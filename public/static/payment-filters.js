// ===== FILTROS E RELATÓRIOS DE PAGAMENTOS =====

// Estado global dos filtros (acessados via window para compatibilidade)
if (typeof window.window.currentLinkId === 'undefined') window.window.currentLinkId = null;
if (typeof window.window.currentLinkName === 'undefined') window.window.currentLinkName = null;
if (typeof window.window.allPayments === 'undefined') window.window.allPayments = [];
if (typeof window.window.filteredPayments === 'undefined') window.window.filteredPayments = [];

// Aplicar filtros
function applyPaymentFilters() {
    const searchTerm = document.getElementById('payment-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('payment-status-filter')?.value || '';
    const startDate = document.getElementById('payment-start-date')?.value || '';
    const endDate = document.getElementById('payment-end-date')?.value || '';
    const monthFilter = document.getElementById('payment-month-filter')?.value || '';
    
    window.window.filteredPayments = window.window.allPayments.filter(payment => {
        // Filtro de busca (nome do cliente ou ID)
        if (searchTerm) {
            const customerNameMatch = (payment.customerName || '').toLowerCase().includes(searchTerm);
            const customerIdMatch = (payment.customer || '').toLowerCase().includes(searchTerm);
            const idMatch = (payment.id || '').toLowerCase().includes(searchTerm);
            if (!customerNameMatch && !customerIdMatch && !idMatch) return false;
        }
        
        // Filtro de status
        if (statusFilter && payment.status !== statusFilter) {
            return false;
        }
        
        // Filtro de data inicial
        if (startDate && payment.dateCreated) {
            const paymentDate = new Date(payment.dateCreated);
            if (paymentDate < new Date(startDate)) return false;
        }
        
        // Filtro de data final
        if (endDate && payment.dateCreated) {
            const paymentDate = new Date(payment.dateCreated);
            if (paymentDate > new Date(endDate + 'T23:59:59')) return false;
        }
        
        // Filtro de mês/ano
        if (monthFilter && payment.dateCreated) {
            const paymentMonth = new Date(payment.dateCreated).toISOString().substring(0, 7); // YYYY-MM
            if (paymentMonth !== monthFilter) return false;
        }
        
        return true;
    });
    
    renderFilteredPayments();
}

// Renderizar pagamentos filtrados
function renderFilteredPayments() {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
            'RECEIVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Recebido' },
            'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
            'OVERDUE': { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencido' },
            'REFUNDED': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Reembolsado' }
        };
        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        return `<span class="px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}">${config.label}</span>`;
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };
    
    const formatShortDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    
    // Calcular estatísticas
    const totalValue = window.filteredPayments.reduce((sum, p) => sum + (p.value || 0), 0);
    const totalNetValue = window.filteredPayments.reduce((sum, p) => sum + (p.netValue || p.value || 0), 0);
    const receivedCount = window.filteredPayments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length;
    const pendingCount = window.filteredPayments.filter(p => p.status === 'PENDING').length;
    const overdueCount = window.filteredPayments.filter(p => p.status === 'OVERDUE').length;
    
    let html = `
        <div class="mb-6">
            <!-- Cabeçalho -->
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-money-bill-wave text-green-600 mr-2"></i>
                    Pagamentos: ${window.currentLinkName}
                </h3>
                <div class="flex gap-2">
                    <button onclick="exportPaymentsExcel()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm">
                        <i class="fas fa-file-excel mr-2"></i>Excel
                    </button>
                    <button onclick="exportPaymentsPDF()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold text-sm">
                        <i class="fas fa-file-pdf mr-2"></i>PDF
                    </button>
                    <button onclick="loadPaymentLinks()" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold text-sm">
                        <i class="fas fa-arrow-left mr-2"></i>Voltar
                    </button>
                </div>
            </div>
            
            <!-- Filtros -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <h4 class="font-bold text-gray-700 mb-3">
                    <i class="fas fa-filter mr-2"></i>Filtros
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar (Nome/ID)</label>
                        <input type="text" id="payment-search" placeholder="Digite para buscar..." 
                            onkeyup="applyPaymentFilters()"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="payment-status-filter" onchange="applyPaymentFilters()" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="RECEIVED">Recebido</option>
                            <option value="CONFIRMED">Confirmado</option>
                            <option value="OVERDUE">Vencido</option>
                            <option value="REFUNDED">Reembolsado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                        <input type="date" id="payment-start-date" onchange="applyPaymentFilters()" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                        <input type="date" id="payment-end-date" onchange="applyPaymentFilters()" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
                        <input type="month" id="payment-month-filter" onchange="applyPaymentFilters()" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                <div class="mt-3 flex gap-2">
                    <button onclick="clearPaymentFilters()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold">
                        <i class="fas fa-times mr-2"></i>Limpar Filtros
                    </button>
                    <span class="text-sm text-gray-600 px-3 py-2">
                        Mostrando <strong>${window.filteredPayments.length}</strong> de <strong>${window.allPayments.length}</strong> pagamentos
                    </span>
                </div>
            </div>
    `;
    
    if (window.filteredPayments.length === 0) {
        html += `
            <div class="text-center py-12 bg-gray-50 rounded-lg">
                <i class="fas fa-search text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-600 text-lg">Nenhum pagamento encontrado com os filtros aplicados</p>
                <p class="text-gray-500 text-sm mt-2">Tente ajustar os filtros ou limpar para ver todos</p>
            </div>
        `;
    } else {
        html += `
            <!-- Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow">
                    <p class="text-sm opacity-90">Recebidos</p>
                    <p class="text-2xl font-bold">${receivedCount}</p>
                    <p class="text-xs opacity-75">${formatCurrency(window.filteredPayments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').reduce((sum, p) => sum + (p.value || 0), 0))}</p>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-4 rounded-lg shadow">
                    <p class="text-sm opacity-90">Pendentes</p>
                    <p class="text-2xl font-bold">${pendingCount}</p>
                    <p class="text-xs opacity-75">${formatCurrency(window.filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.value || 0), 0))}</p>
                </div>
                <div class="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-lg shadow">
                    <p class="text-sm opacity-90">Vencidos</p>
                    <p class="text-2xl font-bold">${overdueCount}</p>
                    <p class="text-xs opacity-75">${formatCurrency(window.filteredPayments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + (p.value || 0), 0))}</p>
                </div>
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow">
                    <p class="text-sm opacity-90">Total</p>
                    <p class="text-2xl font-bold">${window.filteredPayments.length}</p>
                    <p class="text-xs opacity-75">Bruto: ${formatCurrency(totalValue)} | Líquido: ${formatCurrency(totalNetValue)}</p>
                </div>
            </div>
            
            <!-- Lista de Pagamentos -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valor</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Líquido</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vencimento</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${window.filteredPayments.map(payment => `
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-4 py-3">
                                        <div>
                                            <p class="font-semibold text-gray-800 text-sm">${payment.customerName || payment.customer || 'Cliente'}</p>
                                            <p class="text-xs text-gray-500">${payment.customerEmail || ''}</p>
                                            <p class="text-xs text-gray-400">ID: ${payment.id}</p>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">${getStatusBadge(payment.status)}</td>
                                    <td class="px-4 py-3 text-right font-semibold text-gray-800">${formatCurrency(payment.value)}</td>
                                    <td class="px-4 py-3 text-right font-semibold text-green-600">${formatCurrency(payment.netValue || payment.value)}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">${formatShortDate(payment.dateCreated)}</td>
                                    <td class="px-4 py-3 text-sm text-gray-600">${payment.dueDate || 'N/A'}</td>
                                    <td class="px-4 py-3 text-center">
                                        ${payment.invoiceUrl ? `
                                            <a href="${payment.invoiceUrl}" target="_blank" 
                                                class="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                                <i class="fas fa-file-invoice"></i>
                                            </a>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    document.getElementById('payment-links-list').innerHTML = html;
}

// Limpar filtros
function clearPaymentFilters() {
    document.getElementById('payment-search').value = '';
    document.getElementById('payment-status-filter').value = '';
    document.getElementById('payment-start-date').value = '';
    document.getElementById('payment-end-date').value = '';
    document.getElementById('payment-month-filter').value = '';
    window.filteredPayments = [...window.allPayments];
    renderFilteredPayments();
}

// Exportar para Excel
function exportPaymentsExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Biblioteca XLSX não carregada. Recarregue a página.');
        return;
    }
    
    const data = window.filteredPayments.map(p => ({
        'Cliente': p.customer || 'N/A',
        'ID': p.id,
        'Status': p.status,
        'Valor': p.value,
        'Valor Líquido': p.netValue || p.value,
        'Data Criação': new Date(p.dateCreated).toLocaleString('pt-BR'),
        'Vencimento': p.dueDate || 'N/A',
        'Descrição': p.description || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagamentos');
    
    const fileName = `pagamentos_${window.currentLinkName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Exportar para PDF
function exportPaymentsPDF() {
    if (typeof jsPDF === 'undefined') {
        alert('Biblioteca jsPDF não carregada. Recarregue a página.');
        return;
    }
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text(`Relatório de Pagamentos`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Link: ${window.currentLinkName}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    
    // Estatísticas
    const totalValue = window.filteredPayments.reduce((sum, p) => sum + (p.value || 0), 0);
    const receivedCount = window.filteredPayments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length;
    
    doc.text(`Total de Pagamentos: ${window.filteredPayments.length}`, 14, 35);
    doc.text(`Pagamentos Recebidos: ${receivedCount}`, 14, 40);
    doc.text(`Valor Total: R$ ${totalValue.toFixed(2)}`, 14, 45);
    
    // Tabela
    const tableData = window.filteredPayments.map(p => [
        p.customer || 'Cliente',
        p.status,
        `R$ ${(p.value || 0).toFixed(2)}`,
        new Date(p.dateCreated).toLocaleDateString('pt-BR')
    ]);
    
    doc.autoTable({
        head: [['Cliente', 'Status', 'Valor', 'Data']],
        body: tableData,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }
    });
    
    const fileName = `pagamentos_${window.currentLinkName}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}
