// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;

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
    
    const targetSection = document.getElementById(section + '-section');
    if (!targetSection) {
        // Se seção não tem sufixo -section, tentar sem
        const altSection = document.getElementById(section);
        if (altSection) {
            altSection.classList.remove('hidden');
        } else {
            console.warn('Seção não encontrada:', section);
            return;
        }
    } else {
        targetSection.classList.remove('hidden');
    }
    
    if (section === 'accounts') {
        loadAccounts();
    } else if (section === 'dashboard') {
        loadDashboard();
    } else if (section === 'deltapag') {
        if (typeof loadDeltapagSubscriptions === 'function') {
            loadDeltapagSubscriptions();
        }
    } else if (section === 'banners' || section === 'banners-section') {
        loadSavedBanners();
    } else if (section === 'pix') {
        loadSubaccountsForPix();
        loadRecentPayments();
    } else if (section === 'api-keys') {
        loadSubaccountsFilter();
    } else if (section === 'reports') {
        loadReportAccounts();
    } else if (section === 'payment-links') {
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
    
    // Show dashboard by default after login
    showSection('dashboard');
    
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
    const createLinkForm = document.getElementById('create-link-form');
    if (createLinkForm) {
        createLinkForm.addEventListener('submit', async (e) => {
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
    }

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
                                    <textarea readonly 
                                        id="pix-payload-${accountId}"
                                        class="flex-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-xs font-mono resize-none"
                                        rows="3"
                                        style="word-break: break-all; overflow-wrap: break-word;">${pixData.payload}</textarea>
                                    <button onclick="copyPixPayload('${accountId}')"
                                        id="copy-btn-${accountId}"
                                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Comprimento: ${pixData.payload.length} caracteres
                                </p>
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
                                <div class="grid grid-cols-3 gap-2 items-start">
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
                            
                            <!-- Opção 3: Copiar Chave -->
                            <button onclick="copyPixLink('${accountId}', '${pixData.payload}')" 
                                class="bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-700 text-center flex flex-col items-center gap-1 shadow-md">
                                <i class="fas fa-share-alt text-2xl"></i>
                                <span class="text-xs font-bold">Copiar<br>Chave</span>
                            </button>
                            
                            <!-- Opção 4: Exibir QR Code Grande -->
                            <button onclick="showFullScreenQR('${pixData.qrCodeBase64}', '${pixData.payload}', ${value})" 
                                class="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 text-center flex flex-col items-center gap-1 shadow-md col-span-3">
                                <i class="fas fa-expand text-2xl"></i>
                                <span class="text-xs font-bold">Ver QR Code em Tela Cheia</span>
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
// Função auxiliar para esconder todos os frames de uma subconta
function hideAllFrames(accountId) {
    // Esconder frame de PIX avulso
    const pixFrame = document.getElementById(`pix-frame-${accountId}`);
    if (pixFrame) pixFrame.classList.add('hidden');
    
    // Esconder frame de assinatura
    const subscriptionFrame = document.getElementById(`subscription-frame-${accountId}`);
    if (subscriptionFrame) subscriptionFrame.classList.add('hidden');
    
    // Esconder frame de PIX Automático
    const automaticFrame = document.getElementById(`automatic-frame-${accountId}`);
    if (automaticFrame) automaticFrame.classList.add('hidden');
    
    // Esconder frame de link de auto-cadastro
    const signupLinkFrame = document.getElementById(`signup-link-frame-${accountId}`);
    if (signupLinkFrame) signupLinkFrame.classList.add('hidden');
    
    // Resetar botões
    const pixBtn = document.getElementById(`btn-toggle-${accountId}`);
    if (pixBtn) {
        pixBtn.innerHTML = '<i class="fas fa-qrcode mr-2"></i>QR Code Avulso';
        pixBtn.classList.remove('from-gray-500', 'to-gray-600');
        pixBtn.classList.add('from-green-500', 'to-blue-500');
    }
    
    const subscriptionBtn = document.getElementById(`btn-subscription-${accountId}`);
    if (subscriptionBtn) {
        subscriptionBtn.innerHTML = '<i class="fas fa-calendar-check mr-2"></i>Assinatura Mensal';
        subscriptionBtn.classList.remove('from-gray-500', 'to-gray-600');
        subscriptionBtn.classList.add('from-purple-500', 'to-pink-500');
    }
    
    const automaticBtn = document.getElementById(`btn-automatic-${accountId}`);
    if (automaticBtn) {
        automaticBtn.innerHTML = '<i class="fas fa-robot mr-2"></i>PIX Automático';
        automaticBtn.classList.remove('from-gray-500', 'to-gray-600');
        automaticBtn.classList.add('from-indigo-500', 'to-cyan-500');
    }
    
    const signupLinkBtn = document.getElementById(`btn-signup-link-${accountId}`);
    if (signupLinkBtn) {
        signupLinkBtn.innerHTML = '<i class="fas fa-link mr-2"></i>Link Auto-Cadastro';
        signupLinkBtn.classList.remove('from-gray-500', 'to-gray-600');
        signupLinkBtn.classList.add('from-orange-500', 'to-red-500');
    }
}

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
        btn.innerHTML = '<i class="fas fa-qrcode mr-2"></i>QR Code Avulso (Split 20/80)';
        btn.classList.remove('from-gray-500', 'to-gray-600');
        btn.classList.add('from-green-500', 'to-blue-500');
    }
    
    // Resetar formulário
    resetPixForm(accountId);
}

// Controles do formulário de assinatura
function toggleSubscriptionForm(accountId, walletId) {
    const frame = document.getElementById(`subscription-frame-${accountId}`);
    const btn = document.getElementById(`btn-subscription-${accountId}`);
    
    if (!frame) {
        console.error('Frame de assinatura não encontrado:', accountId);
        return;
    }
    
    if (frame.classList.contains('hidden')) {
        frame.classList.remove('hidden');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>Fechar';
        btn.classList.remove('from-purple-500', 'to-pink-500');
        btn.classList.add('from-gray-500', 'to-gray-600');
        
        setTimeout(() => {
            const nameInput = document.getElementById(`sub-name-${accountId}`);
            if (nameInput) nameInput.focus();
        }, 100);
    } else {
        closeSubscriptionFrame(accountId);
    }
}

function closeSubscriptionFrame(accountId) {
    const frame = document.getElementById(`subscription-frame-${accountId}`);
    const btn = document.getElementById(`btn-subscription-${accountId}`);
    
    if (frame) {
        frame.classList.add('hidden');
    }
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-calendar-check mr-2"></i>Assinatura Mensal (Split 20/80)';
        btn.classList.remove('from-gray-500', 'to-gray-600');
        btn.classList.add('from-purple-500', 'to-pink-500');
    }
    
    // Resetar formulário
    const form = document.getElementById(`subscription-form-${accountId}`);
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            if (input.id.includes('desc')) {
                input.value = 'Mensalidade';
            } else {
                input.value = '';
            }
        });
    }
}

async function createSubscription(accountId, walletId) {
    const resultDiv = document.getElementById(`subscription-result-${accountId}`);
    const formDiv = document.getElementById(`subscription-form-${accountId}`);
    
    const customerName = document.getElementById(`sub-name-${accountId}`).value.trim();
    const customerEmail = document.getElementById(`sub-email-${accountId}`).value.trim();
    const customerCpf = document.getElementById(`sub-cpf-${accountId}`).value.trim();
    const value = parseFloat(document.getElementById(`sub-value-${accountId}`).value);
    const description = document.getElementById(`sub-desc-${accountId}`).value.trim();
    
    if (!customerName || !customerEmail || !customerCpf || !value || value <= 0) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (customerCpf.length !== 11 || !/^\d+$/.test(customerCpf)) {
        alert('⚠️ CPF inválido! Digite apenas números (11 dígitos)');
        return;
    }
    
    formDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <p class="text-gray-500 text-sm py-4">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Criando assinatura mensal de R$ ${value.toFixed(2)}...
        </p>
    `;
    
    try {
        const response = await axios.post('/api/pix/subscription', {
            walletId,
            accountId,
            value,
            description,
            customerName,
            customerEmail,
            customerCpf
        });
        
        if (response.data.ok) {
            const { subscription, firstPayment, splitConfig } = response.data;
            
            const splitSubAccount = (value * splitConfig.subAccount / 100).toFixed(2);
            const splitMainAccount = (value * splitConfig.mainAccount / 100).toFixed(2);
            
            let qrCodeSection = '';
            if (firstPayment.pix) {
                qrCodeSection = `
                    <div class="bg-white p-4 rounded-lg border-2 border-purple-200 mb-4">
                        <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-qrcode text-purple-600 mr-2"></i>
                            QR Code do Primeiro Pagamento
                        </h4>
                        
                        <div class="flex flex-col items-center mb-4">
                            <img src="${firstPayment.pix.qrCodeBase64}" alt="QR Code PIX" class="w-64 h-64 border-2 border-gray-300 rounded">
                            <p class="text-sm text-gray-600 mt-2">Valor: <strong class="text-purple-600">R$ ${value.toFixed(2)}</strong></p>
                        </div>
                        
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-copy mr-1"></i> Chave PIX (Copia e Cola)
                            </label>
                            <div class="flex gap-2">
                                <textarea readonly 
                                    id="pix-payload-${accountId}" 
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-xs"
                                    rows="3">${firstPayment.pix.payload}</textarea>
                                <button onclick="copyPixKey('${accountId}')" 
                                    class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                ${firstPayment.pix.payload.length} caracteres
                            </p>
                        </div>
                    </div>
                `;
            }
            
            resultDiv.innerHTML = `
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-300">
                    <div class="flex items-start gap-3 mb-4">
                        <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                        <div class="flex-1">
                            <h3 class="font-bold text-lg text-gray-800">✅ Assinatura Criada com Sucesso!</h3>
                            <p class="text-sm text-gray-600 mt-1">
                                O cliente receberá uma cobrança mensal de <strong class="text-purple-600">R$ ${value.toFixed(2)}</strong>
                            </p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-xs text-gray-500 mb-1"><i class="fas fa-user mr-1"></i>Cliente</p>
                            <p class="font-semibold text-gray-800">${customerName}</p>
                            <p class="text-sm text-gray-600">${customerEmail}</p>
                        </div>
                        
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-xs text-gray-500 mb-1"><i class="fas fa-calendar mr-1"></i>Próximo Vencimento</p>
                            <p class="font-semibold text-gray-800">${new Date(subscription.nextDueDate).toLocaleDateString('pt-BR')}</p>
                            <p class="text-sm text-gray-600">Ciclo: Mensal</p>
                        </div>
                    </div>
                    
                    ${qrCodeSection}
                    
                    <div class="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded border border-green-300 mb-4">
                        <h4 class="font-bold text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-chart-pie text-green-600 mr-2"></i>
                            Split Automático 20/80
                        </h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p class="text-gray-600">Para você (20%)</p>
                                <p class="font-bold text-green-600 text-lg">R$ ${splitSubAccount}</p>
                            </div>
                            <div>
                                <p class="text-gray-600">Conta Principal (80%)</p>
                                <p class="font-bold text-blue-600 text-lg">R$ ${splitMainAccount}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-1"></i>
                            <strong>Como funciona:</strong> O cliente receberá uma notificação automática todo mês com o QR Code PIX. 
                            Após o pagamento, o split de 20/80 será aplicado automaticamente.
                        </p>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="closeSubscriptionFrame('${accountId}')" 
                            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold">
                            <i class="fas fa-check mr-2"></i>Concluir
                        </button>
                        <button onclick="viewSubscriptionDetails('${subscription.id}')" 
                            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            <i class="fas fa-eye mr-2"></i>Ver Detalhes
                        </button>
                    </div>
                </div>
            `;
        } else {
            throw new Error(response.data.error || 'Erro ao criar assinatura');
        }
    } catch (error) {
        console.error('Erro:', error);
        resultDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded p-4">
                <p class="text-red-800">
                    <i class="fas fa-times-circle mr-2"></i>
                    <strong>Erro:</strong> ${error.response?.data?.error || error.message}
                </p>
                <button onclick="closeSubscriptionFrame('${accountId}')" 
                    class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
}

function copyPixKey(accountId) {
    const textarea = document.getElementById(`pix-payload-${accountId}`);
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        alert('✅ Chave PIX copiada!\n\nCole no aplicativo do banco para pagar.');
    }
}

function viewSubscriptionDetails(subscriptionId) {
    alert(`🔍 Visualizar detalhes da assinatura ${subscriptionId}\n\nEm breve: painel com histórico de pagamentos, status e gestão da assinatura.`);
}

// Controles do formulário de PIX Automático
function toggleAutomaticForm(accountId, walletId) {
    // Abrir modal PIX Automático
    openPixAutomaticModal(accountId, walletId);
}

function closeAutomaticFrame(accountId) {
    const frame = document.getElementById(`automatic-frame-${accountId}`);
    const btn = document.getElementById(`btn-automatic-${accountId}`);
    
    if (frame) {
        frame.classList.add('hidden');
    }
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-robot mr-2"></i>PIX Automático';
        btn.classList.remove('from-gray-500', 'to-gray-600');
        btn.classList.add('from-indigo-500', 'to-cyan-500');
    }
    
    // Resetar formulário
    const form = document.getElementById(`automatic-form-${accountId}`);
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            if (input.id.includes('desc')) {
                input.value = 'Mensalidade';
            } else {
                input.value = '';
            }
        });
    }
}

async function createAutomaticAuthorization(accountId, walletId) {
    const resultDiv = document.getElementById(`automatic-result-${accountId}`);
    const formDiv = document.getElementById(`automatic-form-${accountId}`);
    
    const customerName = document.getElementById(`auto-name-${accountId}`).value.trim();
    const customerEmail = document.getElementById(`auto-email-${accountId}`).value.trim();
    const customerCpf = document.getElementById(`auto-cpf-${accountId}`).value.trim();
    const value = parseFloat(document.getElementById(`auto-value-${accountId}`).value);
    const description = document.getElementById(`auto-desc-${accountId}`).value.trim();
    
    if (!customerName || !customerEmail || !customerCpf || !value || value <= 0) {
        alert('⚠️ Preencha todos os campos obrigatórios!');
        return;
    }
    
    if (customerCpf.length !== 11 || !/^\d+$/.test(customerCpf)) {
        alert('⚠️ CPF inválido! Digite apenas números (11 dígitos)');
        return;
    }
    
    formDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <p class="text-gray-500 text-sm py-4">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Criando autorização PIX Automático de R$ ${value.toFixed(2)}...
        </p>
    `;
    
    try {
        const response = await axios.post('/api/pix/automatic-authorization', {
            walletId,
            accountId,
            value,
            description,
            customerName,
            customerEmail,
            customerCpf,
            recurrenceType: 'MONTHLY'
        });
        
        if (response.data.ok) {
            const { authorization, qrCode, splitConfig, instructions } = response.data;
            
            const splitSubAccount = (value * splitConfig.subAccount / 100).toFixed(2);
            const splitMainAccount = (value * splitConfig.mainAccount / 100).toFixed(2);
            
            resultDiv.innerHTML = `
                <div class="bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 rounded-lg border-2 border-indigo-300">
                    <div class="flex items-start gap-3 mb-4">
                        <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                        <div class="flex-1">
                            <h3 class="font-bold text-lg text-gray-800">✅ Autorização PIX Automático Criada!</h3>
                            <p class="text-sm text-gray-600 mt-1">
                                Cliente precisa <strong class="text-indigo-600">escanear o QR Code</strong> e <strong>autorizar</strong> no app do banco.
                            </p>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <p class="text-sm text-yellow-800 font-semibold mb-2">
                            <i class="fas fa-info-circle mr-1"></i>
                            Como funciona:
                        </p>
                        <ol class="text-xs text-yellow-800 space-y-1 ml-4 list-decimal">
                            <li>${instructions.step1}</li>
                            <li>${instructions.step2}</li>
                            <li>${instructions.step3}</li>
                            <li>${instructions.step4}</li>
                            <li>${instructions.step5}</li>
                        </ol>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg border-2 border-indigo-200 mb-4">
                        <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-qrcode text-indigo-600 mr-2"></i>
                            QR Code de Autorização
                        </h4>
                        
                        <div class="flex flex-col items-center mb-4">
                            <img src="${qrCode.encodedImage}" alt="QR Code PIX Automático" class="w-64 h-64 border-2 border-gray-300 rounded">
                            <p class="text-sm text-gray-600 mt-2">Valor mensal: <strong class="text-indigo-600">R$ ${value.toFixed(2)}</strong></p>
                            <p class="text-xs text-gray-500">Status: ${authorization.status}</p>
                        </div>
                        
                        <div class="mb-3">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-copy mr-1"></i> Chave PIX (Copia e Cola)
                            </label>
                            <div class="flex gap-2">
                                <textarea readonly 
                                    id="auto-payload-${accountId}" 
                                    class="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 font-mono text-xs"
                                    rows="3">${qrCode.payload}</textarea>
                                <button onclick="copyAutomaticPayload('${accountId}')" 
                                    class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                ${qrCode.payload.length} caracteres
                            </p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-xs text-gray-500 mb-1"><i class="fas fa-user mr-1"></i>Cliente</p>
                            <p class="font-semibold text-gray-800">${customerName}</p>
                            <p class="text-sm text-gray-600">${customerEmail}</p>
                        </div>
                        
                        <div class="bg-white p-3 rounded border border-gray-200">
                            <p class="text-xs text-gray-500 mb-1"><i class="fas fa-calendar mr-1"></i>Recorrência</p>
                            <p class="font-semibold text-gray-800">Mensal</p>
                            <p class="text-sm text-gray-600">Início: ${authorization.startDate}</p>
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded border border-green-300 mb-4">
                        <h4 class="font-bold text-gray-800 mb-2 flex items-center">
                            <i class="fas fa-chart-pie text-green-600 mr-2"></i>
                            Split Automático 20/80
                        </h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p class="text-gray-600">Para você (20%)</p>
                                <p class="font-bold text-green-600 text-lg">R$ ${splitSubAccount}</p>
                            </div>
                            <div>
                                <p class="text-gray-600">Conta Principal (80%)</p>
                                <p class="font-bold text-blue-600 text-lg">R$ ${splitMainAccount}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <p class="text-sm text-blue-800">
                            <i class="fas fa-robot mr-1"></i>
                            <strong>Débito Automático:</strong> Após autorização, o valor será debitado automaticamente todo mês. 
                            Cliente NÃO precisa pagar manualmente. Split aplicado em todos os pagamentos.
                        </p>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="closeAutomaticFrame('${accountId}')" 
                            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold">
                            <i class="fas fa-check mr-2"></i>Concluir
                        </button>
                        <button onclick="viewAuthorizationDetails('${authorization.id}')" 
                            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            <i class="fas fa-eye mr-2"></i>Ver Detalhes
                        </button>
                    </div>
                </div>
            `;
        } else {
            throw new Error(response.data.error || 'Erro ao criar autorização');
        }
    } catch (error) {
        console.error('Erro:', error);
        resultDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded p-4">
                <p class="text-red-800">
                    <i class="fas fa-times-circle mr-2"></i>
                    <strong>Erro:</strong> ${error.response?.data?.error || error.message}
                </p>
                <button onclick="closeAutomaticFrame('${accountId}')" 
                    class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
}

function copyAutomaticPayload(accountId) {
    const textarea = document.getElementById(`auto-payload-${accountId}`);
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        alert('✅ Chave PIX copiada!\n\nCliente deve colar no aplicativo do banco e autorizar o débito automático.');
    }
}

