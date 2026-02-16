// ===== FUNÇÕES DE LINKS DE PAGAMENTO (Asaas API) =====
// Links são criados direto na conta principal, SEM subconta

// Configure axios to send cookies
if (typeof axios !== 'undefined') {
    axios.defaults.withCredentials = true;
}

// Alternar entre tipos de cobrança
document.addEventListener('DOMContentLoaded', () => {
    const chargeTypeSelect = document.getElementById('paylink-charge-type');
    const billingTypeSelect = document.getElementById('paylink-billing-type');
    const detachedSection = document.getElementById('paylink-detached-section');
    const recurrentSection = document.getElementById('paylink-recurrent-section');
    const installmentSection = document.getElementById('paylink-installment-section');
    const valueInput = document.getElementById('paylink-value');
    const recurrentValueInput = document.getElementById('paylink-recurrent-value');
    const installmentValueInput = document.getElementById('paylink-installment-value');
    
    // Função para verificar restrições de tipo de cobrança
    const updateChargeTypeAvailability = () => {
        if (billingTypeSelect && chargeTypeSelect) {
            const billingType = billingTypeSelect.value;
            const recurrentOption = chargeTypeSelect.querySelector('option[value="RECURRENT"]');
            const installmentOption = chargeTypeSelect.querySelector('option[value="INSTALLMENT"]');
            
            // PIX não suporta recorrente nem parcelamento
            if (billingType === 'PIX') {
                if (recurrentOption) {
                    recurrentOption.disabled = true;
                    recurrentOption.textContent = 'Assinatura Recorrente (não disponível para PIX)';
                }
                if (installmentOption) {
                    installmentOption.disabled = true;
                    installmentOption.textContent = 'Parcelado (não disponível para PIX)';
                }
                // Força DETACHED se estava em outro tipo
                if (chargeTypeSelect.value !== 'DETACHED') {
                    chargeTypeSelect.value = 'DETACHED';
                    chargeTypeSelect.dispatchEvent(new Event('change'));
                }
            } else {
                // Outras formas de pagamento permitem todos os tipos
                if (recurrentOption) {
                    recurrentOption.disabled = false;
                    recurrentOption.textContent = 'Assinatura Recorrente';
                }
                if (installmentOption) {
                    installmentOption.disabled = false;
                    installmentOption.textContent = 'Parcelado (Cartão)';
                }
            }
        }
    };
    
    // Event listener para mudança no tipo de cobrança (billing)
    if (billingTypeSelect) {
        billingTypeSelect.addEventListener('change', updateChargeTypeAvailability);
    }
    
    // Event listener para mudança no tipo de valor (charge)
    if (chargeTypeSelect) {
        chargeTypeSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            
            // Esconder todas as seções primeiro
            if (detachedSection) detachedSection.classList.add('hidden');
            if (recurrentSection) recurrentSection.classList.add('hidden');
            if (installmentSection) installmentSection.classList.add('hidden');
            
            // Mostrar seção apropriada e configurar required
            if (value === 'DETACHED') {
                if (detachedSection) detachedSection.classList.remove('hidden');
                if (valueInput) valueInput.required = true;
                if (recurrentValueInput) recurrentValueInput.required = false;
                if (installmentValueInput) installmentValueInput.required = false;
            } else if (value === 'RECURRENT') {
                if (recurrentSection) recurrentSection.classList.remove('hidden');
                if (valueInput) valueInput.required = false;
                if (recurrentValueInput) recurrentValueInput.required = true;
                if (installmentValueInput) installmentValueInput.required = false;
            } else if (value === 'INSTALLMENT') {
                if (installmentSection) installmentSection.classList.remove('hidden');
                if (valueInput) valueInput.required = false;
                if (recurrentValueInput) recurrentValueInput.required = false;
                if (installmentValueInput) installmentValueInput.required = true;
            }
        });
    }
    
    // Submit form
    const form = document.getElementById('payment-link-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createPaymentLink();
        });
    }
    
    // Inicializar estado
    updateChargeTypeAvailability();
});

