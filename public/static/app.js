// Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + '-section').classList.remove('hidden');
    
    if (section === 'accounts') {
        loadAccounts();
    } else if (section === 'dashboard') {
        loadDashboard();
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
document.addEventListener('DOMContentLoaded', () => {
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
