// Sistema de Relatórios Detalhados com Dados dos Clientes
// Data: 20/02/2026

// Namespace para evitar conflitos
window.ReportsDetailed = window.ReportsDetailed || {};

// Variável para armazenar dados do relatório atual
window.ReportsDetailed.currentData = null;

// Função principal para gerar relatório detalhado
window.generateDetailedReport = async function() {
    const accountId = document.getElementById('report-account-select')?.value;
    const startDate = document.getElementById('report-start-date')?.value;
    const endDate = document.getElementById('report-end-date')?.value;
    const chargeType = document.getElementById('report-charge-type')?.value || 'all';
    const status = document.getElementById('report-status')?.value || 'all';
    
    if (!accountId) {
        alert('Por favor, selecione uma subconta');
        return;
    }
    
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-6xl text-orange-500 mb-4"></i><p class="text-lg text-gray-600">Gerando relatório...</p></div>';
    
    try {
        // Montar URL com filtros
        let url;
        if (accountId === 'ALL_ACCOUNTS') {
            // Relatório consolidado de todas as subcontas
            url = `/api/reports/all-accounts/detailed?`;
        } else {
            // Relatório individual
            url = `/api/reports/${accountId}/detailed?`;
        }
        
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;
        if (chargeType) url += `chargeType=${chargeType}&`;
        if (status) url += `status=${status}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            window.ReportsDetailed.currentData = data.data;
            displayDetailedReport(data.data);
        } else {
            resultsDiv.innerHTML = '<div class="text-center py-12 text-red-500"><i class="fas fa-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">Erro ao gerar relatório: ' + (data.error || 'Erro desconhecido') + '</p></div>';
        }
    } catch (error) {
        console.error('Erro:', error);
        resultsDiv.innerHTML = '<div class="text-center py-12 text-red-500"><i class="fas fa-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">Erro ao buscar relatório</p></div>';
    }
}

// Função para exibir o relatório na tela
function displayDetailedReport(data) {
    const resultsDiv = document.getElementById('report-results');
    
    const { account, period, filters, summary, transactions } = data;
    
    // Badge de tipo de cobrança
    const getChargeTypeBadge = (type) => {
        const badges = {
            'single': '<span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">🟢 QR Code Avulso</span>',
            'monthly': '<span class="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">🟣 Assinatura Mensal</span>',
            'pix_auto': '<span class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">🔵 PIX Automático</span>',
            'link_cadastro': '<span class="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">🟠 Link Auto-Cadastro</span>'
        };
        return badges[type] || '<span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">Mensal</span>';
    };
    
    // Badge de status
    const getStatusBadge = (status) => {
        const badges = {
            'RECEIVED': '<span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">✅ Recebido</span>',
            'PENDING': '<span class="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">⏳ Pendente</span>',
            'OVERDUE': '<span class="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">⚠️ Vencido</span>',
            'REFUNDED': '<span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">↩️ Reembolsado</span>'
        };
        return badges[status] || '<span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">' + status + '</span>';
    };
    
    // Formatar CPF
    const formatCPF = (cpf) => {
        if (!cpf || cpf === 'N/A') return 'N/A';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };
    
    // Formatar data
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };
    
    let html = '<div class="space-y-6">' +
        '<!-- Cabeçalho -->' +
        '<div class="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md p-6 text-white">' +
        '<h3 class="text-2xl font-bold mb-2"><i class="fas fa-chart-bar mr-2"></i>Relatório de Subconta</h3>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">' +
        '<div><p class="text-sm opacity-80">📋 Conta</p><p class="font-semibold text-lg">' + account.name + '</p></div>' +
        '<div><p class="text-sm opacity-80">📧 Email</p><p class="font-semibold">' + account.email + '</p></div>' +
        '<div><p class="text-sm opacity-80">🆔 CPF/CNPJ</p><p class="font-semibold">' + account.cpfCnpj + '</p></div>' +
        '<div><p class="text-sm opacity-80">💼 Wallet ID</p><p class="font-semibold text-sm">' + account.walletId + '</p></div>' +
        '</div>' +
        '<div class="mt-4 pt-4 border-t border-white border-opacity-30">' +
        '<p class="text-sm opacity-80">📅 Período: <span class="font-semibold">' + period.startDate + ' até ' + period.endDate + '</span></p>' +
        '<p class="text-sm opacity-80">🏷️ Filtros: Tipo <span class="font-semibold">' + (filters.chargeType === 'all' ? 'Todos' : filters.chargeType) + '</span> | Status <span class="font-semibold">' + (filters.status === 'all' ? 'Todos' : filters.status) + '</span></p>' +
        '</div>' +
        '</div>' +
        
        '<!-- Cards de Estatísticas -->' +
        '<div class="grid grid-cols-1 md:grid-cols-4 gap-4">' +
        '<div class="bg-white border-l-4 border-green-500 rounded-lg shadow p-4">' +
        '<p class="text-sm font-medium text-gray-600 mb-1">Recebido</p>' +
        '<p class="text-2xl font-bold text-green-600">R$ ' + summary.totalReceived.toFixed(2) + '</p>' +
        '</div>' +
        '<div class="bg-white border-l-4 border-yellow-500 rounded-lg shadow p-4">' +
        '<p class="text-sm font-medium text-gray-600 mb-1">Pendente</p>' +
        '<p class="text-2xl font-bold text-yellow-600">R$ ' + summary.totalPending.toFixed(2) + '</p>' +
        '</div>' +
        '<div class="bg-white border-l-4 border-red-500 rounded-lg shadow p-4">' +
        '<p class="text-sm font-medium text-gray-600 mb-1">Vencido</p>' +
        '<p class="text-2xl font-bold text-red-600">R$ ' + summary.totalOverdue.toFixed(2) + '</p>' +
        '</div>' +
        '<div class="bg-white border-l-4 border-blue-500 rounded-lg shadow p-4">' +
        '<p class="text-sm font-medium text-gray-600 mb-1">Transações</p>' +
        '<p class="text-2xl font-bold text-blue-600">' + summary.totalTransactions + '</p>' +
        '</div>' +
        '</div>' +
        
        '<!-- Botões de Exportação -->' +
        '<div class="flex gap-3">' +
        '<button onclick="exportReportToPDF()" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md transition"><i class="fas fa-file-pdf mr-2"></i>Exportar PDF</button>' +
        '<button onclick="exportReportToExcel()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition"><i class="fas fa-file-excel mr-2"></i>Exportar Excel</button>' +
        '</div>' +
        
        '<!-- Tabela de Transações -->' +
        '<div class="bg-white rounded-lg shadow overflow-hidden">' +
        '<div class="p-6 border-b border-gray-200 bg-gray-50">' +
        '<h4 class="text-lg font-bold text-gray-800"><i class="fas fa-list mr-2"></i>Transações (' + transactions.length + ')</h4>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
        '<table class="w-full">' +
        '<thead class="bg-gray-100">' +
        '<tr>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome Cliente</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CPF</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nascimento</th>' +
        '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody class="divide-y divide-gray-200">';
    
    transactions.forEach((t) => {
        html += '<tr class="hover:bg-gray-50">' +
            '<td class="px-4 py-3 text-sm text-gray-700">' + formatDate(t.dateCreated) + '</td>' +
            '<td class="px-4 py-3 text-sm text-gray-700">' + t.description + '</td>' +
            '<td class="px-4 py-3 text-sm font-semibold text-gray-900">R$ ' + t.value.toFixed(2) + '</td>' +
            '<td class="px-4 py-3">' + getStatusBadge(t.status) + '</td>' +
            '<td class="px-4 py-3 text-sm text-gray-700">' + t.customer.name + '</td>' +
            '<td class="px-4 py-3 text-sm text-gray-700">' + formatCPF(t.customer.cpf) + '</td>' +
            '<td class="px-4 py-3 text-sm text-gray-700">' + formatDate(t.customer.birthdate) + '</td>' +
            '<td class="px-4 py-3">' + getChargeTypeBadge(t.chargeType) + '</td>' +
            '</tr>';
    });
    
    html += '</tbody></table></div></div></div>';
    
    resultsDiv.innerHTML = html;
}

// Função para exportar para PDF
window.exportReportToPDF = function() {
    if (!window.ReportsDetailed.currentData) {
        alert('Gere um relatório primeiro');
        return;
    }
    
    alert('Exportação para PDF em desenvolvimento. Por enquanto, use "Imprimir" (Ctrl+P) e salve como PDF.');
    window.print();
}

// Função para exportar para Excel
window.exportReportToExcel = function() {
    if (!window.ReportsDetailed.currentData) {
        alert('Gere um relatório primeiro');
        return;
    }
    
    const { account, transactions } = window.ReportsDetailed.currentData;
    
    // Criar CSV
    let csv = 'Data,Descrição,Valor,Status,Nome Cliente,Email,CPF,Nascimento,Tipo\n';
    
    transactions.forEach(t => {
        const date = new Date(t.dateCreated).toLocaleDateString('pt-BR');
        const birthdate = t.customer.birthdate && t.customer.birthdate !== 'N/A' ? new Date(t.customer.birthdate).toLocaleDateString('pt-BR') : 'N/A';
        const cpf = t.customer.cpf ? t.customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
        
        csv += date + ',' +
            '"' + t.description + '",' +
            t.value.toFixed(2).replace('.', ',') + ',' +
            t.status + ',' +
            '"' + t.customer.name + '",' +
            '"' + t.customer.email + '",' +
            cpf + ',' +
            birthdate + ',' +
            t.chargeType + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_' + account.name.replace(/\s/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

console.log('✅ Sistema de Relatórios Detalhados carregado');
