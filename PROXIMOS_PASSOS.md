# 📋 Próximos Passos - Sistema Asaas Manager

## 🎯 Funcionalidade Solicitada: Relatórios

### Requisitos
- Criar aba de Relatórios
- Mostrar o que cada subconta faz (transações, cobranças)
- Relacionar dados por ID/Wallet
- Opção de extrair PDF ou Excel
- Pesquisa por data para gerar relatórios

### Implementação Sugerida

#### 1. Adicionar Botão no Menu
```html
<button onclick="showSection('reports')">
    <i class="fas fa-file-chart"></i>
    Relatórios
</button>
```

#### 2. Criar Seção HTML
```html
<div id="reports-section" class="section hidden">
    <!-- Filtros -->
    <div class="filters">
        <select id="report-account">
            <option value="">Selecione Subconta</option>
        </select>
        <input type="date" id="report-start-date">
        <input type="date" id="report-end-date">
        <button onclick="generateReport()">Gerar Relatório</button>
    </div>
    
    <!-- Resultados -->
    <div id="report-results">
        <!-- Tabela de transações -->
    </div>
    
    <!-- Botões de Exportação -->
    <div class="export-buttons">
        <button onclick="exportPDF()">
            <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
        <button onclick="exportExcel()">
            <i class="fas fa-file-excel"></i> Exportar Excel
        </button>
    </div>
</div>
```

#### 3. Endpoint Backend
```typescript
// GET /api/reports/:accountId?start=YYYY-MM-DD&end=YYYY-MM-DD
app.get('/api/reports/:accountId', async (c) => {
  const { accountId } = c.req.param()
  const start = c.req.query('start')
  const end = c.req.query('end')
  
  // Buscar cobranças/payments da subconta
  const result = await asaasRequest(c, `/payments?customer=${accountId}&dateCreated[ge]=${start}&dateCreated[le]=${end}`)
  
  return c.json({
    ok: true,
    data: {
      account: { /* dados da subconta */ },
      payments: result.data.data,
      summary: {
        total: /* soma total */,
        paid: /* total pago */,
        pending: /* total pendente */
      }
    }
  })
})
```

#### 4. Funções JavaScript
```javascript
// Gerar relatório
async function generateReport() {
    const accountId = document.getElementById('report-account').value
    const start = document.getElementById('report-start-date').value
    const end = document.getElementById('report-end-date').value
    
    const response = await axios.get(`/api/reports/${accountId}?start=${start}&end=${end}`)
    
    // Renderizar tabela
    renderReportTable(response.data.data)
}

// Exportar PDF
function exportPDF() {
    // Usar biblioteca jsPDF
    const doc = new jsPDF()
    doc.text('Relatório de Transações', 10, 10)
    // ... adicionar dados
    doc.save('relatorio.pdf')
}

// Exportar Excel (CSV)
function exportExcel() {
    const data = [
        ['Data', 'Descrição', 'Valor', 'Status'],
        // ... linhas de dados
    ]
    
    let csv = data.map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio.csv'
    link.click()
}
```

#### 5. Bibliotecas Necessárias
```html
<!-- Para PDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>

<!-- Para Excel alternativo (se quiser .xlsx real) -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

### Estrutura de Dados do Relatório

```json
{
  "account": {
    "id": "62118294-...",
    "name": "Gelci jose da silva",
    "email": "gelci.jose...@gmail.com",
    "walletId": "cb64c741-..."
  },
  "period": {
    "start": "2026-02-01",
    "end": "2026-02-15"
  },
  "summary": {
    "totalTransactions": 10,
    "totalValue": 1500.00,
    "totalPaid": 1000.00,
    "totalPending": 500.00
  },
  "transactions": [
    {
      "id": "pay_xxx",
      "dateCreated": "2026-02-10",
      "description": "Pagamento via PIX",
      "value": 150.00,
      "status": "CONFIRMED",
      "billingType": "PIX"
    }
  ]
}
```

### Ordem de Implementação

1. ✅ **Backend Endpoint** (30 min)
   - Criar GET /api/reports/:accountId
   - Integrar com API Asaas para buscar payments
   - Calcular summary

2. ✅ **Frontend Seção** (45 min)
   - Adicionar botão "Relatórios" no menu
   - Criar seção HTML com filtros
   - Dropdown de subcontas
   - Date pickers

3. ✅ **Tabela de Resultados** (30 min)
   - Renderizar transações em tabela
   - Paginação
   - Ordenação

4. ✅ **Exportação PDF** (20 min)
   - Incluir jsPDF
   - Gerar PDF com dados
   - Download automático

5. ✅ **Exportação Excel** (15 min)
   - Gerar CSV
   - Download automático

**Tempo Total Estimado**: ~2h20min

### Próximo Comando para Implementar

```bash
# Após criar os arquivos necessários:
cd /home/user/webapp
npm run build
pm2 restart asaas-manager

# Testar endpoint:
curl -b /tmp/cookies.txt "http://localhost:3000/api/reports/ACCOUNT_ID?start=2026-02-01&end=2026-02-15"
```

### Checklist de Tarefas

- [ ] Adicionar botão "Relatórios" no menu superior
- [ ] Criar seção HTML #reports-section
- [ ] Criar endpoint GET /api/reports/:accountId
- [ ] Implementar filtros (subconta, data início, data fim)
- [ ] Renderizar tabela de transações
- [ ] Adicionar bibliotecas jsPDF e autotable
- [ ] Implementar função exportPDF()
- [ ] Implementar função exportExcel()
- [ ] Adicionar summary cards (Total, Pago, Pendente)
- [ ] Testar com dados reais
- [ ] Commit e documentação

