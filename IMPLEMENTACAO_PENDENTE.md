# 🚧 Implementação Pendente - DeltaPag Full Features

## ✅ O que JÁ está pronto:

1. **Seção DeltaPag** - Interface completa com:
   - 3 cards de ação (Criar Assinatura, Link Auto-Cadastro, Importar CSV)
   - 4 cards de estatísticas
   - Tabela de assinaturas com filtros
   - Exportação Excel

2. **Modais Criados**:
   - ✅ Modal principal (criar assinatura manual)
   - ✅ Modal Link Auto-Cadastro
   - ✅ Modal Importar CSV

3. **Backend API**:
   - ✅ POST /api/deltapag/create-subscription
   - ✅ GET /api/admin/deltapag/subscriptions
   - ✅ POST /api/deltapag/cancel-subscription/:id

4. **Banco de Dados**:
   - ✅ Tabela deltapag_subscriptions

---

## 🔨 O que FALTA implementar:

### 1. Endpoints Backend

#### A) Link Auto-Cadastro
```typescript
// Criar tabela deltapag_signup_links
CREATE TABLE deltapag_signup_links (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  description TEXT,
  recurrence_type TEXT DEFAULT 'MONTHLY',
  valid_until DATE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 999,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

// POST /api/deltapag/create-link
// Cria link e retorna URL pública

// GET /api/public/deltapag-signup/:linkId
// Página pública para cliente preencher dados

// POST /api/public/deltapag-signup/:linkId
// Processa cadastro do cliente via link público
```

#### B) Importar CSV
```typescript
// POST /api/deltapag/import-csv
// Recebe array de assinaturas e processa em lote
// Retorna sucesso/erro para cada linha
```

### 2. Funções JavaScript (app.js)

Adicionar ao final de `public/static/app.js`:

```javascript
// ==========================================
// DELTAPAG SECTION - FULL FEATURES
// ==========================================

// Carregar estatísticas
async function loadDeltapagStats() {
  const response = await axios.get('/api/admin/deltapag/subscriptions');
  const subs = response.data.subscriptions;
  
  const total = subs.length;
  const active = subs.filter(s => s.status === 'ACTIVE').length;
  const cancelled = subs.filter(s => s.status === 'CANCELLED').length;
  const revenue = subs.filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.value, 0);
  
  document.getElementById('deltapag-stat-total').textContent = total;
  document.getElementById('deltapag-stat-active').textContent = active;
  document.getElementById('deltapag-stat-cancelled').textContent = cancelled;
  document.getElementById('deltapag-stat-revenue').textContent = 
    `R$ ${revenue.toFixed(2)}`;
}

// Carregar lista de assinaturas
async function loadDeltapagSubscriptions() {
  const response = await axios.get('/api/admin/deltapag/subscriptions');
  const tbody = document.getElementById('deltapag-subscriptions-tbody');
  
  if (response.data.subscriptions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8">Nenhuma assinatura encontrada</td></tr>';
    return;
  }
  
  tbody.innerHTML = response.data.subscriptions.map(sub => `
    <tr>
      <td class="px-6 py-4">${sub.customer_name}</td>
      <td class="px-6 py-4">${sub.customer_email}</td>
      <td class="px-6 py-4">R$ ${parseFloat(sub.value).toFixed(2)}</td>
      <td class="px-6 py-4">${sub.recurrence_type}</td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 text-xs rounded ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${sub.status}
        </span>
      </td>
      <td class="px-6 py-4">${new Date(sub.created_at).toLocaleDateString()}</td>
      <td class="px-6 py-4">
        ${sub.status === 'ACTIVE' ? `
          <button onclick="cancelDeltapagSubscription('${sub.id}')" 
            class="text-red-600 hover:text-red-800">
            <i class="fas fa-times-circle"></i> Cancelar
          </button>
        ` : '-'}
      </td>
    </tr>
  `).join('');
  
  loadDeltapagStats();
}

// Exportar para Excel
function exportDeltapagToExcel() {
  // Usar biblioteca XLSX (já incluída)
  const wb = XLSX.utils.book_new();
  const ws_data = [
    ['Cliente', 'Email', 'CPF', 'Valor', 'Recorrência', 'Status', 'Data']
  ];
  
  // Adicionar dados... (buscar da API)
  
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Assinaturas");
  XLSX.writeFile(wb, `deltapag-assinaturas-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Aplicar filtros
function applyDeltapagFilters() {
  const name = document.getElementById('deltapag-filter-name').value.toLowerCase();
  const email = document.getElementById('deltapag-filter-email').value.toLowerCase();
  const status = document.getElementById('deltapag-filter-status').value;
  
  const rows = document.querySelectorAll('#deltapag-subscriptions-tbody tr');
  rows.forEach(row => {
    const rowName = row.children[0]?.textContent.toLowerCase() || '';
    const rowEmail = row.children[1]?.textContent.toLowerCase() || '';
    const rowStatus = row.querySelector('span')?.textContent.trim() || '';
    
    const matchName = !name || rowName.includes(name);
    const matchEmail = !email || rowEmail.includes(email);
    const matchStatus = !status || rowStatus === status;
    
    row.style.display = (matchName && matchEmail && matchStatus) ? '' : 'none';
  });
}

