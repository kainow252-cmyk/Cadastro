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

// Visualizar pagamentos de um link (integra com payment-filters.js)
async function viewLinkPayments(linkId, linkName) {
    try {
        const response = await axios.get(`/api/payment-links/${linkId}/payments`);
        
        // Definir variáveis globais para payment-filters.js
        window.currentLinkId = linkId;
        window.currentLinkName = linkName;
        window.allPayments = response.data.data || [];
        window.filteredPayments = [...window.allPayments];
        
        // Renderizar com filtros
        if (typeof renderFilteredPayments === 'function') {
            renderFilteredPayments();
        } else {
            console.error('payment-filters.js não carregado');
            alert('Erro: Módulo de filtros não carregado. Recarregue a página.');
        }
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        alert('Erro ao carregar pagamentos: ' + (error.response?.data?.error || error.message));
    }
}


// Renderizar pagamentos com filtros - Ver payment-filters.js
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar link');
    });
}
