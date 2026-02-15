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
        
        if (response.data.ok && response.data.data) {
            const accounts = response.data.data.data || [];
            
            if (accounts.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma subconta encontrada</p>';
                return;
            }
            
            listDiv.innerHTML = accounts.map(account => {
                const walletHtml = account.walletId ? `
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Wallet: ${account.walletId}
                    </span>
                ` : '';
                
                return `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800">${account.name}</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-envelope mr-2"></i>${account.email}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <i class="fas fa-id-card mr-2"></i>${account.cpfCnpj}
                                </p>
                                <div class="flex gap-4 mt-2">
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        ID: ${account.id}
                                    </span>
                                    ${walletHtml}
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="createLinkForAccount('${account.id}')" 
                                    class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                                    <i class="fas fa-link mr-1"></i>Link
                                </button>
                                <button onclick="viewAccount('${account.id}')" 
                                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                    <i class="fas fa-eye mr-1"></i>Ver
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            listDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800">Erro ao carregar subcontas: ${response.data.data?.message || 'Erro desconhecido'}</p>
                </div>
            `;
        }
    } catch (error) {
        listDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <p class="text-red-800">Erro: ${error.message}</p>
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
        
        // Gerar API Key diretamente
        const response = await axios.post(
            `/api/accounts/${subaccountData.id}/api-key`,
            {
                name: `API Key - ${subaccountData.name} - ${new Date().toLocaleDateString('pt-BR')}`
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