function viewAuthorizationDetails(authorizationId) {
    alert(`🔍 Visualizar detalhes da autorização ${authorizationId}\n\nEm breve: painel com status da autorização, histórico de cobranças automáticas e opção de cancelamento.`);
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
// Função para exibir QR Code em tela cheia
function showFullScreenQR(qrCodeBase64, payload, value) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
            <button onclick="this.closest('.fixed').remove()" 
                class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold">
                &times;
            </button>
            
            <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                <i class="fas fa-qrcode mr-2 text-indigo-600"></i>
                QR Code PIX - R$ ${value.toFixed(2)}
            </h3>
            
            <div class="flex flex-col items-center gap-6">
                <!-- QR Code Grande -->
                <div class="bg-white p-6 rounded-lg border-4 border-indigo-600 shadow-xl">
                    <img src="${qrCodeBase64}" alt="QR Code PIX" class="w-80 h-80">
                </div>
                
                <!-- Payload Completo -->
                <div class="w-full">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-key mr-1"></i>
                        Chave PIX Completa (${payload.length} caracteres):
                    </label>
                    <div class="relative">
                        <textarea readonly 
                            id="fullscreen-payload"
                            class="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded text-xs font-mono resize-none"
                            rows="4"
                            style="word-break: break-all;">${payload}</textarea>
                        <button onclick="navigator.clipboard.writeText('${payload}').then(() => alert('✅ Chave PIX copiada!'))"
                            class="absolute top-2 right-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold">
                            <i class="fas fa-copy mr-1"></i>Copiar
                        </button>
                    </div>
                </div>
                
                <!-- Instruções -->
                <div class="w-full bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <p class="text-sm font-semibold text-blue-900 mb-2">
                        <i class="fas fa-mobile-alt mr-2"></i>
                        Como usar no app do banco:
                    </p>
                    <ol class="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                        <li><strong>Opção 1:</strong> Escaneie o QR Code acima</li>
                        <li><strong>Opção 2:</strong> Copie a chave PIX e cole no app do banco (PIX → Copia e Cola)</li>
                        <li>Confirme o valor: <strong>R$ ${value.toFixed(2)}</strong></li>
                        <li>Complete o pagamento</li>
                    </ol>
                </div>
                
                <!-- Botões de Ação -->
                <div class="flex gap-3 w-full">
                    <button onclick="downloadQRCodeFromModal('${qrCodeBase64}', ${value})" 
                        class="flex-1 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 font-semibold">
                        <i class="fas fa-download mr-2"></i>Baixar QR Code
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                        class="flex-1 bg-gray-600 text-white rounded-lg py-3 hover:bg-gray-700 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Função auxiliar para download do QR Code do modal
function downloadQRCodeFromModal(qrCodeBase64, value) {
    const link = document.createElement('a');
    link.href = qrCodeBase64;
    link.download = `qrcode-pix-${value.toFixed(2).replace('.', ',')}.png`;
    link.click();
    alert('✅ QR Code baixado com sucesso!');
}

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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button onclick="toggleAutomaticForm('${account.id}', '${account.walletId}')" 
                        id="btn-automatic-${account.id}"
                        class="px-4 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-600 font-semibold shadow-md transition">
                        <i class="fas fa-robot mr-2"></i>PIX Automático
                    </button>
                    <button onclick="toggleSignupLinkForm('${account.id}', '${account.walletId}')" 
                        id="btn-signup-link-${account.id}"
                        class="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold shadow-md transition">
                        <i class="fas fa-link mr-2"></i>Link Auto-Cadastro
                    </button>
                    <button onclick="showSavedBanners('${account.id}', '${account.name || ''}')" 
                        id="btn-banners-${account.id}"
                        class="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold shadow-md transition">
                        <i class="fas fa-images mr-2"></i>Banners Salvos
                    </button>
                </div>
                
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
                
                <!-- Formulário de Assinatura Recorrente -->
                <div id="subscription-frame-${account.id}" class="hidden mt-4 border-2 border-purple-300 rounded-lg overflow-hidden shadow-lg">
                    <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-3 flex justify-between items-center">
                        <h4 class="text-white font-bold">
                            <i class="fas fa-calendar-check mr-2"></i>Assinatura Mensal PIX
                        </h4>
                        <button onclick="closeSubscriptionFrame('${account.id}')" 
                            class="text-white hover:text-gray-200 font-bold text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Formulário -->
                    <div id="subscription-form-${account.id}" class="p-4 bg-white">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" 
                                id="sub-name-${account.id}" 
                                placeholder="Nome do cliente" 
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                            <input type="email" 
                                id="sub-email-${account.id}" 
                                placeholder="Email do cliente" 
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" 
                                id="sub-cpf-${account.id}" 
                                placeholder="CPF (somente números)" 
                                maxlength="11"
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                            <input type="number" 
                                id="sub-value-${account.id}" 
                                placeholder="Valor mensal (R$)" 
                                step="0.01" 
                                min="1"
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                            <input type="text" 
                                id="sub-desc-${account.id}" 
                                placeholder="Descrição" 
                                value="Mensalidade"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500">
                        </div>
                        <button onclick="createSubscription('${account.id}', '${account.walletId}')" 
                            class="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold">
                            <i class="fas fa-calendar-check mr-2"></i>Criar Assinatura Mensal
                        </button>
                    </div>
                    
                    <!-- Resultado da Assinatura -->
                    <div id="subscription-result-${account.id}" class="hidden p-4 bg-gray-50"></div>
                </div>
                
                <!-- Formulário de PIX Automático (Débito Automático) -->
                <div id="automatic-frame-${account.id}" class="hidden mt-4 border-2 border-indigo-300 rounded-lg overflow-hidden shadow-lg">
                    <div class="bg-gradient-to-r from-indigo-500 to-cyan-500 p-3 flex justify-between items-center">
                        <h4 class="text-white font-bold">
                            <i class="fas fa-robot mr-2"></i>PIX Automático (Débito Automático)
                        </h4>
                        <button onclick="closeAutomaticFrame('${account.id}')" 
                            class="text-white hover:text-gray-200 font-bold text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Formulário -->
                    <div id="automatic-form-${account.id}" class="p-4 bg-white">
                        <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                            <p class="text-sm text-blue-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                <strong>PIX Automático:</strong> Cliente autoriza UMA VEZ e o débito ocorre automaticamente todo mês. Sem necessidade de pagar manualmente.
                            </p>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" 
                                id="auto-name-${account.id}" 
                                placeholder="Nome do cliente" 
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500">
                            <input type="email" 
                                id="auto-email-${account.id}" 
                                placeholder="Email do cliente" 
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="text" 
                                id="auto-cpf-${account.id}" 
                                placeholder="CPF (somente números)" 
                                maxlength="11"
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500">
                            <input type="number" 
                                id="auto-value-${account.id}" 
                                placeholder="Valor mensal (R$)" 
                                step="0.01" 
                                min="1"
                                required
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500">
                            <input type="text" 
                                id="auto-desc-${account.id}" 
                                placeholder="Descrição" 
                                value="Mensalidade"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500">
                        </div>
                        <button onclick="createAutomaticAuthorization('${account.id}', '${account.walletId}')" 
                            class="w-full mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold">
                            <i class="fas fa-robot mr-2"></i>Gerar Autorização PIX Automático
                        </button>
                    </div>
                    
                    <!-- Resultado da Autorização -->
                    <div id="automatic-result-${account.id}" class="hidden p-4 bg-gray-50"></div>
                </div>
                
                <!-- Formulário de Link de Auto-Cadastro -->
                <div id="signup-link-frame-${account.id}" class="hidden mt-4 border-2 border-orange-300 rounded-lg overflow-hidden shadow-lg">
                    <div class="bg-gradient-to-r from-orange-500 to-red-500 p-3 flex justify-between items-center">
                        <h4 class="text-white font-bold">
                            <i class="fas fa-link mr-2"></i>Gerar Link de Auto-Cadastro
                        </h4>
                        <button onclick="closeSignupLinkFrame('${account.id}')" 
                            class="text-white hover:text-gray-200 font-bold text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Formulário -->
                    <div id="signup-link-form-${account.id}" class="p-4 bg-white">
                        <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-magic mr-1"></i>
                                <strong>Link de Auto-Cadastro:</strong> Cliente lê QR Code → Preenche dados → Paga via PIX → Sistema processa automaticamente com Split 80/20!
                            </p>
                        </div>
                        
                        <!-- Tipo de Cobrança -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-list mr-2"></i>Tipo de Cobrança:
                            </label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition">
                                    <input type="radio" 
                                        name="charge-type-${account.id}" 
                                        value="single" 
                                        checked
                                        class="mr-2 text-orange-600 focus:ring-orange-500">
                                    <div class="flex-1">
                                        <div class="font-semibold text-gray-800">
                                            <i class="fas fa-receipt mr-1 text-blue-600"></i>
                                            Cobrança Única
                                        </div>
                                        <div class="text-xs text-gray-500">Pagamento único, sem recorrência</div>
                                    </div>
                                </label>
                                
                                <label class="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition">
                                    <input type="radio" 
                                        name="charge-type-${account.id}" 
                                        value="monthly" 
                                        class="mr-2 text-orange-600 focus:ring-orange-500">
                                    <div class="flex-1">
                                        <div class="font-semibold text-gray-800">
                                            <i class="fas fa-sync-alt mr-1 text-green-600"></i>
                                            Assinatura Mensal
                                        </div>
                                        <div class="text-xs text-gray-500">Cobrança recorrente automática</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                                <input type="number" 
                                    id="signup-value-${account.id}" 
                                    placeholder="Ex: 149.90" 
                                    step="0.01" 
                                    min="1"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input type="text" 
                                    id="signup-desc-${account.id}" 
                                    placeholder="Ex: Plano Premium" 
                                    value="Mensalidade"
                                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500">
                            </div>
                        </div>
                        <button onclick="generateSignupLink('${account.id}', '${account.walletId}')" 
                            class="w-full mt-3 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold">
                            <i class="fas fa-magic mr-2"></i>Gerar Link e QR Code
                        </button>
                    </div>
                    
                    <!-- Resultado do Link -->
                    <div id="signup-link-result-${account.id}" class="hidden p-4 bg-gray-50"></div>
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
    
    // Carregar assinaturas DeltaPag quando entrar na seção
    if (section === 'deltapag') {
        if (typeof loadDeltapagSubscriptions === 'function') {
            setTimeout(() => loadDeltapagSubscriptions(), 100);
        }
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
        select.innerHTML = '<option value="">Selecione uma subconta...</option>' +
                          '<option value="ALL_ACCOUNTS">📊 TODAS AS SUBCONTAS</option>';
        
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
    
    // Função para verificar se pode usar recorrente
    const updateRecurrentAvailability = () => {
        if (billingTypeSelect && chargeTypeSelect) {
            const billingType = billingTypeSelect.value;
            const recurrentOption = chargeTypeSelect.querySelector('option[value="RECURRENT"]');
            
            // PIX não suporta recorrente - apenas Cartão e Boleto
            if (billingType === 'PIX') {
                if (recurrentOption) {
                    recurrentOption.disabled = true;
                    recurrentOption.textContent = 'Assinatura/Recorrente (não disponível para PIX)';
                }
                // Se estava selecionado recorrente, muda para valor fixo
                if (chargeTypeSelect.value === 'RECURRENT') {
                    chargeTypeSelect.value = 'DETACHED';
                    chargeTypeSelect.dispatchEvent(new Event('change'));
                }
            } else {
                // Outras formas de pagamento permitem recorrente
                if (recurrentOption) {
                    recurrentOption.disabled = false;
                    recurrentOption.textContent = 'Assinatura/Recorrente';
                }
            }
        }
    };
    
    // Event listener para mudança no tipo de cobrança
    if (billingTypeSelect) {
        billingTypeSelect.addEventListener('change', updateRecurrentAvailability);
    }
    
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
    
    // Inicializar estado
    updateRecurrentAvailability();
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

// ========================================
// FUNÇÕES DE LINK DE AUTO-CADASTRO
// ========================================

function toggleSignupLinkForm(accountId, walletId) {
    const frame = document.getElementById(`signup-link-frame-${accountId}`);
    if (!frame) {
        console.error('Frame de link de auto-cadastro não encontrado:', accountId);
        return;
    }
    
    // Esconder outros frames
    hideAllFrames(accountId);
    
    // Toggle este frame
    frame.classList.toggle('hidden');
    
    // Atualizar botão
    const btn = document.getElementById(`btn-signup-link-${accountId}`);
    if (btn) {
        if (frame.classList.contains('hidden')) {
            btn.innerHTML = '<i class="fas fa-link mr-2"></i>Link Auto-Cadastro';
            btn.classList.remove('from-gray-500', 'to-gray-600');
            btn.classList.add('from-orange-500', 'to-red-500');
        } else {
            btn.innerHTML = '<i class="fas fa-times mr-2"></i>Fechar';
            btn.classList.remove('from-orange-500', 'to-red-500');
            btn.classList.add('from-gray-500', 'to-gray-600');
        }
    }
}

function closeSignupLinkFrame(accountId) {
    const frame = document.getElementById(`signup-link-frame-${accountId}`);
    if (frame) {
        frame.classList.add('hidden');
    }
    
    // Resetar botão
    const btn = document.getElementById(`btn-signup-link-${accountId}`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-link mr-2"></i>Link Auto-Cadastro';
        btn.classList.remove('from-gray-500', 'to-gray-600');
        btn.classList.add('from-orange-500', 'to-red-500');
    }
    
    // Resetar formulário
    const form = document.getElementById(`signup-link-form-${accountId}`);
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            if (input.id.includes('desc')) {
                input.value = 'Mensalidade';
            } else {
                input.value = '';
            }
        });
    }
}

