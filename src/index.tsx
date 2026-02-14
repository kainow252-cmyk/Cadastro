import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'

type Bindings = {
  ASAAS_API_KEY: string;
  ASAAS_API_URL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  MAILERSEND_API_KEY: string;
  MAILERSEND_FROM_EMAIL: string;
  MAILERSEND_FROM_NAME: string;
  DB: D1Database;
}

type Variables = {
  user: { username: string };
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Helper function to create JWT token
async function createToken(username: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(secret)
  
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey)
  
  return token
}

// Helper function to verify JWT token
async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    const encoder = new TextEncoder()
    const secretKey = encoder.encode(secret)
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

// Auth middleware for protected routes
async function authMiddleware(c: any, next: any) {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ error: 'Não autorizado' }, 401)
  }
  
  const payload = await verifyToken(token, c.env.JWT_SECRET)
  
  if (!payload) {
    return c.json({ error: 'Token inválido' }, 401)
  }
  
  c.set('user', payload)
  await next()
}

// Apply auth middleware to all /api/* routes except public routes
app.use('/api/*', async (c, next) => {
  const publicRoutes = ['/api/login', '/api/check-auth', '/api/public/signup']
  if (publicRoutes.includes(c.req.path)) {
    return next()
  }
  return authMiddleware(c, next)
})

