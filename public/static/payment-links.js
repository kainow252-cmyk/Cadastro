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
                <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input type="text" value="${link.url}" readonly 
                        class="flex-1 min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded text-sm">
                    <button onclick="viewLinkPayments('${link.id}', '${link.name}')" 
                        class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold text-sm whitespace-nowrap">
                        <i class="fas fa-money-bill-wave mr-2"></i>Pagamentos
                    </button>
                    <button onclick="generateQRCodeHTML('${link.url}', '${link.name.replace(/'/g, "\\'")}', '${formatCurrency(link.value)}')" 
                        class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 font-semibold text-sm whitespace-nowrap">
                        <i class="fas fa-qrcode mr-2"></i>QR Code HTML
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
        
        // Buscar informações dos clientes para cada pagamento
        const payments = response.data.data || [];
        const enrichedPayments = await Promise.all(payments.map(async (payment) => {
            try {
                if (payment.customer) {
                    const customerResponse = await axios.get(`/api/customers/${payment.customer}`);
                    payment.customerName = customerResponse.data.data?.name || payment.customer;
                    payment.customerEmail = customerResponse.data.data?.email || '';
                }
            } catch (err) {
                console.warn(`Erro ao buscar cliente ${payment.customer}:`, err);
                payment.customerName = payment.customer; // Fallback para ID
            }
            return payment;
        }));
        
        // Definir variáveis globais para payment-filters.js
        window.currentLinkId = linkId;
        window.currentLinkName = linkName;
        window.allPayments = enrichedPayments;
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

// Função auxiliar para copiar para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar link');
    });
}

// Gerar HTML do QR Code para embedding
function generateQRCodeHTML(linkUrl, linkName, linkValue) {
    // URL da API do Google Charts para gerar QR Code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkUrl)}`;
    
    // HTML completo pronto para copiar e colar
    const htmlCode = `<!-- QR Code de Pagamento: ${linkName} -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 30px; max-width: 400px; margin: 20px auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2); font-family: Arial, sans-serif; color: white; text-align: center;">
    
    <!-- Título -->
    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">
        💳 Pagamento PIX
    </h2>
    
    <!-- Nome do Link -->
    <p style="margin: 0 0 20px 0; font-size: 18px; opacity: 0.9;">
        ${linkName}
    </p>
    
    <!-- QR Code -->
    <div style="background: white; padding: 20px; border-radius: 15px; display: inline-block; margin-bottom: 20px;">
        <img src="${qrCodeUrl}" 
             alt="QR Code para Pagamento" 
             style="width: 250px; height: 250px; display: block;">
    </div>
    
    <!-- Valor -->
    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Valor:</p>
        <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">
            ${linkValue}
        </p>
    </div>
    
    <!-- Instruções -->
    <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9; line-height: 1.5;">
        📱 Aponte a câmera do seu celular<br>
        ou app do banco para o QR Code
    </p>
    
    <!-- Botão -->
    <a href="${linkUrl}" 
       target="_blank"
       style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; transition: transform 0.2s;">
        Pagar Agora →
    </a>
    
    <!-- Rodapé -->
    <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.7;">
        🔒 Pagamento seguro via Asaas
    </p>
    
</div>
<!-- Fim do QR Code -->`;

    // Criar modal para exibir o código
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 30px; max-width: 900px; max-height: 90vh; overflow-y: auto; position: relative;">
            <!-- Botão Fechar -->
            <button onclick="this.closest('div[style*=fixed]').remove()" 
                style="position: absolute; top: 15px; right: 15px; background: #f3f4f6; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 20px; color: #6b7280; transition: all 0.2s;">
                ×
            </button>
            
            <!-- Título -->
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                <i class="fas fa-qrcode" style="color: #8b5cf6; margin-right: 10px;"></i>
                Código HTML do QR Code
            </h2>
            
            <!-- Preview -->
            <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; font-weight: 600;">
                    📱 Preview:
                </h3>
                <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; overflow-x: auto;">
                    ${htmlCode}
                </div>
            </div>
            
            <!-- Código HTML -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; font-weight: 600;">
                    📋 Código HTML (Copie e Cole):
                </h3>
                <textarea id="html-code-textarea" readonly 
                    style="width: 100%; height: 200px; padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; resize: vertical;">${htmlCode}</textarea>
            </div>
            
            <!-- Instruções -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                    💡 Como usar:
                </h4>
                <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.6;">
                    <li>Clique no botão "Copiar Código" abaixo</li>
                    <li>Cole no HTML do seu site, banner, email ou página</li>
                    <li>O QR Code funcionará automaticamente</li>
                    <li>Personalize cores e textos se desejar</li>
                </ol>
            </div>
            
            <!-- Botões -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="
                    const textarea = document.getElementById('html-code-textarea');
                    textarea.select();
                    document.execCommand('copy');
                    this.innerHTML = '<i class=\\"fas fa-check\\"></i> Código Copiado!';
                    this.style.background = '#10b981';
                    setTimeout(() => {
                        this.innerHTML = '<i class=\\"fas fa-copy\\"></i> Copiar Código';
                        this.style.background = '#8b5cf6';
                    }, 2000);
                " 
                style="flex: 1; background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-copy"></i> Copiar Código
                </button>
                
                <button onclick="
                    const blob = new Blob([document.getElementById('html-code-textarea').value], {type: 'text/html'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'qrcode-pagamento.html';
                    a.click();
                " 
                style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-download"></i> Baixar HTML
                </button>
                
                <button onclick="this.closest('div[style*=fixed]').remove()" 
                style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===== CONFIGURAÇÃO DO SORTEIO =====
document.addEventListener('DOMContentLoaded', () => {
    const lotteryEnabled = document.getElementById('paylink-lottery-enabled');
    const lotteryFields = document.getElementById('lottery-config-fields');
    const lotteryDrawDate = document.getElementById('paylink-lottery-draw-date');
    const lotteryDescription = document.getElementById('paylink-lottery-description');
    const lotteryPrize = document.getElementById('paylink-lottery-prize');
    
    // Preview elements
    const previewDate = document.getElementById('lottery-preview-date');
    const previewDesc = document.getElementById('lottery-preview-desc');
    const previewPrize = document.getElementById('lottery-preview-prize');
    
    // Ativar/Desativar campos do sorteio
    if (lotteryEnabled && lotteryFields) {
        lotteryEnabled.addEventListener('change', () => {
            if (lotteryEnabled.checked) {
                lotteryFields.style.display = 'grid';
            } else {
                lotteryFields.style.display = 'none';
            }
        });
    }
    
    // Atualizar preview da data
    if (lotteryDrawDate && previewDate) {
        lotteryDrawDate.addEventListener('change', () => {
            if (lotteryDrawDate.value) {
                const date = new Date(lotteryDrawDate.value + 'T00:00:00');
                previewDate.textContent = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } else {
                previewDate.textContent = 'Próxima quarta-feira';
            }
        });
    }
    
    // Atualizar preview da descrição
    if (lotteryDescription && previewDesc) {
        lotteryDescription.addEventListener('input', () => {
            previewDesc.textContent = lotteryDescription.value || 'Loteria Federal';
        });
    }
    
    // Atualizar preview do prêmio
    if (lotteryPrize && previewPrize) {
        lotteryPrize.addEventListener('input', () => {
            previewPrize.textContent = lotteryPrize.value || '1º Prêmio - R$ 500.000,00';
        });
    }
});