async function generateSignupLink(accountId, walletId) {
    const resultDiv = document.getElementById(`signup-link-result-${accountId}`);
    const formDiv = document.getElementById(`signup-link-form-${accountId}`);
    
    const value = parseFloat(document.getElementById(`signup-value-${accountId}`).value);
    const description = document.getElementById(`signup-desc-${accountId}`).value.trim();
    
    // Capturar tipo de cobrança selecionado
    const chargeTypeInputs = document.getElementsByName(`charge-type-${accountId}`);
    let chargeType = 'single'; // Padrão
    for (const input of chargeTypeInputs) {
        if (input.checked) {
            chargeType = input.value;
            break;
        }
    }
    
    if (!value || value <= 0) {
        alert('⚠️ Digite um valor válido maior que zero!');
        return;
    }
    
    formDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <p class="text-gray-500 text-sm py-4">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Gerando link de auto-cadastro...
        </p>
    `;
    
    try {
        const response = await fetch('/api/pix/subscription-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletId,
                accountId,
                value,
                description,
                chargeType // 'single' ou 'monthly'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            const link = data.data;
            
            // Gerar QR Code do link
            const qrCodeBase64 = await generateQRCodeFromText(link.linkUrl);
            
            resultDiv.innerHTML = `
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 class="text-lg font-bold text-green-800 mb-3">
                        <i class="fas fa-check-circle mr-2"></i>
                        Link de Auto-Cadastro Criado!
                    </h4>
                    
                    <div class="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Valor Mensal:</p>
                            <p class="text-xl font-bold text-green-600">R$ ${value.toFixed(2)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Descrição:</p>
                            <p class="font-semibold text-gray-800">${description}</p>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-4 mb-4 text-center">
                        <p class="text-sm text-gray-600 mb-3 font-semibold">
                            <i class="fas fa-qrcode mr-2"></i>
                            Cliente escaneia este QR Code para se cadastrar:
                        </p>
                        <img src="${qrCodeBase64}" alt="QR Code" class="w-48 h-48 mx-auto border-4 border-white shadow-lg rounded-lg mb-3">
                        <div class="flex gap-2 justify-center">
                            <button onclick="downloadQRCode('${qrCodeBase64}', 'qrcode-auto-cadastro-${accountId}.png')" 
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-2"></i>Baixar QR Code
                            </button>
                            <button onclick="generateHTML('${link.linkUrl}', '${qrCodeBase64}', ${value}, '${description}')" 
                                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                                <i class="fas fa-code mr-2"></i>Gerar HTML
                            </button>
                            <button onclick="openBannerEditor('${link.linkUrl}', '${qrCodeBase64}', ${value}, '${description}', '${chargeType}')" 
                                class="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded hover:from-orange-700 hover:to-red-700 transition">
                                <i class="fas fa-image mr-2"></i>Gerar Banner
                            </button>
                        </div>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            <strong>Como funciona:</strong>
                        </p>
                        <ol class="text-sm text-yellow-800 mt-2 space-y-1 ml-4">
                            <li>1️⃣ Cliente escaneia o QR Code</li>
                            <li>2️⃣ Preenche nome, email e CPF</li>
                            <li>3️⃣ Paga primeira parcela via PIX</li>
                            <li>4️⃣ <strong>Assinatura mensal criada automaticamente!</strong></li>
                            <li>5️⃣ <strong>Split 80/20 aplicado em todas as mensalidades</strong></li>
                        </ol>
                    </div>
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p class="text-xs text-gray-600 mb-2 font-semibold">Link de Auto-Cadastro:</p>
                        <div class="flex gap-2">
                            <input type="text" value="${link.linkUrl}" readonly 
                                class="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                            <button onclick="copyToClipboard('${link.linkUrl}')" 
                                class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            <i class="fas fa-clock mr-1"></i>
                            Válido até: ${new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    
                    <button onclick="closeSignupLinkFrame('${accountId}')" 
                        class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                        <i class="fas fa-check mr-2"></i>Fechar
                    </button>
                </div>
            `;
        } else {
            throw new Error(data.error || 'Erro ao gerar link');
        }
    } catch (error) {
        console.error('Erro ao gerar link:', error);
        resultDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 class="text-red-800 font-bold mb-2">
                    <i class="fas fa-exclamation-triangle mr-2"></i>Erro
                </h4>
                <p class="text-red-700 text-sm mb-3">${error.message}</p>
                <button onclick="closeSignupLinkFrame('${accountId}')" 
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <i class="fas fa-times mr-2"></i>Fechar
                </button>
            </div>
        `;
    }
}

async function generateQRCodeFromText(text) {
    try {
        const response = await fetch('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(text));
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        return '';
    }
}

function downloadQRCode(base64Data, filename) {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    link.click();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Link copiado para a área de transferência!');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ Link copiado!');
    });
}