// Helper function to send welcome email via Mailersend
async function sendWelcomeEmail(
  c: any,
  name: string,
  email: string,
  accountId: string,
  walletId?: string
) {
  const apiKey = c.env.MAILERSEND_API_KEY
  const fromEmail = c.env.MAILERSEND_FROM_EMAIL
  const fromName = c.env.MAILERSEND_FROM_NAME
  
  const emailData = {
    from: {
      email: fromEmail,
      name: fromName
    },
    to: [
      {
        email: email,
        name: name
      }
    ],
    subject: "Bem-vindo ao Asaas - Conta Criada com Sucesso! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #667eea; }
          .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao Asaas!</h1>
            <p>Sua conta foi criada com sucesso</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${name}! 👋</h2>
            
            <p>É um prazer tê-lo(a) conosco! Sua conta no Asaas foi criada e está pronta para uso.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Informações da sua conta:</h3>
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>ID da Conta:</strong> <code class="highlight">${accountId}</code></p>
              ${walletId ? `<p><strong>Wallet ID:</strong> <code class="highlight">${walletId}</code></p>` : ''}
            </div>
            
            <h3>🚀 Próximos Passos:</h3>
            <ol>
              <li><strong>Verifique seu email</strong> do Asaas para definir sua senha de acesso</li>
              <li><strong>Acesse o painel</strong> Asaas com suas credenciais</li>
              <li><strong>Complete seu perfil</strong> e configure sua conta</li>
              <li><strong>Comece a usar</strong> todos os recursos disponíveis</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="https://www.asaas.com" class="button">Acessar Painel Asaas</a>
            </div>
            
            <div class="info-box" style="background: #e7f3ff; border-left-color: #2196F3;">
              <h3 style="margin-top: 0; color: #2196F3;">💡 Dica:</h3>
              <p>Guarde suas credenciais em local seguro e nunca as compartilhe com terceiros.</p>
            </div>
            
            <h3>📞 Precisa de Ajuda?</h3>
            <p>Nossa equipe está sempre disponível para ajudá-lo(a):</p>
            <ul>
              <li>📧 Email: suporte@asaas.com</li>
              <li>📱 Telefone: (11) 4950-2819</li>
              <li>💬 Chat: Disponível no painel Asaas</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Gerenciador Asaas. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Bem-vindo ao Asaas, ${name}!
      
      Sua conta foi criada com sucesso.
      
      Informações da conta:
      - Nome: ${name}
      - Email: ${email}
      - ID da Conta: ${accountId}
      ${walletId ? `- Wallet ID: ${walletId}` : ''}
      
      Próximos passos:
      1. Verifique seu email do Asaas para definir sua senha
      2. Acesse o painel Asaas
      3. Complete seu perfil
      4. Comece a usar!
      
      Precisa de ajuda? Entre em contato:
      Email: suporte@asaas.com
      Telefone: (11) 4950-2819
      
      Atenciosamente,
      Equipe Gerenciador Asaas
    `
  }
  
  try {
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(emailData)
    })
    
    return {
      ok: response.ok,
      status: response.status
    }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return {
      ok: false,
      status: 500
    }
  }
}

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
      'access_token': apiKey,
      'User-Agent': 'AsaasManager/1.0'
    }
  }
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, options)
    const text = await response.text()
    
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      // Se não for JSON, retorna o texto
      data = { message: text }
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data
    }
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      data: { error: error.message }
    }
  }
}

// API Routes

// Login route
app.post('/api/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (username === c.env.ADMIN_USERNAME && password === c.env.ADMIN_PASSWORD) {
      const token = await createToken(username, c.env.JWT_SECRET)
      
      setCookie(c, 'auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        maxAge: 86400 // 24 hours
      })
      
      return c.json({ 
        ok: true, 
        data: { username, message: 'Login realizado com sucesso' }
      })
    } else {
      return c.json({ 
        ok: false, 
        error: 'Usuário ou senha inválidos' 
      }, 401)
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Logout route
app.post('/api/logout', async (c) => {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0
  })
  
  return c.json({ ok: true, message: 'Logout realizado com sucesso' })
})

// Check auth status
app.get('/api/check-auth', async (c) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.json({ authenticated: false }, 401)
  }
  
  const payload = await verifyToken(token, c.env.JWT_SECRET)
  
  if (!payload) {
    return c.json({ authenticated: false }, 401)
  }
  
  return c.json({ 
    authenticated: true, 
    user: { username: payload.username }
  })
})

// Public signup route (sem autenticação) - usado pela página pública de cadastro
app.post('/api/public/signup', async (c) => {
  try {
    const body = await c.req.json()
    const result = await asaasRequest(c, '/accounts', 'POST', body)
    
    // Se a conta foi criada com sucesso, enviar email de boas-vindas
    if (result.ok && result.data && result.data.id) {
      const account = result.data
      await sendWelcomeEmail(
        c,
        account.name,
        account.email,
        account.id,
        account.walletId
      )
    }
    
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

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
    
    // Se a conta foi criada com sucesso, enviar email de boas-vindas
    if (result.ok && result.data && result.data.id) {
      const account = result.data
      await sendWelcomeEmail(
        c,
        account.name,
        account.email,
        account.id,
        account.walletId
      )
    }
    
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
    const { accountId, expirationDays = 7, maxUses = null, notes = '' } = await c.req.json()
    
    // Criar data de expiração
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + expirationDays)
    
    // Gerar ID único para o link
    const linkId = `${accountId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const url = `${c.req.url.split('/api')[0]}/cadastro/${linkId}`
    
    // Obter usuário autenticado
    const user = c.get('user')
    const createdBy = user?.username || 'system'
    
    // Salvar no banco D1
    await c.env.DB.prepare(`
      INSERT INTO signup_links 
      (id, account_id, url, expires_at, created_by, max_uses, notes, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      linkId,
      accountId,
      url,
      expirationDate.toISOString(),
      createdBy,
      maxUses,
      notes
    ).run()
    
    const link = {
      id: linkId,
      accountId,
      url,
      expiresAt: expirationDate.toISOString(),
      createdAt: new Date().toISOString(),
      active: true,
      usesCount: 0,
      maxUses,
      notes
    }
    
    return c.json({ ok: true, data: link })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Listar todos os links
app.get('/api/signup-links', async (c) => {
  try {
    const { status, search, accountId } = c.req.query()
    
    let query = 'SELECT * FROM signup_links WHERE 1=1'
    const params: any[] = []
    
    if (status === 'active') {
      query += ' AND active = 1 AND datetime(expires_at) > datetime("now")'
    } else if (status === 'expired') {
      query += ' AND datetime(expires_at) <= datetime("now")'
    } else if (status === 'disabled') {
      query += ' AND active = 0'
    }
    
    if (search) {
      query += ' AND (id LIKE ? OR account_id LIKE ? OR notes LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (accountId) {
      query += ' AND account_id = ?'
      params.push(accountId)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const stmt = params.length > 0 
      ? c.env.DB.prepare(query).bind(...params)
      : c.env.DB.prepare(query)
    
    const result = await stmt.all()
    
    return c.json({ ok: true, data: result.results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Obter detalhes de um link específico
app.get('/api/signup-links/:id', async (c) => {
  try {
    const linkId = c.req.param('id')
    
    const link = await c.env.DB.prepare(`
      SELECT * FROM signup_links WHERE id = ?
    `).bind(linkId).first()
    
    if (!link) {
      return c.json({ error: 'Link não encontrado' }, 404)
    }
    
    return c.json({ ok: true, data: link })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Atualizar link (ativar/desativar)
app.patch('/api/signup-links/:id', async (c) => {
  try {
    const linkId = c.req.param('id')
    const { active, notes } = await c.req.json()
    
    const updates: string[] = []
    const params: any[] = []
    
    if (typeof active !== 'undefined') {
      updates.push('active = ?')
      params.push(active ? 1 : 0)
    }
    
    if (typeof notes !== 'undefined') {
      updates.push('notes = ?')
      params.push(notes)
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'Nenhum campo para atualizar' }, 400)
    }
    
    params.push(linkId)
    
    await c.env.DB.prepare(`
      UPDATE signup_links 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run()
    
    return c.json({ ok: true, message: 'Link atualizado com sucesso' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Excluir link
app.delete('/api/signup-links/:id', async (c) => {
  try {
    const linkId = c.req.param('id')
    
    await c.env.DB.prepare(`
      DELETE FROM signup_links WHERE id = ?
    `).bind(linkId).run()
    
    return c.json({ ok: true, message: 'Link excluído com sucesso' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Analytics de um link específico
app.get('/api/signup-links/:id/analytics', async (c) => {
  try {
    const linkId = c.req.param('id')
    
    const conversions = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM link_conversions WHERE link_id = ?
    `).bind(linkId).first()
    
    const link = await c.env.DB.prepare(`
      SELECT uses_count FROM signup_links WHERE id = ?
    `).bind(linkId).first()
    
    const analytics = {
      views: link?.uses_count || 0,
      started: Math.floor((link?.uses_count || 0) * 0.6), // Estimativa
      conversions: conversions?.count || 0
    }
    
    return c.json({ ok: true, data: analytics })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Página de cadastro público
app.get('/cadastro/:linkId', (c) => {
  const linkId = c.req.param('linkId')
  
  // Extrair accountId do linkId (formato: accountId-timestamp-random)
  const accountId = linkId.split('-')[0]
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro - Asaas</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-3xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
                        <i class="fas fa-building text-blue-600 text-4xl"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">Bem-vindo!</h1>
                    <p class="text-gray-600 text-lg">Complete seu cadastro para começar</p>
                </div>

                <!-- Form Card -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-user-plus mr-2 text-blue-600"></i>
                                Dados do Cadastro
                            </h2>
                            <span class="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                <i class="fas fa-shield-alt mr-1"></i>Seguro
                            </span>
                        </div>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-info-circle mr-1"></i>
                            Todos os seus dados são protegidos e criptografados
                        </p>
                    </div>

                    <form id="signup-form" class="space-y-6">
                        <input type="hidden" id="account-id" value="${accountId}">
                        <input type="hidden" id="link-id" value="${linkId}">

                        <!-- Dados Pessoais -->
                        <div class="border-l-4 border-blue-500 pl-4">
                            <h3 class="text-lg font-semibold text-gray-700 mb-4">
                                <i class="fas fa-user mr-2"></i>Dados Pessoais
                            </h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input type="text" name="name" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Seu nome completo">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input type="email" name="email" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="seu@email.com">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        CPF *
                                    </label>
                                    <input type="text" name="cpfCnpj" required maxlength="14"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="000.000.000-00">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Data de Nascimento *
                                    </label>
                                    <input type="date" name="birthDate" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone
                                    </label>
                                    <input type="text" name="phone"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="(11) 3230-0606">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Celular *
                                    </label>
                                    <input type="text" name="mobilePhone" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="(11) 98845-1155">
                                </div>
                            </div>
                        </div>

                        <!-- Endereço -->
                        <div class="border-l-4 border-green-500 pl-4">
                            <h3 class="text-lg font-semibold text-gray-700 mb-4">
                                <i class="fas fa-map-marker-alt mr-2"></i>Endereço
                            </h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        CEP *
                                    </label>
                                    <input type="text" name="postalCode" required maxlength="9"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="00000-000">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Rua *
                                    </label>
                                    <input type="text" name="address" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Nome da rua">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Número *
                                    </label>
                                    <input type="text" name="addressNumber" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="123">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Complemento
                                    </label>
                                    <input type="text" name="complement"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Apto, sala, etc">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Bairro *
                                    </label>
                                    <input type="text" name="province" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Nome do bairro">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Pessoa/Empresa
                                    </label>
                                    <select name="companyType"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                        <option value="">Selecione...</option>
                                        <option value="">Pessoa Física</option>
                                        <option value="MEI">MEI - Microempreendedor Individual</option>
                                        <option value="LIMITED">Limitada</option>
                                        <option value="INDIVIDUAL">Individual</option>
                                        <option value="ASSOCIATION">Associação</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Renda/Faturamento Mensal *
                                    </label>
                                    <select name="incomeValue" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                        <option value="">Selecione...</option>
                                        <option value="500">Até R$ 500</option>
                                        <option value="1000">R$ 500 a R$ 1.000</option>
                                        <option value="2000">R$ 1.000 a R$ 2.000</option>
                                        <option value="5000">R$ 2.000 a R$ 5.000</option>
                                        <option value="10000">R$ 5.000 a R$ 10.000</option>
                                        <option value="20000">R$ 10.000 a R$ 20.000</option>
                                        <option value="50000">R$ 20.000 a R$ 50.000</option>
                                        <option value="100000">Acima de R$ 50.000</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Terms -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="flex items-start cursor-pointer">
                                <input type="checkbox" id="terms" required
                                    class="mt-1 mr-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                                <span class="text-sm text-gray-700">
                                    Eu li e aceito os 
                                    <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">termos de uso</a> 
                                    e a 
                                    <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">política de privacidade</a>
                                </span>
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <div class="pt-4">
                            <button type="submit"
                                class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg">
                                <i class="fas fa-check-circle mr-2"></i>
                                Completar Cadastro
                            </button>
                        </div>
                    </form>

                    <!-- Result Message -->
                    <div id="result" class="mt-6 hidden"></div>
                </div>

                <!-- Footer -->
                <div class="text-center mt-8 text-gray-600 text-sm">
                    <p>
                        <i class="fas fa-lock mr-1"></i>
                        Seus dados são protegidos e criptografados
                    </p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Máscara para CPF
            document.querySelector('[name="cpfCnpj"]').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
                } else {
                    value = value.substring(0, 14);
                    value = value.replace(/(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})/, '$1.$2.$3/$4-$5');
                }
                e.target.value = value;
            });

            // Máscara para CEP
            document.querySelector('[name="postalCode"]').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\D/g, '');
                value = value.replace(/(\\d{5})(\\d{3})/, '$1-$2');
                e.target.value = value;
            });

            // Máscara para telefone
            document.querySelectorAll('[name="phone"], [name="mobilePhone"]').forEach(input => {
                input.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\\D/g, '');
                    if (value.length <= 10) {
                        value = value.replace(/(\\d{2})(\\d{4})(\\d{4})/, '($1) $2-$3');
                    } else {
                        value = value.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
                    }
                    e.target.value = value;
                });
            });

            // Submit form
            document.getElementById('signup-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Remover formatação de CPF, CEP e telefones
                data.cpfCnpj = data.cpfCnpj.replace(/\\D/g, '');
                data.postalCode = data.postalCode.replace(/\\D/g, '');
                if (data.phone) data.phone = data.phone.replace(/\\D/g, '');
                if (data.mobilePhone) data.mobilePhone = data.mobilePhone.replace(/\\D/g, '');
                
                // Remover campos vazios
                Object.keys(data).forEach(key => {
                    if (!data[key] || data[key] === '') delete data[key];
                });
                
                const resultDiv = document.getElementById('result');
                const submitBtn = e.target.querySelector('button[type="submit"]');
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
                
                resultDiv.innerHTML = \`
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-blue-800 text-center">
                            <i class="fas fa-spinner fa-spin mr-2"></i>
                            Criando sua conta...
                        </p>
                    </div>
                \`;
                resultDiv.classList.remove('hidden');
                
                try {
                    const response = await axios.post('/api/public/signup', data);
                    
                    if (response.data.ok && response.data.data) {
                        const account = response.data.data;
                        resultDiv.innerHTML = \`
                            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div class="text-center mb-4">
                                    <i class="fas fa-check-circle text-green-600 text-5xl mb-3"></i>
                                    <h3 class="text-2xl font-bold text-green-800 mb-2">Cadastro Concluído!</h3>
                                    <p class="text-green-700">Sua conta foi criada com sucesso</p>
                                </div>
                                <div class="bg-white rounded-lg p-4 space-y-2">
                                    <p class="text-sm"><strong>Nome:</strong> \${account.name}</p>
                                    <p class="text-sm"><strong>Email:</strong> \${account.email}</p>
                                    <p class="text-sm"><strong>ID da Conta:</strong> <code class="bg-gray-100 px-2 py-1 rounded">\${account.id}</code></p>
                                    \${account.walletId ? \`<p class="text-sm"><strong>Wallet ID:</strong> <code class="bg-gray-100 px-2 py-1 rounded">\${account.walletId}</code></p>\` : ''}
                                </div>
                                <div class="mt-4 text-center">
                                    <p class="text-sm text-gray-600 mb-3">
                                        <i class="fas fa-envelope mr-2"></i>
                                        Verifique seu email para definir sua senha de acesso
                                    </p>
                                </div>
                            </div>
                        \`;
                        e.target.reset();
                    } else {
                        throw new Error(response.data.data?.errors?.[0]?.description || response.data.data?.message || 'Erro ao criar conta');
                    }
                } catch (error) {
                    resultDiv.innerHTML = \`
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-red-800 mb-2">
                                <i class="fas fa-exclamation-circle mr-2"></i>Erro no Cadastro
                            </h3>
                            <p class="text-red-700 text-sm">\${error.response?.data?.data?.errors?.[0]?.description || error.message}</p>
                            <button onclick="document.getElementById('result').classList.add('hidden')" 
                                class="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
                                <i class="fas fa-times mr-1"></i>Tentar novamente
                            </button>
                        </div>
                    \`;
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Completar Cadastro';
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Gerenciador Asaas</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-600 to-indigo-700 min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-4">
            <!-- Login Card -->
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <!-- Logo/Icon -->
                <div class="text-center mb-8">
                    <div class="inline-block bg-blue-100 rounded-full p-4 mb-4">
                        <i class="fas fa-building text-blue-600 text-5xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Gerenciador Asaas</h1>
                    <p class="text-gray-600">Faça login para continuar</p>
                </div>

                <!-- Login Form -->
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-user mr-2"></i>Usuário
                        </label>
                        <input type="text" name="username" required autofocus
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Digite seu usuário">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock mr-2"></i>Senha
                        </label>
                        <input type="password" name="password" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Digite sua senha">
                    </div>

                    <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span id="error-text"></span>
                    </div>

                    <button type="submit"
                        class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Entrar
                    </button>
                </form>

                <!-- Info Box -->
                <div class="mt-6 bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-blue-800 text-center">
                        <i class="fas fa-info-circle mr-2"></i>
                        Credenciais padrão: admin / admin123
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-6 text-white">
                <p class="text-sm">
                    <i class="fas fa-shield-alt mr-2"></i>
                    Acesso seguro e protegido
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                const errorDiv = document.getElementById('error-message');
                const errorText = document.getElementById('error-text');
                const submitBtn = e.target.querySelector('button[type="submit"]');
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...';
                errorDiv.classList.add('hidden');
                
                try {
                    const response = await axios.post('/api/login', data);
                    
                    if (response.data.ok) {
                        submitBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Sucesso!';
                        submitBtn.classList.remove('from-blue-600', 'to-indigo-600');
                        submitBtn.classList.add('from-green-600', 'to-green-700');
                        
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 500);
                    } else {
                        throw new Error(response.data.error || 'Erro ao fazer login');
                    }
                } catch (error) {
                    errorText.textContent = error.response?.data?.error || error.message || 'Usuário ou senha inválidos';
                    errorDiv.classList.remove('hidden');
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Entrar';
                }
            });
        </script>
    </body>
    </html>
  `)
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
                        <div class="border-l border-gray-300 h-8 mx-2"></div>
                        <button onclick="logout()" class="text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Sair
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
                                        Tipo de Pessoa/Empresa
                                    </label>
                                    <select name="companyType"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">Selecione...</option>
                                        <option value="">Pessoa Física</option>
                                        <option value="MEI">MEI - Microempreendedor Individual</option>
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
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Renda/Faturamento Mensal *
                                    </label>
                                    <select name="incomeValue" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">Selecione...</option>
                                        <option value="500">Até R$ 500</option>
                                        <option value="1000">R$ 500 a R$ 1.000</option>
                                        <option value="2000">R$ 1.000 a R$ 2.000</option>
                                        <option value="5000">R$ 2.000 a R$ 5.000</option>
                                        <option value="10000">R$ 5.000 a R$ 10.000</option>
                                        <option value="20000">R$ 10.000 a R$ 20.000</option>
                                        <option value="50000">R$ 20.000 a R$ 50.000</option>
                                        <option value="100000">Acima de R$ 50.000</option>
                                    </select>
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