// Criar link de pagamento (SEM subconta - direto na conta principal)
async function createPaymentLink() {
    const name = document.getElementById('paylink-name').value;
    const description = document.getElementById('paylink-description').value;
    const billingType = document.getElementById('paylink-billing-type').value;
    const chargeType = document.getElementById('paylink-charge-type').value;
    const notificationEnabled = document.getElementById('paylink-notification')?.checked || false;
    
    if (!name) {
        alert('Preencha o nome do link');
        return;
    }
    
    const data = {
        name,
        billingType,
        chargeType,
        notificationEnabled
    };
    
    if (description) data.description = description;
    
    // Campos específicos por tipo
    if (chargeType === 'DETACHED') {
        const value = document.getElementById('paylink-value').value;
        const dueDays = document.getElementById('paylink-due-days').value;
        
        if (!value || parseFloat(value) <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        data.value = parseFloat(value);
        if (dueDays) data.dueDateLimitDays = parseInt(dueDays);
        
    } else if (chargeType === 'RECURRENT') {
        const value = document.getElementById('paylink-recurrent-value').value;
        const cycle = document.getElementById('paylink-cycle').value;
        
        if (!value || parseFloat(value) <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        data.value = parseFloat(value);
        data.subscriptionCycle = cycle;
        
    } else if (chargeType === 'INSTALLMENT') {
        const value = document.getElementById('paylink-installment-value').value;
        const maxInstallments = document.getElementById('paylink-max-installments').value;
        
        if (!value || parseFloat(value) <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        data.value = parseFloat(value);
        data.maxInstallmentCount = parseInt(maxInstallments);
    }
    
    try {
        const response = await axios.post('/api/payment-links', data);
        
        if (response.data.ok) {
            alert('Link de pagamento criado com sucesso!');
            document.getElementById('payment-link-form').reset();
            loadPaymentLinks();
        } else {
            alert('Erro: ' + (response.data.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao criar link:', error);
        alert('Erro ao criar link: ' + (error.response?.data?.error || error.message));
    }
}

// Carregar lista de links
async function loadPaymentLinks() {
    try {
        const response = await axios.get('/api/payment-links');
        const links = response.data.data || [];
        
        const container = document.getElementById('payment-links-list');
        
        if (links.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-link text-6xl mb-4 opacity-30"></i>
                    <p class="text-lg">Nenhum link criado ainda</p>
                </div>
            `;
            return;
        }
        
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };
        
        const getChargeTypeLabel = (type) => {
            const types = {
                'DETACHED': 'Pagamento Único',
                'RECURRENT': 'Assinatura',
                'INSTALLMENT': 'Parcelado'
            };
            return types[type] || type;
        };
        
        const getBillingTypeLabel = (type) => {
            const types = {
                'UNDEFINED': 'Todos',
                'PIX': 'PIX',
                'CREDIT_CARD': 'Cartão',
                'BOLETO': 'Boleto'
            };
            return types[type] || type;
        };
        
        container.innerHTML = links.map(link => `
            <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-gray-800">${link.name}</h4>
                        ${link.description ? `<p class="text-sm text-gray-600">${link.description}</p>` : ''}
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        link.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }">
                        ${link.active ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    <div>
                        <span class="text-gray-500">Tipo:</span>
                        <span class="font-semibold ml-1">${getChargeTypeLabel(link.chargeType)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Pagamento:</span>
                        <span class="font-semibold ml-1">${getBillingTypeLabel(link.billingType)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Valor:</span>
                        <span class="font-semibold ml-1">${formatCurrency(link.value)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Notificações:</span>
                        <span class="font-semibold ml-1">${link.notificationEnabled ? 'Sim' : 'Não'}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input type="text" value="${link.url}" readonly 
                        class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm">
                    <button onclick="viewLinkPayments('${link.id}', '${link.name}')" 
                        class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold text-sm whitespace-nowrap">
                        <i class="fas fa-money-bill-wave mr-2"></i>Pagamentos
                    </button>
                    <button onclick="copyToClipboard('${link.url}')" 
                        class="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 font-semibold text-sm">
                        <i class="fas fa-copy mr-2"></i>Copiar
                    </button>
                    <a href="${link.url}" target="_blank" 
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold text-sm">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button onclick="deletePaymentLink('${link.id}')" 
                        class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar links:', error);
    }
}

// Deletar link de pagamento
async function deletePaymentLink(linkId) {
    if (!confirm('Deseja realmente deletar este link? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        await axios.delete(`/api/payment-links/${linkId}`);
        alert('Link deletado com sucesso!');
        loadPaymentLinks();
    } catch (error) {
        console.error('Erro ao deletar link:', error);
        alert('Erro ao deletar link: ' + (error.response?.data?.error || error.message));
    }
}

// Visualizar pagamentos de um link
async function viewLinkPayments(linkId, linkName) {
    try {
        const response = await axios.get(`/api/payment-links/${linkId}/payments`);
        const payments = response.data.data || [];
        
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
        
        let html = `
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-money-bill-wave text-green-600 mr-2"></i>
                        Pagamentos do Link: ${linkName}
                    </h3>
                    <button onclick="loadPaymentLinks()" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        <i class="fas fa-arrow-left mr-2"></i>Voltar
                    </button>
                </div>
        `;
        
        if (payments.length === 0) {
            html += `
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                    <i class="fas fa-receipt text-gray-300 text-6xl mb-4"></i>
                    <p class="text-gray-600 text-lg">Nenhum pagamento realizado ainda</p>
                    <p class="text-gray-500 text-sm mt-2">Compartilhe o link para receber pagamentos</p>
                </div>
            `;
        } else {
            html += `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm opacity-90">Total de Pagamentos</p>
                                <p class="text-3xl font-bold">${payments.length}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm opacity-90">Valor Total</p>
                                <p class="text-3xl font-bold">${formatCurrency(payments.reduce((sum, p) => sum + (p.value || 0), 0))}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="divide-y divide-gray-200">
                        ${payments.map(payment => `
                            <div class="p-4 hover:bg-gray-50 transition">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <p class="font-semibold text-gray-800">${payment.customer || 'Cliente'}</p>
                                        <p class="text-sm text-gray-600">ID: ${payment.id}</p>
                                    </div>
                                    ${getStatusBadge(payment.status)}
                                </div>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                                    <div>
                                        <span class="text-gray-500">Valor:</span>
                                        <span class="font-semibold ml-1">${formatCurrency(payment.value)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Líquido:</span>
                                        <span class="font-semibold ml-1 text-green-600">${formatCurrency(payment.netValue || payment.value)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Criado:</span>
                                        <span class="font-semibold ml-1">${formatDate(payment.dateCreated)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Vencimento:</span>
                                        <span class="font-semibold ml-1">${payment.dueDate || 'N/A'}</span>
                                    </div>
                                </div>
                                ${payment.description ? `<p class="text-sm text-gray-600 mt-2">${payment.description}</p>` : ''}
                                ${payment.invoiceUrl ? `
                                    <a href="${payment.invoiceUrl}" target="_blank" 
                                        class="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold">
                                        <i class="fas fa-file-invoice mr-1"></i>Ver Fatura
                                    </a>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        document.getElementById('payment-links-list').innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        alert('Erro ao carregar pagamentos: ' + (error.response?.data?.error || error.message));
    }
}

// Função auxiliar para copiar para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar link');
    });
}