// Gerar HTML completo para compartilhamento
function generateHTML(linkUrl, qrCodeBase64, value, description) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assinatura Mensal - ${description}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        .icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
        }
        h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .price-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .price {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .price-label {
            font-size: 18px;
            opacity: 0.9;
        }
        .qr-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .qr-code {
            width: 250px;
            height: 250px;
            margin: 0 auto;
            border: 4px solid white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .instructions {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            border-radius: 10px;
            text-align: left;
            margin-bottom: 20px;
        }
        .instructions h3 {
            color: #856404;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .step {
            display: flex;
            align-items: start;
            margin-bottom: 12px;
            color: #856404;
        }
        .step-number {
            background: #ffc107;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            font-size: 18px;
            margin-top: 20px;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 30px 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            font-size: 14px;
            color: #666;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            .price {
                font-size: 36px;
            }
            .qr-code {
                width: 200px;
                height: 200px;
            }
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📋</div>
        <h1>Assinatura Mensal</h1>
        <p class="subtitle">${description}</p>
        
        <div class="price-box">
            <div class="price">R$ ${value.toFixed(2)}</div>
            <div class="price-label">por mês</div>
        </div>
        
        <div class="qr-container">
            <p style="color: #666; margin-bottom: 15px; font-weight: 600;">Escaneie o QR Code para se cadastrar:</p>
            <img src="${qrCodeBase64}" alt="QR Code" class="qr-code">
        </div>
        
        <div class="instructions">
            <h3>🎯 Como funciona:</h3>
            <div class="step">
                <div class="step-number">1</div>
                <div>Escaneie o QR Code acima com a câmera do seu celular</div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div>Preencha seus dados (nome, email e CPF)</div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div>Pague a primeira parcela via PIX</div>
            </div>
            <div class="step">
                <div class="step-number">4</div>
                <div><strong>Pronto!</strong> Sua assinatura mensal estará ativa</div>
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">✅</div>
                <strong>Pagamento Automático</strong><br>
                Débito mensal sem complicação
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <strong>100% Seguro</strong><br>
                Pode cancelar quando quiser
            </div>
            <div class="feature">
                <div class="feature-icon">📧</div>
                <strong>Notificações</strong><br>
                Receba email todo mês
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <strong>Rápido</strong><br>
                Cadastro em 2 minutos
            </div>
        </div>
        
        <a href="${linkUrl}" class="btn">Acessar Formulário de Cadastro</a>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Link de auto-cadastro válido por 30 dias
        </p>
    </div>
</body>
</html>`;

    // Criar blob e fazer download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assinatura-mensal-' + value.toFixed(2).replace('.', '-') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar modal com prévia
    showHTMLPreview(html);
}

// Mostrar prévia do HTML gerado
function showHTMLPreview(html) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 20px; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 20px; color: #333;">
                    <i class="fas fa-eye mr-2"></i>Prévia do HTML Gerado
                </h3>
                <button onclick="this.closest('[style*=fixed]').remove()" 
                    style="background: #ef4444; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px;">
                    ×
                </button>
            </div>
            
            <div style="flex: 1; overflow: auto; padding: 20px; background: #f9fafb;">
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #16a34a; display: flex; align-items: center;">
                        <i class="fas fa-check-circle mr-2"></i>Arquivo baixado com sucesso!
                    </h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        O arquivo HTML foi salvo no seu computador. Você pode enviá-lo por email, WhatsApp ou hospedar em seu servidor.
                    </p>
                </div>
                
                <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #2563eb;">
                        <i class="fas fa-lightbulb mr-2"></i>Como usar:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
                        <li style="margin-bottom: 8px;">📧 <strong>Email:</strong> Anexe o arquivo HTML e envie para seus clientes</li>
                        <li style="margin-bottom: 8px;">💬 <strong>WhatsApp:</strong> Envie o arquivo como documento</li>
                        <li style="margin-bottom: 8px;">🌐 <strong>Servidor:</strong> Faça upload para seu site e compartilhe o link</li>
                        <li style="margin-bottom: 8px;">💾 <strong>Drive:</strong> Salve no Google Drive/Dropbox e compartilhe</li>
                    </ul>
                </div>
                
                <iframe srcdoc="${html.replace(/"/g, '&quot;')}" 
                    style="width: 100%; height: 500px; border: 2px solid #e5e7eb; border-radius: 10px; background: white;">
                </iframe>
            </div>
            
            <div style="padding: 20px; border-top: 2px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="copyHTMLCode()" 
                    style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-copy mr-2"></i>Copiar Código HTML
                </button>
                <button onclick="this.closest('[style*=fixed]').remove()" 
                    style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-times mr-2"></i>Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Salvar HTML para copiar
    window.generatedHTML = html;
}

// Copiar código HTML
function copyHTMLCode() {
    if (window.generatedHTML) {
        copyToClipboard(window.generatedHTML);
    }
}

// ===== FUNÇÕES PIX AUTOMÁTICO =====
let currentPixAutoLink = '';
let currentPixAutoAccountId = '';
let currentPixAutoWalletId = '';

// Abrir modal PIX Automático
async function openPixAutomaticModal(accountId, walletId) {
    currentPixAutoAccountId = accountId;
    currentPixAutoWalletId = walletId;
    
    const modal = document.getElementById('pix-automatic-modal');
    const form = document.getElementById('pix-automatic-form');
    const loading = document.getElementById('pix-automatic-loading');
    const content = document.getElementById('pix-automatic-content');
    
    // Resetar formulário
    document.getElementById('pix-auto-value').value = '';
    document.getElementById('pix-auto-description').value = '';
    document.getElementById('pix-auto-days').value = '30';
    
    // Mostrar modal com formulário
    modal.classList.remove('hidden');
    form.classList.remove('hidden');
    loading.classList.add('hidden');
    content.classList.add('hidden');
}

// Gerar link PIX Automático
async function generatePixAutomaticLink() {
    const value = parseFloat(document.getElementById('pix-auto-value').value);
    const description = document.getElementById('pix-auto-description').value.trim();
    const days = parseInt(document.getElementById('pix-auto-days').value);
    
    // Validações
    if (!value || value <= 0) {
        alert('❌ Por favor, informe um valor válido maior que zero');
        return;
    }
    
    if (!description) {
        alert('❌ Por favor, informe uma descrição');
        return;
    }
    
    if (!days || days <= 0) {
        alert('❌ Por favor, informe uma validade válida');
        return;
    }
    
    const form = document.getElementById('pix-automatic-form');
    const loading = document.getElementById('pix-automatic-loading');
    const content = document.getElementById('pix-automatic-content');
    const btn = document.getElementById('generate-pix-auto-btn');
    
    // Desabilitar botão
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando...';
    
    try {
        // Gerar link via API
        const response = await axios.post('/api/pix/automatic-signup-link', {
            walletId: currentPixAutoWalletId,
            accountId: currentPixAutoAccountId,
            value: value,
            description: description,
            expirationDays: days
        });
        
        if (response.data.ok) {
            const linkData = response.data;
            currentPixAutoLink = linkData.linkUrl;
            
            // Preencher informações do link
            document.getElementById('generated-pix-auto-link').value = linkData.linkUrl;
            document.getElementById('pix-auto-display-value').textContent = `R$ ${value.toFixed(2)}`;
            
            // Formatar data de expiração
            const expiresDate = new Date(linkData.expiresAt);
            const expiresFormatted = expiresDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            document.getElementById('pix-auto-expires').textContent = expiresFormatted;
            
            // Gerar QR Code
            const qrContainer = document.getElementById('pix-auto-qr-container');
            const qrSize = 200;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(linkData.linkUrl)}`;
            qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="mx-auto border-2 border-gray-300 rounded-lg" style="width: ${qrSize}px; height: ${qrSize}px;">`;
            
            // Mostrar conteúdo
            form.classList.add('hidden');
            loading.classList.add('hidden');
            content.classList.remove('hidden');
        } else {
            throw new Error(response.data.error || 'Erro ao gerar link');
        }
    } catch (error) {
        console.error('Erro ao gerar link PIX Automático:', error);
        alert('❌ Erro ao gerar link: ' + (error.response?.data?.error || error.message));
        
        // Reabilitar botão
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-robot mr-2"></i>Gerar Link PIX Automático';
    }
}

// Fechar modal PIX Automático
function closePixAutomaticModal() {
    const modal = document.getElementById('pix-automatic-modal');
    modal.classList.add('hidden');
    currentPixAutoLink = '';
    currentPixAutoAccountId = '';
    currentPixAutoWalletId = '';
}

// Copiar link PIX Automático
function copyPixAutoLink() {
    const input = document.getElementById('generated-pix-auto-link');
    const btn = document.getElementById('copy-pix-auto-btn');
    
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

// Compartilhar via WhatsApp
function sharePixAutoWhatsApp() {
    if (currentPixAutoLink) {
        const text = encodeURIComponent(`✨ Link PIX Automático - Débito Automático Mensal\n\nAutorize uma única vez e o pagamento será debitado automaticamente todo mês!\n\n🔗 ${currentPixAutoLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }
}

// Compartilhar via Email
function sharePixAutoEmail() {
    if (currentPixAutoLink) {
        const subject = encodeURIComponent('Link PIX Automático - Débito Automático Mensal');
        const body = encodeURIComponent(`Olá!\n\nAqui está o link para você se cadastrar no PIX Automático:\n\n${currentPixAutoLink}\n\nCom o PIX Automático, você autoriza o débito uma única vez e o pagamento será debitado automaticamente todo mês. Sem necessidade de pagar manualmente!\n\nAtenciosamente`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
}

// Compartilhar via Telegram
function sharePixAutoTelegram() {
    if (currentPixAutoLink) {
        const text = encodeURIComponent(`✨ Link PIX Automático - Débito Automático Mensal\n\nAutorize uma única vez e o pagamento será debitado automaticamente todo mês!\n\n🔗 ${currentPixAutoLink}`);
        window.open(`https://t.me/share/url?url=${currentPixAutoLink}&text=${text}`, '_blank');
    }
}

// Baixar QR Code
function downloadPixAutoQRCode() {
    if (currentPixAutoLink) {
        const qrSize = 500;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(currentPixAutoLink)}`;
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = 'qrcode-pix-automatico.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Gerar HTML do PIX Automático (igual ao Link Auto-Cadastro)
function downloadPixAutoHTML() {
    if (!currentPixAutoLink) return;
    
    const value = parseFloat(document.getElementById('pix-auto-value').value);
    const description = document.getElementById('pix-auto-description').value.trim();
    const linkUrl = currentPixAutoLink;
    
    // Gerar QR Code em base64
    const qrSize = 300;
    const qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(linkUrl)}`;
    
    // Gerar HTML completo
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PIX Automático - ${description}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            max-width: 600px;
            width: 100%;
            padding: 50px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 32px;
            color: #1a1a1a;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
        }
        .price-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .price {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .price-label {
            font-size: 18px;
            opacity: 0.9;
        }
        .qr-container {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .qr-code {
            width: 300px;
            height: 300px;
            border-radius: 10px;
            background: white;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .instructions {
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        .instructions h3 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            gap: 15px;
        }
        .step-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            font-size: 14px;
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        .highlight {
            background: #fff3cd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #ffc107;
        }
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            .price {
                font-size: 36px;
            }
            .qr-code {
                width: 200px;
                height: 200px;
            }
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🤖</div>
        <h1>PIX Automático</h1>
        <p class="subtitle">${description}</p>
        
        <div class="price-box">
            <div class="price">R$ ${value.toFixed(2)}</div>
            <div class="price-label">débito automático mensal</div>
        </div>
        
        <div class="highlight">
            <strong>⚡ PIX Automático:</strong> Autorize uma única vez e o pagamento será debitado automaticamente todo mês! Sem necessidade de pagar manualmente.
        </div>
        
        <div class="qr-container">
            <p style="color: #666; margin-bottom: 15px; font-weight: 600;">Escaneie o QR Code para se cadastrar:</p>
            <img src="${qrCodeBase64}" alt="QR Code" class="qr-code">
        </div>
        
        <div class="instructions">
            <h3>🎯 Como funciona:</h3>
            <div class="step">
                <div class="step-number">1</div>
                <div>Escaneie o QR Code acima com a câmera do seu celular</div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div>Preencha seus dados (nome, email e CPF)</div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div>Autorize o débito automático no app do seu banco</div>
            </div>
            <div class="step">
                <div class="step-number">4</div>
                <div>Pague a primeira parcela via PIX</div>
            </div>
            <div class="step">
                <div class="step-number">5</div>
                <div><strong>Pronto!</strong> Os pagamentos futuros serão debitados automaticamente</div>
            </div>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🤖</div>
                <strong>100% Automático</strong><br>
                Débito mensal sem intervenção
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <strong>Seguro</strong><br>
                Autorização uma única vez
            </div>
            <div class="feature">
                <div class="feature-icon">💰</div>
                <strong>Taxa Baixa</strong><br>
                Apenas 1,99% por transação
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <strong>Rápido</strong><br>
                Cadastro em 2 minutos
            </div>
        </div>
        
        <a href="${linkUrl}" class="btn">Acessar Formulário de Cadastro</a>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Link válido por ${document.getElementById('pix-auto-days').value} dias
        </p>
    </div>
</body>
</html>`;

    // Criar blob e fazer download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pix-automatico-' + value.toFixed(2).replace('.', '-') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Feedback visual
    alert('✅ HTML gerado com sucesso!');
}

// =====================================================
// DELTAPAG - PAGAMENTO RECORRENTE CARTÃO DE CRÉDITO
// =====================================================

function openDeltapagModal() {
    document.getElementById('deltapag-modal').classList.remove('hidden');
    
    // Aplicar máscaras nos campos
    const cpfInput = document.getElementById('deltapag-customer-cpf');
    const cardNumberInput = document.getElementById('deltapag-card-number');
    const cvvInput = document.getElementById('deltapag-card-cvv');
    
    // Máscara CPF
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        e.target.value = value;
    });
    
    // Máscara Cartão
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value.substring(0, 19);
    });
    
    // Máscara CVV
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

function closeDeltapagModal() {
    document.getElementById('deltapag-modal').classList.add('hidden');
    document.getElementById('deltapag-form').reset();
    document.getElementById('deltapag-result').classList.add('hidden');
}

// Handler do formulário DeltaPag
document.addEventListener('DOMContentLoaded', function() {
    const deltapagForm = document.getElementById('deltapag-form');
    if (deltapagForm) {
        deltapagForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('deltapag-submit-btn');
            const resultDiv = document.getElementById('deltapag-result');
            
            // Desabilitar botão
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
            resultDiv.classList.add('hidden');
            
            try {
                // Coletar dados do formulário
                const formData = {
                    customerName: document.getElementById('deltapag-customer-name').value,
                    customerEmail: document.getElementById('deltapag-customer-email').value,
                    customerCpf: document.getElementById('deltapag-customer-cpf').value,
                    customerPhone: document.getElementById('deltapag-customer-phone').value,
                    
                    cardNumber: document.getElementById('deltapag-card-number').value,
                    cardHolderName: document.getElementById('deltapag-card-holder').value,
                    cardExpiryMonth: document.getElementById('deltapag-card-month').value,
                    cardExpiryYear: document.getElementById('deltapag-card-year').value,
                    cardCvv: document.getElementById('deltapag-card-cvv').value,
                    
                    value: parseFloat(document.getElementById('deltapag-value').value),
                    recurrenceType: document.getElementById('deltapag-recurrence').value,
                    description: document.getElementById('deltapag-description').value,
                    
                    splitWalletId: document.getElementById('deltapag-split-wallet').value || null,
                    splitPercentage: document.getElementById('deltapag-split-percentage').value ? 
                        parseFloat(document.getElementById('deltapag-split-percentage').value) : null
                };
                
                // Fazer requisição
                const response = await axios.post('/api/deltapag/create-subscription', formData);
                
                if (response.data.ok) {
                    // Sucesso
                    resultDiv.innerHTML = `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                                <div class="flex-1">
                                    <h4 class="font-bold text-green-900 mb-2">
                                        🎉 Assinatura Criada com Sucesso!
                                    </h4>
                                    <div class="space-y-2 text-sm text-green-800">
                                        <div><strong>ID:</strong> ${response.data.subscription.id}</div>
                                        <div><strong>Cliente:</strong> ${response.data.subscription.customer.name}</div>
                                        <div><strong>Email:</strong> ${response.data.subscription.customer.email}</div>
                                        <div><strong>Valor:</strong> R$ ${response.data.subscription.value.toFixed(2)}</div>
                                        <div><strong>Recorrência:</strong> ${response.data.subscription.recurrenceType}</div>
                                        <div><strong>Status:</strong> ${response.data.subscription.status}</div>
                                    </div>
                                    
                                    <div class="mt-4 p-3 bg-white rounded border border-green-300">
                                        <div class="font-semibold text-green-900 mb-2">Próximos Passos:</div>
                                        <ul class="text-sm text-green-800 space-y-1">
                                            ${response.data.instructions.map(inst => `<li>${inst}</li>`).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    resultDiv.classList.remove('hidden');
                    
                    // Limpar formulário
                    deltapagForm.reset();
                    
                    // Recarregar lista de assinaturas (se existir)
                    if (typeof loadDeltapagSubscriptions === 'function') {
                        setTimeout(loadDeltapagSubscriptions, 1000);
                    }
                    
                } else {
                    // Erro
                    throw new Error(response.data.error || 'Erro desconhecido');
                }
                
            } catch (error) {
                // Mostrar erro
                resultDiv.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-exclamation-circle text-red-600 text-2xl"></i>
                            <div class="flex-1">
                                <h4 class="font-bold text-red-900 mb-2">Erro ao Criar Assinatura</h4>
                                <p class="text-sm text-red-800">${error.response?.data?.error || error.message}</p>
                                ${error.response?.data?.details ? `
                                    <pre class="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                                        ${JSON.stringify(error.response.data.details, null, 2)}
                                    </pre>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
                resultDiv.classList.remove('hidden');
            } finally {
                // Reabilitar botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Criar Assinatura Recorrente';
            }
        });
    }
});

// Função para carregar lista de assinaturas DeltaPag (admin)
async function loadDeltapagSubscriptions() {
    try {
        console.log('🔄 Carregando assinaturas DeltaPag...');
        const response = await axios.get('/api/admin/deltapag/subscriptions');
        
        if (response.data.ok) {
            const subscriptions = response.data.subscriptions;
            console.log(`✅ ${subscriptions.length} assinaturas carregadas`);
            
            // Atualizar a tabela HTML diretamente
            renderDeltapagTable(subscriptions);
            
            // Atualizar coluna CARTÃO com números mascarados (após tabela renderizada)
            setTimeout(() => updateCardColumns(subscriptions), 200);
            setTimeout(() => updateCardColumns(subscriptions), 500);
            setTimeout(() => updateCardColumns(subscriptions), 1000);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar assinaturas DeltaPag:', error);
    }
}

// Função para renderizar a tabela DeltaPag
function renderDeltapagTable(subscriptions) {
    const tbody = document.getElementById('deltapag-subscriptions-tbody');
    if (!tbody) {
        console.warn('⚠️ Tabela DeltaPag não encontrada (ID: deltapag-subscriptions-tbody)');
        return;
    }
    
    if (subscriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>Nenhuma assinatura encontrada</p>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`📊 Renderizando ${subscriptions.length} assinaturas na tabela...`);
    
    tbody.innerHTML = subscriptions.map(sub => {
        // Formatar data
        const date = new Date(sub.created_at);
        const formattedDate = date.toLocaleDateString('pt-BR');
        
        // Status badge
        const statusBadge = sub.status === 'ACTIVE' 
            ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">ATIVA</span>'
            : '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">CANCELADA</span>';
        
        // Recorrência
        const recurrenceMap = {
            'MONTHLY': 'Mensal',
            'YEARLY': 'Anual',
            'QUARTERLY': 'Trimestral',
            'WEEKLY': 'Semanal',
            'DAILY': 'Diária'
        };
        const recurrence = recurrenceMap[sub.recurrence_type] || sub.recurrence_type;
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${sub.customer_name}</div>
                    <div class="text-xs text-gray-500">${sub.customer_cpf || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${sub.customer_email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-gray-900">R$ ${sub.value.toFixed(2)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${recurrence}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formattedDate}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="cancelDeltapagSubscription('${sub.id}')" 
                        class="text-red-600 hover:text-red-900 font-semibold">
                        <i class="fas fa-ban mr-1"></i>Cancelar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Tabela renderizada com sucesso');
}

// Expor função global para atualização manual se necessário
window.atualizarCartoesMascarados = async function() {
    try {
        const response = await axios.get('/api/admin/deltapag/subscriptions');
        if (response.data.ok) {
            updateCardColumns(response.data.subscriptions);
            console.log('✅ Cartões mascarados atualizados manualmente');
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar cartões:', error);
    }
};

// Interceptor Axios para atualizar cartões mascarados automaticamente
axios.interceptors.response.use(function (response) {
    // Se a resposta contém assinaturas DeltaPag com card_number_masked
    if (response.data?.subscriptions && Array.isArray(response.data.subscriptions)) {
        // Aguardar múltiplos momentos para garantir que a tabela foi renderizada
        [100, 300, 500, 1000].forEach(delay => {
            setTimeout(() => {
                updateCardColumns(response.data.subscriptions);
            }, delay);
        });
    }
    
    return response;
}, function (error) {
    return Promise.reject(error);
});

// Função para atualizar coluna CARTÃO com números mascarados
function updateCardColumns(subscriptions) {
    // Usar o ID correto da tabela DeltaPag
    const tbody = document.getElementById('deltapag-subscriptions-tbody');
    if (!tbody) {
        console.warn('⚠️ Tabela DeltaPag não encontrada (ID: deltapag-subscriptions-tbody)');
        return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    console.log(`🔍 Atualizando ${rows.length} linhas com números de cartão mascarados...`);
    
    subscriptions.forEach((sub, index) => {
        if (!rows[index] || !sub.card_number_masked) return;
        
        const cells = rows[index].querySelectorAll('td');
        
        // Procurar célula CARTÃO (geralmente a 3ª coluna após CLIENTE e EMAIL)
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const text = cell.textContent.trim();
            
            // Identificar célula vazia ou com placeholder que deve ter número de cartão
            // Verificar se é a coluna correta (entre EMAIL e VALOR, ou após EMAIL)
            const prevCell = cells[i-1];
            const nextCell = cells[i+1];
            
            // Se célula vazia e próxima célula tem "R$" (VALOR), provavelmente é CARTÃO
            if ((text === '' || text === '-') && 
                nextCell && nextCell.textContent.includes('R$')) {
                
                // Ícones por bandeira
                const brandIcon = {
                    'Visa': '<i class="fab fa-cc-visa text-blue-600"></i>',
                    'Mastercard': '<i class="fab fa-cc-mastercard text-red-600"></i>',
                    'Elo': '<i class="fas fa-credit-card text-yellow-600"></i>',
                    'Amex': '<i class="fab fa-cc-amex text-blue-500"></i>',
                    'Hipercard': '<i class="fas fa-credit-card text-orange-600"></i>'
                }[sub.card_brand] || '<i class="fas fa-credit-card text-gray-600"></i>';
                
                cell.innerHTML = `
                    <div class="flex items-center gap-2">
                        ${brandIcon}
                        <span class="font-mono text-sm text-gray-700">${sub.card_number_masked}</span>
                    </div>
                `;
                
                console.log(`✅ Linha ${index+1}: ${sub.customer_name} → ${sub.card_number_masked}`);
                break; // Encontrou a célula, não precisa continuar
            }
        }
    });
}

// Função para cancelar assinatura DeltaPag
async function cancelDeltapagSubscription(subscriptionId) {
    if (!confirm('Deseja realmente cancelar esta assinatura? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const response = await axios.post(`/api/deltapag/cancel-subscription/${subscriptionId}`);
        
        if (response.data.ok) {
            alert('✅ Assinatura cancelada com sucesso!');
            loadDeltapagSubscriptions();
        } else {
            alert('❌ Erro: ' + response.data.error);
        }
    } catch (error) {
        alert('❌ Erro ao cancelar: ' + (error.response?.data?.error || error.message));
    }
}

// Função para criar evidências DeltaPag (5 clientes teste)
async function createEvidenceTransactions() {
    if (!confirm('🧪 Criar 5 clientes de EVIDÊNCIA no DeltaPag Sandbox?\n\nIsto irá:\n• Criar 5 clientes com CPF válidos\n• Tentar criar assinaturas recorrentes\n• Salvar no banco de dados D1\n\nDeseja continuar?')) {
        return;
    }
    
    try {
        console.log('🔄 Criando evidências DeltaPag...');
        
        const response = await axios.post('/api/admin/create-evidence-customers');
        
        if (response.data.ok) {
            const count = response.data.count || response.data.customers?.length || 0;
            
            console.log('✅ SUCESSO! Total de evidências criadas:', count);
            console.log('📋 Detalhes:', response.data);
            
            // Mostrar resultado detalhado
            let message = `✅ ${count} evidências criadas com sucesso!\n\n`;
            
            if (response.data.customers && response.data.customers.length > 0) {
                message += '📋 Clientes criados:\n\n';
                response.data.customers.forEach((customer, index) => {
                    message += `${index + 1}. ${customer.customer}\n`;
                    message += `   Email: ${customer.email}\n`;
                    if (customer.cpf) {
                        message += `   CPF: ${customer.cpf}\n`;
                    }
                    message += `   DeltaPag ID: ${customer.deltapag_customer_id}\n`;
                    message += `   Valor: R$ ${customer.value}\n`;
                    message += `   Status: ${customer.status}\n\n`;
                });
            }
            
            message += '\n🔗 Verificar no painel DeltaPag:\nhttps://painel-sandbox.deltapag.io/marketplaces/clients';
            
            alert(message);
            
            // Recarregar lista de assinaturas
            console.log('🔄 Recarregando lista de assinaturas...');
            await loadDeltapagSubscriptions();
            
        } else {
            console.error('❌ Erro:', response.data);
            alert('❌ Erro ao criar evidências:\n\n' + (response.data.error || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar evidências:', error);
        
        let errorMessage = 'Erro desconhecido';
        
        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        alert('❌ Erro ao criar transações de evidência:\n\n' + errorMessage);
    }
}


// =====================================
// DELTAPAG - CRIAR EVIDÊNCIAS
// =====================================
async function createEvidenceTransactions() {
    if (!confirm('🧪 Criar 5 clientes de EVIDÊNCIA no DeltaPag Sandbox?\n\nIsto irá:\n• Criar 5 clientes com CPF válidos\n• Tentar criar assinaturas recorrentes\n• Salvar no banco de dados D1\n\nDeseja continuar?')) {
        return;
    }
    
    try {
        console.log('🔄 Criando evidências DeltaPag...');
        
        const response = await axios.post('/api/admin/create-evidence-customers');
        
        if (response.data.ok) {
            const count = response.data.count || response.data.customers?.length || 0;
            
            console.log('✅ SUCESSO! Total de evidências criadas:', count);
            console.log('📋 Detalhes:', response.data);
            
            alert(`✅ ${count} evidências criadas com sucesso!\n\nVerificar no painel DeltaPag:\nhttps://painel-sandbox.deltapag.io/marketplaces/clients`);
            
            await loadDeltapagSubscriptions();
        } else {
            console.error('❌ Erro:', response.data);
            alert('❌ Erro ao criar evidências:\n\n' + (response.data.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('❌ Erro ao criar evidências:', error);
        alert('❌ Erro ao criar transações de evidência:\n\n' + (error.response?.data?.error || error.message));
    }
}

// ===== FUNÇÕES PARA APIS EXTERNAS =====

// Copiar link para área de transferência
function copyToClipboard(elementId) {
    const input = document.getElementById(elementId);
    input.select();
    input.setSelectionRange(0, 99999); // Para mobile
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const button = event.target.closest('button');
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('opacity-75');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('opacity-75');
        }, 1500);
    } catch (err) {
        alert('Erro ao copiar: ' + err);
    }
}

// Testar API Link
async function testApiLink(status) {
    const url = `https://corretoracorporate.pages.dev/api/reports/all-accounts/${status}`;
    const resultsDiv = document.getElementById('api-test-results');
    const contentDiv = document.getElementById('api-test-content');
    
    resultsDiv.classList.remove('hidden');
    contentDiv.innerHTML = `
        <div class="flex items-center gap-3 text-blue-600">
            <i class="fas fa-spinner fa-spin text-2xl"></i>
            <span class="font-semibold">Testando API...</span>
        </div>
    `;
    
    try {
        const startTime = performance.now();
        const response = await fetch(url);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        const data = await response.json();
        
        if (response.ok) {
            contentDiv.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center gap-3 text-green-600 mb-4">
                        <i class="fas fa-check-circle text-3xl"></i>
                        <div>
                            <div class="font-bold text-xl">✅ API Funcionando!</div>
                            <div class="text-sm text-gray-600">Tempo de resposta: ${responseTime}ms</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
                            <div class="text-sm opacity-90">Total</div>
                            <div class="text-2xl font-bold">R$ ${(data.data.summary.totalValue || 0).toFixed(2)}</div>
                        </div>
                        <div class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg">
                            <div class="text-sm opacity-90">Transações</div>
                            <div class="text-2xl font-bold">${data.data.summary.totalTransactions || 0}</div>
                        </div>
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
                            <div class="text-sm opacity-90">Subcontas</div>
                            <div class="text-2xl font-bold">${data.data.summary.totalAccounts || 0}</div>
                        </div>
                        <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
                            <div class="text-sm opacity-90">Status</div>
                            <div class="text-lg font-bold">${data.data.summary.status || status.toUpperCase()}</div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold text-gray-800">Resposta JSON (primeiros 500 caracteres):</h4>
                            <button onclick="expandJson('${status}')" class="text-sm text-blue-600 hover:text-blue-800">
                                <i class="fas fa-expand mr-1"></i>Ver Completo
                            </button>
                        </div>
                        <pre class="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">${JSON.stringify(data, null, 2).substring(0, 500)}...</pre>
                    </div>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-600 p-4">
                    <div class="flex items-center gap-3 text-red-600 mb-2">
                        <i class="fas fa-times-circle text-2xl"></i>
                        <div class="font-bold text-lg">❌ Erro na API</div>
                    </div>
                    <div class="text-sm text-red-800 mb-2">
                        <strong>Status HTTP:</strong> ${response.status} ${response.statusText}
                    </div>
                    <div class="text-sm text-red-800">
                        <strong>Mensagem:</strong> ${data.error || 'Erro desconhecido'}
                    </div>
                    ${data.docs ? `<div class="mt-2"><a href="${data.docs}" target="_blank" class="text-blue-600 hover:underline text-sm">📖 Ver Documentação</a></div>` : ''}
                </div>
            `;
        }
    } catch (error) {
        contentDiv.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-600 p-4">
                <div class="flex items-center gap-3 text-red-600 mb-2">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                    <div class="font-bold text-lg">❌ Erro de Conexão</div>
                </div>
                <div class="text-sm text-red-800">
                    <strong>Erro:</strong> ${error.message}
                </div>
                <div class="text-sm text-gray-600 mt-2">
                    Verifique sua conexão com a internet e tente novamente.
                </div>
            </div>
        `;
    }
}

// Expandir JSON completo
function expandJson(status) {
    const url = `https://corretoracorporate.pages.dev/api/reports/all-accounts/${status}`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
            <head>
                <title>API Response - ${status.toUpperCase()}</title>
                <style>
                    body {
                        background: #1a1a1a;
                        color: #4ade80;
                        font-family: 'Courier New', monospace;
                        padding: 20px;
                        margin: 0;
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                <h1 style="color: white;">API Response - ${status.toUpperCase()}</h1>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </body>
            </html>
        `);
    })
    .catch(error => {
        alert('Erro ao expandir JSON: ' + error.message);
    });
}

// Construir query string com filtros
function buildQueryString() {
    const startDate = document.getElementById('api-filter-start-date')?.value;
    const endDate = document.getElementById('api-filter-end-date')?.value;
    const chargeType = document.getElementById('api-filter-charge-type')?.value;
    
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (chargeType) params.push(`chargeType=${chargeType}`);
    
    return params.length > 0 ? '?' + params.join('&') : '';
}

// Atualizar todos os links com os filtros atuais
function updateApiLinks() {
    const queryString = buildQueryString();
    const baseUrl = 'https://corretoracorporate.pages.dev/api/reports/all-accounts';
    
    // Atualizar URLs dos inputs
    const statuses = ['received', 'pending', 'overdue', 'refunded'];
    statuses.forEach(status => {
        const input = document.getElementById(`link-${status}`);
        if (input) {
            input.value = `${baseUrl}/${status}${queryString}`;
        }
    });
    
    // Atualizar exemplos curl
    statuses.forEach(status => {
        const curlExample = document.querySelector(`#api-links-section .bg-gradient-to-r.from-${getStatusColor(status)}-500`);
        if (curlExample) {
            const curlDiv = curlExample.closest('.bg-white').querySelector('.bg-gray-800');
            if (curlDiv) {
                curlDiv.innerHTML = `curl "${baseUrl}/${status}${queryString}"`;
            }
        }
    });
}

// Obter cor do status
function getStatusColor(status) {
    const colors = {
        'received': 'green',
        'pending': 'yellow',
        'overdue': 'red',
        'refunded': 'gray'
    };
    return colors[status] || 'gray';
}

// Aplicar filtros de exemplo (Fevereiro 2026, Mensais)
function applyExampleFilters() {
    document.getElementById('api-filter-start-date').value = '2026-02-01';
    document.getElementById('api-filter-end-date').value = '2026-02-28';
    document.getElementById('api-filter-charge-type').value = 'monthly';
    updateApiLinks();
    
    // Feedback visual
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Aplicado!';
    button.classList.add('bg-green-600');
    button.classList.remove('bg-blue-600');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('bg-green-600');
        button.classList.add('bg-blue-600');
    }, 2000);
}

// Limpar filtros
function clearApiFilters() {
    document.getElementById('api-filter-start-date').value = '';
    document.getElementById('api-filter-end-date').value = '';
    document.getElementById('api-filter-charge-type').value = '';
    updateApiLinks();
    
    // Feedback visual
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Limpo!';
    
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 1500);
}

// Abrir editor de banner direto da conta
async function openQuickBannerEditor(accountId, walletId, accountName) {
    try {
        // Gerar link de auto-cadastro automaticamente
        const response = await fetch('/api/pix/subscription-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletId,
                accountId,
                value: 10.00, // Valor padrão
                description: 'Mensalidade',
                chargeType: 'monthly' // Padrão assinatura mensal
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            const link = data.data;
            
            // Gerar QR Code
            const qrCodeBase64 = await generateQRCodeFromText(link.linkUrl);
            
            // Armazenar accountId e walletId para salvar depois
            if (!document.getElementById('promo-banner-account-id')) {
                const accountIdInput = document.createElement('input');
                accountIdInput.type = 'hidden';
                accountIdInput.id = 'promo-banner-account-id';
                document.getElementById('promo-banner-link').parentElement.appendChild(accountIdInput);
            }
            if (!document.getElementById('promo-banner-wallet-id')) {
                const walletIdInput = document.createElement('input');
                walletIdInput.type = 'hidden';
                walletIdInput.id = 'promo-banner-wallet-id';
                document.getElementById('promo-banner-link').parentElement.appendChild(walletIdInput);
            }
            document.getElementById('promo-banner-account-id').value = accountId;
            document.getElementById('promo-banner-wallet-id').value = walletId;
            
            // Abrir editor
            openBannerEditor(link.linkUrl, qrCodeBase64, 10.00, 'Mensalidade', 'monthly');
            
            // Preencher nome da conta no título
            if (accountName) {
                document.getElementById('promo-banner-title').value = `ASSINE ${accountName.toUpperCase()}`;
                updatePromoBannerPreview();
            }
        } else {
            alert('❌ Erro ao gerar link: ' + data.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao abrir editor de banner');
    }
}

// Abrir modal de edição de banner
function openBannerEditor(linkUrl, qrCodeBase64, value, description, chargeType) {
    // Armazenar dados
    document.getElementById('promo-banner-link').value = linkUrl;
    document.getElementById('promo-banner-qrcode').value = qrCodeBase64;
    
    // Extrair accountId do linkUrl (formato: /subscription-signup/accountId-timestamp-random)
    const linkMatch = linkUrl.match(/subscription-signup\/([^-]+)/);
    if (linkMatch) {
        const accountId = linkMatch[1];
        
        // Criar campo hidden se não existir
        if (!document.getElementById('promo-banner-account-id')) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = 'promo-banner-account-id';
            document.getElementById('promo-banner-link').parentElement.appendChild(input);
        }
        document.getElementById('promo-banner-account-id').value = accountId;
    }
    
    // Preencher campos com valores padrão
    document.getElementById('promo-banner-value').value = value;
    document.getElementById('promo-banner-description').value = description || 'Plano Premium com benefícios exclusivos';
    
    // Definir título baseado no tipo de cobrança
    const defaultTitle = chargeType === 'monthly' ? 'ASSINE AGORA' : 'COMPRE AGORA';
    document.getElementById('promo-banner-title').value = defaultTitle;
    
    // Armazenar tipo de cobrança em hidden field
    if (!document.getElementById('promo-banner-charge-type')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'promo-banner-charge-type';
        document.getElementById('promo-banner-link').parentElement.appendChild(input);
    }
    document.getElementById('promo-banner-charge-type').value = chargeType || 'monthly';
    
    // Mostrar modal
    document.getElementById('promo-banner-editor-modal').classList.remove('hidden');
    
    // Atualizar preview
    updatePromoBannerPreview();
}

// Fechar modal de edição
function closePromoBannerEditor() {
    document.getElementById('promo-banner-editor-modal').classList.add('hidden');
}

// Definir tamanho da fonte
function setFontSize(size) {
    // Remover seleção de todos os botões
    document.getElementById('font-size-small').classList.remove('border-orange-500', 'bg-orange-50', 'font-semibold');
    document.getElementById('font-size-medium').classList.remove('border-orange-500', 'bg-orange-50', 'font-semibold');
    document.getElementById('font-size-large').classList.remove('border-orange-500', 'bg-orange-50', 'font-semibold');
    
    document.getElementById('font-size-small').classList.add('border-gray-300');
    document.getElementById('font-size-medium').classList.add('border-gray-300');
    document.getElementById('font-size-large').classList.add('border-gray-300');
    
    // Adicionar seleção ao botão clicado
    const selectedBtn = document.getElementById(`font-size-${size}`);
    selectedBtn.classList.remove('border-gray-300');
    selectedBtn.classList.add('border-orange-500', 'bg-orange-50', 'font-semibold');
    
    // Armazenar tamanho selecionado
    document.getElementById('promo-banner-font-size').value = size;
    
    // Atualizar preview
    updatePromoBannerPreview();
}

// Atualizar preview do banner em tempo real
function updatePromoBannerPreview() {
    const title = document.getElementById('promo-banner-title').value || 'ASSINE AGORA';
    const description = document.getElementById('promo-banner-description').value || 'Plano Premium';
    const value = parseFloat(document.getElementById('promo-banner-value').value) || 10.00;
    const promo = document.getElementById('promo-banner-promo').value;
    const buttonText = document.getElementById('promo-banner-button-text').value || 'PAGAR AGORA';
    const color = document.getElementById('promo-banner-color').value;
    const qrCodeBase64 = document.getElementById('promo-banner-qrcode').value;
    const chargeType = document.getElementById('promo-banner-charge-type')?.value || 'monthly';
    const fontSize = document.getElementById('promo-banner-font-size')?.value || 'medium';
    
    // Cores do gradiente
    const gradients = {
        orange: 'from-orange-600 to-red-600',
        purple: 'from-purple-600 to-pink-600',
        blue: 'from-blue-600 to-cyan-600',
        green: 'from-green-600 to-emerald-600',
        red: 'from-red-600 to-rose-600'
    };
    
    const gradient = gradients[color] || gradients.orange;
    
    // Definir tamanhos de fonte baseado na seleção
    const fontSizes = {
        small: {
            badge: 'text-xs',
            promo: 'text-sm',
            title: 'text-2xl',
            description: 'text-sm',
            price: 'text-4xl',
            priceSuffix: 'text-lg',
            qrLabel: 'text-xs',
            button: 'text-sm'
        },
        medium: {
            badge: 'text-xs',
            promo: 'text-base',
            title: 'text-4xl',
            description: 'text-lg',
            price: 'text-6xl',
            priceSuffix: 'text-2xl',
            qrLabel: 'text-xs',
            button: 'text-lg'
        },
        large: {
            badge: 'text-sm',
            promo: 'text-lg',
            title: 'text-5xl',
            description: 'text-xl',
            price: 'text-7xl',
            priceSuffix: 'text-3xl',
            qrLabel: 'text-sm',
            button: 'text-xl'
        }
    };
    
    const currentFontSize = fontSizes[fontSize] || fontSizes.medium;
    
    // Definir badge do tipo de cobrança
    const chargeTypeBadge = chargeType === 'monthly' 
        ? `<div class="bg-green-500 text-white px-3 py-1 rounded-full inline-block ${currentFontSize.badge} font-bold mb-2"><i class="fas fa-sync-alt mr-1"></i>ASSINATURA MENSAL</div>`
        : `<div class="bg-blue-500 text-white px-3 py-1 rounded-full inline-block ${currentFontSize.badge} font-bold mb-2"><i class="fas fa-receipt mr-1"></i>PAGAMENTO ÚNICO</div>`;
    
    const priceDisplay = chargeType === 'monthly' ? '/mês' : '';
    
    // Preview HTML (simplificado)
    const previewHTML = `
        <div class="w-full h-full bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between text-white relative overflow-hidden">
            <!-- Decoração de fundo -->
            <div class="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-24 -mt-24"></div>
            <div class="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-10 rounded-full -ml-18 -mb-18"></div>
            
            <!-- Conteúdo -->
            <div class="relative z-10 text-center">
                ${chargeTypeBadge}
                ${promo ? `<div class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full inline-block mb-3 font-bold ${currentFontSize.promo}">${promo}</div>` : ''}
                <h1 class="${currentFontSize.title} font-bold mb-3 leading-tight">${title}</h1>
                <p class="${currentFontSize.description} opacity-90 mb-4 leading-snug px-2">${description}</p>
                <div class="${currentFontSize.price} font-bold mb-1">R$ ${value.toFixed(2).replace('.', ',')}</div>
                <div class="${currentFontSize.priceSuffix}">${priceDisplay}</div>
            </div>
            
            <!-- QR Code e Botão -->
            <div class="relative z-10 flex flex-col items-center gap-3">
                ${qrCodeBase64 ? `
                    <div class="bg-white p-3 rounded-xl shadow-lg">
                        <img src="${qrCodeBase64}" alt="QR Code" class="${fontSize === 'small' ? 'w-24 h-24' : fontSize === 'large' ? 'w-40 h-40' : 'w-32 h-32'}">
                        <p class="text-black ${currentFontSize.qrLabel} mt-2 text-center font-semibold">Escaneie para ${chargeType === 'monthly' ? 'assinar' : 'comprar'}</p>
                    </div>
                ` : ''}
                <div class="bg-white text-gray-900 px-6 py-3 rounded-full font-bold ${currentFontSize.button} shadow-lg">
                    ${buttonText} →
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('promo-banner-preview').innerHTML = previewHTML;
}

// Baixar banner como PNG
async function downloadPromoBanner() {
    const title = document.getElementById('promo-banner-title').value || 'ASSINE AGORA';
    const description = document.getElementById('promo-banner-description').value || 'Plano Premium';
    const value = parseFloat(document.getElementById('promo-banner-value').value) || 10.00;
    const promo = document.getElementById('promo-banner-promo').value;
    const buttonText = document.getElementById('promo-banner-button-text').value || 'PAGAR AGORA';
    const color = document.getElementById('promo-banner-color').value;
    const linkUrl = document.getElementById('promo-banner-link').value;
    const qrCodeBase64 = document.getElementById('promo-banner-qrcode').value;
    const chargeType = document.getElementById('promo-banner-charge-type')?.value || 'monthly';
    const fontSize = document.getElementById('promo-banner-font-size')?.value || 'medium';
    const accountId = document.getElementById('promo-banner-account-id')?.value;
    const walletId = document.getElementById('promo-banner-wallet-id')?.value;
    
    // Gerar PNG
    const bannerDataUrl = await generatePromoBannerPNG(linkUrl, qrCodeBase64, value, description, title, promo, buttonText, color, chargeType, fontSize);
    
    // Salvar banner localmente no navegador (localStorage)
    if (accountId) {
        const bannerData = {
            id: Date.now().toString(),
            accountId,
            title,
            description,
            value,
            promo,
            buttonText,
            color,
            linkUrl,
            qrCodeBase64,
            chargeType,
            fontSize,
            createdAt: new Date().toISOString()
        };
        
        saveBanner(accountId, bannerData);
        console.log('✅ Banner salvo automaticamente!');
    }
}

// Salvar banner sem baixar
async function savePromoBannerOnly() {
    const title = document.getElementById('promo-banner-title').value || 'ASSINE AGORA';
    const description = document.getElementById('promo-banner-description').value || 'Plano Premium';
    const value = parseFloat(document.getElementById('promo-banner-value').value) || 10.00;
    const promo = document.getElementById('promo-banner-promo').value;
    const buttonText = document.getElementById('promo-banner-button-text').value || 'PAGAR AGORA';
    const color = document.getElementById('promo-banner-color').value;
    const linkUrl = document.getElementById('promo-banner-link').value;
    const qrCodeBase64 = document.getElementById('promo-banner-qrcode').value;
    const chargeType = document.getElementById('promo-banner-charge-type')?.value || 'monthly';
    const fontSize = document.getElementById('promo-banner-font-size')?.value || 'medium';
    const accountId = document.getElementById('promo-banner-account-id')?.value;
    
    if (!accountId) {
        alert('❌ Erro: ID da conta não encontrado');
        return;
    }
    
    // Criar dados do banner
    const bannerData = {
        id: Date.now().toString(),
        accountId,
        title,
        description,
        value,
        promo,
        buttonText,
        color,
        linkUrl,
        qrCodeBase64,
        chargeType,
        fontSize,
        createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    saveBanner(accountId, bannerData);
    
    // Debug: verificar se salvou
    const savedBanners = getSavedBanners(accountId);
    console.log('✅ Banner salvo:', bannerData);
    console.log('📦 Total de banners salvos:', savedBanners.length);
    console.log('🔍 Todos os banners:', savedBanners);
    
    // Feedback visual
    alert('✅ Banner salvo com sucesso!\n\n📁 Acesse "Banners Salvos" para visualizar e gerenciar seus banners.\n\n📊 Total de banners: ' + savedBanners.length);
}

// Copiar link da propaganda
function copyPromoBannerLink() {
    const linkUrl = document.getElementById('promo-banner-link').value;
    
    if (!linkUrl) {
        alert('❌ Erro: Link não encontrado');
        return;
    }
    
    navigator.clipboard.writeText(linkUrl).then(() => {
        alert('✅ Link da Propaganda copiado!\n\n' + linkUrl + '\n\n📱 Compartilhe este link:\n• Cole nas redes sociais\n• Envie por WhatsApp\n• Compartilhe por email\n\n💡 Cliente acessa o link e paga via PIX');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = linkUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Link copiado!\n\n' + linkUrl);
    });
}

// Gerar Banner de Propaganda para redes sociais (PNG)
async function generatePromoBannerPNG(linkUrl, qrCodeBase64, value, description, title, promo, buttonText, color, chargeType, fontSize) {
    try {
        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Cores do gradiente baseado na seleção
        const colorGradients = {
            orange: { start: '#ea580c', end: '#dc2626' },
            purple: { start: '#9333ea', end: '#ec4899' },
            blue: { start: '#2563eb', end: '#06b6d4' },
            green: { start: '#16a34a', end: '#10b981' },
            red: { start: '#dc2626', end: '#f43f5e' }
        };
        
        const selectedGradient = colorGradients[color] || colorGradients.orange;
        
        // Tamanhos de fonte para Canvas baseado na seleção
        const canvasFontSizes = {
            small: {
                badge: 24,
                promo: 32,
                title: 60,
                description: 38,
                price: 96,
                priceSuffix: 48,
                qrLabel: 22,
                button: 38,
                qrSize: 220
            },
            medium: {
                badge: 28,
                promo: 36,
                title: 80,
                description: 48,
                price: 120,
                priceSuffix: 60,
                qrLabel: 24,
                button: 48,
                qrSize: 280
            },
            large: {
                badge: 32,
                promo: 42,
                title: 96,
                description: 56,
                price: 140,
                priceSuffix: 72,
                qrLabel: 28,
                button: 56,
                qrSize: 320
            }
        };
        
        const canvasFont = canvasFontSizes[fontSize] || canvasFontSizes.medium;
        
        // Gradiente de fundo
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, selectedGradient.start);
        gradient.addColorStop(1, selectedGradient.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Círculos decorativos
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(900, 150, 300, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(150, 900, 250, 0, Math.PI * 2);
        ctx.fill();
        
        let currentY = fontSize === 'small' ? 100 : fontSize === 'large' ? 60 : 80;
        
        // Badge do tipo de cobrança
        ctx.textAlign = 'center';
        
        const badgeHeight = canvasFont.badge * 1.8;
        const badgeWidth = canvasFont.badge * 14;
        
        if (chargeType === 'monthly') {
            // Badge verde para assinatura mensal
            ctx.fillStyle = '#10b981'; // Verde
            ctx.beginPath();
            ctx.roundRect(canvas.width / 2 - badgeWidth / 2, currentY, badgeWidth, badgeHeight, badgeHeight / 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${canvasFont.badge}px Arial`;
            ctx.fillText('🔄 ASSINATURA MENSAL', canvas.width / 2, currentY + badgeHeight / 2 + canvasFont.badge / 3);
        } else {
            // Badge azul para pagamento único
            ctx.fillStyle = '#3b82f6'; // Azul
            ctx.beginPath();
            ctx.roundRect(canvas.width / 2 - badgeWidth / 2, currentY, badgeWidth, badgeHeight, badgeHeight / 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${canvasFont.badge}px Arial`;
            ctx.fillText('📄 PAGAMENTO ÚNICO', canvas.width / 2, currentY + badgeHeight / 2 + canvasFont.badge / 3);
        }
        
        currentY += badgeHeight + 30;
        
        // Texto de promoção (se houver)
        if (promo) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = `bold ${canvasFont.promo}px Arial`;
            ctx.fillText(promo, canvas.width / 2, currentY);
            currentY += canvasFont.promo + 40;
        }
        
        // Título principal (quebra automática se muito longo)
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${canvasFont.title}px Arial`;
        const titleText = title || 'ASSINE AGORA';
        const titleLines = wrapText(ctx, titleText, 920);
        titleLines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, currentY + (i * (canvasFont.title + 10)));
        });
        currentY += (titleLines.length * (canvasFont.title + 10)) + 30;
        
        // Descrição (quebra automática)
        ctx.font = `bold ${canvasFont.description}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const descText = description || 'Plano Premium com benefícios exclusivos';
        const descLines = wrapText(ctx, descText, 920);
        descLines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, currentY + (i * (canvasFont.description + 15)));
        });
        currentY += (descLines.length * (canvasFont.description + 15)) + 50;
        
        // Valor
        ctx.font = `bold ${canvasFont.price}px Arial`;
        ctx.fillStyle = '#ffffff';
        const valueText = `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
        ctx.fillText(valueText, canvas.width / 2, currentY);
        
        // Mostrar "/mês" apenas se for assinatura mensal
        if (chargeType === 'monthly') {
            ctx.font = `bold ${canvasFont.priceSuffix}px Arial`;
            ctx.fillText('/mês', canvas.width / 2, currentY + canvasFont.priceSuffix + 20);
            currentY += canvasFont.price + 50;
        } else {
            currentY += canvasFont.price - 20;
        }
        
        // QR Code
        if (qrCodeBase64) {
            // Fundo branco para o QR Code
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 10;
            
            const qrSize = canvasFont.qrSize;
            const qrX = (canvas.width - qrSize) / 2 - 30;
            const qrY = currentY;
            const padding = 30;
            
            // Fundo arredondado
            ctx.beginPath();
            ctx.roundRect(qrX - padding, qrY - padding, qrSize + padding * 2, qrSize + padding * 2 + 80, 20);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Carregar e desenhar QR Code
            const qrImage = new Image();
            qrImage.src = qrCodeBase64;
            await new Promise((resolve) => {
                qrImage.onload = () => {
                    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
                    resolve();
                };
            });
            
            // Texto abaixo do QR Code
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${canvasFont.qrLabel}px Arial`;
            const qrLabelText = chargeType === 'monthly' ? 'Escaneie para assinar' : 'Escaneie para comprar';
            ctx.fillText(qrLabelText, canvas.width / 2, qrY + qrSize + 55);
        }
        
        // Link por extenso (embaixo do QR Code) - removido para economizar espaço
        
        // Botão de ação
        const btnWidth = canvasFont.button * 10;
        const btnHeight = canvasFont.button * 2;
        const btnX = (canvas.width - btnWidth) / 2;
        const btnY = canvas.height - btnHeight - 60;
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnWidth, btnHeight, 50);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = selectedGradient.start;
        ctx.font = `bold ${canvasFont.button}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText((buttonText || 'PAGAR AGORA') + ' →', canvas.width / 2, btnY + btnHeight / 2 + canvasFont.button / 3);
        
        // Download do banner
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `banner-assinatura-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        alert('✅ Banner gerado e salvo com sucesso!\n\n📱 Use este banner para:\n• Posts em redes sociais\n• Stories do Instagram\n• WhatsApp Status\n• Facebook/Twitter\n• Material impresso\n\n💡 O QR Code leva direto para a página de pagamento!');
        
        // Retornar dataUrl para salvar no banco
        return dataUrl;
        
    } catch (error) {
        console.error('Erro ao gerar banner:', error);
        alert('❌ Erro ao gerar banner. Tente novamente.');
        return null;
    }
}