// Link Auto-Cadastro
function openDeltapagLinkModal() {
  document.getElementById('deltapag-link-modal').classList.remove('hidden');
}

function closeDeltapagLinkModal() {
  document.getElementById('deltapag-link-modal').classList.add('hidden');
  document.getElementById('deltapag-link-form').classList.remove('hidden');
  document.getElementById('deltapag-link-result').classList.add('hidden');
}

async function generateDeltapagLink() {
  const value = document.getElementById('deltapag-link-value').value;
  const description = document.getElementById('deltapag-link-description').value;
  const recurrence = document.getElementById('deltapag-link-recurrence').value;
  const days = document.getElementById('deltapag-link-days').value;
  
  try {
    const response = await axios.post('/api/deltapag/create-link', {
      value: parseFloat(value),
      description,
      recurrenceType: recurrence,
      validDays: parseInt(days)
    });
    
    if (response.data.ok) {
      const url = `${window.location.origin}/deltapag-signup/${response.data.linkId}`;
      document.getElementById('deltapag-link-url').value = url;
      document.getElementById('deltapag-link-form').classList.add('hidden');
      document.getElementById('deltapag-link-result').classList.remove('hidden');
      window.currentDeltapagLink = url;
    }
  } catch (error) {
    alert('Erro: ' + (error.response?.data?.error || error.message));
  }
}

function copyDeltapagLink() {
  const input = document.getElementById('deltapag-link-url');
  input.select();
  document.execCommand('copy');
  alert('✅ Link copiado!');
}

