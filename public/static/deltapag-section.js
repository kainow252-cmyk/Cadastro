// ==========================================
// DELTAPAG SECTION - DASHBOARD COMPLETO
// ==========================================

// Variável global para armazenar dados CSV
let csvData = [];
let currentDeltapagLink = '';

// Carregar estatísticas DeltaPag
async function loadDeltapagStats() {
    try {
        const response = await axios.get('/api/admin/deltapag/subscriptions');
        const subs = response.data.subscriptions || [];
        
        const total = subs.length;
        const active = subs.filter(s => s.status === 'ACTIVE').length;
        const cancelled = subs.filter(s => s.status === 'CANCELLED').length;
        const revenue = subs.filter(s => s.status === 'ACTIVE')
            .reduce((sum, s) => sum + parseFloat(s.value), 0);
        
        document.getElementById('deltapag-stat-total').textContent = total;
        document.getElementById('deltapag-stat-active').textContent = active;
        document.getElementById('deltapag-stat-cancelled').textContent = cancelled;
        document.getElementById('deltapag-stat-revenue').textContent = `R$ ${revenue.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar stats DeltaPag:', error);
    }
}

// Carregar lista de assinaturas DeltaPag
async function loadDeltapagSubscriptions() {
    try {
        const response = await axios.get('/api/admin/deltapag/subscriptions');
        const subs = response.data.subscriptions || [];
        const tbody = document.getElementById('deltapag-subscriptions-tbody');
        
        if (subs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-3"></i>
                        <p>Nenhuma assinatura encontrada</p>
                        <p class="text-sm mt-2">Crie a primeira assinatura clicando nos cards acima</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = subs.map(sub => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-medium text-gray-900">${sub.customer_name}</div>
                        <div class="text-sm text-gray-500">ID: ${sub.id.substring(0, 8)}...</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${sub.customer_email}</div>
                        <div class="text-xs text-gray-500">${sub.customer_cpf}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-semibold text-gray-900">R$ ${parseFloat(sub.value).toFixed(2)}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-xs px-2 py-1 rounded ${
                            sub.recurrence_type === 'MONTHLY' ? 'bg-blue-100 text-blue-800' :
                            sub.recurrence_type === 'WEEKLY' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            ${sub.recurrence_type}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-xs px-3 py-1 rounded-full font-semibold ${
                            sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${sub.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(sub.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${sub.status === 'ACTIVE' ? `
                            <button onclick="cancelDeltapagSubscription('${sub.id}')" 
                                class="text-red-600 hover:text-red-800 font-semibold">
                                <i class="fas fa-times-circle mr-1"></i>Cancelar
                            </button>
                        ` : `
                            <span class="text-gray-400">-</span>
                        `}
                    </td>
                </tr>
            `).join('');
        }
        
        // Atualizar stats
        loadDeltapagStats();
        
    } catch (error) {
        console.error('Erro ao carregar assinaturas DeltaPag:', error);
        const tbody = document.getElementById('deltapag-subscriptions-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-red-600">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                    <p>Erro ao carregar assinaturas</p>
                </td>
            </tr>
        `;
    }
}

// Exportar para Excel
function exportDeltapagToExcel() {
    axios.get('/api/admin/deltapag/subscriptions')
        .then(response => {
            const subs = response.data.subscriptions || [];
            
            const ws_data = [
                ['Cliente', 'Email', 'CPF', 'Valor', 'Recorrência', 'Status', 'Data Criação']
            ];
            
            subs.forEach(sub => {
                ws_data.push([
                    sub.customer_name,
                    sub.customer_email,
                    sub.customer_cpf,
                    `R$ ${parseFloat(sub.value).toFixed(2)}`,
                    sub.recurrence_type,
                    sub.status,
                    new Date(sub.created_at).toLocaleDateString('pt-BR')
                ]);
            });
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, "Assinaturas DeltaPag");
            XLSX.writeFile(wb, `deltapag-assinaturas-${new Date().toISOString().split('T')[0]}.xlsx`);
            
            alert('✅ Excel exportado com sucesso!');
        })
        .catch(error => {
            alert('❌ Erro ao exportar: ' + error.message);
        });
}

// Aplicar filtros
function applyDeltapagFilters() {
    const name = document.getElementById('deltapag-filter-name').value.toLowerCase();
    const email = document.getElementById('deltapag-filter-email').value.toLowerCase();
    const status = document.getElementById('deltapag-filter-status').value;
    
    const rows = document.querySelectorAll('#deltapag-subscriptions-tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 1) return; // Skip "no data" row
        
        const rowName = cells[0]?.textContent.toLowerCase() || '';
        const rowEmail = cells[1]?.textContent.toLowerCase() || '';
        const rowStatus = row.querySelector('.rounded-full')?.textContent.trim() || '';
        
        const matchName = !name || rowName.includes(name);
        const matchEmail = !email || rowEmail.includes(email);
        const matchStatus = !status || rowStatus === status;
        
        if (matchName && matchEmail && matchStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    console.log(`Filtro aplicado: ${visibleCount} assinaturas visíveis`);
}

// Link Auto-Cadastro Modal
function openDeltapagLinkModal() {
    document.getElementById('deltapag-link-modal').classList.remove('hidden');
    document.getElementById('deltapag-link-form').classList.remove('hidden');
    document.getElementById('deltapag-link-result').classList.add('hidden');
}

function closeDeltapagLinkModal() {
    document.getElementById('deltapag-link-modal').classList.add('hidden');
    document.getElementById('deltapag-link-value').value = '';
    document.getElementById('deltapag-link-description').value = '';
}

async function generateDeltapagLink() {
    const value = document.getElementById('deltapag-link-value').value;
    const description = document.getElementById('deltapag-link-description').value;
    const recurrence = document.getElementById('deltapag-link-recurrence').value;
    const days = document.getElementById('deltapag-link-days').value;
    
    if (!value || !description) {
        alert('Por favor, preencha valor e descrição');
        return;
    }
    
    try {
        const response = await axios.post('/api/deltapag/create-link', {
            value: parseFloat(value),
            description,
            recurrenceType: recurrence,
            validDays: parseInt(days)
        });
        
        if (response.data.ok) {
            const url = `${window.location.origin}/deltapag-signup/${response.data.linkId}`;
            currentDeltapagLink = url;
            document.getElementById('deltapag-link-url').value = url;
            document.getElementById('deltapag-link-form').classList.add('hidden');
            document.getElementById('deltapag-link-result').classList.remove('hidden');
        }
    } catch (error) {
        alert('❌ Erro: ' + (error.response?.data?.error || error.message));
    }
}

function copyDeltapagLink() {
    const input = document.getElementById('deltapag-link-url');
    input.select();
    document.execCommand('copy');
    alert('✅ Link copiado para a área de transferência!');
}

function shareDeltapagWhatsApp() {
    const url = currentDeltapagLink;
    const value = document.getElementById('deltapag-link-value').value;
    const description = document.getElementById('deltapag-link-description').value;
    const text = `🔷 *Cadastro de Assinatura - Cartão de Crédito*\n\n` +
                 `📝 ${description}\n` +
                 `💰 R$ ${parseFloat(value).toFixed(2)}/mês\n\n` +
                 `Use este link para cadastrar seu cartão:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareDeltapagEmail() {
    const url = currentDeltapagLink;
    const value = document.getElementById('deltapag-link-value').value;
    const description = document.getElementById('deltapag-link-description').value;
    const subject = 'Link de Cadastro - Assinatura Cartão de Crédito';
    const body = `Olá!\n\n` +
                 `Use este link para cadastrar seu cartão de crédito e ativar sua assinatura:\n\n` +
                 `Descrição: ${description}\n` +
                 `Valor: R$ ${parseFloat(value).toFixed(2)}/mês\n\n` +
                 `Link: ${url}\n\n` +
                 `Obrigado!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Importar CSV Modal
function openDeltapagImportModal() {
    document.getElementById('deltapag-import-modal').classList.remove('hidden');
    document.getElementById('deltapag-csv-file').value = '';
    document.getElementById('deltapag-csv-preview').classList.add('hidden');
    document.getElementById('deltapag-import-progress').classList.add('hidden');
    document.getElementById('deltapag-import-result').classList.add('hidden');
}

function closeDeltapagImportModal() {
    document.getElementById('deltapag-import-modal').classList.add('hidden');
    csvData = [];
}

function downloadDeltapagTemplate() {
    const csv = `nome,email,cpf,telefone,numero_cartao,nome_cartao,mes,ano,cvv,valor,recorrencia,descricao
João Silva,joao@email.com,00000000000,11987654321,0000000000000000,JOÃO SILVA,12,2028,123,50.00,MONTHLY,Plano Premium
Maria Santos,maria@email.com,11111111111,11912345678,1111111111111111,MARIA SANTOS,06,2029,456,100.00,MONTHLY,Plano Enterprise`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-deltapag.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleDeltapagCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        const header = lines[0].split(',');
        
        csvData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
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
        }).filter(row => row.customerName); // Remove linhas vazias
        
        // Mostrar preview
        const headerHTML = header.map(h => `<th class="px-3 py-2 border border-gray-300 bg-gray-100 text-xs font-bold">${h}</th>`).join('');
        const bodyHTML = csvData.slice(0, 5).map(row => `
            <tr class="hover:bg-gray-50">
                <td class="px-2 py-1 border text-xs">${row.customerName}</td>
                <td class="px-2 py-1 border text-xs">${row.customerEmail}</td>
                <td class="px-2 py-1 border text-xs">${row.customerCpf}</td>
                <td class="px-2 py-1 border text-xs">${row.customerPhone || '-'}</td>
                <td class="px-2 py-1 border text-xs">****</td>
                <td class="px-2 py-1 border text-xs">${row.cardHolderName}</td>
                <td class="px-2 py-1 border text-xs">${row.cardExpiryMonth}/${row.cardExpiryYear}</td>
                <td class="px-2 py-1 border text-xs">***</td>
                <td class="px-2 py-1 border text-xs">R$ ${row.value.toFixed(2)}</td>
                <td class="px-2 py-1 border text-xs">${row.recurrenceType}</td>
                <td class="px-2 py-1 border text-xs">${row.description}</td>
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
    if (csvData.length === 0) {
        alert('Nenhum dado para importar');
        return;
    }
    
    document.getElementById('deltapag-csv-preview').classList.add('hidden');
    document.getElementById('deltapag-import-progress').classList.remove('hidden');
    
    const total = csvData.length;
    let current = 0;
    const results = { success: [], errors: [] };
    
    document.getElementById('deltapag-import-total').textContent = total;
    
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
        document.getElementById('deltapag-import-bar').style.width = `${(current / total) * 100}%`;
        
        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Mostrar resultado
    document.getElementById('deltapag-import-progress').classList.add('hidden');
    document.getElementById('deltapag-import-result').innerHTML = `
        <div class="bg-${results.errors.length === 0 ? 'green' : 'yellow'}-50 border border-${results.errors.length === 0 ? 'green' : 'yellow'}-200 rounded-lg p-4">
            <h4 class="font-bold text-${results.errors.length === 0 ? 'green' : 'yellow'}-900 mb-3 text-lg">
                <i class="fas fa-check-circle mr-2"></i>Importação Concluída!
            </h4>
            <div class="text-sm space-y-2">
                <p class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">
                        ✅ ${results.success.length} sucesso${results.success.length !== 1 ? 's' : ''}
                    </span>
                </p>
                ${results.errors.length > 0 ? `
                    <p class="flex items-center gap-2">
                        <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                            ❌ ${results.errors.length} erro${results.errors.length !== 1 ? 's' : ''}
                        </span>
                    </p>
                    <details class="mt-3 p-3 bg-white rounded border">
                        <summary class="cursor-pointer font-semibold text-red-900">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Ver detalhes dos erros
                        </summary>
                        <ul class="mt-3 space-y-2 text-xs max-h-48 overflow-y-auto">
                            ${results.errors.map(e => `
                                <li class="p-2 bg-red-50 rounded">
                                    <strong>${e.email}:</strong> ${e.error}
                                </li>
                            `).join('')}
                        </ul>
                    </details>
                ` : ''}
            </div>
        </div>
    `;
    document.getElementById('deltapag-import-result').classList.remove('hidden');
    
    // Recarregar lista após 2 segundos
    setTimeout(() => {
        loadDeltapagSubscriptions();
        csvData = [];
    }, 2000);
}

// Log de carregamento
console.log('✅ DeltaPag Section JS carregado');
