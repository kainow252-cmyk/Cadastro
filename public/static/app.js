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
                listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma subconta encontrada. Crie uma nova subconta acima.</p>';
                return;
            }
            
            listDiv.innerHTML = accounts.map(account => {
                const walletHtml = account.walletId ? `
                    <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                        ✓ Wallet: ${account.walletId.substring(0, 20)}...
                    </span>
                ` : '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⏳ Aguardando aprovação</span>';
                
                const pixFormHtml = account.walletId ? `
                    <div class="mt-4 border-t border-gray-200 pt-4">
                        <h4 class="text-sm font-semibold text-gray-700 mb-3">
                            <i class="fas fa-qrcode mr-2 text-green-600"></i>
                            Gerar Cobrança PIX (Split 20/80)
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input type="number" 
                                id="pix-value-${account.id}" 
                                placeholder="Valor (R$)" 
                                step="0.01" 
                                min="1"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <input type="text" 
                                id="pix-desc-${account.id}" 
                                placeholder="Descrição" 
                                value="Pagamento via PIX"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <input type="date" 
                                id="pix-due-${account.id}" 
                                value="${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
                                class="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500">
                            <button onclick="generatePixForAccount('${account.id}', '${account.walletId}')" 
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
                                <i class="fas fa-qrcode mr-2"></i>Gerar PIX
                            </button>
                        </div>
                        <div id="pix-result-${account.id}" class="hidden mt-3"></div>
                    </div>
                ` : '';
                
                return `
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800">${account.name}</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-envelope mr-2"></i>${account.email}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <i class="fas fa-id-card mr-2"></i>${account.cpfCnpj}
                                </p>
                                <div class="flex gap-2 mt-2">
                                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                        ID: ${account.id.substring(0, 8)}...
                                    </span>
                                    ${walletHtml}
                                </div>
                            </div>
                        </div>
                        ${pixFormHtml}
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
// SEÇÃO: Geração de PIX Simplificada
// ============================================

async function generatePixForAccount(accountId, walletId) {
    const valueInput = document.getElementById(`pix-value-${accountId}`);
    const descInput = document.getElementById(`pix-desc-${accountId}`);
    const dueInput = document.getElementById(`pix-due-${accountId}`);
    const resultDiv = document.getElementById(`pix-result-${accountId}`);
    
    const value = parseFloat(valueInput.value);
    const description = descInput.value || 'Pagamento via PIX';
    const dueDate = dueInput.value;
    
    if (!value || value <= 0) {
        alert('⚠️ Por favor, informe um valor válido maior que zero');
        valueInput.focus();
        return;
    }
    
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded p-3 text-center">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            <span class="text-blue-800">Gerando cobrança PIX...</span>
        </div>
    `;
    
    try {
        // Criar cliente genérico
        const customerData = {
            name: `Cliente - ${new Date().toISOString()}`,
            email: `cliente${Date.now()}@example.com`,
            cpfCnpj: `${Math.floor(10000000000 + Math.random() * 90000000000)}`
        };
        
        const customerResponse = await axios.post('/api/customers', customerData);
        let customerId = null;
        
        if (customerResponse.data.ok && customerResponse.data.data && customerResponse.data.data.id) {
            customerId = customerResponse.data.data.id;
        } else {
            // Se falhar, tentar usar CPF direto
            customerId = customerData.cpfCnpj;
        }
        
        // Criar cobrança PIX com split
        const paymentData = {
            customer: {
                cpfCnpj: customerData.cpfCnpj,
                name: customerData.name,
                email: customerData.email
            },
            value: value,
            description: description,
            dueDate: dueDate,
            subAccountId: accountId,
            subAccountWalletId: walletId
        };
        
        const paymentResponse = await axios.post('/api/payments', paymentData);
        
        if (paymentResponse.data.ok && paymentResponse.data.data) {
            const payment = paymentResponse.data.data;
            
            // Buscar QR Code
            const qrResponse = await axios.get(`/api/payments/${payment.id}/pix-qrcode`);
            
            if (qrResponse.data.ok && qrResponse.data.data) {
                const qrData = qrResponse.data.data;
                const splitValue = (value * 0.20).toFixed(2);
                const mainValue = (value * 0.80).toFixed(2);
                
                resultDiv.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded p-4">
                        <h5 class="font-semibold text-green-800 mb-3 text-center">
                            ✅ PIX Gerado com Sucesso!
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="text-center">
                                <img src="${qrData.qrCodeBase64}" alt="QR Code PIX" class="mx-auto mb-2" style="max-width: 200px;">
                                <p class="text-xs text-gray-600">Escaneie com o app do banco</p>
                            </div>
                            <div class="space-y-2 text-sm">
                                <p><strong>Valor:</strong> R$ ${value.toFixed(2)}</p>
                                <p><strong>Split 20/80:</strong></p>
                                <ul class="text-xs ml-4 space-y-1">
                                    <li>→ Subconta (20%): R$ ${splitValue}</li>
                                    <li>→ Principal (80%): R$ ${mainValue}</li>
                                </ul>
                                <p><strong>Vencimento:</strong> ${new Date(dueDate).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Status:</strong> <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">${payment.status}</span></p>
                                <div class="mt-3">
                                    <label class="block text-xs font-medium text-gray-700 mb-1">PIX Copia e Cola:</label>
                                    <div class="flex gap-1">
                                        <input type="text" readonly value="${qrData.payload}" 
                                            class="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                                        <button onclick="navigator.clipboard.writeText('${qrData.payload}'); this.innerHTML='✓'; setTimeout(() => this.innerHTML='📋', 2000)"
                                            class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Limpar campos
                valueInput.value = '';
                descInput.value = 'Pagamento via PIX';
            } else {
                throw new Error('Erro ao buscar QR Code');
            }
        } else {
            throw new Error(paymentResponse.data.error || 'Erro ao criar cobrança');
        }
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        resultDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded p-3">
                <p class="text-red-800 text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    ${error.response?.data?.error || error.message || 'Erro ao gerar PIX'}
                </p>
            </div>
        `;
    }
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
