// Check authentication on page load
async function checkAuth() {
    try {
        const response = await axios.get('/api/check-auth');
        if (!response.data.authenticated) {
            window.location.href = '/login';
        }
        return response.data;
    } catch (error) {
        window.location.href = '/login';
    }
}

// Logout function
async function logout() {
    if (confirm('Deseja realmente sair?')) {
        try {
            await axios.post('/api/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            window.location.href = '/login';
        }
    }
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + '-section').classList.remove('hidden');
    
    if (section === 'accounts') {
        loadAccounts();
    } else if (section === 'dashboard') {
        loadDashboard();
    } else if (section === 'pix') {
        loadSubaccountsForPix();
        loadRecentPayments();
    } else if (section === 'api-keys') {
        loadSubaccountsFilter();
    } else if (section === 'reports') {
        loadReportAccounts();
    } else if (section === 'payment-links') {
        loadPaymentLinkAccounts();
        loadPaymentLinks();
    }
}

// Load Dashboard Stats
async function loadDashboard() {
    try {
        const response = await axios.get('/api/accounts');
        if (response.data.ok && response.data.data) {
            const accounts = response.data.data.data || [];
            document.getElementById('total-accounts').textContent = accounts.length;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Accounts
async function loadAccounts() {
    const listDiv = document.getElementById('accounts-list');
    listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Carregando...</p>';
    
    try {
        const response = await axios.get('/api/accounts');
        
        // Nova estrutura de resposta: {accounts: [...], totalCount: N}
        if (response.data && response.data.accounts) {
            const accounts = response.data.accounts || [];
            
            // Salvar accounts globalmente para filtros
            saveAccountsData(accounts);
            
            if (accounts.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma subconta encontrada. Crie uma nova subconta acima.</p>';
                return;
            }
            
            // Usar nova função de exibição
            displayAccounts(accounts);
            
            // Atualizar contador
            const resultsDiv = document.getElementById('search-results');
            if (resultsDiv) {
                resultsDiv.textContent = `Mostrando ${accounts.length} de ${accounts.length} subcontas`;
            }
            return;

        } else if (response.data && response.data.error) {
            // Caso de erro retornado pela API
            listDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800">Erro ao carregar subcontas: ${response.data.error}</p>
                    <button onclick="loadAccounts()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            `;
        } else {
            // Formato de resposta inesperado
            console.error('Formato de resposta inesperado:', response.data);
            listDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800">Erro ao carregar subcontas: Formato de resposta inesperado</p>
                    <button onclick="loadAccounts()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
        listDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">Erro: ${error.message}</p>
                <button onclick="loadAccounts()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Create Account
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    await checkAuth();
    
    // Then proceed with page initialization
    document.getElementById('create-account-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Remove empty fields
        Object.keys(data).forEach(key => {
            if (!data[key] || data[key] === '') delete data[key];
        });
        
        const resultDiv = document.getElementById('create-result');
        resultDiv.innerHTML = '<p class="text-blue-600">Criando subconta...</p>';
        resultDiv.classList.remove('hidden');
        
        try {
            const response = await axios.post('/api/accounts', data);
            
            if (response.data.ok && response.data.data) {
                const account = response.data.data;
                const apiKeyHtml = account.apiKey ? `<p class="bg-yellow-50 p-2 rounded"><strong>API Key:</strong> <code class="text-xs break-all">${account.apiKey}</code></p>` : '';
                const walletHtml = account.walletId ? `<p><strong>Wallet ID:</strong> ${account.walletId}</p>` : '';
                
                resultDiv.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-green-800 mb-2">
                            <i class="fas fa-check-circle mr-2"></i>Subconta criada com sucesso!
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p><strong>ID:</strong> ${account.id}</p>
                            <p><strong>Nome:</strong> ${account.name}</p>
                            <p><strong>Email:</strong> ${account.email}</p>
                            ${apiKeyHtml}
                            ${walletHtml}
                        </div>
                        <button onclick="showSection('accounts')" 
                            class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Ver Todas as Subcontas
                        </button>
                    </div>
                `;
                e.target.reset();
            } else {
                resultDiv.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p class="text-red-800">Erro: ${response.data.data?.errors?.[0]?.description || response.data.data?.message || 'Erro ao criar subconta'}</p>
                    </div>
                `;
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800">Erro: ${error.response?.data?.error || error.message}</p>
                </div>
            `;
        }
    });

    // Create Link
    document.getElementById('create-link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const accountId = document.getElementById('link-account-id').value;
        const expirationDays = parseInt(document.getElementById('link-expiration').value);
        
        if (!accountId) {
            alert('Por favor, informe o ID da subconta');
            return;
        }
        
        try {
            const response = await axios.post('/api/signup-link', {
                accountId,
                expirationDays
            });
            
            if (response.data.ok) {
                const link = response.data.data;
                const linksDiv = document.getElementById('links-list');
                
                if (linksDiv.querySelector('p')) {
                    linksDiv.innerHTML = '';
                }
                
                const linkHtml = `
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="text-sm text-gray-600 mb-2">
                                    <i class="fas fa-user mr-2"></i>Subconta: <strong>${accountId}</strong>
                                </p>
                                <div class="bg-gray-50 p-3 rounded mb-2">
                                    <code class="text-sm text-blue-600 break-all">${link.url}</code>
                                </div>
                                <div class="flex gap-4 text-xs text-gray-600">
                                    <span><i class="fas fa-calendar mr-1"></i>Criado: ${new Date(link.createdAt).toLocaleString('pt-BR')}</span>
                                    <span><i class="fas fa-clock mr-1"></i>Expira: ${new Date(link.expiresAt).toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                            <button onclick="copyLink('${link.url}')" 
                                class="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                <i class="fas fa-copy mr-1"></i>Copiar
                            </button>
                        </div>
                    </div>
                `;
                
                linksDiv.insertAdjacentHTML('afterbegin', linkHtml);
                document.getElementById('link-account-id').value = '';
            }
        } catch (error) {
            alert('Erro ao criar link: ' + error.message);
        }
    });

    // Load dashboard on page load
    loadDashboard();
});

// Helper Functions
function createLinkForAccount(accountId) {
    showSection('links');
    document.getElementById('link-account-id').value = accountId;
}

function viewAccount(accountId) {
    alert('Visualizar detalhes da conta: ' + accountId);
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado para a área de transferência!');
    });
}

// =====================================
// FUNÇÕES PIX
// =====================================

// Carregar subcontas para o select de PIX
async function loadSubaccountsForPix() {
    try {
        const response = await axios.get('/api/accounts');
        
        if (response.data.ok && response.data.data) {
            const accounts = response.data.data.data || [];
            const select = document.getElementById('pix-subaccount');
            
            select.innerHTML = '<option value="">Selecione a subconta...</option>';
            
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = JSON.stringify({
                    id: account.id,
                    walletId: account.walletId,
                    name: account.name
                });
                option.textContent = `${account.name} - ${account.email}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
        alert('Erro ao carregar subcontas. Verifique sua conexão.');
    }
}

// Gerar API Key para subconta selecionada
async function generateApiKeyForSubaccount() {
    const select = document.getElementById('pix-subaccount');
    
    if (!select.value) {
        alert('Por favor, selecione uma subconta primeiro!');
        return;
    }
    
    try {
        const subaccountData = JSON.parse(select.value);
        
        // Mostrar loading
        const originalText = event.target.innerHTML;
        event.target.disabled = true;
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Gerar API Key sem expiração (tempo indeterminado)
        const response = await axios.post(
            `/api/accounts/${subaccountData.id}/api-key`,
            {
                name: `API Key - ${subaccountData.name} - ${new Date().toLocaleDateString('pt-BR')}`
                // Sem expiresAt = tempo indeterminado
            }
        );
        
        if (response.data.ok) {
            const apiKeyData = response.data.data;
            
            // Mostrar resultado
            document.getElementById('generated-api-key').value = apiKeyData.apiKey;
            document.getElementById('api-key-details').innerHTML = `
                <p><strong>Nome:</strong> ${apiKeyData.name}</p>
                <p><strong>ID:</strong> ${apiKeyData.id}</p>
                <p><strong>Criada em:</strong> ${new Date(apiKeyData.createdAt).toLocaleString('pt-BR')}</p>
                ${apiKeyData.expiresAt ? `<p><strong>Expira em:</strong> ${new Date(apiKeyData.expiresAt).toLocaleString('pt-BR')}</p>` : '<p><strong>Validade:</strong> Sem expiração</p>'}
                <p><strong>Status:</strong> ${apiKeyData.active ? '✅ Ativa' : '❌ Inativa'}</p>
            `;
            
            document.getElementById('api-key-result').classList.remove('hidden');
            
            // Scroll para o resultado
            document.getElementById('api-key-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Mostrar aviso novamente
            setTimeout(() => {
                alert(
                    '✅ API Key gerada com sucesso!\n\n' +
                    '⚠️ IMPORTANTE: Copie a API Key agora!\n\n' +
                    'Esta é a única vez que ela será exibida.\n' +
                    'Não será possível recuperá-la depois.'
                );
            }, 500);
            
        } else {
            throw new Error(response.data.error || 'Erro desconhecido');
        }
        
        // Restaurar botão
        event.target.disabled = false;
        event.target.innerHTML = originalText;
        
    } catch (error) {
        console.error('Erro ao gerar API Key:', error);
        
        let errorMessage = 'Erro ao gerar API Key:\n\n';
        
        if (error.response?.status === 403 || error.response?.status === 401) {
            errorMessage += 
                '❌ Acesso negado!\n\n' +
                'Para gerar API Keys de subcontas, você precisa:\n\n' +
                '1. Acessar a conta principal no Asaas\n' +
                '2. Ir em Integrações → Chaves de API\n' +
                '3. Localizar "Gerenciamento de Chaves de API de Subcontas"\n' +
                '4. Clicar em "Habilitar acesso"\n\n' +
                '⏰ A habilitação dura 2 horas e depois expira automaticamente.';
        } else if (error.response?.data?.message) {
            errorMessage += error.response.data.message;
        } else {
            errorMessage += error.message || 'Erro desconhecido';
        }
        
        alert(errorMessage);
        
        // Restaurar botão
        if (event.target) {
            event.target.disabled = false;
            event.target.innerHTML = originalText;
        }
    }
}

// Copiar API Key
function copyApiKey() {
    const apiKey = document.getElementById('generated-api-key').value;
    
    navigator.clipboard.writeText(apiKey).then(() => {
        alert('✅ API Key copiada para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('❌ Erro ao copiar a API Key. Tente selecionar e copiar manualmente.');
    });
}

// Formatar CPF/CNPJ no campo PIX
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('pix-customer-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                // CPF: 000.000.000-00
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // CNPJ: 00.000.000/0000-00
                value = value.substring(0, 14);
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Máscara de telefone
    const phoneInput = document.getElementById('pix-customer-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 10) {
                // (00) 0000-0000
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                // (00) 00000-0000
                value = value.substring(0, 11);
                value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
});

// Enviar formulário de cobrança PIX
document.getElementById('pix-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando PIX...';
    
    try {
        // Obter dados da subconta selecionada
        const subaccountData = JSON.parse(document.getElementById('pix-subaccount').value);
        
        // Preparar dados do cliente
        const customer = {
            name: document.getElementById('pix-customer-name').value,
            email: document.getElementById('pix-customer-email').value,
            cpfCnpj: document.getElementById('pix-customer-cpf').value.replace(/\D/g, ''),
            phone: document.getElementById('pix-customer-phone').value.replace(/\D/g, '') || undefined
        };
        
        // Preparar dados da cobrança
        const paymentData = {
            customer,
            value: parseFloat(document.getElementById('pix-value').value),
            description: document.getElementById('pix-description').value || 'Pagamento via PIX',
            dueDate: document.getElementById('pix-due-date').value || undefined,
            subAccountId: subaccountData.id,
            subAccountWalletId: subaccountData.walletId
        };
        
        // Criar cobrança
        const response = await axios.post('/api/payments', paymentData);
        
        if (response.data.ok) {
            const payment = response.data.data;
            
            // Mostrar resultado
            const resultDiv = document.getElementById('pix-result');
            const contentDiv = document.getElementById('pix-result-content');
            
            contentDiv.innerHTML = `
                <div class="space-y-2 text-sm">
                    <p><strong>ID da Cobrança:</strong> ${payment.id}</p>
                    <p><strong>Valor:</strong> R$ ${payment.value.toFixed(2)}</p>
                    <p><strong>Valor Líquido:</strong> R$ ${payment.netValue.toFixed(2)}</p>
                    <p><strong>Status:</strong> <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">${payment.status}</span></p>
                    <p><strong>Split Configurado:</strong> 20% para ${subaccountData.name}, 80% para conta principal</p>
                    ${payment.invoiceUrl ? `<p><a href="${payment.invoiceUrl}" target="_blank" class="text-blue-600 hover:underline">Ver Fatura</a></p>` : ''}
                </div>
            `;
            
            resultDiv.classList.remove('hidden');
            
            // Carregar e mostrar QR Code se disponível
            if (payment.pixQrCode) {
                await loadPixQrCode(payment.id);
            }
            
            // Atualizar histórico
            loadRecentPayments();
            
            // Limpar formulário
            document.getElementById('pix-form').reset();
            
            // Scroll para o resultado
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Erro ao gerar PIX: ' + (response.data.error || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        alert('Erro ao gerar PIX: ' + (error.response?.data?.error || error.message));
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Carregar QR Code PIX
async function loadPixQrCode(paymentId) {
    try {
        const response = await axios.get(`/api/payments/${paymentId}/pix-qrcode`);
        
        if (response.data.ok) {
            const qrData = response.data.data;
            
            const qrcodeContainer = document.getElementById('qrcode-container');
            qrcodeContainer.innerHTML = `
                <img src="data:image/png;base64,${qrData.encodedImage}" 
                     alt="QR Code PIX" 
                     class="mx-auto w-64 h-64 border-4 border-green-500 rounded-lg">
                <p class="text-sm text-gray-600 mt-2">Expira em: ${new Date(qrData.expirationDate).toLocaleString('pt-BR')}</p>
            `;
            
            document.getElementById('pix-payload').value = qrData.payload;
            document.getElementById('qrcode-display').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
    }
}

// Copiar payload PIX
function copyPixPayload() {
    const payload = document.getElementById('pix-payload').value;
    navigator.clipboard.writeText(payload).then(() => {
        alert('Código PIX copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar o código PIX');
    });
}

// Carregar cobranças recentes
async function loadRecentPayments() {
    try {
        const response = await axios.get('/api/payments?limit=10');
        
        if (response.data.ok) {
            const payments = response.data.data;
            const listDiv = document.getElementById('payments-list');
            
            if (payments.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma cobrança ainda</p>';
                return;
            }
            
            listDiv.innerHTML = `
                <div class="space-y-3">
                    ${payments.map(p => `
                        <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-800">R$ ${p.value.toFixed(2)}</span>
                                        <span class="px-2 py-1 text-xs rounded ${getStatusClass(p.status)}">${getStatusText(p.status)}</span>
                                    </div>
                                    <p class="text-sm text-gray-600 mt-1">${p.description || 'Sem descrição'}</p>
                                    <p class="text-xs text-gray-500 mt-1">
                                        ${new Date(p.dueDate).toLocaleDateString('pt-BR')}
                                        ${p.paymentDate ? ` • Pago em ${new Date(p.paymentDate).toLocaleDateString('pt-BR')}` : ''}
                                    </p>
                                </div>
                                <button onclick="viewPayment('${p.id}')" 
                                    class="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar cobranças:', error);
    }
}

// Visualizar detalhes do pagamento
async function viewPayment(paymentId) {
    try {
        const response = await axios.get(`/api/payments/${paymentId}`);
        
        if (response.data.ok) {
            const p = response.data.data;
            
            const details = `
ID: ${p.id}
Cliente: ${p.customer}
Valor: R$ ${p.value.toFixed(2)}
Valor Líquido: R$ ${p.netValue.toFixed(2)}
Status: ${getStatusText(p.status)}
Vencimento: ${new Date(p.dueDate).toLocaleDateString('pt-BR')}
${p.paymentDate ? `Data Pagamento: ${new Date(p.paymentDate).toLocaleDateString('pt-BR')}` : ''}
${p.description ? `Descrição: ${p.description}` : ''}
${p.invoiceUrl ? `\nFatura: ${p.invoiceUrl}` : ''}
            `;
            
            alert(details);
            
            // Se tiver QR Code e status for pendente, carregar
            if (p.pixQrCode && p.status === 'PENDING') {
                loadPixQrCode(p.id);
                document.getElementById('qrcode-display').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Erro ao visualizar pagamento:', error);
        alert('Erro ao carregar detalhes do pagamento');
    }
}

// Helper: classe CSS para status
function getStatusClass(status) {
    const classes = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'RECEIVED': 'bg-green-100 text-green-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'OVERDUE': 'bg-red-100 text-red-800',
        'REFUNDED': 'bg-gray-100 text-gray-800',
        'RECEIVED_IN_CASH': 'bg-green-100 text-green-800',
        'REFUND_REQUESTED': 'bg-orange-100 text-orange-800',
        'CHARGEBACK_REQUESTED': 'bg-red-100 text-red-800',
        'CHARGEBACK_DISPUTE': 'bg-red-100 text-red-800',
        'AWAITING_CHARGEBACK_REVERSAL': 'bg-orange-100 text-orange-800',
        'DUNNING_REQUESTED': 'bg-purple-100 text-purple-800',
        'DUNNING_RECEIVED': 'bg-purple-100 text-purple-800',
        'AWAITING_RISK_ANALYSIS': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// Helper: texto do status
function getStatusText(status) {
    const texts = {
        'PENDING': 'Pendente',
        'RECEIVED': 'Recebido',
        'CONFIRMED': 'Confirmado',
        'OVERDUE': 'Vencido',
        'REFUNDED': 'Estornado',
        'RECEIVED_IN_CASH': 'Recebido',
        'REFUND_REQUESTED': 'Estorno Solicitado',
        'CHARGEBACK_REQUESTED': 'Chargeback Solicitado',
        'CHARGEBACK_DISPUTE': 'Disputa Chargeback',
        'AWAITING_CHARGEBACK_REVERSAL': 'Aguardando Reversão',
        'DUNNING_REQUESTED': 'Cobrança Solicitada',
        'DUNNING_RECEIVED': 'Cobrança Recebida',
        'AWAITING_RISK_ANALYSIS': 'Análise de Risco'
    };
    return texts[status] || status;
}

// =====================================
// GERENCIAR API KEYS
// =====================================

// Carregar lista de API Keys da subconta selecionada
async function loadApiKeys() {
    const select = document.getElementById('pix-subaccount');
    const listDiv = document.getElementById('api-keys-list');
    
    if (!select.value) {
        listDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Selecione uma subconta para ver suas API Keys</p>';
        return;
    }
    
    try {
        const subaccountData = JSON.parse(select.value);
        
        listDiv.innerHTML = '<p class="text-gray-500 text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando...</p>';
        
        const response = await axios.get(`/api/accounts/${subaccountData.id}/api-keys`);
        
        if (response.data.ok) {
            const apiKeys = response.data.data;
            
            if (apiKeys.length === 0) {
                listDiv.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-key text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500">Nenhuma API Key criada para esta subconta</p>
                        <p class="text-sm text-gray-400 mt-1">Clique no botão 🔑 acima para gerar</p>
                    </div>
                `;
                return;
            }
            
            listDiv.innerHTML = `
                <div class="space-y-3">
                    ${apiKeys.map(key => `
                        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="font-semibold text-gray-800">${key.name || 'API Key'}</span>
                                        <span class="px-2 py-1 text-xs rounded ${key.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            ${key.active ? '✅ Ativa' : '❌ Inativa'}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-500 mb-1">
                                        <i class="fas fa-fingerprint mr-1"></i>
                                        ID: ${key.id}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        <i class="fas fa-calendar mr-1"></i>
                                        Criada em: ${new Date(key.dateCreated).toLocaleDateString('pt-BR')}
                                        ${key.expiresAt ? ` • Expira: ${new Date(key.expiresAt).toLocaleDateString('pt-BR')}` : ' • <strong>Sem expiração</strong>'}
                                    </p>
                                </div>
                                <div class="flex gap-2">
                                    ${key.active ? `
                                        <button onclick="toggleApiKey('${subaccountData.id}', '${key.id}', false)" 
                                            title="Desativar API Key"
                                            class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
                                            <i class="fas fa-ban"></i>
                                        </button>
                                    ` : `
                                        <button onclick="toggleApiKey('${subaccountData.id}', '${key.id}', true)" 
                                            title="Ativar API Key"
                                            class="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    `}
                                    <button onclick="deleteApiKey('${subaccountData.id}', '${key.id}')" 
                                        title="Excluir API Key"
                                        class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar API Keys:', error);
        listDiv.innerHTML = '<p class="text-red-500 text-center py-4">Erro ao carregar API Keys. Tente novamente.</p>';
    }
}

// Ativar/Desativar API Key
async function toggleApiKey(accountId, keyId, activate) {
    const action = activate ? 'ativar' : 'desativar';
    
    if (!confirm(`Deseja realmente ${action} esta API Key?`)) {
        return;
    }
    
    try {
        // Nota: A API do Asaas não tem endpoint de ativar/desativar direto
        // Apenas excluir. Então vamos apenas excluir se desativar.
        if (!activate) {
            await deleteApiKey(accountId, keyId, true);
        } else {
            alert('Para reativar, é necessário gerar uma nova API Key.');
        }
    } catch (error) {
        console.error('Erro ao alternar API Key:', error);
        alert('Erro ao ' + action + ' API Key');
    }
}

// Excluir API Key
async function deleteApiKey(accountId, keyId, skipConfirm = false) {
    if (!skipConfirm && !confirm('Deseja realmente EXCLUIR esta API Key?\n\nEsta ação não pode ser desfeita!')) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/accounts/${accountId}/api-keys/${keyId}`);
        
        if (response.data.ok) {
            alert('✅ API Key excluída com sucesso!');
            loadApiKeys(); // Recarregar lista
        } else {
            throw new Error(response.data.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao excluir API Key:', error);
        alert('❌ Erro ao excluir API Key: ' + (error.response?.data?.error || error.message));
    }
}

// Carregar API Keys quando a seção PIX for aberta ou subconta selecionada
document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('pix-subaccount');
    if (select) {
        select.addEventListener('change', function() {
            if (this.value) {
                loadApiKeys();
            }
        });
    }
});

// ============================================
// SEÇÃO: Gerenciamento Global de API Keys
// ============================================

// Carregar subcontas para o filtro
async function loadSubaccountsFilter() {
    try {
        const response = await axios.get('/api/accounts');
        if (response.data.ok && response.data.data) {
            const accounts = response.data.data.data || [];
            const select = document.getElementById('filter-subaccount');
            
            select.innerHTML = '<option value="">Todas as subcontas</option>';
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} - ${account.email}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
    }
}

// Carregar todas as API Keys
async function loadAllApiKeys() {
    const filterSelect = document.getElementById('filter-subaccount');
    const accountId = filterSelect?.value;
    const container = document.getElementById('all-api-keys-list');
    
    if (!container) return;
    
    container.innerHTML = '<p class="text-gray-500 text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Carregando...</p>';
    
    try {
        // Se um filtro foi selecionado, carregar apenas dessa subconta
        if (accountId) {
            try {
                const response = await axios.get(`/api/accounts/${accountId}/api-keys`);
                
                if (response.data.ok) {
                    const keys = response.data.data || [];
                    displayApiKeysList(keys, accountId, container);
                } else {
                    showApiKeysError(container, response.data);
                }
            } catch (error) {
                showApiKeysError(container, error.response?.data);
            }
        } else {
            // Carregar todas as subcontas e suas API Keys
            const accountsResponse = await axios.get('/api/accounts');
            if (!accountsResponse.data.ok) {
                container.innerHTML = '<p class="text-red-500 text-center py-4">Erro ao carregar subcontas</p>';
                return;
            }
            
            const accounts = accountsResponse.data.data.data || [];
            let allKeys = [];
            
            // Carregar API Keys de cada subconta
            for (const account of accounts) {
                try {
                    const keysResponse = await axios.get(`/api/accounts/${account.id}/api-keys`);
                    if (keysResponse.data.ok) {
                        const keys = keysResponse.data.data || [];
                        keys.forEach(key => {
                            allKeys.push({
                                ...key,
                                accountId: account.id,
                                accountName: account.name,
                                accountEmail: account.email
                            });
                        });
                    }
                } catch (error) {
                    console.error(`Erro ao carregar keys da conta ${account.id}:`, error);
                }
            }
            
            if (allKeys.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma API Key encontrada</p>';
            } else {
                displayAllApiKeysList(allKeys, container);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar API Keys:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-4">Erro ao carregar API Keys</p>';
    }
}

// Exibir lista de API Keys de uma subconta específica
function displayApiKeysList(keys, accountId, container) {
    if (keys.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma API Key encontrada para esta subconta</p>';
        return;
    }
    
    const html = keys.map(key => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-2 py-1 text-xs rounded-full ${key.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${key.active ? '✓ Ativa' : '✗ Desativada'}
                        </span>
                        <span class="text-sm font-mono text-gray-600">${key.name || 'Sem nome'}</span>
                    </div>
                    <div class="text-xs text-gray-500 space-y-1">
                        <div><strong>ID:</strong> ${key.id}</div>
                        <div><strong>Criada em:</strong> ${new Date(key.dateCreated).toLocaleString('pt-BR')}</div>
                        ${key.expiresAt ? `<div><strong>Expira em:</strong> ${new Date(key.expiresAt).toLocaleString('pt-BR')}</div>` : '<div><strong>Validade:</strong> Sem expiração</div>'}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="toggleApiKeyStatus('${accountId}', '${key.id}', ${key.active})" 
                        class="px-3 py-1 text-sm rounded ${key.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}">
                        <i class="fas fa-${key.active ? 'pause' : 'play'} mr-1"></i>
                        ${key.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onclick="deleteApiKeyConfirm('${accountId}', '${key.id}')" 
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                        <i class="fas fa-trash mr-1"></i>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Exibir lista de todas as API Keys (com informações da subconta)
function displayAllApiKeysList(keys, container) {
    const html = keys.map(key => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fas fa-user-circle text-purple-600"></i>
                        <span class="font-semibold text-gray-800">${key.accountName}</span>
                        <span class="text-sm text-gray-500">${key.accountEmail}</span>
                    </div>
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-2 py-1 text-xs rounded-full ${key.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${key.active ? '✓ Ativa' : '✗ Desativada'}
                        </span>
                        <span class="text-sm font-mono text-gray-600">${key.name || 'Sem nome'}</span>
                    </div>
                    <div class="text-xs text-gray-500 space-y-1">
                        <div><strong>ID:</strong> ${key.id}</div>
                        <div><strong>Criada em:</strong> ${new Date(key.dateCreated).toLocaleString('pt-BR')}</div>
                        ${key.expiresAt ? `<div><strong>Expira em:</strong> ${new Date(key.expiresAt).toLocaleString('pt-BR')}</div>` : '<div><strong>Validade:</strong> Sem expiração</div>'}
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="toggleApiKeyStatus('${key.accountId}', '${key.id}', ${key.active})" 
                        class="px-3 py-1 text-sm rounded ${key.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}">
                        <i class="fas fa-${key.active ? 'pause' : 'play'} mr-1"></i>
                        ${key.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onclick="deleteApiKeyConfirm('${key.accountId}', '${key.id}')" 
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                        <i class="fas fa-trash mr-1"></i>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Ativar/Desativar API Key
async function toggleApiKeyStatus(accountId, keyId, currentStatus) {
    const action = currentStatus ? 'desativar' : 'ativar';
    
    if (!confirm(`Deseja realmente ${action} esta API Key?`)) {
        return;
    }
    
    try {
        // Por enquanto, apenas DELETE está implementado
        // Para desativar, vamos usar o DELETE
        if (currentStatus) {
            await deleteApiKey(accountId, keyId);
        } else {
            alert('⚠️ A reativação de API Keys ainda não está implementada. Por favor, gere uma nova API Key.');
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        alert('❌ Erro ao alterar status da API Key');
    }
}

// Confirmar exclusão de API Key
async function deleteApiKeyConfirm(accountId, keyId) {
    if (confirm('⚠️ Deseja realmente EXCLUIR esta API Key?\n\nEsta ação não pode ser desfeita e a chave será permanentemente removida.')) {
        await deleteApiKey(accountId, keyId);
    }
}

// ============================================
// SEÇÃO: PIX Estático Reutilizável
// ============================================

// Carregar QR Code PIX estático automaticamente
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const accountsList = document.getElementById('accounts-list');
        if (accountsList) {
            // Aguardar carregamento das contas
            const observer = new MutationObserver(() => {
                document.querySelectorAll('[id^="pix-static-"]').forEach(div => {
                    const accountId = div.id.replace('pix-static-', '');
                    const card = div.closest('.border');
                    if (card) {
                        const walletSpan = card.querySelector('.bg-green-100');
                        if (walletSpan && walletSpan.textContent.includes('Wallet:')) {
                            const walletMatch = card.innerHTML.match(/Wallet: ([a-f0-9-]+)/);
                            if (walletMatch && div.innerHTML.includes('Carregando')) {
                                loadStaticPixForAccount(accountId, walletMatch[1]);
                            }
                        }
                    }
                });
            });
            observer.observe(accountsList, { childList: true, subtree: true });
        }
    }, 1000);
});

async function generateStaticPix(accountId, walletId) {
    const valueInput = document.getElementById(`pix-value-${accountId}`);
    const descInput = document.getElementById(`pix-desc-${accountId}`);
    const pixDiv = document.getElementById(`pix-static-${accountId}`);
    const formDiv = document.getElementById(`pix-form-${accountId}`);
    
    // Verificar se elementos existem
    if (!valueInput || !descInput || !pixDiv) {
        console.error('Elementos do formulário não encontrados:', {
            valueInput: !!valueInput,
            descInput: !!descInput,
            pixDiv: !!pixDiv,
            formDiv: !!formDiv
        });
        return;
    }
    
    const value = parseFloat(valueInput.value);
    const description = descInput.value || 'Pagamento via PIX';
    
    if (!value || value <= 0) {
        alert('⚠️ Por favor, informe um valor válido maior que zero');
        valueInput.focus();
        return;
    }
    
    pixDiv.classList.remove('hidden');
    pixDiv.innerHTML = `
        <p class="text-gray-500 text-sm py-4">
            <i class="fas fa-spinner fa-spin mr-2"></i>Gerando QR Code com valor R$ ${value.toFixed(2)}...
        </p>
    `;
    
    try {
        // Gerar chave PIX estática via endpoint
        const response = await axios.post('/api/pix/static', {
            walletId: walletId,
            accountId: accountId,
            value: value,
            description: description
        });
        
        if (response.data.ok && response.data.data) {
            const pixData = response.data.data;
            const splitValue20 = (value * 0.20).toFixed(2);
            const splitValue80 = (value * 0.80).toFixed(2);
            
            // Ocultar formulário
            const formElement = document.getElementById(`qr-form-${accountId}`);
            if (formElement) {
                formElement.classList.add('hidden');
            }
            
            pixDiv.innerHTML = `
                <div class="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-3">
                        <h5 class="font-bold text-gray-800">
                            <i class="fas fa-check-circle text-green-600 mr-2"></i>
                            QR Code Gerado com Sucesso!
                        </h5>
                        <button onclick="resetPixForm('${accountId}')" 
                            class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                            <i class="fas fa-plus mr-1"></i>Gerar Outro
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="bg-white p-4 rounded-lg inline-block shadow-md">
                                <img src="${pixData.qrCodeBase64}" alt="QR Code PIX" class="mx-auto" style="width: 220px; height: 220px;">
                            </div>
                            <p class="text-xs text-gray-700 mt-3 font-semibold">
                                <i class="fas fa-infinity mr-1 text-green-600"></i>
                                Use quantas vezes quiser!
                            </p>
                        </div>
                        <div class="space-y-3">
                            <div class="bg-white rounded-lg p-3 shadow-sm">
                                <h5 class="text-sm font-bold text-gray-800 mb-2">
                                    <i class="fas fa-money-bill-wave mr-2 text-green-600"></i>
                                    Valor Fixo:
                                </h5>
                                <div class="text-2xl font-bold text-green-700 mb-2">R$ ${value.toFixed(2)}</div>
                                <p class="text-xs text-gray-600">${description}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3 shadow-sm">
                                <label class="block text-xs font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-copy mr-1"></i>
                                    Chave PIX (Copia e Cola):
                                </label>
                                <div class="flex gap-1">
                                    <input type="text" readonly value="${pixData.payload}" 
                                        id="pix-payload-${accountId}"
                                        class="flex-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-xs font-mono">
                                    <button onclick="copyPixPayload('${accountId}')"
                                        id="copy-btn-${accountId}"
                                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 border border-green-300">
                                <p class="text-xs font-bold text-gray-800 text-center mb-2">
                                    💰 Split Automático de R$ ${value.toFixed(2)}:
                                </p>
                                <div class="flex justify-around text-xs">
                                    <div class="text-center">
                                        <div class="font-bold text-green-700 text-lg">R$ ${splitValue20}</div>
                                        <div class="text-gray-600">Para você (20%)</div>
                                    </div>
                                    <div class="text-center text-2xl text-gray-400">+</div>
                                    <div class="text-center">
                                        <div class="font-bold text-blue-700 text-lg">R$ ${splitValue80}</div>
                                        <div class="text-gray-600">Principal (80%)</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Opções de Compartilhamento - MOVIDAS AQUI -->
                            <div class="bg-purple-50 rounded-lg p-3 border border-purple-300 mt-3">
                                <p class="text-xs font-bold text-purple-900 mb-2 text-center">
                                    <i class="fas fa-share-alt mr-1"></i>
                                    COMPARTILHAR
                                </p>
                                <div class="grid grid-cols-3 gap-2">
                            <!-- Opção 1: Baixar Imagem -->
                            <button onclick="downloadQRCode('${accountId}', '${pixData.qrCodeBase64}')" 
                                class="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 text-center flex flex-col items-center gap-1 shadow-md">
                                <i class="fas fa-download text-2xl"></i>
                                <span class="text-xs font-bold">Baixar<br>PNG</span>
                            </button>
                            
                            <!-- Opção 2: Código HTML -->
                            <button onclick="copyHtmlCode('${accountId}', '${pixData.qrCodeBase64}', '${value}', '${description}')" 
                                class="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 text-center flex flex-col items-center gap-1 shadow-md">
                                <i class="fas fa-code text-2xl"></i>
                                <span class="text-xs font-bold">Copiar<br>HTML</span>
                            </button>
                            
                            <!-- Opção 3: Link Direto -->
                            <button onclick="copyPixLink('${accountId}', '${pixData.payload}')" 
                                class="bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-700 text-center flex flex-col items-center gap-1 shadow-md">
                                <i class="fas fa-share-alt text-2xl"></i>
                                <span class="text-xs font-bold">Copiar<br>Chave</span>
                            </button>
                        </div>
                        
                                <!-- Dica -->
                                <div class="mt-2 text-center">
                                    <p class="text-xs text-gray-600">
                                        <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
                                        Use em: site, banner, WhatsApp
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            throw new Error(response.data.error || 'Erro ao gerar QR Code');
        }
    } catch (error) {
        console.error('Erro ao carregar PIX estático:', error);
        pixDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-800 text-sm text-center">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${error.response?.data?.error || error.message || 'Erro ao gerar QR Code'}
                </p>
                <button onclick="loadStaticPixForAccount('${accountId}', '${walletId}')" 
                    class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 w-full">
                    <i class="fas fa-redo mr-1"></i>Tentar novamente
                </button>
            </div>
        `;
    }
}

function copyPixPayload(accountId) {
    const input = document.getElementById(`pix-payload-${accountId}`);
    const btn = document.getElementById(`copy-btn-${accountId}`);
    
    input.select();
    document.execCommand('copy');
    
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btn.classList.add('bg-green-600');
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-copy"></i>';
        btn.classList.remove('bg-green-600');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }, 2000);
}

function resetPixForm(accountId) {
    const formDiv = document.getElementById(`qr-form-${accountId}`);
    const pixDiv = document.getElementById(`pix-static-${accountId}`);
    const valueInput = document.getElementById(`pix-value-${accountId}`);
    const descInput = document.getElementById(`pix-desc-${accountId}`);
    
    // Verificar se elementos existem
    if (!formDiv || !pixDiv || !valueInput || !descInput) {
        console.error('Elementos não encontrados ao resetar formulário');
        return;
    }
    
    // Mostrar formulário novamente
    formDiv.classList.remove('hidden');
    
    // Ocultar resultado
    pixDiv.classList.add('hidden');
    pixDiv.innerHTML = '';
    
    // Limpar campos
    valueInput.value = '';
    descInput.value = 'Pagamento via PIX';
    valueInput.focus();
}

// Abre o iframe do PIX dentro do card da subconta
function togglePixForm(accountId, walletId) {
    const frame = document.getElementById(`pix-frame-${accountId}`);
    const btn = document.getElementById(`btn-toggle-${accountId}`);
    
    if (!frame) {
        console.error('Frame PIX não encontrado:', accountId);
        return;
    }
    
    // Toggle visibility
    if (frame.classList.contains('hidden')) {
        frame.classList.remove('hidden');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>Fechar QR Code';
        btn.classList.remove('from-green-500', 'to-blue-500');
        btn.classList.add('from-gray-500', 'to-gray-600');
        
        // Focar no input de valor
        setTimeout(() => {
            const valueInput = document.getElementById(`pix-value-${accountId}`);
            if (valueInput) valueInput.focus();
        }, 100);
    } else {
        closePixFrame(accountId);
    }
}

// Fecha o iframe e reseta
function closePixFrame(accountId) {
    const frame = document.getElementById(`pix-frame-${accountId}`);
    const btn = document.getElementById(`btn-toggle-${accountId}`);
    
    if (frame) {
        frame.classList.add('hidden');
    }
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-qrcode mr-2"></i>Gerar QR Code PIX com Valor Fixo (Split 20/80)';
        btn.classList.remove('from-gray-500', 'to-gray-600');
        btn.classList.add('from-green-500', 'to-blue-500');
    }
    
    // Resetar formulário
    resetPixForm(accountId);
}

// Exibir erro ao carregar API Keys
function showApiKeysError(container, errorData) {
    const message = errorData?.message || errorData?.error || 'Erro ao carregar API Keys';
    const help = errorData?.help || '';
    
    container.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                <div class="flex-1">
                    <h4 class="font-semibold text-red-800 mb-2">❌ ${message}</h4>
                    ${help ? `
                        <div class="text-sm text-red-700 bg-white border border-red-200 rounded p-3 mb-3">
                            <p class="font-semibold mb-2">📋 Como resolver:</p>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Acesse <strong>https://www.asaas.com</strong></li>
                                <li>Faça login com a conta principal</li>
                                <li>Vá em <strong>Integrações → Chaves de API</strong></li>
                                <li>Procure por <strong>"Gerenciamento de Chaves de API de Subcontas"</strong></li>
                                <li>Clique em <strong>"Habilitar acesso"</strong></li>
                                <li>Configure o whitelist de IPs (se necessário)</li>
                                <li>Aguarde alguns segundos e tente novamente</li>
                            </ol>
                            <p class="mt-3 text-xs text-gray-600">
                                ⏰ O acesso habilitado expira após 2 horas
                            </p>
                        </div>
                    ` : ''}
                    <button onclick="loadAllApiKeys()" 
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                        <i class="fas fa-redo mr-2"></i>Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// FUNÇÕES DE COMPARTILHAMENTO DO QR CODE
// ========================================

// Função para baixar QR Code como imagem PNG
function downloadQRCode(accountId, base64Image) {
    try {
        // Criar link de download
        const link = document.createElement('a');
        link.href = base64Image;
        link.download = `qrcode-pix-${accountId}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('✅ QR Code baixado com sucesso!\n\nVocê pode usar esta imagem em:\n• Banner do seu site\n• Stories/Posts\n• Flyers impressos\n• Email marketing');
    } catch (error) {
        console.error('Erro ao baixar QR Code:', error);
        alert('❌ Erro ao baixar QR Code: ' + error.message);
    }
}

// Função para copiar código HTML
function copyHtmlCode(accountId, base64Image, value, description) {
    const htmlCode = `<!-- QR Code PIX - Valor: R$ ${value} -->
<div style="text-align: center; padding: 20px; border: 2px solid #10b981; border-radius: 10px; background: #f0fdf4; max-width: 400px; margin: 0 auto;">
    <h3 style="color: #059669; margin: 0 0 10px 0;">💳 Pagamento via PIX</h3>
    <img src="${base64Image}" alt="QR Code PIX" style="width: 250px; height: 250px; margin: 10px auto; display: block;">
    <p style="font-size: 18px; font-weight: bold; color: #047857; margin: 10px 0;">R$ ${value}</p>
    <p style="font-size: 14px; color: #065f46; margin: 5px 0;">${description}</p>
    <p style="font-size: 12px; color: #6b7280; margin: 10px 0;">
        ✓ Escaneie o QR Code com seu app bancário<br>
        ✓ Pagamento instantâneo e seguro
    </p>
</div>
<!-- Fim QR Code PIX -->`;

    // Copiar para clipboard
    navigator.clipboard.writeText(htmlCode).then(() => {
        alert('✅ Código HTML copiado!\n\nCole no seu site/loja virtual:\n1. Abra o editor HTML do seu site\n2. Cole o código (Ctrl+V)\n3. Salve e publique\n\n💡 O QR Code aparecerá formatado e pronto!');
    }).catch(error => {
        console.error('Erro ao copiar código:', error);
        
        // Fallback: mostrar em textarea
        const textarea = document.createElement('textarea');
        textarea.value = htmlCode;
        textarea.style.position = 'fixed';
        textarea.style.top = '50%';
        textarea.style.left = '50%';
        textarea.style.transform = 'translate(-50%, -50%)';
        textarea.style.width = '80%';
        textarea.style.height = '400px';
        textarea.style.zIndex = '9999';
        textarea.style.padding = '20px';
        textarea.style.border = '2px solid #10b981';
        textarea.style.borderRadius = '10px';
        textarea.style.fontSize = '12px';
        textarea.style.fontFamily = 'monospace';
        document.body.appendChild(textarea);
        textarea.select();
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✖ Fechar';
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = 'calc(50% - 220px)';
        closeBtn.style.right = 'calc(50% - 40% + 10px)';
        closeBtn.style.zIndex = '10000';
        closeBtn.style.padding = '5px 15px';
        closeBtn.style.background = '#ef4444';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => {
            document.body.removeChild(textarea);
            document.body.removeChild(closeBtn);
        };
        document.body.appendChild(closeBtn);
        
        alert('📋 Código HTML exibido!\n\nSelecione tudo (Ctrl+A) e copie (Ctrl+C)');
    });
}

// Função para copiar link do PIX
function copyPixLink(accountId, payload) {
    navigator.clipboard.writeText(payload).then(() => {
        const valueInput = document.getElementById(`pix-value-${accountId}`);
        const value = valueInput ? valueInput.value : '0.00';
        
        alert('✅ Chave PIX copiada!\n\n📱 Como compartilhar:\n\n1️⃣ WhatsApp:\n   • Cole a chave PIX na mensagem\n   • Cliente copia e cola no app do banco\n\n2️⃣ Redes Sociais:\n   • Poste a imagem do QR Code\n   • Adicione a chave PIX na legenda\n\n3️⃣ Email:\n   • Envie a imagem em anexo\n   • Cole a chave PIX no corpo do email\n\n💡 Dica: Sempre mencione o valor R$ ' + value + '!');
    }).catch(error => {
        console.error('Erro ao copiar link:', error);
        alert('❌ Erro ao copiar link: ' + error.message);
    });
}

// ========================================
// FUNÇÕES DE PESQUISA E FILTRO DE SUBCONTAS
// ========================================

// Variável global para armazenar todas as subcontas
let allAccounts = [];

// Função para salvar contas na variável global (modificar loadAccounts)
function saveAccountsData(accounts) {
    allAccounts = accounts;
}

// Função para filtrar subcontas
function filterAccounts() {
    const searchTerm = document.getElementById('search-accounts').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    
    let filteredAccounts = allAccounts.filter(account => {
        // Filtro de busca por texto
        const matchesSearch = !searchTerm || 
            (account.name && account.name.toLowerCase().includes(searchTerm)) ||
            (account.email && account.email.toLowerCase().includes(searchTerm)) ||
            (account.cpfCnpj && account.cpfCnpj.includes(searchTerm)) ||
            (account.id && account.id.toLowerCase().includes(searchTerm));
        
        // Filtro por status
        const hasWallet = account.walletId && account.walletId !== 'null';
        const matchesStatus = !statusFilter || 
            (statusFilter === 'approved' && hasWallet) ||
            (statusFilter === 'pending' && !hasWallet);
        
        return matchesSearch && matchesStatus;
    });
    
    // Aplicar ordenação atual
    const sortOption = document.getElementById('sort-accounts').value;
    filteredAccounts = applySorting(filteredAccounts, sortOption);
    
    // Exibir resultados
    displayAccounts(filteredAccounts);
    
    // Mostrar contador de resultados
    const resultsDiv = document.getElementById('search-results');
    const total = allAccounts.length;
    const shown = filteredAccounts.length;
    
    if (searchTerm || statusFilter) {
        resultsDiv.textContent = `Mostrando ${shown} de ${total} subconta(s)`;
    } else {
        resultsDiv.textContent = `Total: ${total} subconta(s)`;
    }
}

// Função para ordenar subcontas
function sortAccounts() {
    const sortOption = document.getElementById('sort-accounts').value;
    const searchTerm = document.getElementById('search-accounts').value;
    
    // Se há busca ativa, filtrar antes de ordenar
    if (searchTerm) {
        filterAccounts();
    } else {
        const sortedAccounts = applySorting([...allAccounts], sortOption);
        displayAccounts(sortedAccounts);
    }
}

// Função auxiliar para aplicar ordenação
function applySorting(accounts, sortOption) {
    const sorted = [...accounts];
    
    switch(sortOption) {
        case 'name-asc':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.dateCreated || 0) - new Date(b.dateCreated || 0));
            break;
    }
    
    return sorted;
}

// Função para exibir subcontas
function displayAccounts(accounts) {
    const container = document.getElementById('accounts-list');
    
    if (accounts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Nenhuma subconta encontrada</p>
                <p class="text-gray-400 text-sm mt-2">Tente alterar os filtros de busca</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = accounts.map(account => {
        const hasWallet = account.walletId && account.walletId !== 'null';
        const dateCreated = account.dateCreated ? new Date(account.dateCreated).toLocaleDateString('pt-BR') : 'N/A';
        
        const walletHtml = hasWallet 
            ? `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                   <i class="fas fa-check-circle mr-1"></i>Aprovado
               </span>`
            : `<span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                   <i class="fas fa-clock mr-1"></i>Aguardando Aprovação
               </span>`;
        
        // Seção de PIX (só para aprovados)
        const pixSection = hasWallet ? `
            <div class="mt-4">
                <button onclick="togglePixForm('${account.id}', '${account.walletId}')" 
                    id="btn-toggle-${account.id}"
                    class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold shadow-md transition">
                    <i class="fas fa-qrcode mr-2"></i>Gerar QR Code PIX com Valor Fixo (Split 20/80)
                </button>
                
                <!-- Iframe embutido (inicialmente escondido) -->
                <div id="pix-frame-${account.id}" class="hidden mt-4 border-2 border-green-300 rounded-lg overflow-hidden shadow-lg">
                    <div class="bg-gradient-to-r from-green-500 to-blue-500 p-3 flex justify-between items-center">
                        <h4 class="text-white font-bold">
                            <i class="fas fa-qrcode mr-2"></i>QR Code PIX
                        </h4>
                        <button onclick="closePixFrame('${account.id}')" 
                            class="text-white hover:text-gray-200 font-bold text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Formulário -->
                    <div id="qr-form-${account.id}" class="p-4 bg-white">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="number" 
                                id="pix-value-${account.id}" 
                                placeholder="Valor fixo (R$)" 
                                step="0.01" 
                                min="1"
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <input type="text" 
                                id="pix-desc-${account.id}" 
                                placeholder="Descrição (opcional)" 
                                value="Pagamento via PIX"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <button onclick="generateStaticPix('${account.id}', '${account.walletId}')" 
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
                                <i class="fas fa-qrcode mr-2"></i>Gerar QR Code
                            </button>
                        </div>
                    </div>
                    
                    <!-- Resultado do QR Code -->
                    <div id="pix-static-${account.id}" class="hidden p-4 bg-gray-50"></div>
                </div>
            </div>
        ` : '';
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-lg font-semibold text-gray-800">${account.name}</h3>
                            ${walletHtml}
                        </div>
                        <p class="text-sm text-gray-600 mt-1">
                            <i class="fas fa-envelope mr-2"></i>${account.email}
                        </p>
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-id-card mr-2"></i>${account.cpfCnpj}
                        </p>
                        <p class="text-sm text-gray-500 mt-2">
                            <i class="fas fa-calendar mr-2"></i>Criado em: ${dateCreated}
                        </p>
                        <div class="flex gap-2 mt-2">
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                ID: ${account.id.substring(0, 8)}...
                            </span>
                            ${hasWallet ? `
                                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                                    <i class="fas fa-wallet mr-1"></i>Wallet: ${account.walletId.substring(0, 8)}...
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                ${pixSection}
            </div>
        `;
    }).join('');
}

// ============================================
// FUNÇÕES DE LINK DE CADASTRO
// ============================================

let currentGeneratedLink = '';

// Abrir modal e gerar link
async function openLinkModal() {
    const modal = document.getElementById('link-modal');
    const loading = document.getElementById('link-loading');
    const content = document.getElementById('link-content');
    
    // Mostrar modal e loading
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    content.classList.add('hidden');
    
    try {
        // Gerar link via API
        const response = await axios.post('/api/signup-link', {
            accountId: 'new', // Link genérico para novo cadastro
            expirationDays: 30,
            maxUses: null,
            notes: 'Link gerado via dashboard admin'
        });
        
        if (response.data.ok) {
            const linkData = response.data.data;
            currentGeneratedLink = linkData.url;
            
            // Preencher informações do link
            document.getElementById('generated-link').value = linkData.url;
            
            // Formatar data de expiração
            const expiresDate = new Date(linkData.expiresAt);
            const expiresFormatted = expiresDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            document.getElementById('link-expires').textContent = expiresFormatted;
            
            // Gerar QR Code
            const qrContainer = document.getElementById('qr-code-container');
            const qrSize = 200;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(linkData.url)}`;
            qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="mx-auto border-2 border-gray-300 rounded-lg" style="width: ${qrSize}px; height: ${qrSize}px;">`;
            
            // Mostrar conteúdo
            loading.classList.add('hidden');
            content.classList.remove('hidden');
        } else {
            throw new Error(response.data.error || 'Erro ao gerar link');
        }
    } catch (error) {
        console.error('Erro ao gerar link:', error);
        alert('❌ Erro ao gerar link de cadastro: ' + error.message);
        closeLinkModal();
    }
}

// Fechar modal
function closeLinkModal() {
    const modal = document.getElementById('link-modal');
    modal.classList.add('hidden');
    currentGeneratedLink = '';
}

// Copiar link
function copyLink() {
    const input = document.getElementById('generated-link');
    const btn = document.getElementById('copy-link-btn');
    
    input.select();
    document.execCommand('copy');
    
    // Feedback visual
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btn.classList.add('bg-green-600');
    
    setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('bg-green-600');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }, 2000);
}

// Compartilhar no WhatsApp
function shareWhatsApp() {
    const message = encodeURIComponent(`🎉 Olá! Você foi convidado para criar sua conta.\n\nClique no link abaixo para completar seu cadastro:\n\n${currentGeneratedLink}\n\n✅ Cadastro rápido e seguro!`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// Compartilhar por Email
function shareEmail() {
    const subject = encodeURIComponent('Convite para Cadastro');
    const body = encodeURIComponent(`Olá!

Você foi convidado para criar sua conta.

Clique no link abaixo para completar seu cadastro:

${currentGeneratedLink}

✅ Cadastro rápido e seguro!

Atenciosamente,
Equipe Asaas`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Compartilhar no Telegram
function shareTelegram() {
    const message = encodeURIComponent(`🎉 Você foi convidado para criar sua conta!\n\nClique no link abaixo:\n${currentGeneratedLink}\n\n✅ Cadastro rápido e seguro!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentGeneratedLink)}&text=${message}`, '_blank');
}

// Baixar QR Code
function downloadQRCode() {
    const qrContainer = document.getElementById('qr-code-container');
    const img = qrContainer.querySelector('img');
    
    if (img) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'qrcode-cadastro.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ============================================
// DASHBOARD OVERVIEW / ESTATÍSTICAS
// ============================================

let statusChart = null;

// Carregar estatísticas do dashboard
async function loadDashboardStats() {
    try {
        const response = await axios.get('/api/stats');
        
        if (response.data && response.data.ok) {
            const stats = response.data.data;
            
            // Atualizar cards de estatísticas
            document.getElementById('stat-total-accounts').textContent = stats.accounts.total;
            document.getElementById('stat-approved-accounts').textContent = stats.accounts.approved;
            document.getElementById('stat-pending-accounts').textContent = stats.accounts.pending;
            document.getElementById('stat-active-links').textContent = stats.links.active;
            document.getElementById('stat-approval-rate').textContent = stats.accounts.approvalRate + '%';
            document.getElementById('stat-conversion-rate').textContent = stats.links.conversionRate + '%';
            
            // Atualizar timestamp
            const now = new Date();
            document.getElementById('last-update-time').textContent = now.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Renderizar gráfico de status
            renderStatusChart(stats.accounts);
            
            // Renderizar atividades recentes
            renderRecentActivity(stats.recentAccounts);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Renderizar gráfico de pizza de status
function renderStatusChart(accountStats) {
    const canvas = document.getElementById('status-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (statusChart) {
        statusChart.destroy();
    }
    
    // Criar novo gráfico
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Aprovadas', 'Pendentes'],
            datasets: [{
                data: [accountStats.approved, accountStats.pending],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // Verde
                    'rgba(234, 179, 8, 0.8)'    // Amarelo
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(234, 179, 8, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = accountStats.total;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Renderizar atividades recentes
function renderRecentActivity(recentAccounts) {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    if (!recentAccounts || recentAccounts.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma atividade recente</p>';
        return;
    }
    
    container.innerHTML = recentAccounts.map(account => {
        const date = account.dateCreated ? new Date(account.dateCreated).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Data não disponível';
        
        const statusBadge = account.status === 'approved' 
            ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold"><i class="fas fa-check-circle mr-1"></i>Aprovada</span>'
            : '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold"><i class="fas fa-clock mr-1"></i>Pendente</span>';
        
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-100 rounded-full p-2">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-800">${account.name}</p>
                        <p class="text-xs text-gray-500">${account.email}</p>
                    </div>
                </div>
                <div class="text-right">
                    ${statusBadge}
                    <p class="text-xs text-gray-500 mt-1">${date}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Auto-refresh do dashboard a cada 30 segundos
let dashboardRefreshInterval = null;

function startDashboardAutoRefresh() {
    // Limpar intervalo anterior se existir
    if (dashboardRefreshInterval) {
        clearInterval(dashboardRefreshInterval);
    }
    
    // Carregar estatísticas imediatamente
    loadDashboardStats();
    
    // Atualizar a cada 30 segundos
    dashboardRefreshInterval = setInterval(loadDashboardStats, 30000);
}

function stopDashboardAutoRefresh() {
    if (dashboardRefreshInterval) {
        clearInterval(dashboardRefreshInterval);
        dashboardRefreshInterval = null;
    }
}

// Iniciar auto-refresh quando entrar na seção de overview
const originalShowSection = window.showSection;
window.showSection = function(section) {
    // Chamar função original
    if (originalShowSection) {
        originalShowSection(section);
    }
    
    // Iniciar/parar auto-refresh baseado na seção
    if (section === 'dashboard') {
        startDashboardAutoRefresh();
    } else {
        stopDashboardAutoRefresh();
    }
    
    // Carregar subcontas no select quando entrar na seção de relatórios
    if (section === 'reports') {
        loadReportAccounts();
    }
}

// ===== FUNÇÕES DE RELATÓRIOS =====

// Variável global para armazenar dados do relatório
let currentReportData = null;

// Carregar subcontas no select
async function loadReportAccounts() {
    try {
        const response = await axios.get('/api/accounts');
        const accounts = response.data.accounts || [];
        
        const select = document.getElementById('report-account-select');
        select.innerHTML = '<option value="">Selecione uma subconta...</option>';
        
        accounts.forEach(account => {
            if (account.walletId) { // Apenas aprovadas
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.email})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
    }
}

// Gerar relatório
async function generateReport() {
    const accountId = document.getElementById('report-account-select').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const resultsDiv = document.getElementById('report-results');
    
    if (!accountId) {
        alert('Selecione uma subconta');
        return;
    }
    
    // Mostrar loading
    resultsDiv.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-orange-500 mb-4"></i>
            <p class="text-gray-600">Gerando relatório...</p>
        </div>
    `;
    
    try {
        let url = `/api/reports/${accountId}`;
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        
        const response = await axios.get(url);
        currentReportData = response.data.data;
        
        displayReport(currentReportData);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        resultsDiv.innerHTML = `
            <div class="text-center py-12 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p class="text-lg">Erro ao gerar relatório</p>
                <p class="text-sm mt-2">${error.response?.data?.error || error.message}</p>
            </div>
        `;
    }
}

// Exibir relatório
function displayReport(data) {
    const resultsDiv = document.getElementById('report-results');
    const { account, period, summary, transactions } = data;
    
    let statusClass = '';
    let statusIcon = '';
    let statusText = '';
    
    // Formatador de moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Formatador de data
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };
    
    // Status das transações
    const getStatusBadge = (status) => {
        const badges = {
            'RECEIVED': '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><i class="fas fa-check mr-1"></i>Recebido</span>',
            'PENDING': '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"><i class="fas fa-clock mr-1"></i>Pendente</span>',
            'OVERDUE': '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"><i class="fas fa-exclamation-circle mr-1"></i>Vencido</span>',
            'REFUNDED': '<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold"><i class="fas fa-undo mr-1"></i>Reembolsado</span>'
        };
        return badges[status] || status;
    };
    
    resultsDiv.innerHTML = `
        <!-- Cabeçalho do Relatório -->
        <div class="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white mb-6">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold mb-2">
                        <i class="fas fa-file-alt mr-2"></i>Relatório de Subconta
                    </h3>
                    <p class="text-orange-100">
                        <i class="fas fa-user mr-1"></i>${account.name}
                    </p>
                    <p class="text-orange-100 text-sm mt-1">
                        <i class="fas fa-envelope mr-1"></i>${account.email} | 
                        <i class="fas fa-id-card ml-2 mr-1"></i>${account.cpfCnpj}
                    </p>
                    <p class="text-orange-100 text-sm mt-1">
                        <i class="fas fa-wallet mr-1"></i>Wallet: ${account.walletId?.substring(0, 8)}...
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-orange-100">Período</p>
                    <p class="font-semibold">${formatDate(period.startDate)} - ${formatDate(period.endDate)}</p>
                </div>
            </div>
        </div>
        
        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm">Recebido</p>
                        <p class="text-2xl font-bold mt-1">${formatCurrency(summary.totalReceived)}</p>
                    </div>
                    <i class="fas fa-check-circle text-4xl text-green-300 opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-yellow-100 text-sm">Pendente</p>
                        <p class="text-2xl font-bold mt-1">${formatCurrency(summary.totalPending)}</p>
                    </div>
                    <i class="fas fa-clock text-4xl text-yellow-300 opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-red-100 text-sm">Vencido</p>
                        <p class="text-2xl font-bold mt-1">${formatCurrency(summary.totalOverdue)}</p>
                    </div>
                    <i class="fas fa-exclamation-triangle text-4xl text-red-300 opacity-50"></i>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm">Transações</p>
                        <p class="text-2xl font-bold mt-1">${summary.totalTransactions}</p>
                    </div>
                    <i class="fas fa-list text-4xl text-blue-300 opacity-50"></i>
                </div>
            </div>
        </div>
        
        <!-- Botões de Exportação -->
        <div class="flex justify-end gap-3 mb-6">
            <button onclick="exportReportPDF()" 
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold shadow-md transition">
                <i class="fas fa-file-pdf mr-2"></i>Exportar PDF
            </button>
            <button onclick="exportReportExcel()" 
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-md transition">
                <i class="fas fa-file-excel mr-2"></i>Exportar Excel
            </button>
        </div>
        
        <!-- Tabela de Transações -->
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h4 class="text-lg font-bold text-gray-800">
                    <i class="fas fa-exchange-alt mr-2"></i>Transações (${transactions.length})
                </h4>
            </div>
            <div class="overflow-x-auto">
                ${transactions.length > 0 ? `
                    <table class="w-full">
                        <thead class="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Descrição</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${transactions.map(t => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 text-sm text-gray-700">${formatDate(t.dateCreated)}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">${t.description}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700">${t.billingType || 'N/A'}</td>
                                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${formatCurrency(t.value)}</td>
                                    <td class="px-6 py-4 text-sm">${getStatusBadge(t.status)}</td>
                                    <td class="px-6 py-4 text-sm">
                                        ${t.invoiceUrl ? `
                                            <a href="${t.invoiceUrl}" target="_blank" 
                                                class="text-blue-600 hover:text-blue-800 font-semibold">
                                                <i class="fas fa-external-link-alt mr-1"></i>Ver
                                            </a>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div class="p-12 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-4 opacity-30"></i>
                        <p>Nenhuma transação encontrada no período selecionado</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Exportar relatório em PDF
function exportReportPDF() {
    if (!currentReportData) {
        alert('Nenhum relatório gerado');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { account, period, summary, transactions } = currentReportData;
    
    // Formatador de moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Formatador de data
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };
    
    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Relatório de Subconta', 14, 20);
    
    // Informações da subconta
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Nome: ${account.name}`, 14, 30);
    doc.text(`Email: ${account.email}`, 14, 36);
    doc.text(`CPF/CNPJ: ${account.cpfCnpj}`, 14, 42);
    doc.text(`Wallet ID: ${account.walletId}`, 14, 48);
    doc.text(`Período: ${formatDate(period.startDate)} - ${formatDate(period.endDate)}`, 14, 54);
    
    // Resumo
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Resumo Financeiro', 14, 66);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Recebido: ${formatCurrency(summary.totalReceived)}`, 14, 74);
    doc.text(`Total Pendente: ${formatCurrency(summary.totalPending)}`, 14, 80);
    doc.text(`Total Vencido: ${formatCurrency(summary.totalOverdue)}`, 14, 86);
    doc.text(`Total de Transações: ${summary.totalTransactions}`, 14, 92);
    
    // Tabela de transações
    if (transactions.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Transações', 14, 104);
        
        const tableData = transactions.map(t => [
            formatDate(t.dateCreated),
            t.description.substring(0, 30),
            formatCurrency(t.value),
            t.status
        ]);
        
        doc.autoTable({
            startY: 108,
            head: [['Data', 'Descrição', 'Valor', 'Status']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [249, 115, 22] } // Orange
        });
    }
    
    // Salvar PDF
    const fileName = `relatorio_${account.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
}

// Exportar relatório em Excel
function exportReportExcel() {
    if (!currentReportData) {
        alert('Nenhum relatório gerado');
        return;
    }
    
    const { account, period, summary, transactions } = currentReportData;
    
    // Formatador de moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Formatador de data
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Informações da Subconta
    const infoData = [
        ['RELATÓRIO DE SUBCONTA'],
        [],
        ['Nome', account.name],
        ['Email', account.email],
        ['CPF/CNPJ', account.cpfCnpj],
        ['Wallet ID', account.walletId],
        ['Período', `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`],
        [],
        ['RESUMO FINANCEIRO'],
        ['Total Recebido', formatCurrency(summary.totalReceived)],
        ['Total Pendente', formatCurrency(summary.totalPending)],
        ['Total Vencido', formatCurrency(summary.totalOverdue)],
        ['Total Reembolsado', formatCurrency(summary.totalRefunded)],
        ['Total de Transações', summary.totalTransactions]
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Informações');
    
    // Sheet 2: Transações
    if (transactions.length > 0) {
        const transactionsData = transactions.map(t => ({
            'Data Criação': formatDate(t.dateCreated),
            'Data Vencimento': formatDate(t.dueDate),
            'Descrição': t.description,
            'Tipo': t.billingType || 'N/A',
            'Valor': formatCurrency(t.value),
            'Status': t.status,
            'ID': t.id,
            'Link Fatura': t.invoiceUrl || 'N/A'
        }));
        
        const ws2 = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Transações');
    }
    
    // Salvar arquivo
    const fileName = `relatorio_${account.name.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// ===== FUNÇÕES DE LINKS DE PAGAMENTO =====

// Carregar subcontas no select de links de pagamento
async function loadPaymentLinkAccounts() {
    try {
        const response = await axios.get('/api/accounts');
        const accounts = response.data.accounts || [];
        
        const select = document.getElementById('paylink-account');
        select.innerHTML = '<option value="">Selecione uma subconta...</option>';
        
        accounts.forEach(account => {
            if (account.walletId) { // Apenas aprovadas
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.email})`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar subcontas:', error);
    }
}

// Alternar entre valor fixo e recorrente
document.addEventListener('DOMContentLoaded', () => {
    const chargeTypeSelect = document.getElementById('paylink-charge-type');
    const fixedSection = document.getElementById('paylink-fixed-value-section');
    const recurrentSection = document.getElementById('paylink-recurrent-section');
    const valueInput = document.getElementById('paylink-value');
    const recurrentValueInput = document.getElementById('paylink-recurrent-value');
    
    if (chargeTypeSelect) {
        chargeTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'DETACHED') {
                fixedSection.classList.remove('hidden');
                recurrentSection.classList.add('hidden');
                valueInput.required = true;
                recurrentValueInput.required = false;
            } else {
                fixedSection.classList.add('hidden');
                recurrentSection.classList.remove('hidden');
                valueInput.required = false;
                recurrentValueInput.required = true;
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
});

// Criar link de pagamento
async function createPaymentLink() {
    const accountId = document.getElementById('paylink-account').value;
    const name = document.getElementById('paylink-name').value;
    const description = document.getElementById('paylink-description').value;
    const billingType = document.getElementById('paylink-billing-type').value;
    const chargeType = document.getElementById('paylink-charge-type').value;
    
    if (!accountId || !name) {
        alert('Preencha os campos obrigatórios');
        return;
    }
    
    const data = {
        accountId,
        name,
        description,
        billingType,
        chargeType
    };
    
    if (chargeType === 'DETACHED') {
        const value = document.getElementById('paylink-value').value;
        const dueDate = document.getElementById('paylink-due-date').value;
        
        if (!value || parseFloat(value) <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        data.value = value;
        if (dueDate) data.dueDate = dueDate;
    } else {
        const value = document.getElementById('paylink-recurrent-value').value;
        const cycle = document.getElementById('paylink-cycle').value;
        const duration = document.getElementById('paylink-duration').value;
        
        if (!value || parseFloat(value) <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        data.value = value;
        data.cycle = cycle;
        if (duration) data.duration = duration;
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
        
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
        };
        
        const getChargeTypeBadge = (type) => {
            if (type === 'DETACHED') {
                return '<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"><i class="fas fa-dollar-sign mr-1"></i>Valor Fixo</span>';
            } else {
                return '<span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold"><i class="fas fa-sync mr-1"></i>Recorrente</span>';
            }
        };
        
        const getStatusBadge = (active) => {
            if (active) {
                return '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><i class="fas fa-check mr-1"></i>Ativo</span>';
            } else {
                return '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"><i class="fas fa-times mr-1"></i>Inativo</span>';
            }
        };
        
        container.innerHTML = links.map(link => `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="text-lg font-bold text-gray-800 mb-1">${link.name}</h4>
                        <p class="text-sm text-gray-600">${link.description || 'Sem descrição'}</p>
                    </div>
                    <div class="flex gap-2">
                        ${getStatusBadge(link.active)}
                        ${getChargeTypeBadge(link.chargeType)}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div class="bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-600">Valor</p>
                        <p class="text-sm font-semibold text-gray-800">
                            ${link.chargeType === 'DETACHED' ? formatCurrency(link.value) : formatCurrency(link.subscriptionValue)}
                        </p>
                    </div>
                    <div class="bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-600">Forma de Pagamento</p>
                        <p class="text-sm font-semibold text-gray-800">${link.billingType || 'Todas'}</p>
                    </div>
                    <div class="bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-600">Criado em</p>
                        <p class="text-sm font-semibold text-gray-800">${formatDate(link.dateCreated)}</p>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="copyToClipboard('${link.url}')" 
                        class="flex-1 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 font-semibold text-sm">
                        <i class="fas fa-copy mr-2"></i>Copiar Link
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

// Copiar para clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copiado!');
    });
}
