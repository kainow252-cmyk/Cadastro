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
    const isConsolidated = account.id === 'ALL_ACCOUNTS';
    
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
        (isConsolidated ? '<th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subconta</th>' : '') +
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
            (isConsolidated ? '<td class="px-4 py-3 text-sm font-medium text-blue-700"><i class="fas fa-building mr-1"></i>' + (t.accountName || 'N/A') + '</td>' : '') +
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
window.exportReportToPDF = async function() {
    if (!window.ReportsDetailed.currentData) {
        alert('Gere um relatório primeiro');
        return;
    }
    
    // Carregar jsPDF e autoTable dinamicamente
    if (typeof jsPDF === 'undefined') {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script1);
        
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
        document.head.appendChild(script2);
        
        await new Promise((resolve) => {
            script2.onload = resolve;
        });
    }
    
    const { account, period, filters, summary, transactions } = window.ReportsDetailed.currentData;
    const isConsolidated = account.id === 'ALL_ACCOUNTS';
    
    // Criar instância do jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Subconta', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
    
    // Informações da conta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Conta: ${account.name}`, 14, yPos);
    yPos += 6;
    doc.text(`Email: ${account.email}`, 14, yPos);
    yPos += 6;
    doc.text(`CPF/CNPJ: ${account.cpfCnpj}`, 14, yPos);
    yPos += 6;
    doc.text(`Período: ${period.startDate} até ${period.endDate}`, 14, yPos);
    yPos += 6;
    doc.text(`Filtros: Tipo ${filters.chargeType === 'all' ? 'Todos' : filters.chargeType} | Status ${filters.status === 'all' ? 'Todos' : filters.status}`, 14, yPos);
    yPos += 10;
    
    // Estatísticas
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo Financeiro:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Recebido: R$ ${summary.totalReceived.toFixed(2)}`, 14, yPos);
    doc.text(`Pendente: R$ ${summary.totalPending.toFixed(2)}`, 70, yPos);
    yPos += 6;
    doc.text(`Vencido: R$ ${summary.totalOverdue.toFixed(2)}`, 14, yPos);
    doc.text(`Transações: ${summary.totalTransactions}`, 70, yPos);
    yPos += 10;
    
    // Preparar dados da tabela
    const tableData = transactions.map(t => {
        const date = t.dateCreated ? new Date(t.dateCreated).toLocaleDateString('pt-BR') : 'N/A';
        const birthdate = t.customer.birthdate && t.customer.birthdate !== 'N/A' ? new Date(t.customer.birthdate).toLocaleDateString('pt-BR') : 'N/A';
        const cpf = t.customer.cpf ? t.customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
        
        const chargeTypeLabels = {
            'single': 'QR Code Avulso',
            'monthly': 'Assinatura Mensal',
            'pix_auto': 'PIX Automático',
            'link_cadastro': 'Link Auto-Cadastro'
        };
        
        const row = [
            date,
            t.description,
            `R$ ${t.value.toFixed(2)}`,
            t.status
        ];
        
        // Adicionar coluna Subconta se for relatório consolidado
        if (isConsolidated) {
            row.push(t.accountName || 'N/A');
        }
        
        row.push(
            t.customer.name,
            cpf,
            birthdate,
            chargeTypeLabels[t.chargeType] || 'Mensal'
        );
        
        return row;
    });
    
    // Cabeçalho da tabela (adiciona "Subconta" se for consolidado)
    const tableHead = ['Data', 'Descrição', 'Valor', 'Status'];
    if (isConsolidated) {
        tableHead.push('Subconta');
    }
    tableHead.push('Cliente', 'CPF', 'Nascimento', 'Tipo');
    
    // Estilos de colunas (ajustado para incluir Subconta se necessário)
    let columnStyles;
    if (isConsolidated) {
        columnStyles = {
            0: { cellWidth: 18 },  // Data
            1: { cellWidth: 28 },  // Descrição
            2: { cellWidth: 18 },  // Valor
            3: { cellWidth: 18 },  // Status
            4: { cellWidth: 25 },  // Subconta
            5: { cellWidth: 25 },  // Cliente
            6: { cellWidth: 22 },  // CPF
            7: { cellWidth: 18 },  // Nascimento
            8: { cellWidth: 28 }   // Tipo
        };
    } else {
        columnStyles = {
            0: { cellWidth: 20 },  // Data
            1: { cellWidth: 35 },  // Descrição
            2: { cellWidth: 22 },  // Valor
            3: { cellWidth: 20 },  // Status
            4: { cellWidth: 30 },  // Cliente
            5: { cellWidth: 25 },  // CPF
            6: { cellWidth: 20 },  // Nascimento
            7: { cellWidth: 28 }   // Tipo
        };
    }
    
    // Adicionar tabela
    doc.autoTable({
        head: [tableHead],
        body: tableData,
        startY: yPos,
        styles: { 
            fontSize: 7,
            cellPadding: 1.5
        },
        headStyles: {
            fillColor: [249, 115, 22], // Orange-500
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251] // Gray-50
        },
        columnStyles: columnStyles
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} - Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }
    
    // Download
    const fileName = `relatorio_${account.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

// Função para exportar para Excel
window.exportReportToExcel = function() {
    if (!window.ReportsDetailed.currentData) {
        alert('Gere um relatório primeiro');
        return;
    }
    
    const { account, transactions } = window.ReportsDetailed.currentData;
    const isConsolidated = account.id === 'ALL_ACCOUNTS';
    
    // Criar CSV com cabeçalho dinâmico
    let csv = 'Data,Descrição,Valor,Status,';
    if (isConsolidated) {
        csv += 'Subconta,';
    }
    csv += 'Nome Cliente,Email,CPF,Nascimento,Tipo\n';
    
    transactions.forEach(t => {
        const date = new Date(t.dateCreated).toLocaleDateString('pt-BR');
        const birthdate = t.customer.birthdate && t.customer.birthdate !== 'N/A' ? new Date(t.customer.birthdate).toLocaleDateString('pt-BR') : 'N/A';
        const cpf = t.customer.cpf ? t.customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'N/A';
        
        csv += date + ',' +
            '"' + t.description + '",' +
            t.value.toFixed(2).replace('.', ',') + ',' +
            t.status + ',';
        
        // Adicionar subconta se for relatório consolidado
        if (isConsolidated) {
            csv += '"' + (t.accountName || 'N/A') + '",';
        }
        
        csv += '"' + t.customer.name + '",' +
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
