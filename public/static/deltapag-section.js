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
        console.log('🔄 Carregando assinaturas DeltaPag...');
        const response = await axios.get('/api/admin/deltapag/subscriptions');
        console.log('✅ Response:', response.data);
        const subs = response.data.subscriptions || [];
        console.log(`📊 Total de assinaturas: ${subs.length}`);
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
            tbody.innerHTML = subs.map(sub => {
                // Ícone da bandeira do cartão
                const cardBrandIcon = {
                    'Visa': 'fab fa-cc-visa text-blue-600',
                    'Mastercard': 'fab fa-cc-mastercard text-orange-600',
                    'Elo': 'fas fa-credit-card text-yellow-600',
                    'Amex': 'fab fa-cc-amex text-blue-800',
                    'Diners': 'fab fa-cc-diners-club text-blue-500',
                    'Discover': 'fab fa-cc-discover text-orange-500',
                    'Hipercard': 'fas fa-credit-card text-red-600',
                    'JCB': 'fab fa-cc-jcb text-blue-700',
                    'Unknown': 'fas fa-credit-card text-gray-400'
                }[sub.card_brand] || 'fas fa-credit-card text-gray-400';
                
                return `
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
                        ${sub.card_number ? `
                            <div class="flex items-center gap-2">
                                <i class="${cardBrandIcon} text-2xl"></i>
                                <div>
                                    <div class="text-sm font-mono text-gray-900">${sub.card_number}</div>
                                    <div class="text-xs text-gray-500">${sub.card_expiry_month}/${sub.card_expiry_year}</div>
                                </div>
                            </div>
                        ` : '<span class="text-xs text-gray-400">-</span>'}
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
            `}).join('');
        }
        
        // Atualizar stats
        loadDeltapagStats();
        
        // Aplicar filtros após renderização
        setTimeout(() => applyDeltapagFilters(), 100);
        
    } catch (error) {
        console.error('❌ Erro ao carregar assinaturas DeltaPag:', error);
        console.error('Detalhes:', error.response?.data || error.message);
        const tbody = document.getElementById('deltapag-subscriptions-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-red-600">
                    <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                    <p>Erro ao carregar assinaturas</p>
                    <p class="text-sm mt-2">${error.response?.data?.error || error.message}</p>
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
                ['Cliente', 'Email', 'CPF', 'Telefone', 'Cartão Completo', 'Últimos 4', 'Bandeira', 'Validade', 'Valor', 'Recorrência', 'Status', 'Data Criação']
            ];
            
            subs.forEach(sub => {
                ws_data.push([
                    sub.customer_name,
                    sub.customer_email,
                    sub.customer_cpf,
                    sub.customer_phone || '-',
                    sub.card_number || '-',
                    sub.card_last4 || '-',
                    sub.card_brand || '-',
                    sub.card_expiry_month && sub.card_expiry_year ? `${sub.card_expiry_month}/${sub.card_expiry_year}` : '-',
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

// Exportar para CSV
function exportDeltapagToCSV() {
    axios.get('/api/admin/deltapag/subscriptions')
        .then(response => {
            const subs = response.data.subscriptions || [];
            
            // Cabeçalhos
            let csvContent = 'Cliente,Email,CPF,Telefone,Cartão Completo,Últimos 4,Bandeira,Validade,Valor,Recorrência,Status,Data Criação\n';
            
            // Dados
            subs.forEach(sub => {
                const row = [
                    sub.customer_name,
                    sub.customer_email,
                    sub.customer_cpf,
                    sub.customer_phone || '-',
                    sub.card_number || '-',
                    sub.card_last4 || '-',
                    sub.card_brand || '-',
                    sub.card_expiry_month && sub.card_expiry_year ? `${sub.card_expiry_month}/${sub.card_expiry_year}` : '-',
                    `R$ ${parseFloat(sub.value).toFixed(2)}`,
                    sub.recurrence_type,
                    sub.status,
                    new Date(sub.created_at).toLocaleDateString('pt-BR')
                ];
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
            
            // Criar blob e download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `deltapag-assinaturas-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('✅ CSV exportado com sucesso!');
        })
        .catch(error => {
            alert('❌ Erro ao exportar: ' + error.message);
        });
}

// Aplicar filtros avançados
function applyDeltapagFilters() {
    const name = document.getElementById('deltapag-filter-name')?.value.toLowerCase() || '';
    const email = document.getElementById('deltapag-filter-email')?.value.toLowerCase() || '';
    const status = document.getElementById('deltapag-filter-status')?.value || '';
    const recurrence = document.getElementById('deltapag-filter-recurrence')?.value || '';
    const filterDate = document.getElementById('deltapag-filter-date')?.value || '';
    const filterMonth = document.getElementById('deltapag-filter-month')?.value || '';
    const filterYear = document.getElementById('deltapag-filter-year')?.value || '';
    const dateFrom = document.getElementById('deltapag-filter-date-from')?.value || '';
    const dateTo = document.getElementById('deltapag-filter-date-to')?.value || '';
    
    const rows = document.querySelectorAll('#deltapag-subscriptions-tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 1) return; // Skip "no data" row
        
        const rowName = cells[0]?.textContent.toLowerCase() || '';
        const rowEmail = cells[1]?.textContent.toLowerCase() || '';
        const rowRecurrence = cells[3]?.textContent.trim() || '';
        const rowStatus = row.querySelector('.rounded-full')?.textContent.trim() || '';
        const rowDateText = cells[5]?.textContent.trim() || '';
        
        // Parse date (formato dd/mm/yyyy)
        let rowDate = null;
        if (rowDateText) {
            const [day, month, year] = rowDateText.split('/');
            if (day && month && year) {
                rowDate = new Date(year, month - 1, day);
            }
        }
        
        // Filtros de texto
        const matchName = !name || rowName.includes(name);
        const matchEmail = !email || rowEmail.includes(email);
        const matchStatus = !status || rowStatus === status;
        const matchRecurrence = !recurrence || rowRecurrence === recurrence;
        
        // Filtros de data
        let matchDate = true;
        
        if (filterDate && rowDate) {
            const targetDate = new Date(filterDate);
            matchDate = rowDate.toDateString() === targetDate.toDateString();
        }
        
        if (filterMonth && rowDate) {
            const [year, month] = filterMonth.split('-');
            matchDate = matchDate && 
                rowDate.getFullYear() === parseInt(year) && 
                rowDate.getMonth() === parseInt(month) - 1;
        }
        
        if (filterYear && rowDate) {
            matchDate = matchDate && rowDate.getFullYear() === parseInt(filterYear);
        }
        
        if (dateFrom && rowDate) {
            const fromDate = new Date(dateFrom);
            matchDate = matchDate && rowDate >= fromDate;
        }
        
        if (dateTo && rowDate) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Incluir todo o dia
            matchDate = matchDate && rowDate <= toDate;
        }
        
        // Aplicar filtro
        if (matchName && matchEmail && matchStatus && matchRecurrence && matchDate) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Atualizar contador
    const countElement = document.getElementById('deltapag-filter-count');
    if (countElement) {
        countElement.textContent = `${visibleCount} assinatura${visibleCount !== 1 ? 's' : ''} visível${visibleCount !== 1 ? 'is' : ''}`;
    }
    
    console.log(`Filtro aplicado: ${visibleCount} assinaturas visíveis`);
}

// Limpar todos os filtros
function clearDeltapagFilters() {
    document.getElementById('deltapag-filter-name').value = '';
    document.getElementById('deltapag-filter-email').value = '';
    document.getElementById('deltapag-filter-status').value = '';
    document.getElementById('deltapag-filter-recurrence').value = '';
    document.getElementById('deltapag-filter-date').value = '';
    document.getElementById('deltapag-filter-month').value = '';
    document.getElementById('deltapag-filter-year').value = '';
    document.getElementById('deltapag-filter-date-from').value = '';
    document.getElementById('deltapag-filter-date-to').value = '';
    
    applyDeltapagFilters();
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

// ==========================================
// MODAL VER LINKS DELTAPAG
// ==========================================

async function showDeltapagLinksModal() {
    document.getElementById('deltapag-links-modal').classList.remove('hidden');
    document.getElementById('deltapag-links-loading').classList.remove('hidden');
    document.getElementById('deltapag-links-list').classList.add('hidden');
    document.getElementById('deltapag-links-empty').classList.add('hidden');
    
    try {
        const response = await axios.get('/api/deltapag/links');
        const links = response.data.links || [];
        
        if (links.length === 0) {
            document.getElementById('deltapag-links-loading').classList.add('hidden');
            document.getElementById('deltapag-links-empty').classList.remove('hidden');
            return;
        }
        
        const listHtml = links.map(link => {
            const isExpired = new Date(link.valid_until) < new Date();
            const statusBadge = link.status === 'ACTIVE' && !isExpired
                ? '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"><i class="fas fa-check-circle mr-1"></i>Ativo</span>'
                : '<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold"><i class="fas fa-times-circle mr-1"></i>Inativo</span>';
            
            const linkUrl = `${window.location.origin}/deltapag-signup/${link.id}`;
            const recurrenceMap = {
                'MONTHLY': 'Mensal',
                'WEEKLY': 'Semanal',
                'BIWEEKLY': 'Quinzenal',
                'QUARTERLY': 'Trimestral',
                'SEMIANNUALLY': 'Semestral',
                'YEARLY': 'Anual'
            };
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-800 mb-1">${link.description}</h3>
                            <div class="flex items-center gap-4 text-sm text-gray-600">
                                <span><i class="fas fa-money-bill-wave mr-1 text-green-600"></i>R$ ${parseFloat(link.value).toFixed(2)}</span>
                                <span><i class="fas fa-calendar-alt mr-1 text-blue-600"></i>${recurrenceMap[link.recurrence_type] || link.recurrence_type}</span>
                                <span><i class="fas fa-clock mr-1 text-purple-600"></i>Válido até ${new Date(link.valid_until).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-link text-blue-600"></i>
                            <span class="text-sm font-semibold text-gray-700">Link de Cadastro:</span>
                        </div>
                        <div class="flex items-center gap-2 mb-3">
                            <input type="text" value="${linkUrl}" readonly 
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono"
                                id="link-url-${link.id}">
                            <button onclick="copyLinkUrl('${link.id}')" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                                <i class="fas fa-copy mr-1"></i>Copiar
                            </button>
                        </div>
                        <button onclick="showQRCodeModal('${link.id}', '${linkUrl}', '${link.description.replace(/'/g, "\\'")}', '${parseFloat(link.value).toFixed(2)}', '${recurrenceMap[link.recurrence_type] || link.recurrence_type}')" 
                            class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                            <i class="fas fa-qrcode"></i>
                            Gerar QR Code
                        </button>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-4 text-gray-600">
                            <span><i class="fas fa-users mr-1"></i>${link.uses_count || 0} cadastros</span>
                            <span><i class="fas fa-calendar-plus mr-1"></i>Criado em ${new Date(link.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        ${link.status === 'ACTIVE' && !isExpired ? `
                            <button onclick="deactivateLink('${link.id}')" 
                                class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                                <i class="fas fa-ban mr-1"></i>Desativar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('deltapag-links-list').innerHTML = listHtml;
        document.getElementById('deltapag-links-loading').classList.add('hidden');
        document.getElementById('deltapag-links-list').classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao carregar links:', error);
        alert('Erro ao carregar links. Tente novamente.');
        closeDeltapagLinksModal();
    }
}

function closeDeltapagLinksModal() {
    document.getElementById('deltapag-links-modal').classList.add('hidden');
}

function copyLinkUrl(linkId) {
    const input = document.getElementById(`link-url-${linkId}`);
    input.select();
    input.setSelectionRange(0, 99999); // Para mobile
    
    navigator.clipboard.writeText(input.value).then(() => {
        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="fas fa-check mr-1"></i>Copiado!';
        event.target.classList.add('bg-green-600');
        event.target.classList.remove('bg-blue-600');
        
        setTimeout(() => {
            event.target.innerHTML = originalText;
            event.target.classList.remove('bg-green-600');
            event.target.classList.add('bg-blue-600');
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar link. Tente manualmente.');
    });
}

async function deactivateLink(linkId) {
    if (!confirm('Deseja realmente desativar este link? Ele não poderá ser usado para novos cadastros.')) {
        return;
    }
    
    try {
        await axios.patch(`/api/deltapag/links/${linkId}/deactivate`);
        alert('Link desativado com sucesso!');
        showDeltapagLinksModal(); // Recarregar lista
    } catch (error) {
        console.error('Erro ao desativar link:', error);
        alert('Erro ao desativar link. Tente novamente.');
    }
}

// ==========================================
// QR CODE MODAL
// ==========================================

let currentQRData = null;

async function showQRCodeModal(linkId, linkUrl, description, value, recurrence) {
    currentQRData = { linkId, linkUrl, description, value, recurrence };
    
    // Verificar se biblioteca QRCode está carregada
    if (typeof QRCode === 'undefined') {
        console.error('Biblioteca QRCode não carregada');
        alert('Erro: Biblioteca QR Code não foi carregada. Recarregue a página e tente novamente.');
        return;
    }
    
    // Atualizar informações do link
    document.getElementById('qr-link-description').textContent = description;
    document.getElementById('qr-link-value').textContent = `R$ ${value}`;
    document.getElementById('qr-link-recurrence').textContent = recurrence;
    
    // Gerar QR Code
    const canvas = document.getElementById('qrcode-canvas');
    try {
        // Usar a API correta do qrcode.min.js
        QRCode.toCanvas(canvas, linkUrl, {
            width: 280,
            margin: 2,
            color: {
                dark: '#6b21a8',  // purple-800
                light: '#ffffff'
            }
        }, function(error) {
            if (error) {
                console.error('Erro ao gerar QR Code:', error);
                alert(`Erro ao gerar QR Code: ${error.message}`);
                return;
            }
            
            // Gerar preview HTML
            const qrDataURL = canvas.toDataURL('image/png');
            const htmlCode = generateQRCodeHTML(linkUrl, description, value, recurrence, qrDataURL);
            document.getElementById('qr-html-preview').textContent = htmlCode;
            
            // Mostrar modal
            document.getElementById('qrcode-modal').classList.remove('hidden');
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        alert(`Erro ao gerar QR Code: ${error.message}\n\nTente recarregar a página.`);
    }
}

function closeQRCodeModal() {
    document.getElementById('qrcode-modal').classList.add('hidden');
    currentQRData = null;
}

function downloadQRCode() {
    const canvas = document.getElementById('qrcode-canvas');
    const link = document.createElement('a');
    const filename = `qrcode-${currentQRData.description.toLowerCase().replace(/\s+/g, '-')}.png`;
    
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Feedback visual
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Baixado!';
    btn.classList.add('bg-green-600');
    btn.classList.remove('bg-purple-600');
    
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('bg-green-600');
        btn.classList.add('bg-purple-600');
    }, 2000);
}

function copyQRCodeHTML() {
    const canvas = document.getElementById('qrcode-canvas');
    const qrDataURL = canvas.toDataURL('image/png');
    const htmlCode = generateQRCodeHTML(
        currentQRData.linkUrl, 
        currentQRData.description, 
        currentQRData.value, 
        currentQRData.recurrence,
        qrDataURL
    );
    
    navigator.clipboard.writeText(htmlCode).then(() => {
        // Feedback visual
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.classList.add('bg-green-600');
        btn.classList.remove('bg-indigo-600');
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-indigo-600');
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar código HTML. Tente novamente.');
    });
}

function generateQRCodeHTML(linkUrl, description, value, recurrence, qrDataURL) {
    return `<!-- QR Code de Auto-Cadastro DeltaPag -->
<div style="max-width: 400px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: white; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
            ${description}
        </h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">
            R$ ${value} • ${recurrence}
        </p>
    </div>
    
    <!-- QR Code -->
    <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
        <img src="${qrDataURL}" 
             alt="QR Code de Cadastro" 
             style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
    </div>
    
    <!-- Instructions -->
    <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
            📱 Como usar:
        </h3>
        <ol style="color: rgba(255,255,255,0.95); font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Aponte a câmera do seu celular para o QR Code</li>
            <li>Toque na notificação que aparecer</li>
            <li>Preencha seus dados de cartão</li>
            <li>Confirme sua assinatura</li>
        </ol>
    </div>
    
    <!-- Link alternativo -->
    <div style="text-align: center;">
        <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
            Ou acesse diretamente:
        </p>
        <a href="${linkUrl}" 
           style="color: white; font-size: 14px; word-break: break-all; text-decoration: underline;">
            ${linkUrl}
        </a>
    </div>
</div>`;
}

// ==========================================
// CRIAR 10 ASSINATURAS DE TESTE
// ==========================================

async function createTestSubscriptions() {
    if (!confirm('Criar 10 novas assinaturas de teste com cartões variados?\n\n✓ Visa, Mastercard, Elo, Hipercard\n✓ Planos mensais e anuais\n✓ Valores de R$ 59,90 a R$ 999,90')) {
        return;
    }
    
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Criando...';
    
    try {
        const response = await axios.post('/api/admin/create-test-subscriptions');
        
        if (response.data.ok) {
            const subs = response.data.subscriptions;
            
            // Mostrar detalhes das assinaturas criadas
            let details = '✅ 10 assinaturas criadas com sucesso!\n\n';
            subs.forEach((sub, i) => {
                details += `${i + 1}. ${sub.name}\n   ${sub.card} - R$ ${sub.value.toFixed(2)}\n\n`;
            });
            
            alert(details);
            
            // Recarregar lista
            loadDeltapagSubscriptions();
        } else {
            alert('❌ Erro: ' + response.data.error);
        }
    } catch (error) {
        console.error('Erro ao criar assinaturas:', error);
        alert('❌ Erro ao criar assinaturas de teste:\n' + (error.response?.data?.error || error.message));
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// ==========================================
// SINCRONIZAR DADOS DE CARTÃO DA API DELTAPAG
// ==========================================

async function syncDeltapagCards() {
    if (!confirm('Deseja sincronizar os dados de cartão das assinaturas com a API DeltaPag?\n\nIsso pode levar alguns segundos.')) {
        return;
    }
    
    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sincronizando...';
    
    try {
        const response = await axios.post('/api/admin/sync-deltapag-cards');
        
        if (response.data.ok) {
            alert(
                `✅ Sincronização concluída!\n\n` +
                `• ${response.data.updated} assinaturas atualizadas\n` +
                `• ${response.data.total} assinaturas verificadas\n` +
                (response.data.errors ? `\n⚠️ Erros:\n${response.data.errors.join('\n')}` : '')
            );
            
            // Recarregar lista
            loadDeltapagSubscriptions();
        } else {
            alert('❌ Erro: ' + response.data.error);
        }
    } catch (error) {
        console.error('Erro ao sincronizar:', error);
        alert('❌ Erro ao sincronizar dados de cartão:\n' + (error.response?.data?.error || error.message));
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Log de carregamento
console.log('✅ DeltaPag Section JS carregado');
