import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  ASAAS_API_KEY: string;
  ASAAS_API_URL: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Helper function to make Asaas API calls
async function asaasRequest(
  c: any,
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const apiKey = c.env.ASAAS_API_KEY
  const apiUrl = c.env.ASAAS_API_URL
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey
    }
  }
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(`${apiUrl}${endpoint}`, options)
  const data = await response.json()
  
  return {
    ok: response.ok,
    status: response.status,
    data
  }
}

// API Routes

// Listar subcontas
app.get('/api/accounts', async (c) => {
  try {
    const result = await asaasRequest(c, '/accounts')
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Criar subconta
app.post('/api/accounts', async (c) => {
  try {
    const body = await c.req.json()
    const result = await asaasRequest(c, '/accounts', 'POST', body)
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Obter detalhes de uma subconta
app.get('/api/accounts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await asaasRequest(c, `/accounts/${id}`)
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Gerar link de cadastro (retorna dados formatados)
app.post('/api/signup-link', async (c) => {
  try {
    const { accountId, expirationDays = 7 } = await c.req.json()
    
    // Criar data de expiração
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + expirationDays)
    
    // Gerar ID único para o link
    const linkId = `${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Em produção, isso seria salvo em D1 ou KV
    const link = {
      id: linkId,
      accountId,
      url: `${c.req.url.split('/api')[0]}/cadastro/${linkId}`,
      expiresAt: expirationDate.toISOString(),
      createdAt: new Date().toISOString(),
      active: true
    }
    
    return c.json({ ok: true, data: link })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Homepage
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gerenciador Asaas - Contas e Subcontas</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navbar -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-building text-blue-600 text-2xl mr-3"></i>
                        <span class="text-xl font-bold text-gray-800">Gerenciador Asaas</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="showSection('dashboard')" class="nav-btn text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                            <i class="fas fa-home mr-2"></i>Dashboard
                        </button>
                        <button onclick="showSection('accounts')" class="nav-btn text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                            <i class="fas fa-users mr-2"></i>Subcontas
                        </button>
                        <button onclick="showSection('create')" class="nav-btn text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                            <i class="fas fa-plus-circle mr-2"></i>Nova Conta
                        </button>
                        <button onclick="showSection('links')" class="nav-btn text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                            <i class="fas fa-link mr-2"></i>Links
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Dashboard Section -->
            <div id="dashboard-section" class="section">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Total de Subcontas</p>
                                <p class="text-3xl font-bold text-gray-800" id="total-accounts">0</p>
                            </div>
                            <div class="bg-blue-100 rounded-full p-3">
                                <i class="fas fa-users text-blue-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Links Ativos</p>
                                <p class="text-3xl font-bold text-gray-800" id="active-links">0</p>
                            </div>
                            <div class="bg-green-100 rounded-full p-3">
                                <i class="fas fa-link text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-500 text-sm">Cadastros Hoje</p>
                                <p class="text-3xl font-bold text-gray-800" id="today-signups">0</p>
                            </div>
                            <div class="bg-purple-100 rounded-full p-3">
                                <i class="fas fa-user-plus text-purple-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-chart-line mr-2 text-blue-600"></i>
                        Visão Geral
                    </h2>
                    <p class="text-gray-600">Bem-vindo ao Gerenciador de Contas e Subcontas Asaas!</p>
                    <p class="text-gray-600 mt-2">Use o menu acima para navegar entre as seções.</p>
                </div>
            </div>

            <!-- Accounts Section -->
            <div id="accounts-section" class="section hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-bold text-gray-800">
                                <i class="fas fa-users mr-2 text-blue-600"></i>
                                Subcontas Criadas
                            </h2>
                            <button onclick="loadAccounts()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-sync-alt mr-2"></i>Atualizar
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="accounts-list" class="space-y-4">
                            <p class="text-gray-500 text-center py-8">Carregando...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Account Section -->
            <div id="create-section" class="section hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-plus-circle mr-2 text-green-600"></i>
                            Criar Nova Subconta
                        </h2>
                    </div>
                    <div class="p-6">
                        <form id="create-account-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Nome *
                                    </label>
                                    <input type="text" name="name" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input type="email" name="email" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        CPF/CNPJ *
                                    </label>
                                    <input type="text" name="cpfCnpj" required
                                        placeholder="00000000000 ou 00000000000000"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Data de Nascimento
                                    </label>
                                    <input type="date" name="birthDate"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Empresa
                                    </label>
                                    <select name="companyType"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">Selecione...</option>
                                        <option value="MEI">MEI</option>
                                        <option value="LIMITED">Limitada</option>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="ASSOCIATION">Associação</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone
                                    </label>
                                    <input type="text" name="phone"
                                        placeholder="11 32300606"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Celular
                                    </label>
                                    <input type="text" name="mobilePhone"
                                        placeholder="11 988451155"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        CEP
                                    </label>
                                    <input type="text" name="postalCode"
                                        placeholder="89223005"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Endereço
                                    </label>
                                    <input type="text" name="address"
                                        placeholder="Av. Rolf Wiest"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Número
                                    </label>
                                    <input type="text" name="addressNumber"
                                        placeholder="277"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Complemento
                                    </label>
                                    <input type="text" name="complement"
                                        placeholder="Sala 502"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Bairro
                                    </label>
                                    <input type="text" name="province"
                                        placeholder="Bom Retiro"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                            </div>

                            <div class="flex justify-end space-x-4">
                                <button type="button" onclick="document.getElementById('create-account-form').reset()"
                                    class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Limpar
                                </button>
                                <button type="submit"
                                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <i class="fas fa-check mr-2"></i>Criar Subconta
                                </button>
                            </div>
                        </form>
                        
                        <div id="create-result" class="mt-6 hidden"></div>
                    </div>
                </div>
            </div>

            <!-- Links Section -->
            <div id="links-section" class="section hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-link mr-2 text-purple-600"></i>
                            Gerenciar Links de Cadastro
                        </h2>
                    </div>
                    <div class="p-6">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Criar Novo Link</h3>
                            <form id="create-link-form" class="flex gap-4">
                                <div class="flex-1">
                                    <input type="text" id="link-account-id" placeholder="ID da Subconta"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>
                                <div class="w-48">
                                    <select id="link-expiration" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="7">7 dias</option>
                                        <option value="15">15 dias</option>
                                        <option value="30">30 dias</option>
                                        <option value="60">60 dias</option>
                                    </select>
                                </div>
                                <button type="submit"
                                    class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    <i class="fas fa-plus mr-2"></i>Gerar Link
                                </button>
                            </form>
                        </div>
                        
                        <div id="links-list" class="space-y-4">
                            <p class="text-gray-500 text-center py-8">Nenhum link criado ainda</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