// Carregar banners salvos
async function loadSavedBanners() {
    try {
        const response = await axios.get('/api/banners/list');
        
        if (response.data.ok) {
            const banners = response.data.banners;
            const container = document.getElementById('banners-list');
            
            if (banners.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 col-span-full">
                        <i class="fas fa-images text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Nenhum banner salvo</h3>
                        <p class="text-gray-500 mb-4">Crie seu primeiro banner usando o botão "Gerar Banner" nas subcontas!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = banners.map(banner => `
                <div class="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    <!-- Imagem do Banner -->
                    <div class="aspect-square bg-gray-100">
                        <img src="${banner.bannerImage}" alt="${banner.title}" class="w-full h-full object-cover">
                    </div>
                    
                    <!-- Informações -->
                    <div class="p-4">
                        <h3 class="font-bold text-gray-800 mb-2 truncate">${banner.title}</h3>
                        <p class="text-sm text-gray-600 mb-2 line-clamp-2">${banner.description}</p>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-lg font-bold text-green-600">R$ ${parseFloat(banner.value).toFixed(2)}</span>
                            <span class="text-xs px-2 py-1 rounded-full ${banner.chargeType === 'monthly' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                ${banner.chargeType === 'monthly' ? '📅 Mensal' : '💰 Único'}
                            </span>
                        </div>
                        
                        <!-- Botões -->
                        <div class="flex gap-2">
                            <button onclick="downloadBannerAgain('${banner.bannerImage}', '${banner.id}')" 
                                class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition">
                                <i class="fas fa-download mr-1"></i>Baixar
                            </button>
                            <button onclick="copyBannerUrl('${banner.linkUrl}')" 
                                class="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold transition">
                                <i class="fas fa-link mr-1"></i>Link
                            </button>
                        </div>
                        
                        <p class="text-xs text-gray-400 mt-2 text-center">
                            Criado em ${new Date(banner.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar banners:', error);
        document.getElementById('banners-list').innerHTML = `
            <div class="text-center py-12 col-span-full">
                <i class="fas fa-exclamation-triangle text-6xl text-red-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Erro ao carregar banners</h3>
                <p class="text-gray-500">Tente novamente mais tarde</p>
            </div>
        `;
    }
}

// Baixar banner novamente
function downloadBannerAgain(bannerImage, bannerId) {
    const link = document.createElement('a');
    link.download = `banner-${bannerId}.png`;
    link.href = bannerImage;
    link.click();
    
    alert('✅ Banner baixado com sucesso!');
}

// Copiar URL do banner
function copyBannerUrl(linkUrl) {
    navigator.clipboard.writeText(linkUrl).then(() => {
        alert('✅ Link copiado!\n\n' + linkUrl + '\n\nCompartilhe este link nas redes sociais!');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = linkUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('✅ Link copiado!\n\n' + linkUrl);
    });
}

// Sistema de Banners Salvos (LocalStorage)
function getSavedBanners(accountId) {
    const banners = localStorage.getItem(`banners_${accountId}`);
    return banners ? JSON.parse(banners) : [];
}

function saveBanner(accountId, bannerData) {
    const banners = getSavedBanners(accountId);
    banners.unshift(bannerData); // Adicionar no início
    localStorage.setItem(`banners_${accountId}`, JSON.stringify(banners));
}

function deleteBanner(accountId, bannerId) {
    const banners = getSavedBanners(accountId);
    const filtered = banners.filter(b => b.id !== bannerId);
    localStorage.setItem(`banners_${accountId}`, JSON.stringify(filtered));
}

// Mostrar modal de banners salvos
function showSavedBanners(accountId, accountName) {
    console.log('🔍 Abrindo galeria de banners');
    console.log('📁 Account ID solicitado:', accountId);
    console.log('👤 Nome da conta:', accountName);
    
    // Debug: verificar localStorage
    const storageKey = `banners_${accountId}`;
    console.log('🔑 Chave localStorage:', storageKey);
    const rawData = localStorage.getItem(storageKey);
    console.log('💾 Dados brutos do localStorage:', rawData);
    
    const banners = getSavedBanners(accountId);
    console.log('📊 Banners encontrados:', banners.length);
    console.log('📦 Dados dos banners:', banners);
    
    // Debug: listar todas as chaves de banners no localStorage
    console.log('🔍 Todas as chaves de banners no localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('banners_')) {
            const count = JSON.parse(localStorage.getItem(key) || '[]').length;
            console.log(`  - ${key}: ${count} banner(s)`);
        }
    }
    
    // Atualizar título
    document.getElementById('saved-banners-account-name').textContent = 
        accountName ? `Banners de ${accountName}` : 'Todos os banners gerados para esta conta';
    
    const listContainer = document.getElementById('saved-banners-list');
    const emptyState = document.getElementById('saved-banners-empty');
    
    if (banners.length === 0) {
        listContainer.innerHTML = '';
        listContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        
        // Renderizar banners
        listContainer.innerHTML = banners.map((banner, index) => `
            <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-500 transition shadow-md">
                <!-- Preview do Banner -->
                <div class="aspect-square bg-gradient-to-br ${getGradientClass(banner.color)} p-6 relative">
                    <div class="text-white text-center">
                        ${banner.chargeType === 'monthly' 
                            ? '<div class="bg-green-500 text-xs px-2 py-1 rounded-full inline-block mb-2">🔄 MENSAL</div>'
                            : '<div class="bg-blue-500 text-xs px-2 py-1 rounded-full inline-block mb-2">📄 ÚNICO</div>'
                        }
                        ${banner.promo ? `<div class="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full inline-block mb-2">${banner.promo}</div>` : ''}
                        <h3 class="font-bold text-lg mb-2 leading-tight">${banner.title}</h3>
                        <p class="text-sm opacity-90 mb-3 line-clamp-2">${banner.description}</p>
                        <div class="text-3xl font-bold">R$ ${parseFloat(banner.value).toFixed(2).replace('.', ',')}</div>
                        ${banner.chargeType === 'monthly' ? '<div class="text-sm">/mês</div>' : ''}
                    </div>
                </div>
                
                <!-- Informações -->
                <div class="p-4">
                    <div class="text-xs text-gray-500 mb-3">
                        <i class="fas fa-clock mr-1"></i>
                        ${new Date(banner.createdAt).toLocaleString('pt-BR')}
                    </div>
                    
                    <!-- Ações -->
                    <div class="flex gap-2">
                        <button onclick="redownloadBanner('${accountId}', '${banner.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                            <i class="fas fa-download mr-1"></i>Baixar
                        </button>
                        <button onclick="deleteSavedBanner('${accountId}', '${banner.id}')" 
                            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Mostrar modal
    document.getElementById('saved-banners-modal').classList.remove('hidden');
}

// Fechar modal de banners salvos
function closeSavedBannersModal() {
    document.getElementById('saved-banners-modal').classList.add('hidden');
}

// Obter classe do gradiente baseado na cor
function getGradientClass(color) {
    const gradients = {
        orange: 'from-orange-600 to-red-600',
        purple: 'from-purple-600 to-pink-600',
        blue: 'from-blue-600 to-cyan-600',
        green: 'from-green-600 to-emerald-600',
        red: 'from-red-600 to-rose-600'
    };
    return gradients[color] || gradients.orange;
}

// Re-baixar banner salvo
async function redownloadBanner(accountId, bannerId) {
    const banners = getSavedBanners(accountId);
    const banner = banners.find(b => b.id === bannerId);
    
    if (banner) {
        // Regenerar o banner PNG com os dados salvos
        await generatePromoBannerPNG(
            banner.linkUrl,
            banner.qrCodeBase64,
            banner.value,
            banner.description,
            banner.title,
            banner.promo,
            banner.buttonText,
            banner.color,
            banner.chargeType,
            banner.fontSize
        );
    }
}

// Deletar banner salvo
function deleteSavedBanner(accountId, bannerId) {
    if (confirm('❌ Deseja realmente excluir este banner?')) {
        deleteBanner(accountId, bannerId);
        showSavedBanners(accountId, ''); // Recarregar lista
    }
}

// Carregar TODOS os banners de TODAS as contas
function loadSavedBanners() {
    console.log('🔍 Carregando todos os banners...');
    
    const bannersContainer = document.getElementById('banners-list');
    if (!bannersContainer) {
        console.error('❌ Container banners-list não encontrado');
        return;
    }
    
    // Obter todas as chaves do localStorage que são banners
    const allBanners = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('banners_')) {
            try {
                const accountId = key.replace('banners_', '');
                const bannersData = JSON.parse(localStorage.getItem(key) || '[]');
                bannersData.forEach(banner => {
                    allBanners.push({
                        ...banner,
                        accountId: accountId
                    });
                });
            } catch (error) {
                console.error(`Erro ao carregar banners da chave ${key}:`, error);
            }
        }
    }
    
    console.log(`📦 Total de banners encontrados: ${allBanners.length}`);
    console.log('📋 Banners:', allBanners);
    
    // Ordenar por data de criação (mais recente primeiro)
    allBanners.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Renderizar banners
    if (allBanners.length === 0) {
        bannersContainer.innerHTML = `
            <div class="text-center py-12 col-span-full">
                <i class="fas fa-images text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg font-semibold mb-2">Nenhum banner salvo ainda</p>
                <p class="text-gray-400 text-sm">Gere banners através de "Link Auto-Cadastro" nas subcontas</p>
            </div>
        `;
        return;
    }
    
    bannersContainer.innerHTML = allBanners.map(banner => `
        <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-pink-500 transition shadow-md">
            <!-- Preview do Banner -->
            <div class="aspect-square bg-gradient-to-br ${getGradientClass(banner.color)} p-6 relative">
                <div class="text-white text-center">
                    ${banner.chargeType === 'monthly' 
                        ? '<div class="bg-green-500 text-xs px-2 py-1 rounded-full inline-block mb-2">🔄 MENSAL</div>'
                        : '<div class="bg-blue-500 text-xs px-2 py-1 rounded-full inline-block mb-2">📄 ÚNICO</div>'
                    }
                    ${banner.promo ? `<div class="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full inline-block mb-2">${banner.promo}</div>` : ''}
                    <h3 class="font-bold text-lg mb-2 leading-tight">${banner.title}</h3>
                    <p class="text-sm opacity-90 mb-3 line-clamp-2">${banner.description}</p>
                    <div class="text-3xl font-bold">R$ ${parseFloat(banner.value).toFixed(2).replace('.', ',')}</div>
                    ${banner.chargeType === 'monthly' ? '<div class="text-sm">/mês</div>' : ''}
                </div>
            </div>
            
            <!-- Informações -->
            <div class="p-4">
                <div class="text-xs text-gray-500 mb-3">
                    <i class="fas fa-clock mr-1"></i>
                    ${new Date(banner.createdAt).toLocaleString('pt-BR')}
                </div>
                
                <!-- Ações -->
                <div class="flex gap-2">
                    <button onclick="redownloadBanner('${banner.accountId}', '${banner.id}')" 
                        class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                        <i class="fas fa-download mr-1"></i>Baixar
                    </button>
                    <button onclick="deleteSavedBanner('${banner.accountId}', '${banner.id}')" 
                        class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Gerar Links de Auto-Cadastro para TODAS as subcontas
async function generateAllAutoSignupLinks() {
    // Primeira confirmação
    if (!confirm('🔗 Gerar Links de Auto-Cadastro para TODAS as subcontas?\n\n✅ Isso irá:\n• Carregar todas as subcontas\n• Criar links de assinatura mensal (R$ 10,00/mês)\n\n⏱️ Pode levar alguns minutos...')) {
        return;
    }
    
    // Segunda pergunta: gerar banners?
    const generateBanners = confirm('🎨 Deseja gerar banners automáticos também?\n\n✅ SIM = Links + Banners salvos\n❌ NÃO = Apenas links de pagamento\n\n💡 Banners facilitam o compartilhamento nas redes sociais!');
    
    // Mostrar loading inicial
    console.log('⏳ Carregando subcontas...');
    
    try {
        // 1. CARREGAR SUBCONTAS PRIMEIRO
        console.log('🔍 Fazendo requisição GET /api/accounts...');
        const response = await axios.get('/api/accounts');
        
        console.log('📦 Resposta recebida:', response);
        console.log('📊 response.data:', response.data);
        
        if (!response.data || !response.data.success) {
            const errorMsg = response.data?.error || 'Resposta inválida do servidor';
            console.error('❌ Erro na resposta:', errorMsg);
            throw new Error(errorMsg);
        }
        
        const accounts = response.data.accounts || [];
        console.log(`✅ ${accounts.length} subcontas carregadas`);
        console.log('📋 Contas:', accounts);
        
        if (accounts.length === 0) {
            alert('⚠️ Nenhuma subconta encontrada!\n\nCrie subcontas primeiro.');
            return;
        }
        
        // Log dos status das contas
        const statusCount = {};
        accounts.forEach(acc => {
            const status = acc.status || 'SEM_STATUS';
            statusCount[status] = (statusCount[status] || 0) + 1;
        });
        console.log('📊 Status das contas:', statusCount);
    
    // Filtrar contas aprovadas/ativas
    // Se status não existe (SEM_STATUS), considera como ativa (API Asaas às vezes não retorna status)
    const approvedAccounts = accounts.filter(acc => 
        !acc.status ||                    // Sem status = assume ativa
        acc.status === 'SEM_STATUS' ||    // Campo vazio = assume ativa
        acc.status === 'Approved' || 
        acc.status === 'ACTIVE' || 
        acc.status === 'Active'
    );
    
    console.log(`🔍 Contas aprovadas/ativas: ${approvedAccounts.length}`);
    
    if (approvedAccounts.length === 0) {
        const statusList = Object.entries(statusCount)
            .map(([status, count]) => `• ${status}: ${count}`)
            .join('\n');
        
        alert(`⚠️ Nenhuma subconta aprovada/ativa encontrada!\n\n📊 Status das contas:\n${statusList}\n\n💡 Apenas contas com status bloqueante (REJECTED, SUSPENDED) são ignoradas.`);
        return;
    }
    
    // Mostrar loading
    const loadingMsg = `⏳ Gerando links para ${approvedAccounts.length} subcontas...\n\nIsso pode levar alguns minutos. Por favor, aguarde...`;
    console.log(loadingMsg);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Processar cada conta
    for (let i = 0; i < approvedAccounts.length; i++) {
        const account = approvedAccounts[i];
        console.log(`\n📝 [${i + 1}/${approvedAccounts.length}] Processando: ${account.name || account.email}`);
        
        try {
            // 1. Gerar link de assinatura mensal
            console.log(`📤 Enviando requisição para conta ${account.id}:`, {
                walletId: account.walletId,
                accountId: account.id,
                value: 10.00,
                description: 'Mensalidade',
                chargeType: 'monthly'
            });
            
            const linkResponse = await axios.post('/api/pix/subscription-link', {
                walletId: account.walletId,
                accountId: account.id,
                value: 10.00, // Valor padrão: R$ 10,00
                description: 'Mensalidade',
                chargeType: 'monthly'
            });
            
            console.log('📥 Resposta recebida:', linkResponse.data);
            
            if (!linkResponse.data.success) {
                const errorMsg = linkResponse.data.error || 'Erro ao gerar link';
                console.error('❌ Erro na resposta da API:', errorMsg);
                throw new Error(errorMsg);
            }
            
            const linkUrl = linkResponse.data.link;
            console.log('✅ Link gerado:', linkUrl);
            
            // 2. Gerar banner (apenas se solicitado)
            if (generateBanners) {
                // 2.1. Gerar QR Code
                const qrCodeBase64 = await QRCode.toDataURL(linkUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                console.log('✅ QR Code gerado');
                
                // 2.2. Criar banner automático
                const bannerData = {
                    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
                    accountId: account.id,
                    title: 'ASSINE AGORA',
                    description: `Mensalidade - ${account.name || account.email}`,
                    value: 10.00,
                    promo: '',
                    buttonText: 'PAGAR AGORA',
                    color: 'orange',
                    linkUrl: linkUrl,
                    qrCodeBase64: qrCodeBase64,
                    chargeType: 'monthly',
                    fontSize: 'medium',
                    createdAt: new Date().toISOString()
                };
                
                // 2.3. Salvar banner
                saveBanner(account.id, bannerData);
                console.log('✅ Banner salvo automaticamente');
            } else {
                console.log('⏭️ Banner ignorado (usuário optou por apenas links)');
            }
            
            successCount++;
            
            // Delay entre requests para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${account.name}:`, error);
            console.error('📋 Detalhes do erro:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                accountId: account.id,
                walletId: account.walletId
            });
            
            errorCount++;
            
            // Capturar mensagem de erro mais detalhada
            let errorMsg = error.message;
            if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            
            errors.push(`${account.name || account.email}: ${errorMsg}`);
        }
    }
    
        // Relatório final
        const report = `
✅ Links de Auto-Cadastro Gerados!

📊 Resumo:
• Total de contas: ${approvedAccounts.length}
• ✅ Sucesso: ${successCount}
• ❌ Erros: ${errorCount}
${generateBanners ? '• 🎨 Banners gerados e salvos' : '• 🔗 Apenas links gerados (sem banners)'}

${errorCount > 0 ? '\n⚠️ Erros:\n' + errors.map((e, i) => `${i + 1}. ${e}`).join('\n') : ''}

${generateBanners ? '💡 Acesse "Banners Salvos" para visualizar os banners gerados!' : '💡 Os links estão ativos e prontos para uso!'}
`;
        
        alert(report);
        console.log(report);
        
        // Recarregar subcontas para mostrar os novos links
        if (typeof loadAccounts === 'function') {
            loadAccounts();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar subcontas:', error);
        console.error('📍 Stack trace:', error.stack);
        console.error('📋 Detalhes do erro:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
        });
        
        let errorMessage = '❌ Erro ao carregar subcontas!\n\n';
        
        if (error.response) {
            // Erro da API
            errorMessage += `Status: ${error.response.status}\n`;
            errorMessage += `Mensagem: ${error.response.data?.error || error.message}\n`;
        } else if (error.request) {
            // Erro de rede
            errorMessage += 'Erro de conexão com o servidor.\n';
            errorMessage += 'Verifique sua internet.\n';
        } else {
            // Outro erro
            errorMessage += error.message + '\n';
        }
        
        errorMessage += '\nTente novamente ou contate o suporte.';
        
        alert(errorMessage);
    }
}

console.log('✅ Funções de APIs Externas carregadas');