function shareDeltapagWhatsApp() {
  const url = window.currentDeltapagLink;
  const text = `Olá! Use este link para cadastrar seu cartão de crédito e ativar sua assinatura: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareDeltapagEmail() {
  const url = window.currentDeltapagLink;
  const subject = 'Link de Cadastro - Assinatura Cartão de Crédito';
  const body = `Olá!\n\nUse este link para cadastrar seu cartão de crédito e ativar sua assinatura:\n\n${url}\n\nObrigado!`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Importar CSV
function openDeltapagImportModal() {
  document.getElementById('deltapag-import-modal').classList.remove('hidden');
}

function closeDeltapagImportModal() {
  document.getElementById('deltapag-import-modal').classList.add('hidden');
  document.getElementById('deltapag-csv-file').value = '';
  document.getElementById('deltapag-csv-preview').classList.add('hidden');
  document.getElementById('deltapag-import-progress').classList.add('hidden');
  document.getElementById('deltapag-import-result').classList.add('hidden');
}

function downloadDeltapagTemplate() {
  const csv = `nome,email,cpf,telefone,numero_cartao,nome_cartao,mes,ano,cvv,valor,recorrencia,descricao
João Silva,joao@email.com,00000000000,11987654321,0000000000000000,JOÃO SILVA,12,2028,123,50.00,MONTHLY,Plano Premium
Maria Santos,maria@email.com,11111111111,11912345678,1111111111111111,MARIA SANTOS,06,2029,456,100.00,MONTHLY,Plano Enterprise`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-deltapag.csv';
  a.click();
  URL.revokeObjectURL(url);
}

let csvData = [];

function handleDeltapagCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim());
    const header = lines[0].split(',');
    
    csvData = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        customerName: values[0],
        customerEmail: values[1],
        customerCpf: values[2],
        customerPhone: values[3],
        cardNumber: values[4],
        cardHolderName: values[5],
        cardExpiryMonth: values[6],
        cardExpiryYear: values[7],
        cardCvv: values[8],
        value: parseFloat(values[9]),
        recurrenceType: values[10],
        description: values[11]
      };
    });
    
    // Mostrar preview
    const headerHTML = header.map(h => `<th class="px-2 py-1 border">${h}</th>`).join('');
    const bodyHTML = csvData.slice(0, 5).map(row => `
      <tr>
        ${Object.values(row).map(v => `<td class="px-2 py-1 border text-xs">${v}</td>`).join('')}
      </tr>
    `).join('');
    
    document.getElementById('deltapag-csv-header').innerHTML = headerHTML;
    document.getElementById('deltapag-csv-body').innerHTML = bodyHTML;
    document.getElementById('deltapag-csv-count').textContent = csvData.length;
    document.getElementById('deltapag-csv-preview').classList.remove('hidden');
  };
  reader.readAsText(file);
}

function cancelDeltapagCSV() {
  csvData = [];
  document.getElementById('deltapag-csv-file').value = '';
  document.getElementById('deltapag-csv-preview').classList.add('hidden');
}

async function importDeltapagCSV() {
  document.getElementById('deltapag-csv-preview').classList.add('hidden');
  document.getElementById('deltapag-import-progress').classList.remove('hidden');
  
  const total = csvData.length;
  let current = 0;
  const results = { success: [], errors: [] };
  
  for (const subscription of csvData) {
    try {
      const response = await axios.post('/api/deltapag/create-subscription', subscription);
      if (response.data.ok) {
        results.success.push(subscription.customerEmail);
      } else {
        results.errors.push({ email: subscription.customerEmail, error: response.data.error });
      }
    } catch (error) {
      results.errors.push({ 
        email: subscription.customerEmail, 
        error: error.response?.data?.error || error.message 
      });
    }
    
    current++;
    document.getElementById('deltapag-import-current').textContent = current;
    document.getElementById('deltapag-import-total').textContent = total;
    document.getElementById('deltapag-import-bar').style.width = `${(current / total) * 100}%`;
  }
  
  // Mostrar resultado
  document.getElementById('deltapag-import-progress').classList.add('hidden');
  document.getElementById('deltapag-import-result').innerHTML = `
    <div class="bg-${results.errors.length === 0 ? 'green' : 'yellow'}-50 border border-${results.errors.length === 0 ? 'green' : 'yellow'}-200 rounded-lg p-4">
      <h4 class="font-bold text-${results.errors.length === 0 ? 'green' : 'yellow'}-900 mb-2">
        Importação Concluída!
      </h4>
      <div class="text-sm space-y-2">
        <p><strong>✅ Sucesso:</strong> ${results.success.length} assinaturas criadas</p>
        ${results.errors.length > 0 ? `
          <p><strong>❌ Erros:</strong> ${results.errors.length} falhas</p>
          <details class="mt-2">
            <summary class="cursor-pointer font-semibold">Ver detalhes dos erros</summary>
            <ul class="mt-2 space-y-1 text-xs">
              ${results.errors.map(e => `<li>• ${e.email}: ${e.error}</li>`).join('')}
            </ul>
          </details>
        ` : ''}
      </div>
    </div>
  `;
  document.getElementById('deltapag-import-result').classList.remove('hidden');
  
  // Recarregar lista
  setTimeout(() => loadDeltapagSubscriptions(), 1000);
}

// Carregar ao abrir a seção
function showSection(sectionId) {
  // ... código existente ...
  
  if (sectionId === 'deltapag-section') {
    loadDeltapagSubscriptions();
  }
}
```

### 3. Endpoints Backend Adicionais

Adicionar em `src/index.tsx`:

```typescript
// Criar link auto-cadastro DeltaPag
app.post('/api/deltapag/create-link', authMiddleware, async (c) => {
  const { value, description, recurrenceType, validDays } = await c.req.json();
  
  const linkId = crypto.randomUUID();
  const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
  
  await c.env.DB.prepare(`
    INSERT INTO deltapag_signup_links 
    (id, value, description, recurrence_type, valid_until, status)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE')
  `).bind(linkId, value, description, recurrenceType, validUntil.toISOString().split('T')[0]).run();
  
  return c.json({ ok: true, linkId });
});

// Página pública de cadastro (HTML)
app.get('/deltapag-signup/:linkId', async (c) => {
  const linkId = c.req.param('linkId');
  
  const link = await c.env.DB.prepare(`
    SELECT * FROM deltapag_signup_links WHERE id = ?
  `).bind(linkId).first();
  
  if (!link) {
    return c.html('<h1>Link não encontrado</h1>');
  }
  
  // Retornar HTML do formulário público
  return c.html(/* HTML com formulário */);
});

// Processar cadastro público
app.post('/api/public/deltapag-signup/:linkId', async (c) => {
  const linkId = c.req.param('linkId');
  const data = await c.req.json();
  
  // Validar link
  // Criar assinatura via DeltaPag
  // Salvar no banco
  // Retornar sucesso
});

// Importar CSV
app.post('/api/deltapag/import-csv', authMiddleware, async (c) => {
  const { subscriptions } = await c.req.json();
  
  const results = { success: [], errors: [] };
  
  for (const sub of subscriptions) {
    try {
      // Processar cada assinatura
      // Adicionar ao results.success ou results.errors
    } catch (error) {
      results.errors.push({ email: sub.customerEmail, error: error.message });
    }
  }
  
  return c.json({ ok: true, results });
});
```

---

## 📋 Checklist de Implementação

- [ ] Criar tabela `deltapag_signup_links` no init-db
- [ ] Endpoint POST /api/deltapag/create-link
- [ ] Endpoint GET /deltapag-signup/:linkId (página pública)
- [ ] Endpoint POST /api/public/deltapag-signup/:linkId
- [ ] Endpoint POST /api/deltapag/import-csv
- [ ] Adicionar funções JavaScript ao app.js
- [ ] Testar link auto-cadastro
- [ ] Testar importação CSV
- [ ] Testar filtros e exportação Excel

---

## 🚀 Para Continuar

1. Adicione as funções JavaScript ao `public/static/app.js`
2. Adicione os endpoints backend ao `src/index.tsx`
3. Execute `npm run build` e deploy
4. Teste cada funcionalidade

Tudo está preparado, só falta conectar as peças!
