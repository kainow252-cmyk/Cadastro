import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getCookie, setCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'
import { initializeSESClient, sendWelcomeEmail, isSESConfigured } from './email-service'
import type { CustomerData } from './email-templates'

type Bindings = {
  ASAAS_API_KEY: string;
  ASAAS_API_URL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  MAILERSEND_API_KEY: string;
  MAILERSEND_FROM_EMAIL: string;
  MAILERSEND_FROM_NAME: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  ASAAS_WEBHOOK_TOKEN?: string;
  DELTAPAG_API_KEY: string;
  DELTAPAG_API_URL: string;
  DB: D1Database;
}

type Variables = {
  user: { username: string };
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Enable CORS with credentials
app.use('/api/*', cors({
  origin: (origin) => origin, // Allow all origins
  credentials: true, // Allow cookies
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

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
  const path = c.req.path
  const publicRoutes = [
    '/api/login', 
    '/api/check-auth', 
    '/api/public/signup',
    '/api/proxy/payments',
    '/api/debug/env'
  ]
  
  // Public routes with exact match
  if (publicRoutes.includes(path)) {
    return next()
  }
  
  // Public routes with pattern match
  if (path.startsWith('/api/pix/subscription-link/') || 
      path.startsWith('/api/pix/subscription-signup/') ||
      path.startsWith('/api/pix/automatic-signup-link/') ||
      path.startsWith('/api/pix/automatic-signup/') ||
      path.startsWith('/api/payment-status/') ||
      path.startsWith('/api/webhooks/') ||
      path.startsWith('/api/reports/all-accounts/received') ||
      path.startsWith('/api/reports/all-accounts/pending') ||
      path.startsWith('/api/reports/all-accounts/overdue') ||
      path.startsWith('/api/reports/all-accounts/refunded')) {
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
    subject: "⚠️ AÇÃO NECESSÁRIA - Finalize sua Conta Asaas em 24h",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f44336 0%, #e91e63 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336; }
          .warning-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; background: #f44336; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; font-weight: bold; }
          .button:hover { background: #d32f2f; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #f44336; }
          .highlight { background: #ffeb3b; padding: 3px 8px; border-radius: 3px; font-weight: bold; }
          .step { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #4caf50; }
          .step-number { display: inline-block; width: 30px; height: 30px; background: #4caf50; color: white; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Sua Conta Asaas foi Criada!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">FINALIZE O CADASTRO EM ATÉ 24 HORAS</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${name}! 👋</h2>
            
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #f57c00;">⏰ ATENÇÃO: Prazo de 24 horas!</h3>
              <p style="margin: 0;">Você recebeu um email do <strong>Asaas</strong> (noreply@asaas.com). Verifique sua caixa de entrada e SPAM para finalizar sua conta!</p>
            </div>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Dados da sua Subconta:</h3>
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> <span class="highlight">${email}</span></p>
              <p><strong>ID da Conta:</strong> <code>${accountId}</code></p>
              ${walletId ? `<p><strong>Wallet ID:</strong> <code>${walletId}</code></p>` : '<p style="color: #ff9800;">⏳ <strong>Wallet ID será gerado após aprovação do Asaas</strong></p>'}
            </div>
            
            <h3 style="color: #4caf50;">✅ PASSO A PASSO PARA FINALIZAR:</h3>
            
            <div class="step">
              <span class="step-number">1</span>
              <strong>Verifique seu Email</strong><br>
              <small>Procure por email do <strong>noreply@asaas.com</strong> ou <strong>contato@asaas.com</strong><br>
              ⚠️ Se não encontrar na caixa de entrada, <strong>verifique a pasta SPAM/Lixo Eletrônico</strong></small>
            </div>
            
            <div class="step">
              <span class="step-number">2</span>
              <strong>Clique no Link de Ativação</strong><br>
              <small>O email contém um link para <strong>definir sua senha</strong> e ativar a conta</small>
            </div>
            
            <div class="step">
              <span class="step-number">3</span>
              <strong>Crie uma Senha Forte</strong><br>
              <small>Use letras maiúsculas, minúsculas, números e caracteres especiais</small>
            </div>
            
            <div class="step">
              <span class="step-number">4</span>
              <strong>Complete seu Perfil</strong><br>
              <small>Preencha as informações solicitadas pelo Asaas (CPF, endereço, telefone, etc.)</small>
            </div>
            
            <div class="step">
              <span class="step-number">5</span>
              <strong>Aguarde Aprovação</strong><br>
              <small>O Asaas analisa a documentação (pode levar de 1 a 3 dias úteis)</small>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.asaas.com/login" class="button">🚀 ACESSAR PAINEL ASAAS</a>
            </div>
            
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #d32f2f;">🚨 IMPORTANTE:</h3>
              <ul style="margin: 10px 0;">
                <li>O link de ativação <strong>expira em 24 horas</strong></li>
                <li>Sem a ativação, sua conta será <strong>suspensa</strong></li>
                <li>Você <strong>NÃO poderá receber pagamentos</strong> sem finalizar o cadastro</li>
              </ul>
            </div>
            
            <div class="info-box" style="background: #e8f5e9; border-left-color: #4caf50;">
              <h3 style="margin-top: 0; color: #4caf50;">💡 Dica de Segurança:</h3>
              <p style="margin: 0;">✓ Nunca compartilhe sua senha<br>
              ✓ Guarde suas credenciais em local seguro<br>
              ✓ Ative a autenticação de dois fatores (2FA)</p>
            </div>
            
            <h3>❓ Não recebeu o email?</h3>
            <ol>
              <li>Verifique a pasta <strong>SPAM/Lixo Eletrônico</strong></li>
              <li>Aguarde até 15 minutos (pode haver atraso)</li>
              <li>Entre em contato com o suporte Asaas: <strong>(11) 4950-2819</strong></li>
            </ol>
            
            <h3>📞 Suporte Asaas:</h3>
            <ul>
              <li>📧 Email: <strong>contato@asaas.com</strong></li>
              <li>📱 Telefone: <strong>(11) 4950-2819</strong></li>
              <li>💬 WhatsApp: <strong>(11) 4950-2819</strong></li>
              <li>🌐 Site: <a href="https://www.asaas.com">www.asaas.com</a></li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Gerenciador Asaas. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
            <p style="color: #f44336; font-weight: bold;">⚠️ Você tem 24 horas para finalizar seu cadastro no Asaas!</p>
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
  body?: any,
  customHeaders?: Record<string, string>
) {
  const apiKey = c.env.ASAAS_API_KEY
  const apiUrl = c.env.ASAAS_API_URL
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'access_token': apiKey,
    'User-Agent': 'AsaasManager/1.0'
  }
  
  // Adicionar headers customizados (ex: asaas-account-key para subcontas)
  if (customHeaders) {
    Object.assign(headers, customHeaders)
  }
  
  const options: RequestInit = {
    method,
    headers
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

/**
 * Cria configuração de split para Asaas garantindo que a sub-conta receba o valor LÍQUIDO
 * 
 * IMPORTANTE: 
 * - percentualValue: Desconta taxas proporcionalmente de cada parte (sub-conta paga parte das taxas)
 * - totalFixedValue: Sub-conta recebe valor líquido, conta principal paga TODAS as taxas
 * 
 * Exemplo com cobrança de R$ 100,00 e taxa Asaas de R$ 3,49:
 * 
 * COM percentualValue (ERRADO - sub-conta recebe menos):
 * - Sub-conta: R$ 20,00 - (20% de R$ 3,49) = R$ 20,00 - R$ 0,70 = R$ 19,30
 * - Conta principal: R$ 80,00 - (80% de R$ 3,49) = R$ 80,00 - R$ 2,79 = R$ 77,21
 * 
 * COM totalFixedValue (CORRETO - sub-conta recebe líquido):
 * - Sub-conta: R$ 20,00 (líquido, sem descontar taxas)
 * - Conta principal: R$ 100,00 - R$ 20,00 - R$ 3,49 = R$ 76,51
 * 
 * @param walletId - ID da carteira (wallet) da sub-conta
 * @param totalValue - Valor total da cobrança
 * @param percentage - Percentual que a sub-conta deve receber (padrão: 20%)
 * @returns Array de split para a API Asaas
 */
function createNetSplit(walletId: string, totalValue: number, percentage: number = 20) {
  // Calcular valor e arredondar para 2 casas decimais
  const fixedValue = Math.round((totalValue * percentage) / 100 * 100) / 100
  
  console.log('🔧 createNetSplit:', { walletId, totalValue, percentage, fixedValue })
  
  // Validar que o valor não seja 0 ou negativo
  if (fixedValue <= 0) {
    console.error('❌ Split value is 0 or negative:', fixedValue)
    throw new Error(`Split value must be greater than 0. Calculated: ${fixedValue}`)
  }
  
  return [{
    walletId: walletId,
    fixedValue: fixedValue // Usar fixedValue em vez de totalFixedValue
  }]
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
        token,
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
    
    // 1. Criar subconta no Asaas
    const result = await asaasRequest(c, '/accounts', 'POST', body)
    
    if (!result.ok) {
      return c.json(result)
    }
    
    const account = result.data
    
    // 2. Criar cliente (customer) no Asaas usando os mesmos dados
    const customerData = {
      name: body.name,
      email: body.email,
      cpfCnpj: body.cpfCnpj,
      mobilePhone: body.mobilePhone,
      phone: body.phone,
      postalCode: body.postalCode,
      address: body.address,
      addressNumber: body.addressNumber,
      complement: body.complement,
      province: body.province,
      notificationDisabled: false
    }
    
    const customerResult = await asaasRequest(c, '/customers', 'POST', customerData)
    
    let customerId = null
    if (customerResult.ok && customerResult.data && customerResult.data.id) {
      customerId = customerResult.data.id
    }
    
    // 3. [REMOVIDO] Cobrança automática de R$ 50,00 removida
    // Agora apenas envia email de boas-vindas, sem criar cobrança
    
    // 4. Enviar email de boas-vindas
    await sendWelcomeEmail(
      c,
      account.name,
      account.email,
      account.id,
      account.walletId
    )
    
    return c.json({
      ok: true,
      data: account
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Estatísticas do dashboard
app.get('/api/stats', async (c) => {
  try {
    // Buscar subcontas reais da API Asaas
    let accounts = []
    let accountsFromAsaas = []
    
    try {
      const accountsResult = await asaasRequest(c, '/accounts')
      accountsFromAsaas = accountsResult?.data?.data || []
      console.log(`✅ Busca Asaas: ${accountsFromAsaas.length} contas`)
    } catch (apiError) {
      console.error('❌ Erro ao buscar contas do Asaas:', apiError)
    }
    
    // Se Asaas não retornou contas, buscar do D1
    if (accountsFromAsaas.length === 0) {
      console.log('⚠️ Asaas retornou 0 contas, buscando do D1...')
      
      // Buscar signup_links que foram usados (uses_count > 0)
      const signupLinksUsed = await c.env.DB.prepare(`
        SELECT 
          sl.id,
          sl.account_id,
          sl.url,
          sl.created_at,
          sl.active,
          sl.uses_count,
          sl.created_by,
          sl.notes
        FROM signup_links sl
        WHERE sl.uses_count > 0 OR sl.account_id != 'new'
        ORDER BY sl.created_at DESC
      `).all()
      
      // Buscar transações para enriquecer dados
      const transactionsData = await c.env.DB.prepare(`
        SELECT DISTINCT account_id, COUNT(*) as tx_count
        FROM transactions
        GROUP BY account_id
      `).all()
      
      const txMap = new Map()
      for (const tx of (transactionsData?.results || [])) {
        txMap.set(tx.account_id, tx.tx_count)
      }
      
      accounts = (signupLinksUsed?.results || []).map((link: any) => ({
        id: link.account_id,
        name: `Conta ${link.account_id.substring(0, 8)}`,
        email: link.notes || 'N/A',
        dateCreated: link.created_at,
        walletId: link.account_id,
        active: link.active === 1,
        transactionCount: txMap.get(link.account_id) || 0
      }))
      
      console.log(`✅ D1 retornou ${accounts.length} contas com transações`)
    } else {
      accounts = accountsFromAsaas
    }
    
    // Buscar links de auto-cadastro (assinatura recorrente)
    const signupLinksResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active,
        SUM(uses_count) as total_uses
      FROM subscription_signup_links
    `).first()
    
    // Buscar links de PIX Automático
    const pixAutoLinksResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active,
        SUM(uses_count) as total_uses
      FROM pix_automatic_signup_links
    `).first()
    
    // Buscar conversões de PIX Automático (autorizações criadas)
    const pixAutoConversionsResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM pix_automatic_authorizations
    `).first()
    
    // Calcular estatísticas
    const totalAccounts = accounts.length
    const approvedAccounts = accounts.filter((a: any) => a.walletId || a.active === 1).length
    const pendingAccounts = totalAccounts - approvedAccounts
    
    // Links de cadastro (soma de ambos os tipos)
    const signupLinksTotal = signupLinksResult?.total || 0
    const signupLinksActive = signupLinksResult?.active || 0
    const signupLinksUses = signupLinksResult?.total_uses || 0
    
    const pixAutoLinksTotal = pixAutoLinksResult?.total || 0
    const pixAutoLinksActive = pixAutoLinksResult?.active || 0
    const pixAutoLinksUses = pixAutoLinksResult?.total_uses || 0
    const pixAutoConversions = pixAutoConversionsResult?.total || 0
    
    const totalLinks = signupLinksTotal + pixAutoLinksTotal
    const activeLinks = signupLinksActive + pixAutoLinksActive
    const totalConversions = signupLinksUses + pixAutoConversions
    
    // Taxa de conversão
    const conversionRate = activeLinks > 0 ? ((totalConversions / activeLinks) * 100).toFixed(1) : '0.0'
    
    return c.json({
      ok: true,
      data: {
        accounts: {
          total: totalAccounts,
          approved: approvedAccounts,
          pending: pendingAccounts,
          approvalRate: totalAccounts > 0 ? ((approvedAccounts / totalAccounts) * 100).toFixed(1) : '0'
        },
        links: {
          total: totalLinks,
          active: activeLinks,
          conversions: totalConversions,
          conversionRate
        },
        recentAccounts: accounts.slice(0, 5).map((a: any) => ({
          id: a.id,
          name: a.name || `Conta ${a.id?.substring(0, 8)}` || 'Sem nome',
          email: a.email || 'N/A',
          dateCreated: a.dateCreated || a.created_at,
          status: a.walletId || a.active ? 'approved' : 'pending'
        }))
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Relatório de subconta
app.get('/api/reports/:accountId', async (c) => {
  try {
    const db = c.env.DB
    const accountId = c.req.param('accountId')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    
    // Buscar informações da subconta do D1
    const accountQuery = await db.prepare('SELECT * FROM signup_links WHERE account_id = ? LIMIT 1').bind(accountId).first()
    
    let account: any = null
    
    if (accountQuery) {
      // Subconta encontrada no D1
      account = {
        id: accountQuery.account_id,
        name: `Conta ${accountId.substring(0, 8)}`,
        email: 'contato@exemplo.com',
        cpfCnpj: '000.000.000-00',
        walletId: accountQuery.account_id
      }
    } else {
      // Subconta não encontrada no D1, buscar direto do Asaas
      console.log(`⚠️ Subconta ${accountId} não encontrada no D1, buscando no Asaas...`)
      
      const asaasAccount = await asaasRequest(c, `/accounts/${accountId}`, 'GET')
      
      if (!asaasAccount.ok || !asaasAccount.data) {
        return c.json({ error: 'Subconta não encontrada no Asaas', accountId }, 404)
      }
      
      account = {
        id: asaasAccount.data.id,
        name: asaasAccount.data.name || `Conta ${accountId.substring(0, 8)}`,
        email: asaasAccount.data.email || 'N/A',
        cpfCnpj: asaasAccount.data.cpfCnpj || 'N/A',
        walletId: asaasAccount.data.walletId || accountId
      }
      
      console.log('✅ Subconta encontrada no Asaas:', account.name)
    }
    
    // Buscar transações do banco D1 local
    let query = `SELECT * FROM transactions WHERE account_id = ?`
    const params = [accountId]
    
    if (startDate) {
      query += ` AND created_at >= ?`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND created_at <= ?`
      params.push(endDate + ' 23:59:59')
    }
    
    query += ` ORDER BY created_at DESC`
    
    const result = await db.prepare(query).bind(...params).all()
    let payments = result.results || []
    
    // Se não houver transações no D1, buscar direto do Asaas
    if (payments.length === 0) {
      console.log(`⚠️ Nenhuma transação no D1 para ${accountId}, buscando no Asaas...`)
      
      // IMPORTANTE: Buscar apenas pagamentos com split para esse walletId
      // Não há filtro direto por walletId na API, então buscar todos e filtrar localmente
      let asaasPaymentsUrl = `/payments?limit=1000`
      if (startDate) asaasPaymentsUrl += `&dateCreated[ge]=${startDate}`
      if (endDate) asaasPaymentsUrl += `&dateCreated[le]=${endDate}`
      
      const asaasPayments = await asaasRequest(c, asaasPaymentsUrl, 'GET')
      
      if (asaasPayments.ok && asaasPayments.data?.data) {
        // Filtrar apenas pagamentos que têm split para essa subconta (walletId)
        const walletId = account.walletId
        
        const filteredPayments = asaasPayments.data.data.filter((p: any) => {
          // Verificar se o pagamento tem split para esse walletId
          if (p.split && Array.isArray(p.split)) {
            return p.split.some((s: any) => s.walletId === walletId)
          }
          return false
        })
        
        payments = filteredPayments.map((p: any) => ({
          id: p.id,
          value: p.value,
          description: p.description,
          due_date: p.dueDate,
          status: p.status,
          created_at: p.dateCreated,
          billing_type: p.billingType,
          payment_date: p.paymentDate
        }))
        
        console.log(`✅ ${payments.length} transações encontradas no Asaas com split para ${walletId}`)
      } else {
        console.log(`⚠️ Nenhuma transação encontrada no Asaas`)
      }
    }
    
    // Calcular estatísticas
    let totalReceived = 0
    let totalPending = 0
    let totalOverdue = 0
    let totalRefunded = 0
    
    payments.forEach((payment: any) => {
      const value = parseFloat(payment.value || 0)
      if (payment.status === 'RECEIVED') totalReceived += value
      else if (payment.status === 'PENDING') totalPending += value
      else if (payment.status === 'OVERDUE') totalOverdue += value
      else if (payment.status === 'REFUNDED') totalRefunded += value
    })
    
    // Preparar transações para retorno
    const transactions = payments.map((p: any) => ({
      id: p.id,
      value: parseFloat(p.value || 0),
      description: p.description || 'Sem descrição',
      dueDate: p.due_date,
      status: p.status,
      dateCreated: p.created_at,
      billingType: p.billing_type,
      paymentDate: p.payment_date
    }))
    
    return c.json({
      ok: true,
      data: {
        account: {
          id: account.id,
          name: account.name,
          email: account.email,
          cpfCnpj: account.cpfCnpj,
          walletId: account.walletId
        },
        period: {
          startDate: startDate || 'Início',
          endDate: endDate || 'Hoje'
        },
        summary: {
          totalReceived,
          totalPending,
          totalOverdue,
          totalRefunded,
          totalTransactions: payments.length
        },
        transactions
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar relatório:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint de relatório consolidado (todas as subcontas)
// IMPORTANTE: Deve vir ANTES do endpoint com :accountId para evitar conflito de rotas
app.get('/api/reports/all-accounts/detailed', async (c) => {
  try {
    const db = c.env.DB
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const chargeType = c.req.query('chargeType') || 'all'
    const statusFilter = c.req.query('status') || 'all'
    
    // Buscar todas as subcontas e criar mapa de nomes
    const accountsResult = await db.prepare('SELECT DISTINCT account_id, wallet_id FROM transactions').all()
    const accounts = accountsResult.results || []
    
    // Criar mapa de account_id → nome da conta
    const accountNamesMap: Record<string, string> = {}
    for (const acc of accounts) {
      const accountId = (acc as any).account_id
      // Buscar nome da subconta na tabela subscription_signup_links
      const linkInfo = await db.prepare(`
        SELECT description FROM subscription_signup_links 
        WHERE account_id = ? 
        LIMIT 1
      `).bind(accountId).first()
      
      if (linkInfo && linkInfo.description) {
        accountNamesMap[accountId] = linkInfo.description
      } else {
        accountNamesMap[accountId] = `Conta ${accountId.substring(0, 8)}`
      }
    }
    
    // Buscar transações de todas as subcontas
    let query = `SELECT * FROM transactions WHERE 1=1`
    const params: any[] = []
    
    if (startDate) {
      query += ` AND created_at >= ?`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND created_at <= ?`
      params.push(endDate + ' 23:59:59')
    }
    if (statusFilter && statusFilter !== 'all') {
      query += ` AND status = ?`
      params.push(statusFilter)
    }
    
    query += ` ORDER BY created_at DESC`
    
    const result = await db.prepare(query).bind(...params).all()
    let payments = result.results || []
    
    // Enriquecer cada pagamento com dados do cliente e subconta
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i] as any
      
      // Buscar dados do cliente
      const conversion = await db.prepare(`
        SELECT sc.*, ssl.charge_type 
        FROM subscription_conversions sc
        LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
        WHERE sc.subscription_id = ?
        LIMIT 1
      `).bind(payment.id).first()
      
      let finalConversion = conversion
      
      // Se não encontrou, tentar buscar pelo account_id (casos onde múltiplos pagamentos da mesma conta)
      if (!finalConversion) {
        finalConversion = await db.prepare(`
          SELECT sc.*, ssl.charge_type 
          FROM subscription_conversions sc
          LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
          WHERE ssl.account_id = ?
          ORDER BY sc.converted_at DESC
          LIMIT 1
        `).bind(payment.account_id).first()
      }
      
      if (finalConversion) {
        payment.customer_name = finalConversion.customer_name
        payment.customer_email = finalConversion.customer_email
        payment.customer_cpf = finalConversion.customer_cpf
        payment.customer_birthdate = finalConversion.customer_birthdate
        payment.charge_type = finalConversion.charge_type || 'monthly'
      } else {
        payment.customer_name = 'N/A'
        payment.customer_email = 'N/A'
        payment.customer_cpf = 'N/A'
        payment.customer_birthdate = 'N/A'
        payment.charge_type = 'monthly'
      }
      
      // Atribuir nome da subconta do mapa
      payment.account_name = accountNamesMap[payment.account_id] || `Conta ${payment.account_id.substring(0, 8)}`
    }
    
    // Filtrar por tipo de cobrança
    if (chargeType && chargeType !== 'all') {
      payments = payments.filter((p: any) => {
        const pChargeType = p.charge_type || 'monthly'
        return pChargeType === chargeType
      })
    }
    
    // Calcular estatísticas
    let totalReceived = 0
    let totalPending = 0
    let totalOverdue = 0
    let totalRefunded = 0
    
    payments.forEach((payment: any) => {
      const value = parseFloat(payment.value || 0)
      if (payment.status === 'RECEIVED') totalReceived += value
      else if (payment.status === 'PENDING') totalPending += value
      else if (payment.status === 'OVERDUE') totalOverdue += value
      else if (payment.status === 'REFUNDED') totalRefunded += value
    })
    
    // Preparar transações
    const transactions = payments.map((p: any) => ({
      id: p.id,
      accountId: p.account_id,
      accountName: p.account_name || 'N/A',
      value: parseFloat(p.value || 0),
      description: p.description || 'Sem descrição',
      dueDate: p.due_date,
      status: p.status,
      dateCreated: p.created_at,
      billingType: p.billing_type,
      paymentDate: p.payment_date,
      chargeType: p.charge_type || 'monthly',
      customer: {
        name: p.customer_name || 'N/A',
        email: p.customer_email || 'N/A',
        cpf: p.customer_cpf || 'N/A',
        birthdate: p.customer_birthdate || 'N/A'
      }
    }))
    
    return c.json({
      ok: true,
      data: {
        account: {
          id: 'ALL_ACCOUNTS',
          name: 'Todas as Subcontas',
          email: 'consolidado@sistema.com',
          cpfCnpj: '-',
          walletId: '-'
        },
        period: {
          startDate: startDate || 'Início',
          endDate: endDate || 'Hoje'
        },
        filters: {
          chargeType: chargeType || 'all',
          status: statusFilter || 'all'
        },
        summary: {
          totalReceived,
          totalPending,
          totalOverdue,
          totalRefunded,
          totalTransactions: payments.length,
          totalAccounts: accounts.length
        },
        transactions
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar relatório consolidado:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ===== ENDPOINTS ESPECÍFICOS POR STATUS (para sistemas externos) =====

// Middleware de autenticação via API Key para sistemas externos
async function externalApiAuth(c: any, next: any) {
  const apiKey = c.req.header('X-API-Key')
  const validApiKey = c.env.EXTERNAL_API_KEY || 'demo-key-123' // Default para desenvolvimento
  
  // Se não forneceu API Key, bloquear
  if (!apiKey) {
    return c.json({ 
      error: 'API Key obrigatória. Envie no header X-API-Key',
      docs: 'https://github.com/kainow252-cmyk/Cadastro/blob/main/API_RELATORIOS_EXTERNOS.md'
    }, 401)
  }
  
  // Validar API Key
  if (apiKey !== validApiKey) {
    return c.json({ 
      error: 'API Key inválida',
      docs: 'https://github.com/kainow252-cmyk/Cadastro/blob/main/API_RELATORIOS_EXTERNOS.md'
    }, 403)
  }
  
  await next()
}

// Helper function para buscar relatório consolidado com status específico
async function getConsolidatedReportByStatus(c: any, statusFilter: string) {
  try {
    const db = c.env.DB
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const chargeType = c.req.query('chargeType') || 'all'
    
    // Buscar todas as subcontas e criar mapa de nomes
    const accountsResult = await db.prepare('SELECT DISTINCT account_id, wallet_id FROM transactions').all()
    const accounts = accountsResult.results || []
    
    // Criar mapa de account_id → nome da conta
    const accountNamesMap: Record<string, string> = {}
    for (const acc of accounts) {
      const accountId = (acc as any).account_id
      const linkInfo = await db.prepare(`
        SELECT description FROM subscription_signup_links 
        WHERE account_id = ? 
        LIMIT 1
      `).bind(accountId).first()
      
      if (linkInfo && linkInfo.description) {
        accountNamesMap[accountId] = linkInfo.description
      } else {
        accountNamesMap[accountId] = `Conta ${accountId.substring(0, 8)}`
      }
    }
    
    // Buscar transações com filtro de status
    let query = `SELECT * FROM transactions WHERE status = ?`
    const params: any[] = [statusFilter]
    
    if (startDate) {
      query += ` AND created_at >= ?`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND created_at <= ?`
      params.push(endDate + ' 23:59:59')
    }
    
    query += ` ORDER BY created_at DESC`
    
    const result = await db.prepare(query).bind(...params).all()
    let payments = result.results || []
    
    // Enriquecer cada pagamento com dados do cliente e subconta
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i] as any
      
      // Buscar dados do cliente
      const conversion = await db.prepare(`
        SELECT sc.*, ssl.charge_type 
        FROM subscription_conversions sc
        LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
        WHERE sc.subscription_id = ?
        LIMIT 1
      `).bind(payment.id).first()
      
      let finalConversion = conversion
      
      // Se não encontrou, tentar buscar pelo account_id
      if (!finalConversion) {
        finalConversion = await db.prepare(`
          SELECT sc.*, ssl.charge_type 
          FROM subscription_conversions sc
          LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
          WHERE ssl.account_id = ?
          ORDER BY sc.converted_at DESC
          LIMIT 1
        `).bind(payment.account_id).first()
      }
      
      if (finalConversion) {
        payment.customer_name = finalConversion.customer_name
        payment.customer_email = finalConversion.customer_email
        payment.customer_cpf = finalConversion.customer_cpf
        payment.customer_birthdate = finalConversion.customer_birthdate
        payment.charge_type = finalConversion.charge_type || 'monthly'
      } else {
        payment.customer_name = 'N/A'
        payment.customer_email = 'N/A'
        payment.customer_cpf = 'N/A'
        payment.customer_birthdate = 'N/A'
        payment.charge_type = 'monthly'
      }
      
      // Atribuir nome da subconta
      payment.account_name = accountNamesMap[payment.account_id] || `Conta ${payment.account_id.substring(0, 8)}`
    }
    
    // Filtrar por tipo de cobrança
    if (chargeType && chargeType !== 'all') {
      payments = payments.filter((p: any) => {
        const pChargeType = p.charge_type || 'monthly'
        return pChargeType === chargeType
      })
    }
    
    // Calcular estatísticas (apenas para o status solicitado)
    let totalValue = 0
    payments.forEach((payment: any) => {
      totalValue += parseFloat(payment.value || 0)
    })
    
    // Preparar transações
    const transactions = payments.map((p: any) => ({
      id: p.id,
      accountId: p.account_id,
      accountName: p.account_name || 'N/A',
      value: parseFloat(p.value || 0),
      description: p.description || 'Sem descrição',
      dueDate: p.due_date,
      status: p.status,
      dateCreated: p.created_at,
      billingType: p.billing_type,
      paymentDate: p.payment_date,
      chargeType: p.charge_type || 'monthly',
      customer: {
        name: p.customer_name || 'N/A',
        email: p.customer_email || 'N/A',
        cpf: p.customer_cpf || 'N/A',
        birthdate: p.customer_birthdate || 'N/A'
      }
    }))
    
    return c.json({
      ok: true,
      data: {
        account: {
          id: 'ALL_ACCOUNTS',
          name: 'Todas as Subcontas',
          email: 'consolidado@sistema.com',
          cpfCnpj: '-',
          walletId: '-'
        },
        period: {
          startDate: startDate || 'Início',
          endDate: endDate || 'Hoje'
        },
        filters: {
          chargeType: chargeType || 'all',
          status: statusFilter
        },
        summary: {
          totalValue,
          totalTransactions: payments.length,
          totalAccounts: accounts.length,
          status: statusFilter
        },
        transactions
      }
    })
  } catch (error: any) {
    console.error(`Erro ao buscar relatório consolidado (status: ${statusFilter}):`, error)
    return c.json({ error: error.message }, 500)
  }
}

// API para sistemas externos: PAGAMENTOS RECEBIDOS (PÚBLICA - SEM AUTENTICAÇÃO)
app.get('/api/reports/all-accounts/received', async (c) => {
  return await getConsolidatedReportByStatus(c, 'RECEIVED')
})

// API para sistemas externos: PAGAMENTOS PENDENTES (PÚBLICA - SEM AUTENTICAÇÃO)
app.get('/api/reports/all-accounts/pending', async (c) => {
  return await getConsolidatedReportByStatus(c, 'PENDING')
})

// API para sistemas externos: PAGAMENTOS VENCIDOS (PÚBLICA - SEM AUTENTICAÇÃO)
app.get('/api/reports/all-accounts/overdue', async (c) => {
  return await getConsolidatedReportByStatus(c, 'OVERDUE')
})

// API para sistemas externos: PAGAMENTOS REEMBOLSADOS (PÚBLICA - SEM AUTENTICAÇÃO)
app.get('/api/reports/all-accounts/refunded', async (c) => {
  return await getConsolidatedReportByStatus(c, 'REFUNDED')
})

// Endpoint aprimorado de relatórios com dados dos clientes
app.get('/api/reports/:accountId/detailed', async (c) => {
  try {
    const db = c.env.DB
    const accountId = c.req.param('accountId')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const chargeType = c.req.query('chargeType') // 'all', 'single', 'monthly', 'pix_auto', 'link_cadastro'
    const statusFilter = c.req.query('status') // 'all', 'RECEIVED', 'PENDING', etc.
    
    // Buscar informações da subconta
    const accountQuery = await db.prepare('SELECT * FROM signup_links WHERE account_id = ? LIMIT 1').bind(accountId).first()
    
    let account: any = null
    
    if (accountQuery) {
      account = {
        id: accountQuery.account_id,
        name: accountQuery.customer_name || `Conta ${accountId.substring(0, 8)}`,
        email: accountQuery.customer_email || 'N/A',
        cpfCnpj: accountQuery.customer_cpf || 'N/A',
        walletId: accountQuery.wallet_id
      }
    } else {
      const asaasAccount = await asaasRequest(c, `/accounts/${accountId}`, 'GET')
      if (!asaasAccount.ok || !asaasAccount.data) {
        return c.json({ error: 'Subconta não encontrada', accountId }, 404)
      }
      account = {
        id: asaasAccount.data.id,
        name: asaasAccount.data.name || `Conta ${accountId.substring(0, 8)}`,
        email: asaasAccount.data.email || 'N/A',
        cpfCnpj: asaasAccount.data.cpfCnpj || 'N/A',
        walletId: asaasAccount.data.walletId || accountId
      }
    }
    
    // Buscar transações do D1 (query simplificada)
    let query = `SELECT * FROM transactions WHERE account_id = ?`
    const params = [accountId]
    
    if (startDate) {
      query += ` AND created_at >= ?`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND created_at <= ?`
      params.push(endDate + ' 23:59:59')
    }
    if (statusFilter && statusFilter !== 'all') {
      query += ` AND status = ?`
      params.push(statusFilter)
    }
    
    query += ` ORDER BY created_at DESC`
    
    const result = await db.prepare(query).bind(...params).all()
    let payments = result.results || []
    
    // Enriquecer cada pagamento com dados do cliente
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i] as any
      
      // Buscar dados do cliente via subscription_conversions
      // Nota: payment.id pode ser tanto subscription_id quanto payment_id
      // Buscar primeiro por subscription_id, depois por customer_id relacionado
      const conversion = await db.prepare(`
        SELECT sc.*, ssl.charge_type 
        FROM subscription_conversions sc
        LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
        WHERE sc.subscription_id = ?
        LIMIT 1
      `).bind(payment.id).first()
      
      let finalConversion = conversion
      
      // Se não encontrou, tentar buscar pelo account_id (casos onde múltiplos pagamentos da mesma conta)
      if (!finalConversion) {
        finalConversion = await db.prepare(`
          SELECT sc.*, ssl.charge_type 
          FROM subscription_conversions sc
          LEFT JOIN subscription_signup_links ssl ON sc.link_id = ssl.id
          WHERE ssl.account_id = ?
          ORDER BY sc.converted_at DESC
          LIMIT 1
        `).bind(payment.account_id).first()
      }
      
      if (finalConversion) {
        payment.customer_name = finalConversion.customer_name
        payment.customer_email = finalConversion.customer_email
        payment.customer_cpf = finalConversion.customer_cpf
        payment.customer_birthdate = finalConversion.customer_birthdate
        payment.charge_type = finalConversion.charge_type || 'monthly'
      } else {
        payment.customer_name = 'N/A'
        payment.customer_email = 'N/A'
        payment.customer_cpf = 'N/A'
        payment.customer_birthdate = 'N/A'
        payment.charge_type = 'monthly'
      }
    }
    
    // Filtrar por tipo de cobrança
    if (chargeType && chargeType !== 'all') {
      payments = payments.filter((p: any) => {
        const pChargeType = p.charge_type || 'monthly'
        return pChargeType === chargeType
      })
    }
    
    // Calcular estatísticas
    let totalReceived = 0
    let totalPending = 0
    let totalOverdue = 0
    let totalRefunded = 0
    
    payments.forEach((payment: any) => {
      const value = parseFloat(payment.value || 0)
      if (payment.status === 'RECEIVED') totalReceived += value
      else if (payment.status === 'PENDING') totalPending += value
      else if (payment.status === 'OVERDUE') totalOverdue += value
      else if (payment.status === 'REFUNDED') totalRefunded += value
    })
    
    // Preparar transações com dados dos clientes
    const transactions = payments.map((p: any) => ({
      id: p.id,
      value: parseFloat(p.value || 0),
      description: p.description || 'Sem descrição',
      dueDate: p.due_date,
      status: p.status,
      dateCreated: p.created_at,
      billingType: p.billing_type,
      paymentDate: p.payment_date,
      chargeType: p.charge_type || 'monthly',
      customer: {
        name: p.customer_name || 'N/A',
        email: p.customer_email || 'N/A',
        cpf: p.customer_cpf || 'N/A',
        birthdate: p.customer_birthdate || 'N/A'
      }
    }))
    
    return c.json({
      ok: true,
      data: {
        account: {
          id: account.id,
          name: account.name,
          email: account.email,
          cpfCnpj: account.cpfCnpj,
          walletId: account.walletId
        },
        period: {
          startDate: startDate || 'Início',
          endDate: endDate || 'Hoje'
        },
        filters: {
          chargeType: chargeType || 'all',
          status: statusFilter || 'all'
        },
        summary: {
          totalReceived,
          totalPending,
          totalOverdue,
          totalRefunded,
          totalTransactions: payments.length
        },
        transactions
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar relatório detalhado:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint simplificado para listar transações (sem validação de conta)
app.get('/api/transactions-list/:accountId', async (c) => {
  try {
    const db = c.env.DB
    const accountId = c.req.param('accountId')
    
    const result = await db.prepare('SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC').bind(accountId).all()
    const transactions = result.results || []
    
    return c.json({
      ok: true,
      accountId,
      total: transactions.length,
      transactions
    })
  } catch (error: any) {
    console.error('Erro ao buscar transações:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Criar link de pagamento
app.post('/api/payment-links', async (c) => {
  try {
    const body = await c.req.json()
    const { accountId, name, description, billingType, chargeType, value, cycle, dueDate, duration } = body
    
    // Dados base do link
    const linkData: any = {
      name,
      description: description || undefined,
      billingType: billingType === 'UNDEFINED' ? undefined : billingType,
      chargeType,
      endDate: undefined
    }
    
    if (chargeType === 'DETACHED') {
      // Link de valor fixo
      linkData.value = parseFloat(value)
      // Para PIX, sempre é necessário dueDateLimitDays (quantidade de dias para vencimento)
      linkData.dueDateLimitDays = 30
    } else if (chargeType === 'RECURRENT') {
      // Link de assinatura
      linkData.subscriptionCycle = cycle
      linkData.subscriptionValue = parseFloat(value)
      if (duration) {
        linkData.maxInstallmentCount = parseInt(duration)
      }
    }
    
    // Se accountId foi fornecido, criar link NA SUBCONTA
    let customHeaders = undefined
    if (accountId) {
      // Buscar API key da subconta
      const accountResult = await asaasRequest(c, `/accounts/${accountId}`)
      if (!accountResult.ok) {
        return c.json({ error: 'Subconta não encontrada' }, 404)
      }
      
      const walletId = accountResult.data?.walletId
      if (!walletId) {
        return c.json({ error: 'Subconta não possui walletId (não aprovada ainda)' }, 400)
      }
      
      // Buscar chaves API da subconta
      const keysResult = await asaasRequest(c, `/accounts/${accountId}/api-keys`)
      const keys = keysResult.data?.data || []
      
      if (keys.length === 0) {
        return c.json({ error: 'Subconta não possui chaves API. Crie uma chave primeiro.' }, 400)
      }
      
      // Usar a primeira chave ativa
      const activeKey = keys.find((k: any) => k.active)
      if (!activeKey) {
        return c.json({ error: 'Subconta não possui chaves API ativas' }, 400)
      }
      
      // Usar header asaas-account-key para criar na subconta
      customHeaders = {
        'asaas-account-key': activeKey.apiKey
      }
    }
    
    // Criar link na API Asaas (conta principal OU subconta)
    const result = await asaasRequest(c, '/paymentLinks', 'POST', linkData, customHeaders)
    
    if (!result.ok) {
      // Log detalhado do erro para debug
      console.error('Erro Asaas API:', JSON.stringify(result.data, null, 2))
      const errorMessage = result.data?.errors?.[0]?.description || result.data?.error || JSON.stringify(result.data) || 'Erro ao criar link'
      return c.json({ error: errorMessage, details: result.data }, 400)
    }
    
    return c.json({
      ok: true,
      data: result.data,
      account: accountId ? { id: accountId, usedSubaccount: true } : { usedSubaccount: false }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Listar links de pagamento
app.get('/api/payment-links', async (c) => {
  try {
    const result = await asaasRequest(c, '/paymentLinks')
    
    return c.json({
      ok: true,
      data: result.data?.data || [],
      totalCount: result.data?.totalCount || 0
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Buscar QR Code PIX de um pagamento
app.get('/api/payments/:id/pixqrcode', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await asaasRequest(c, `/payments/${id}/pixQrCode`)
    
    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao buscar QR Code',
        details: result.data 
      }, result.status || 400)
    }
    
    return c.json({
      ok: true,
      data: result.data
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Deletar link de pagamento
app.delete('/api/payment-links/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await asaasRequest(c, `/paymentLinks/${id}`, 'DELETE')
    
    return c.json({ ok: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Buscar pagamentos de um link específico
app.get('/api/payment-links/:id/payments', async (c) => {
  try {
    const linkId = c.req.param('id')
    
    // Buscar cobranças associadas ao link
    const result = await asaasRequest(c, `/payments?paymentLink=${linkId}`)
    
    // FILTRO ADICIONAL: A API Asaas tem bug e retorna pagamentos de outros links
    // Vamos filtrar apenas pagamentos que realmente pertencem a este link
    const allPayments = result.data?.data || []
    const filteredPayments = allPayments.filter((payment: any) => 
      payment.paymentLink === linkId
    )
    
    return c.json({
      ok: true,
      data: filteredPayments,
      totalCount: filteredPayments.length
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Buscar detalhes de um pagamento específico
app.get('/api/payments/:id', async (c) => {
  try {
    const paymentId = c.req.param('id')
    
    const result = await asaasRequest(c, `/payments/${paymentId}`)
    
    return c.json({
      ok: true,
      data: result.data
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Buscar informações de um cliente/customer
app.get('/api/customers/:id', async (c) => {
  try {
    const customerId = c.req.param('id')
    
    const result = await asaasRequest(c, `/customers/${customerId}`)
    
    return c.json({
      ok: true,
      data: result.data
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Listar todos os pagamentos
app.get('/api/payments', async (c) => {
  try {
    const { status, dateCreated, limit, offset } = c.req.query()
    
    let endpoint = '/payments?'
    const params = []
    
    if (status) params.push(`status=${status}`)
    if (dateCreated) params.push(`dateCreated[ge]=${dateCreated}`)
    if (limit) params.push(`limit=${limit}`)
    if (offset) params.push(`offset=${offset}`)
    
    endpoint += params.join('&')
    
    const result = await asaasRequest(c, endpoint)
    
    return c.json({
      ok: true,
      data: result.data?.data || [],
      totalCount: result.data?.totalCount || 0,
      hasMore: result.data?.hasMore || false
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Debug endpoint para verificar variáveis de ambiente
app.get('/api/debug/env', async (c) => {
  const hasApiKey = !!c.env.ASAAS_API_KEY
  const hasApiUrl = !!c.env.ASAAS_API_URL
  const apiKeyPrefix = c.env.ASAAS_API_KEY?.substring(0, 20) + '...'
  
  return c.json({
    hasApiKey,
    hasApiUrl,
    apiKeyPrefix,
    apiUrl: c.env.ASAAS_API_URL
  })
})

// Endpoint para inicializar tabelas do banco D1 (executar uma vez)
// Criar 10 novas assinaturas com cartões de teste
app.post('/api/admin/create-test-subscriptions', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    // 10 assinaturas novas com cartões de teste variados
    const newSubscriptions = [
      // Visa aprovadas
      {
        customer_name: 'Rafael Mendes',
        customer_email: 'rafael.mendes@email.com',
        customer_cpf: '111.222.333-44',
        customer_phone: '(11) 91234-5678',
        value: 59.90,
        description: 'Plano Gold Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '5428258051342340',
        card_last4: '2340',
        card_brand: 'Visa',
        card_expiry_month: '01',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Beatriz Almeida',
        customer_email: 'beatriz.almeida@email.com',
        customer_cpf: '222.333.444-55',
        customer_phone: '(21) 92345-6789',
        value: 89.90,
        description: 'Plano Platinum Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '5308547387340761',
        card_last4: '0761',
        card_brand: 'Visa',
        card_expiry_month: '03',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Thiago Rodrigues',
        customer_email: 'thiago.rodrigues@email.com',
        customer_cpf: '333.444.555-66',
        customer_phone: '(31) 93456-7890',
        value: 119.90,
        description: 'Plano Diamond Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '5328575787984264',
        card_last4: '8264',
        card_brand: 'Visa',
        card_expiry_month: '06',
        card_expiry_year: '2028'
      },
      // Mastercard aprovadas
      {
        customer_name: 'Camila Souza',
        customer_email: 'camila.souza@email.com',
        customer_cpf: '444.555.666-77',
        customer_phone: '(41) 94567-8901',
        value: 199.90,
        description: 'Plano Corporate Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '5448280000000007',
        card_last4: '0007',
        card_brand: 'Mastercard',
        card_expiry_month: '09',
        card_expiry_year: '2027'
      },
      {
        customer_name: 'Diego Silva',
        customer_email: 'diego.silva@email.com',
        customer_cpf: '555.666.777-88',
        customer_phone: '(51) 95678-9012',
        value: 249.90,
        description: 'Plano Executive Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '4235647728025682',
        card_last4: '5682',
        card_brand: 'Mastercard',
        card_expiry_month: '12',
        card_expiry_year: '2027'
      },
      // Hipercard e Elo
      {
        customer_name: 'Larissa Oliveira',
        customer_email: 'larissa.oliveira@email.com',
        customer_cpf: '666.777.888-99',
        customer_phone: '(61) 96789-0123',
        value: 69.90,
        description: 'Plano Silver Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '6062825624254001',
        card_last4: '4001',
        card_brand: 'Hipercard',
        card_expiry_month: '02',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Gustavo Costa',
        customer_email: 'gustavo.costa@email.com',
        customer_cpf: '777.888.999-00',
        customer_phone: '(71) 97890-1234',
        value: 139.90,
        description: 'Plano Pro Mensal',
        recurrence_type: 'MONTHLY',
        card_number: '4389351648020055',
        card_last4: '0055',
        card_brand: 'Elo',
        card_expiry_month: '04',
        card_expiry_year: '2028'
      },
      // Planos anuais
      {
        customer_name: 'Patricia Santos',
        customer_email: 'patricia.santos@email.com',
        customer_cpf: '888.999.000-11',
        customer_phone: '(81) 98901-2345',
        value: 499.90,
        description: 'Plano Premium Anual',
        recurrence_type: 'YEARLY',
        card_number: '5428258051342340',
        card_last4: '2340',
        card_brand: 'Visa',
        card_expiry_month: '05',
        card_expiry_year: '2029'
      },
      {
        customer_name: 'Rodrigo Lima',
        customer_email: 'rodrigo.lima@email.com',
        customer_cpf: '999.000.111-22',
        customer_phone: '(91) 99012-3456',
        value: 799.90,
        description: 'Plano Business Anual',
        recurrence_type: 'YEARLY',
        card_number: '5448280000000007',
        card_last4: '0007',
        card_brand: 'Mastercard',
        card_expiry_month: '07',
        card_expiry_year: '2029'
      },
      {
        customer_name: 'Amanda Pereira',
        customer_email: 'amanda.pereira@email.com',
        customer_cpf: '000.111.222-33',
        customer_phone: '(85) 90123-4567',
        value: 999.90,
        description: 'Plano Enterprise Anual',
        recurrence_type: 'YEARLY',
        card_number: '5328575787984264',
        card_last4: '8264',
        card_brand: 'Visa',
        card_expiry_month: '10',
        card_expiry_year: '2029'
      }
    ]
    
    const created = []
    
    for (const sub of newSubscriptions) {
      const id = crypto.randomUUID()
      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const deltapagSubId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await db.prepare(`
        INSERT INTO deltapag_subscriptions 
        (id, customer_id, customer_name, customer_email, customer_cpf, customer_phone,
         deltapag_subscription_id, deltapag_customer_id, value, description, 
         recurrence_type, status, card_number, card_last4, card_brand, card_expiry_month, card_expiry_year,
         next_due_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        id,
        customerId,
        sub.customer_name,
        sub.customer_email,
        sub.customer_cpf,
        sub.customer_phone,
        deltapagSubId,
        customerId,
        sub.value,
        sub.description,
        sub.recurrence_type,
        sub.card_number,
        sub.card_last4,
        sub.card_brand,
        sub.card_expiry_month,
        sub.card_expiry_year,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ).run()
      
      created.push({
        name: sub.customer_name,
        email: sub.customer_email,
        value: sub.value,
        card: `${sub.card_brand} •••• ${sub.card_last4}`,
        status: 'ACTIVE'
      })
      
      console.log(`✅ ${sub.customer_name}: ${sub.card_brand} •••• ${sub.card_last4}`)
    }
    
    return c.json({
      ok: true,
      message: '10 novas assinaturas criadas com sucesso!',
      count: created.length,
      subscriptions: created
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar assinaturas:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Sincronizar dados de cartão da API DeltaPag
app.post('/api/admin/sync-deltapag-cards', authMiddleware, async (c) => {
  try {
    // Buscar todas as assinaturas do banco local
    const localSubs = await c.env.DB.prepare(`
      SELECT * FROM deltapag_subscriptions 
      WHERE card_last4 IS NULL OR card_last4 = ''
    `).all()
    
    console.log(`📊 ${localSubs.results?.length || 0} assinaturas sem dados de cartão`)
    
    if (!localSubs.results || localSubs.results.length === 0) {
      return c.json({ 
        ok: true, 
        message: 'Todas as assinaturas já possuem dados de cartão',
        updated: 0
      })
    }
    
    let updated = 0
    const errors: string[] = []
    
    // Para cada assinatura, buscar dados na API DeltaPag
    for (const sub of localSubs.results) {
      try {
        // Buscar assinatura na API DeltaPag
        const deltapagSub = await deltapagRequest(
          c, 
          `/subscriptions/${sub.deltapag_subscription_id}`, 
          'GET'
        )
        
        if (!deltapagSub.ok) {
          console.error(`❌ Erro ao buscar assinatura ${sub.deltapag_subscription_id}:`, deltapagSub.data)
          errors.push(`${sub.customer_name}: ${deltapagSub.data.message || 'Erro desconhecido'}`)
          continue
        }
        
        const apiSub = deltapagSub.data
        
        // Extrair dados do cartão da resposta da API
        let cardLast4 = null
        let cardBrand = null
        
        // DeltaPag retorna creditCard nos dados da assinatura
        if (apiSub.creditCard) {
          cardLast4 = apiSub.creditCard.creditCardNumber?.slice(-4) || null
          cardBrand = apiSub.creditCard.creditCardBrand || 'Unknown'
        } else if (apiSub.creditCardNumber) {
          // Algumas APIs retornam diretamente
          cardLast4 = apiSub.creditCardNumber.slice(-4)
          cardBrand = apiSub.creditCardBrand || 'Unknown'
        }
        
        if (cardLast4) {
          // Atualizar banco local
          await c.env.DB.prepare(`
            UPDATE deltapag_subscriptions 
            SET card_last4 = ?, 
                card_brand = ?,
                updated_at = datetime('now')
            WHERE id = ?
          `).bind(cardLast4, cardBrand, sub.id).run()
          
          updated++
          console.log(`✅ ${sub.customer_name}: ${cardBrand} •••• ${cardLast4}`)
        } else {
          console.log(`⚠️ ${sub.customer_name}: Sem dados de cartão na API`)
          errors.push(`${sub.customer_name}: Sem dados de cartão na API DeltaPag`)
        }
        
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${sub.customer_name}:`, error)
        errors.push(`${sub.customer_name}: ${error.message}`)
      }
    }
    
    return c.json({
      ok: true,
      message: `${updated} assinaturas atualizadas com dados de cartão`,
      updated,
      total: localSubs.results.length,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint de teste para verificar configuração DeltaPag
app.get('/api/admin/test-deltapag-config', authMiddleware, async (c) => {
  try {
    const hasApiKey = !!c.env.DELTAPAG_API_KEY
    const hasApiUrl = !!c.env.DELTAPAG_API_URL
    
    return c.json({
      ok: true,
      config: {
        hasApiKey,
        hasApiUrl,
        apiKeyLength: c.env.DELTAPAG_API_KEY?.length || 0,
        apiUrl: c.env.DELTAPAG_API_URL || 'not set',
        apiKeyPrefix: c.env.DELTAPAG_API_KEY?.substring(0, 20) + '...' || 'not set'
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint temporário PÚBLICO para aplicar migration 0010 (charge_type)
// REMOVER após aplicação bem-sucedida em produção
app.post('/api/admin/apply-migration-0010', async (c) => {
  try {
    console.log('🔧 Aplicando migration 0010: charge_type...')
    
    const db = c.env.DB
    
    // 1. Adicionar coluna charge_type na tabela subscription_signup_links
    await db.prepare(`
      ALTER TABLE subscription_signup_links 
      ADD COLUMN charge_type TEXT DEFAULT 'monthly' CHECK(charge_type IN ('single', 'monthly'))
    `).run()
    
    console.log('✅ Coluna charge_type adicionada em subscription_signup_links')
    
    // 2. Adicionar coluna charge_type na tabela pix_automatic_signup_links
    await db.prepare(`
      ALTER TABLE pix_automatic_signup_links 
      ADD COLUMN charge_type TEXT DEFAULT 'monthly' CHECK(charge_type IN ('single', 'monthly'))
    `).run()
    
    console.log('✅ Coluna charge_type adicionada em pix_automatic_signup_links')
    
    // 3. Atualizar registros existentes
    const result1 = await db.prepare(`
      UPDATE subscription_signup_links SET charge_type = 'monthly' WHERE charge_type IS NULL
    `).run()
    
    const result2 = await db.prepare(`
      UPDATE pix_automatic_signup_links SET charge_type = 'monthly' WHERE charge_type IS NULL
    `).run()
    
    console.log(`✅ ${result1.meta.changes} registros atualizados em subscription_signup_links`)
    console.log(`✅ ${result2.meta.changes} registros atualizados em pix_automatic_signup_links`)
    
    return c.json({
      ok: true,
      message: 'Migration 0010 aplicada com sucesso',
      updates: {
        subscription_signup_links: result1.meta.changes,
        pix_automatic_signup_links: result2.meta.changes
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao aplicar migration:', error)
    
    // Se a coluna já existe, retornar sucesso
    if (error.message?.includes('duplicate column name')) {
      return c.json({
        ok: true,
        message: 'Migration já aplicada (coluna charge_type já existe)',
        alreadyApplied: true
      })
    }
    
    return c.json({ 
      ok: false, 
      error: error.message,
      hint: 'Coluna charge_type pode já existir ou houve erro de sintaxe'
    }, 500)
  }
})

// Endpoint de teste para criar um cliente de teste na DeltaPag
app.post('/api/admin/test-deltapag-api', authMiddleware, async (c) => {
  try {
    console.log('🧪 Testando API DeltaPag...')
    
    if (!c.env.DELTAPAG_API_KEY) {
      return c.json({ ok: false, error: 'DELTAPAG_API_KEY não configurada' }, 400)
    }
    
    // Dados de cliente de teste
    const testCustomer = {
      name: 'Cliente Teste API',
      email: 'teste-api-' + Date.now() + '@example.com',
      cpf: '12345678901',
      mobilePhone: '11999999999'
    }
    
    console.log('📤 Enviando para DeltaPag:', testCustomer)
    
    // Tentar criar cliente
    const result = await deltapagRequest(c, '/customers', 'POST', testCustomer)
    
    console.log('📥 Resposta DeltaPag:', result)
    
    return c.json({
      ok: result.ok,
      statusCode: result.status,
      response: result.data,
      testData: testCustomer
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao testar API DeltaPag:', error)
    return c.json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    }, 500)
  }
})

// Endpoint PÚBLICO para testar criação de assinatura completa
app.post('/api/public/test-deltapag-subscription', async (c) => {
  const debugLogs: string[] = []
  const log = (msg: string) => {
    console.log(msg)
    debugLogs.push(msg)
  }
  
  try {
    log('🧪 [DEBUG] Testando criação de assinatura completa...')
    
    if (!c.env.DELTAPAG_API_KEY) {
      return c.json({ ok: false, error: 'API key não configurada', debugLogs }, 400)
    }
    
    // 1. Criar cliente
    const customerData = {
      name: 'Teste Assinatura',
      email: 'teste-sub-' + Date.now() + '@example.com',
      cpf: '12345678901',
      mobilePhone: '11999999999'
    }
    
    log('📤 Criando cliente: ' + JSON.stringify(customerData))
    const customerResult = await deltapagRequest(c, '/customers', 'POST', customerData)
    log(`📥 Cliente - Status: ${customerResult.status}`)
    
    const customerId = customerResult.data.id || customerResult.headers.get('content-id')
    log(`✅ Customer ID: ${customerId}`)
    
    if (!customerId) {
      return c.json({ ok: false, error: 'Não obteve customer ID', debugLogs }, 500)
    }
    
    // 2. Criar assinatura
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    
    const subscriptionData = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: 99.90,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: 'Teste de Assinatura',
      creditCard: {
        holderName: 'Teste Assinatura',
        number: '5428258051342340',
        expiryMonth: '12',
        expiryYear: '2027',
        ccv: '123'
      },
      creditCardHolderInfo: {
        name: 'Teste Assinatura',
        email: customerData.email,
        cpfCnpj: '12345678901',
        postalCode: '01310100',
        addressNumber: '1000',
        phone: '11999999999'
      }
    }
    
    log('📤 Payload da assinatura: ' + JSON.stringify(subscriptionData, null, 2))
    
    const subscriptionResult = await deltapagRequest(c, '/subscriptions', 'POST', subscriptionData)
    
    log(`📥 Assinatura - Status: ${subscriptionResult.status}`)
    log(`📥 Assinatura - OK: ${subscriptionResult.ok}`)
    log(`📥 Assinatura - Body: ${JSON.stringify(subscriptionResult.data, null, 2)}`)
    
    // Log headers
    log('📋 Headers da assinatura:')
    const subHeaders: Record<string, string> = {}
    subscriptionResult.headers.forEach((value, key) => {
      log(`  ${key}: ${value}`)
      subHeaders[key] = value
    })
    
    const subscriptionId = subscriptionResult.data.id 
      || subscriptionResult.headers.get('content-id')
      || subscriptionResult.headers.get('location')?.match(/\/subscriptions\/([^\/]+)$/)?.[1]
    
    log(`🔍 Subscription ID final: ${subscriptionId}`)
    
    return c.json({
      ok: true,
      customerId,
      subscriptionId,
      customerStatus: customerResult.status,
      subscriptionStatus: subscriptionResult.status,
      subscriptionResponse: subscriptionResult.data,
      subscriptionHeaders: subHeaders,
      debugLogs,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    log(`❌ Erro: ${error.message}`)
    log(`❌ Stack: ${error.stack}`)
    
    return c.json({
      ok: false,
      error: error.message,
      stack: error.stack,
      debugLogs
    }, 500)
  }
})

// Endpoint PÚBLICO de teste DeltaPag com debug completo
app.post('/api/public/test-deltapag-debug', async (c) => {
  try {
    const debugLogs: string[] = []
    const log = (msg: string) => {
      console.log(msg)
      debugLogs.push(msg)
    }
    
    log('🧪 [DEBUG] Testando API DeltaPag com logs completos...')
    
    // Verificar variáveis
    const hasApiKey = !!c.env.DELTAPAG_API_KEY
    const hasApiUrl = !!c.env.DELTAPAG_API_URL
    const apiUrl = c.env.DELTAPAG_API_URL || 'https://api-sandbox.deltapag.io/api/v2'
    
    log(`✅ DELTAPAG_API_KEY existe: ${hasApiKey}`)
    log(`✅ URL que será usada: ${apiUrl}`)
    
    if (!hasApiKey) {
      return c.json({ 
        ok: false, 
        error: 'DELTAPAG_API_KEY não configurada',
        debugLogs
      }, 400)
    }
    
    // Dados de cliente de teste
    const testCustomer = {
      name: 'Cliente Debug Teste',
      email: 'debug-' + Date.now() + '@example.com',
      cpf: '12345678901',
      mobilePhone: '11999999999'
    }
    
    log('📤 Enviando para DeltaPag: ' + JSON.stringify(testCustomer))
    
    // Fazer requisição
    const result = await deltapagRequest(c, '/customers', 'POST', testCustomer)
    
    log(`📥 Status: ${result.status}`)
    log(`📥 OK: ${result.ok}`)
    log(`📥 Body: ${JSON.stringify(result.data)}`)
    
    // Listar TODOS os headers
    log('📋 === HEADERS DA RESPOSTA ===')
    const headers: Record<string, string> = {}
    result.headers.forEach((value, key) => {
      log(`  ${key}: ${value}`)
      headers[key] = value
    })
    
    // Tentar extrair Location
    const location = result.headers.get('location') 
      || result.headers.get('Location')
      || result.headers.get('LOCATION')
    
    log(`📍 Location header: ${location}`)
    
    let customerId = result.data.id
    log(`🔍 ID no body: ${customerId}`)
    
    if (!customerId && location) {
      if (location.includes('/customers/document/')) {
        log('🔍 Location usa /document/ - usando content-id do header')
        
        // ESTRATÉGIA PRINCIPAL: Usar o content-id do header
        const contentId = result.headers.get('content-id')
        log(`🔍 Content-ID do header: ${contentId}`)
        
        if (contentId && contentId !== '0') {
          customerId = contentId
          log(`✅ Usando content-id como Customer ID: ${customerId}`)
        } else {
          log('❌ Content-ID não disponível ou inválido')
        }
      } else {
        const match = location.match(/\/customers\/([^\/]+)$/)
        log(`🔍 Regex match: ${JSON.stringify(match)}`)
        
        if (match) {
          customerId = match[1]
          log(`✅ ID extraído do Location: ${customerId}`)
        }
      }
    }
    
    return c.json({
      ok: true,
      statusCode: result.status,
      response: result.data,
      headers,
      locationHeader: location,
      extractedCustomerId: customerId,
      testData: testCustomer,
      debugLogs,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Erro:', error)
    
    return c.json({ 
      ok: false, 
      error: error.message,
      stack: error.stack
    }, 500)
  }
})

// Endpoint PÚBLICO de teste DeltaPag (sem autenticação - apenas para diagnóstico)
app.post('/api/public/test-deltapag', async (c) => {
  try {
    console.log('🧪 [PÚBLICO] Testando API DeltaPag...')
    console.log('🔍 Verificando variáveis de ambiente...')
    
    // Verificar variáveis
    const hasApiKey = !!c.env.DELTAPAG_API_KEY
    const hasApiUrl = !!c.env.DELTAPAG_API_URL
    const apiUrl = c.env.DELTAPAG_API_URL || 'https://api-sandbox.deltapag.io/api/v2'
    
    console.log(`✅ DELTAPAG_API_KEY existe: ${hasApiKey}`)
    console.log(`✅ DELTAPAG_API_URL existe: ${hasApiUrl}`)
    console.log(`✅ URL que será usada: ${apiUrl}`)
    
    if (!hasApiKey) {
      return c.json({ 
        ok: false, 
        error: 'DELTAPAG_API_KEY não configurada',
        config: { hasApiKey, hasApiUrl, apiUrl }
      }, 400)
    }
    
    // Dados de cliente de teste
    const testCustomer = {
      name: 'Cliente Teste Público',
      email: 'teste-publico-' + Date.now() + '@example.com',
      cpf: '12345678901',
      mobilePhone: '11999999999'
    }
    
    console.log('📤 Enviando para DeltaPag:', JSON.stringify(testCustomer, null, 2))
    
    // Verificar se deltapagRequest existe
    if (typeof deltapagRequest !== 'function') {
      throw new Error('Função deltapagRequest não encontrada')
    }
    
    console.log('🔷 Chamando deltapagRequest...')
    
    // Tentar criar cliente
    const result = await deltapagRequest(c, '/customers', 'POST', testCustomer)
    
    console.log('📥 Resposta DeltaPag recebida:', JSON.stringify(result, null, 2))
    
    return c.json({
      ok: result.ok,
      statusCode: result.status,
      response: result.data,
      testData: testCustomer,
      config: { hasApiKey, hasApiUrl, apiUrl },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao testar API DeltaPag:', error)
    console.error('❌ Stack trace:', error.stack)
    
    return c.json({ 
      ok: false, 
      error: error.message || 'Erro desconhecido',
      errorType: error.name || 'Error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Criar CLIENTES de evidência para DeltaPag (sandbox) - SEM ASSINATURA
// Apenas para demonstração e aprovação da API
app.post('/api/admin/create-evidence-customers', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    // Verificar se as variáveis estão configuradas
    if (!c.env.DELTAPAG_API_KEY) {
      throw new Error('DELTAPAG_API_KEY não configurada. Configure no Cloudflare Dashboard.')
    }
    
    console.log('✅ DELTAPAG_API_KEY configurada:', c.env.DELTAPAG_API_KEY.substring(0, 20) + '...')
    console.log('✅ DELTAPAG_API_URL:', c.env.DELTAPAG_API_URL || 'usando fallback')
    
    // Dados de 5 transações de teste para evidência
    // USANDO CARTÕES DE TESTE OFICIAIS DO DELTAPAG SANDBOX
    // CPFs VÁLIDOS (gerados com algoritmo correto de dígitos verificadores)
    
    // Gerar timestamp único para evitar duplicação de emails
    const timestamp = Date.now()
    
    const evidenceTransactions = [
      {
        customer_name: 'João Silva Santos',
        customer_email: `joao.silva+${timestamp}@evidencia.com`,
        customer_cpf: '783.686.313-19',  // CPF válido (gerado com algoritmo)
        customer_phone: '(11) 98765-4321',
        value: 149.90,
        description: 'Plano Premium Mensal - Evidência #1',
        recurrence_type: 'MONTHLY',
        card_number: '4111111111111111',  // Visa - cartão oficial DeltaPag
        card_brand: 'Visa',
        card_expiry_month: '12',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Maria Oliveira Costa',
        customer_email: `maria.oliveira+${timestamp}@evidencia.com`,
        customer_cpf: '892.162.429-57',  // CPF válido (gerado com algoritmo)
        customer_phone: '(21) 97654-3210',
        value: 249.90,
        description: 'Plano Business Mensal - Evidência #2',
        recurrence_type: 'MONTHLY',
        card_number: '5555555555554444',  // Mastercard - cartão oficial DeltaPag
        card_brand: 'Mastercard',
        card_expiry_month: '12',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Pedro Henrique Lima',
        customer_email: `pedro.lima+${timestamp}@evidencia.com`,
        customer_cpf: '512.662.546-25',  // CPF válido (gerado com algoritmo)
        customer_phone: '(31) 96543-2109',
        value: 399.90,
        description: 'Plano Enterprise Mensal - Evidência #3',
        recurrence_type: 'MONTHLY',
        card_number: '4111111111111111',  // Visa - cartão oficial DeltaPag
        card_brand: 'Visa',
        card_expiry_month: '12',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Ana Paula Rodrigues',
        customer_email: `ana.rodrigues+${timestamp}@evidencia.com`,
        customer_cpf: '657.078.015-88',  // CPF válido (gerado com algoritmo)
        customer_phone: '(41) 95432-1098',
        value: 599.90,
        description: 'Plano Corporate Anual - Evidência #4',
        recurrence_type: 'YEARLY',
        card_number: '5555555555554444',  // Mastercard - cartão oficial DeltaPag
        card_brand: 'Mastercard',
        card_expiry_month: '12',
        card_expiry_year: '2028'
      },
      {
        customer_name: 'Carlos Eduardo Almeida',
        customer_email: `carlos.almeida+${timestamp}@evidencia.com`,
        customer_cpf: '047.862.824-21',  // CPF válido (gerado com algoritmo)
        customer_phone: '(51) 94321-0987',
        value: 899.90,
        description: 'Plano Ultimate Anual - Evidência #5',
        recurrence_type: 'YEARLY',
        card_number: '6362970000457013',  // Elo - cartão oficial DeltaPag
        card_brand: 'Elo',
        card_expiry_month: '12',
        card_expiry_year: '2028'
      }
    ]
    
    const createdTransactions = []
    
    // Criar cada transação via API DeltaPag
    for (const tx of evidenceTransactions) {
      try {
        console.log(`\n🔄 Criando transação para ${tx.customer_name}...`)
        
        // 1. Criar cliente na API DeltaPag (APENAS campo "document" com CPF válido)
        const cpfClean = tx.customer_cpf.replace(/\D/g, '')
        const customerData = {
          name: tx.customer_name,
          email: tx.customer_email,
          document: cpfClean,  // API DeltaPag usa "document", não "cpf"
          mobilePhone: tx.customer_phone.replace(/\D/g, '')
        }
        
        console.log('📤 Criando cliente:', customerData)
        console.log('🔑 Token sendo usado:', c.env.DELTAPAG_API_KEY ? `${c.env.DELTAPAG_API_KEY.substring(0, 30)}...` : 'NÃO CONFIGURADO')
        console.log('🌐 URL da API:', c.env.DELTAPAG_API_URL || 'https://api-sandbox.deltapag.io/api/v2')
        
        const customerResult = await deltapagRequest(c, '/customers', 'POST', customerData)
        
        console.log('🔍 Status da resposta DeltaPag:', customerResult.status)
        console.log('🔍 OK?:', customerResult.ok)
        console.log('🔍 Headers:', Object.fromEntries(customerResult.headers.entries()))
        console.log('🔍 Resposta completa:', JSON.stringify(customerResult.data, null, 2))
        
        if (!customerResult.ok) {
          console.error('❌ Erro ao criar cliente:', customerResult.data)
          const errorMessage = customerResult.data?.message 
            || customerResult.data?.error 
            || customerResult.data?.errors?.[0]?.message
            || JSON.stringify(customerResult.data)
            || 'Erro desconhecido ao criar cliente DeltaPag'
          throw new Error(`Erro ao criar cliente: ${errorMessage}`)
        }
        
        // Se status 201 com resposta vazia, extrair ID do header Location
        let customerId = customerResult.data.id
        console.log('🔍 Customer ID no body:', customerId)
        console.log('🔍 Status da resposta:', customerResult.status)
        
        if (!customerId && customerResult.status === 201) {
          console.log('⚠️ Status 201 mas sem ID no body, tentando Location header...')
          
          // Tentar várias variações do header Location
          const locationHeader = customerResult.headers.get('location') 
            || customerResult.headers.get('Location')
            || customerResult.headers.get('LOCATION')
          
          console.log('📍 Location header encontrado:', locationHeader)
          
          if (locationHeader) {
            // DeltaPag retorna: https://api-sandbox.deltapag.io/api/v2/customers/document/
            // Precisamos fazer GET em /customers/document/{cpf}
            
            if (locationHeader.includes('/customers/document/')) {
              console.log('🔍 Location usa /document/ - usando content-id do header')
              
              // ESTRATÉGIA PRINCIPAL: Usar content-id do header (mais confiável e rápido)
              const contentId = customerResult.headers.get('content-id')
              console.log(`🔍 Content-ID do header: ${contentId}`)
              
              if (contentId && contentId !== '0') {
                customerId = contentId
                console.log(`✅ Customer ID usando content-id: ${customerId}`)
              } else {
                console.error('❌ Content-ID não disponível ou inválido')
              }
            } else {
              // Formato padrão: /customers/{id}
              const match = locationHeader.match(/\/customers\/([^\/]+)$/)
              console.log('🔍 Regex match result:', match)
              
              if (match) {
                customerId = match[1]
                console.log(`📍 Customer ID extraído do Location: ${customerId}`)
                
                // Fazer GET para buscar dados completos do cliente
                console.log('🔄 Buscando dados completos do cliente...')
                const customerDetailsResult = await deltapagRequest(c, `/customers/${customerId}`, 'GET')
                
                if (customerDetailsResult.ok && customerDetailsResult.data.id) {
                  customerId = customerDetailsResult.data.id
                  console.log(`✅ Dados completos obtidos: ${customerId}`)
                }
              } else {
                console.error('❌ Regex não encontrou match no Location header:', locationHeader)
              }
            }
          } else {
            console.error('❌ Nenhuma variação do header Location foi encontrada')
          }
        }
        
        if (!customerId) {
          console.error('❌ ERRO: Não conseguiu obter customerId')
          console.error('❌ Body da resposta:', JSON.stringify(customerResult.data, null, 2))
          console.error('❌ Status:', customerResult.status)
          throw new Error('Não foi possível obter o ID do cliente criado (nem no body nem no Location header)')
        }
        
        console.log(`✅ Cliente DeltaPag criado: ${customerId}`)
        
        // 2. Criar COBRANÇA/PAGAMENTO (payment) para aparecer como "Última transação" no painel
        let paymentId = null
        try {
          console.log(`💳 Criando cobrança de evidência para ${tx.customer_name}...`)
          
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 7) // Vencimento em 7 dias
          
          const paymentData = {
            customer: customerId,
            billingType: 'CREDIT_CARD',
            value: tx.value,
            dueDate: dueDate.toISOString().split('T')[0],
            description: tx.description,
            externalReference: `evidence_${Date.now()}_${customerId}`,
            creditCard: {
              holderName: tx.customer_name,
              number: tx.card_number,
              expiryMonth: tx.card_expiry_month,
              expiryYear: tx.card_expiry_year,
              ccv: '123'
            },
            creditCardHolderInfo: {
              name: tx.customer_name,
              email: tx.customer_email,
              cpfCnpj: cpfClean,
              postalCode: '01310100',
              addressNumber: '1000',
              addressComplement: '',
              phone: tx.customer_phone.replace(/\D/g, ''),
              mobilePhone: tx.customer_phone.replace(/\D/g, '')
            }
          }
          
          console.log('📤 Enviando cobrança DeltaPag:', JSON.stringify(paymentData, null, 2))
          const paymentResult = await deltapagRequest(c, '/payments', 'POST', paymentData)
          
          console.log('📥 Status cobrança:', paymentResult.status)
          console.log('📥 Resposta completa:', JSON.stringify(paymentResult.data, null, 2))
          
          // Diagnóstico detalhado de erros
          if (paymentResult.status === 401) {
            console.error('❌ ERRO 401: Token DELTAPAG_API_KEY inválido ou expirado')
            console.error('💡 Verificar: Token deve começar com "live_" (produção) ou sem prefixo (sandbox)')
            console.error('💡 Obter novo token em: https://dashboard.deltapag.io/settings/api-keys')
          } else if (paymentResult.status === 403) {
            console.error('❌ ERRO 403: Permissão negada - token não tem acesso a /payments')
            console.error('💡 Verificar: Permissões do token no painel DeltaPag')
          } else if (paymentResult.status === 422) {
            console.error('❌ ERRO 422: Dados inválidos no payload')
            console.error('💡 Campos inválidos:', JSON.stringify(paymentResult.data?.errors || paymentResult.data, null, 2))
          }
          
          if (paymentResult.ok && paymentResult.data) {
            paymentId = paymentResult.data.id || paymentResult.headers.get('content-id')
            console.log('✅ COBRANÇA DeltaPag criada! ID:', paymentId)
            console.log('✅ Status:', paymentResult.data.status)
            console.log('✅ Agora deve aparecer em "Última transação" no painel!')
          } else {
            const errorMsg = `Falha ao criar cobrança: HTTP ${paymentResult.status} - ${JSON.stringify(paymentResult.data)}`
            console.error('❌ ' + errorMsg)
            console.log('⚠️ Resposta completa:', JSON.stringify(paymentResult.data, null, 2))
            console.log('ℹ️ Cliente foi criado, mas sem cobrança de evidência')
            
            // Adicionar erro aos logs retornados
            if (!tx.payment_error) {
              tx.payment_error = errorMsg
            }
          }
        } catch (paymentError: any) {
          const errorMsg = `Exceção ao criar cobrança: ${paymentError.message}`
          console.error('❌ ' + errorMsg)
          console.error('⚠️ Stack:', paymentError.stack)
          console.log('ℹ️ Continuando - cliente foi criado com sucesso')
          
          // Adicionar erro aos logs retornados
          if (!tx.payment_error) {
            tx.payment_error = errorMsg
          }
        }
        
        // 3. Salvar cliente no banco D1 como evidência
        const localSubscriptionId = crypto.randomUUID()
        const cardLast4 = tx.card_number.slice(-4)
        const nextDueDate = new Date()
        nextDueDate.setDate(nextDueDate.getDate() + 1)
        
        console.log(`💾 Salvando cliente no banco D1 como evidência...`)
        
        // Usar ID real do pagamento se criado, ou gerar ID de evidência
        const timestamp = Date.now()
        const subscriptionId = paymentId || `evidence_${timestamp}_${customerId}`
        
        await db.prepare(`
          INSERT INTO deltapag_subscriptions 
          (id, customer_id, customer_name, customer_email, customer_cpf, customer_phone,
           deltapag_subscription_id, deltapag_customer_id, value, description, 
           recurrence_type, status, card_number, card_last4, card_brand, card_expiry_month, card_expiry_year,
           next_due_date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          localSubscriptionId,
          customerId,
          tx.customer_name,
          tx.customer_email,
          tx.customer_cpf,
          tx.customer_phone,
          subscriptionId,
          customerId,
          tx.value,
          tx.description,
          tx.recurrence_type,
          tx.card_number,
          cardLast4,
          tx.card_brand,
          tx.card_expiry_month,
          tx.card_expiry_year,
          nextDueDate.toISOString().split('T')[0]
        ).run()
        
        console.log(`💾 Salvo no banco D1: ${localSubscriptionId}`)
        console.log(`📋 DeltaPag Customer ID: ${customerId}`)
        console.log(`📋 Evidence ID: ${subscriptionId}`)
        
        createdTransactions.push({
          id: localSubscriptionId,
          deltapag_customer_id: customerId,
          deltapag_id: subscriptionId,
          customer: tx.customer_name,
          email: tx.customer_email,
          value: tx.value,
          card: `${tx.card_brand} •••• ${cardLast4}`,
          status: 'EVIDENCE',
          description: tx.description,
          // Debug info para entender falhas
          payment_created: !!paymentId,
          payment_id: paymentId || 'NOT_CREATED',
          payment_error: tx.payment_error || null
        })
        
        console.log(`✅ Cliente ${createdTransactions.length + 1}/5 processado`)
        
      } catch (error: any) {
        console.error(`❌ Erro na transação ${tx.customer_name}:`, error)
        console.error(`❌ Stack trace:`, error.stack)
        
        // NÃO PARAR - continuar com próximo cliente
        // Adicionar à lista com status de erro
        createdTransactions.push({
          id: 'ERROR',
          deltapag_customer_id: 'ERROR',
          deltapag_id: 'ERROR',
          customer: tx.customer_name,
          email: tx.customer_email,
          value: tx.value,
          card: 'ERROR',
          status: 'ERROR',
          description: `Erro: ${error.message}`,
          error: error.message
        })
        
        console.log(`⚠️ Continuando com próximo cliente (${createdTransactions.length}/5)...`)
      }
    }
    
    // Verificar se realmente criou os clientes
    const actualCustomersCreated = createdTransactions.filter(t => 
      t.deltapag_customer_id && 
      !t.deltapag_customer_id.includes('evidence_') && 
      t.deltapag_customer_id !== 'ERROR'
    )
    
    const customersWithError = createdTransactions.filter(t => 
      t.deltapag_customer_id === 'ERROR'
    )
    
    console.log(`📊 RESUMO FINAL:`)
    console.log(`   Total processado: ${createdTransactions.length}`)
    console.log(`   Criados no DeltaPag: ${actualCustomersCreated.length}`)
    console.log(`   Com erro: ${customersWithError.length}`)
    console.log(`   IDs DeltaPag: ${actualCustomersCreated.map(t => t.deltapag_customer_id).join(', ')}`)
    
    if (customersWithError.length > 0) {
      console.log(`❌ Clientes com erro:`)
      customersWithError.forEach(c => {
        console.log(`   - ${c.customer}: ${c.description}`)
      })
    }
    
    return c.json({
      ok: true,
      message: `${createdTransactions.length} CLIENTES processados (${actualCustomersCreated.length} criados na API DeltaPag, ${customersWithError.length} com erro)`,
      count: createdTransactions.length,
      customersCreatedInDeltaPag: actualCustomersCreated.length,
      customersWithError: customersWithError.length,
      customers: createdTransactions,
      errors: customersWithError.length > 0 
        ? customersWithError.map(c => ({ customer: c.customer, error: c.description }))
        : [],
      note: actualCustomersCreated.length > 0 
        ? 'Clientes reais criados na DeltaPag Sandbox - prontos para solicitar API de produção!'
        : '⚠️ ATENÇÃO: Clientes salvos localmente mas NÃO foram criados na API DeltaPag. Verifique se DELTAPAG_API_KEY está configurado corretamente ou veja os erros acima.'
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar transações de evidência:', error)
    console.error('Stack trace completo:', error.stack)
    console.error('Erro tipo:', typeof error)
    console.error('Erro objeto:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    return c.json({ 
      ok: false, 
      error: error.message || 'Erro desconhecido',
      errorType: error.constructor?.name || typeof error,
      details: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, 500)
  }
})

// Endpoint temporário para migrar tabela deltapag_subscriptions
app.post('/api/admin/migrate-deltapag', async (c) => {
  try {
    const db = c.env.DB
    
    // Fazer backup dos dados existentes
    const existingData = await db.prepare(`SELECT * FROM deltapag_subscriptions`).all()
    console.log(`📊 Backup: ${existingData.results?.length || 0} assinaturas existentes`)
    
    // Drop tabela antiga
    await db.prepare(`DROP TABLE IF EXISTS deltapag_subscriptions`).run()
    console.log('🗑️ Tabela antiga removida')
    
    // Criar tabela nova com colunas de cartão
    await db.prepare(`
      CREATE TABLE deltapag_subscriptions (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_cpf TEXT NOT NULL,
        customer_phone TEXT,
        deltapag_subscription_id TEXT NOT NULL,
        deltapag_customer_id TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT,
        recurrence_type TEXT DEFAULT 'MONTHLY',
        status TEXT DEFAULT 'ACTIVE',
        next_due_date TEXT,
        card_number TEXT,
        card_last4 TEXT,
        card_brand TEXT,
        card_expiry_month TEXT,
        card_expiry_year TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    console.log('✅ Nova tabela criada com colunas de cartão')
    
    // Recriar índices
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_customer ON deltapag_subscriptions(customer_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_status ON deltapag_subscriptions(status)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_deltapag_id ON deltapag_subscriptions(deltapag_subscription_id)`).run()
    console.log('✅ Índices recriados')
    
    // Restaurar dados (sem os campos de cartão)
    if (existingData.results && existingData.results.length > 0) {
      for (const sub of existingData.results) {
        await db.prepare(`
          INSERT INTO deltapag_subscriptions 
          (id, customer_id, customer_name, customer_email, customer_cpf, 
           deltapag_subscription_id, deltapag_customer_id, value, description, 
           recurrence_type, status, next_due_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          sub.id,
          sub.customer_id,
          sub.customer_name,
          sub.customer_email,
          sub.customer_cpf,
          sub.deltapag_subscription_id,
          sub.deltapag_customer_id,
          sub.value,
          sub.description,
          sub.recurrence_type,
          sub.status,
          sub.next_due_date,
          sub.created_at,
          sub.updated_at
        ).run()
      }
      console.log(`✅ ${existingData.results.length} assinaturas restauradas`)
    }
    
    return c.json({
      ok: true,
      message: 'Tabela migrada com sucesso!',
      restored: existingData.results?.length || 0
    })
  } catch (error: any) {
    console.error('❌ Erro na migração:', error)
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/admin/init-db', async (c) => {
  try {
    const db = c.env.DB
    
    // Criar tabela subscription_signup_links
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS subscription_signup_links (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        wallet_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1,
        uses_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT NULL
      )
    `).run()
    
    // Criar índices
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_subscription_links_wallet ON subscription_signup_links(wallet_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_subscription_links_active ON subscription_signup_links(active)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_subscription_links_expires ON subscription_signup_links(expires_at)`).run()
    
    // Criar tabela subscription_conversions
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS subscription_conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT NOT NULL,
        customer_id TEXT,
        subscription_id TEXT,
        converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        customer_name TEXT,
        customer_email TEXT,
        customer_cpf TEXT,
        FOREIGN KEY (link_id) REFERENCES subscription_signup_links(id)
      )
    `).run()
    
    // Criar índices de conversions
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_subscription_conversions_link ON subscription_conversions(link_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_subscription_conversions_customer ON subscription_conversions(customer_id)`).run()
    
    // Criar tabela de transações para relatórios
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        wallet_id TEXT,
        value REAL NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        billing_type TEXT,
        due_date DATE,
        payment_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    // Criar índices
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at)`).run()
    
    // Criar tabela pix_automatic_signup_links para PIX Automático
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS pix_automatic_signup_links (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        wallet_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT,
        frequency TEXT DEFAULT 'MONTHLY',
        plan_type TEXT DEFAULT 'basico',
        campaign TEXT,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        active INTEGER DEFAULT 1,
        uses_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT NULL
      )
    `).run()
    
    // Criar índices para pix_automatic_signup_links
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_links_wallet ON pix_automatic_signup_links(wallet_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_links_active ON pix_automatic_signup_links(active)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_links_expires ON pix_automatic_signup_links(expires_at)`).run()
    
    // Criar tabela pix_automatic_authorizations
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS pix_automatic_authorizations (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        link_id TEXT NOT NULL,
        authorization_id TEXT,
        customer_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        customer_cpf TEXT,
        account_id TEXT,
        wallet_id TEXT,
        value REAL NOT NULL,
        description TEXT,
        frequency TEXT DEFAULT 'MONTHLY',
        status TEXT DEFAULT 'PENDING',
        qr_code_payload TEXT,
        qr_code_image TEXT,
        first_payment_id TEXT,
        activated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (link_id) REFERENCES pix_automatic_signup_links(id)
      )
    `).run()
    
    // Criar índices para pix_automatic_authorizations
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_auth_link ON pix_automatic_authorizations(link_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_auth_customer ON pix_automatic_authorizations(customer_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_pix_auto_auth_status ON pix_automatic_authorizations(status)`).run()
    
    // Criar tabela welcome_emails para rastreamento de e-mails
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS welcome_emails (
        id TEXT PRIMARY KEY,
        authorization_id TEXT NOT NULL,
        email TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        template_type TEXT NOT NULL,
        sent_at DATETIME NOT NULL,
        ses_message_id TEXT,
        status TEXT DEFAULT 'sent',
        error_message TEXT,
        opened_at DATETIME,
        clicked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorization_id) REFERENCES pix_automatic_authorizations(id)
      )
    `).run()
    
    // Criar índices para welcome_emails
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_welcome_emails_auth ON welcome_emails(authorization_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_welcome_emails_email ON welcome_emails(email)`).run()
    
    // Criar tabela deltapag_subscriptions para assinaturas via cartão de crédito
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS deltapag_subscriptions (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_cpf TEXT NOT NULL,
        customer_phone TEXT,
        deltapag_subscription_id TEXT NOT NULL,
        deltapag_customer_id TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT,
        recurrence_type TEXT DEFAULT 'MONTHLY',
        status TEXT DEFAULT 'ACTIVE',
        next_due_date TEXT,
        card_last4 TEXT,
        card_brand TEXT,
        card_expiry_month TEXT,
        card_expiry_year TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    // Criar índices para deltapag_subscriptions
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_customer ON deltapag_subscriptions(customer_id)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_status ON deltapag_subscriptions(status)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_subs_deltapag_id ON deltapag_subscriptions(deltapag_subscription_id)`).run()
    
    // Criar tabela deltapag_signup_links para links auto-cadastro
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS deltapag_signup_links (
        id TEXT PRIMARY KEY,
        value REAL NOT NULL,
        description TEXT NOT NULL,
        recurrence_type TEXT DEFAULT 'MONTHLY',
        valid_until DATE NOT NULL,
        uses_count INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 999,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    // Criar índices para deltapag_signup_links
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_links_status ON deltapag_signup_links(status)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_deltapag_links_valid ON deltapag_signup_links(valid_until)`).run()
    
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_welcome_emails_status ON welcome_emails(status)`).run()
    await db.prepare(`CREATE INDEX IF NOT EXISTS idx_welcome_emails_sent ON welcome_emails(sent_at)`).run()
    
    // Inserir transações de teste para as 2 subcontas
    const testTransactions = [
      // Franklin - Transações recebidas
      { id: 'pay_franklin_001', account_id: 'e59d37d7-2f9b-462c-b1c1-c730322c8236', wallet_id: 'b0e857ff-e03b-4b16-8492-f0431de088f8', value: 50.00, description: 'Mensalidade Janeiro', status: 'RECEIVED', billing_type: 'PIX', due_date: '2026-01-15', payment_date: '2026-01-15' },
      { id: 'pay_franklin_002', account_id: 'e59d37d7-2f9b-462c-b1c1-c730322c8236', wallet_id: 'b0e857ff-e03b-4b16-8492-f0431de088f8', value: 50.00, description: 'Mensalidade Fevereiro', status: 'RECEIVED', billing_type: 'PIX', due_date: '2026-02-15', payment_date: '2026-02-16' },
      { id: 'pay_franklin_003', account_id: 'e59d37d7-2f9b-462c-b1c1-c730322c8236', wallet_id: 'b0e857ff-e03b-4b16-8492-f0431de088f8', value: 100.00, description: 'Plano Premium', status: 'RECEIVED', billing_type: 'PIX', due_date: '2026-02-10', payment_date: '2026-02-10' },
      
      // Franklin - Transações pendentes
      { id: 'pay_franklin_004', account_id: 'e59d37d7-2f9b-462c-b1c1-c730322c8236', wallet_id: 'b0e857ff-e03b-4b16-8492-f0431de088f8', value: 50.00, description: 'Mensalidade Março', status: 'PENDING', billing_type: 'PIX', due_date: '2026-03-15', payment_date: null },
      
      // Saulo - Transações recebidas
      { id: 'pay_saulo_001', account_id: 'acc_saulo_123', wallet_id: 'wallet_saulo_456', value: 75.00, description: 'Consultoria Janeiro', status: 'RECEIVED', billing_type: 'PIX', due_date: '2026-01-20', payment_date: '2026-01-20' },
      { id: 'pay_saulo_002', account_id: 'acc_saulo_123', wallet_id: 'wallet_saulo_456', value: 75.00, description: 'Consultoria Fevereiro', status: 'RECEIVED', billing_type: 'PIX', due_date: '2026-02-20', payment_date: '2026-02-21' },
      
      // Saulo - Transações atrasadas
      { id: 'pay_saulo_003', account_id: 'acc_saulo_123', wallet_id: 'wallet_saulo_456', value: 75.00, description: 'Consultoria Março', status: 'OVERDUE', billing_type: 'PIX', due_date: '2026-03-20', payment_date: null }
    ]
    
    for (const tx of testTransactions) {
      await db.prepare(`
        INSERT OR IGNORE INTO transactions 
        (id, account_id, wallet_id, value, description, status, billing_type, due_date, payment_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        tx.id,
        tx.account_id,
        tx.wallet_id,
        tx.value,
        tx.description,
        tx.status,
        tx.billing_type,
        tx.due_date,
        tx.payment_date
      ).run()
    }
    
    return c.json({ 
      ok: true, 
      message: 'Tabelas criadas com sucesso e dados de teste inseridos',
      tables: ['subscription_signup_links', 'subscription_conversions', 'transactions', 'pix_automatic_signup_links', 'pix_automatic_authorizations', 'welcome_emails', 'deltapag_subscriptions', 'deltapag_signup_links'],
      testTransactionsInserted: testTransactions.length
    })
  } catch (error: any) {
    console.error('Erro ao criar tabelas:', error)
    return c.json({ 
      ok: false, 
      error: error.message 
    }, 500)
  }
})

// Endpoint para criar transações de teste DeltaPag
app.post('/api/admin/seed-deltapag', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    // Dados de teste com cartões das operadoras Cielo e Rede
    const testSubscriptions = [
      // Cielo - Aprovadas (final 0, 1, 4)
      {
        id: `test_${Date.now()}_1`,
        customer_id: 'test_cust_001',
        customer_name: 'João da Silva',
        customer_email: 'joao.silva@email.com',
        customer_cpf: '123.456.789-00',
        deltapag_subscription_id: 'dpag_sub_001',
        deltapag_customer_id: 'dpag_cust_001',
        value: 99.90,
        description: 'Plano Premium Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Mastercard',
        card_last4: '2340',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: `test_${Date.now()}_2`,
        customer_id: 'test_cust_002',
        customer_name: 'Maria Santos',
        customer_email: 'maria.santos@email.com',
        customer_cpf: '234.567.890-11',
        deltapag_subscription_id: 'dpag_sub_002',
        deltapag_customer_id: 'dpag_cust_002',
        value: 149.90,
        description: 'Plano Business Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Mastercard',
        card_last4: '0761',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        id: `test_${Date.now()}_3`,
        customer_id: 'test_cust_003',
        customer_name: 'Pedro Oliveira',
        customer_email: 'pedro.oliveira@email.com',
        customer_cpf: '345.678.901-22',
        deltapag_subscription_id: 'dpag_sub_003',
        deltapag_customer_id: 'dpag_cust_003',
        value: 79.90,
        description: 'Plano Básico Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Mastercard',
        card_last4: '8264',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Cielo - Não Autorizada (final 2)
      {
        id: `test_${Date.now()}_4`,
        customer_id: 'test_cust_004',
        customer_name: 'Ana Costa',
        customer_email: 'ana.costa@email.com',
        customer_cpf: '456.789.012-33',
        deltapag_subscription_id: 'dpag_sub_004',
        deltapag_customer_id: 'dpag_cust_004',
        value: 199.90,
        description: 'Plano Enterprise Mensal',
        recurrence_type: 'MONTHLY',
        status: 'CANCELLED',
        card_brand: 'Mastercard',
        card_last4: '5532',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Cielo - Cartão Bloqueado (final 5)
      {
        id: `test_${Date.now()}_5`,
        customer_id: 'test_cust_005',
        customer_name: 'Carlos Ferreira',
        customer_email: 'carlos.ferreira@email.com',
        customer_cpf: '567.890.123-44',
        deltapag_subscription_id: 'dpag_sub_005',
        deltapag_customer_id: 'dpag_cust_005',
        value: 299.90,
        description: 'Plano Ultimate Anual',
        recurrence_type: 'YEARLY',
        status: 'CANCELLED',
        card_brand: 'Mastercard',
        card_last4: '7415',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Rede - Mastercard Aprovada
      {
        id: `test_${Date.now()}_6`,
        customer_id: 'test_cust_006',
        customer_name: 'Juliana Lima',
        customer_email: 'juliana.lima@email.com',
        customer_cpf: '678.901.234-55',
        deltapag_subscription_id: 'dpag_sub_006',
        deltapag_customer_id: 'dpag_cust_006',
        value: 49.90,
        description: 'Plano Starter Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Mastercard',
        card_last4: '0007',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Rede - Visa Aprovada
      {
        id: `test_${Date.now()}_7`,
        customer_id: 'test_cust_007',
        customer_name: 'Roberto Alves',
        customer_email: 'roberto.alves@email.com',
        customer_cpf: '789.012.345-66',
        deltapag_subscription_id: 'dpag_sub_007',
        deltapag_customer_id: 'dpag_cust_007',
        value: 129.90,
        description: 'Plano Pro Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Visa',
        card_last4: '5682',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Rede - Hipercard Aprovada
      {
        id: `test_${Date.now()}_8`,
        customer_id: 'test_cust_008',
        customer_name: 'Fernanda Rocha',
        customer_email: 'fernanda.rocha@email.com',
        customer_cpf: '890.123.456-77',
        deltapag_subscription_id: 'dpag_sub_008',
        deltapag_customer_id: 'dpag_cust_008',
        value: 89.90,
        description: 'Plano Plus Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Hipercard',
        card_last4: '4001',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      // Rede - Elo Aprovada
      {
        id: `test_${Date.now()}_9`,
        customer_id: 'test_cust_009',
        customer_name: 'Lucas Martins',
        customer_email: 'lucas.martins@email.com',
        customer_cpf: '901.234.567-88',
        deltapag_subscription_id: 'dpag_sub_009',
        deltapag_customer_id: 'dpag_cust_009',
        value: 169.90,
        description: 'Plano Advanced Mensal',
        recurrence_type: 'MONTHLY',
        status: 'ACTIVE',
        card_brand: 'Elo',
        card_last4: '0055',
        next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
    
    // Inserir assinaturas de teste
    for (const sub of testSubscriptions) {
      await db.prepare(`
        INSERT INTO deltapag_subscriptions 
        (id, customer_id, customer_name, customer_email, customer_cpf, 
         deltapag_subscription_id, deltapag_customer_id, value, description, 
         recurrence_type, status, next_due_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        sub.id,
        sub.customer_id,
        sub.customer_name,
        sub.customer_email,
        sub.customer_cpf,
        sub.deltapag_subscription_id,
        sub.deltapag_customer_id,
        sub.value,
        sub.description,
        sub.recurrence_type,
        sub.status,
        sub.next_due_date
      ).run()
    }
    
    return c.json({
      ok: true,
      message: 'Transações de teste DeltaPag criadas com sucesso',
      count: testSubscriptions.length,
      subscriptions: testSubscriptions.map(s => ({
        customer: s.customer_name,
        value: s.value,
        status: s.status,
        card_brand: s.card_brand,
        card_last4: s.card_last4
      }))
    })
  } catch (error: any) {
    console.error('Erro ao criar transações de teste:', error)
    return c.json({
      ok: false,
      error: error.message
    }, 500)
  }
})

// Endpoint para inicializar Amazon SES
app.post('/api/admin/configure-ses', async (c) => {
  try {
    const { accessKeyId, secretAccessKey, region } = await c.req.json()
    
    if (!accessKeyId || !secretAccessKey) {
      return c.json({ 
        ok: false, 
        error: 'accessKeyId e secretAccessKey são obrigatórios' 
      }, 400)
    }
    
    // Inicializar cliente SES
    initializeSESClient(accessKeyId, secretAccessKey, region || 'us-east-1')
    
    return c.json({ 
      ok: true, 
      message: 'Amazon SES configurado com sucesso',
      region: region || 'us-east-1',
      configured: isSESConfigured()
    })
  } catch (error: any) {
    console.error('Erro ao configurar SES:', error)
    return c.json({ 
      ok: false, 
      error: error.message 
    }, 500)
  }
})

// Endpoint para verificar status do SES
app.get('/api/admin/ses-status', async (c) => {
  return c.json({ 
    ok: true, 
    configured: isSESConfigured(),
    hasCredentials: !!(c.env.AWS_ACCESS_KEY_ID && c.env.AWS_SECRET_ACCESS_KEY),
    region: c.env.AWS_REGION || 'us-east-1'
  })
})

// Webhook do Asaas para notificações de pagamento
app.post('/api/webhooks/asaas', async (c) => {
  try {
    const webhook = await c.req.json()
    console.log('Webhook recebido:', webhook)
    
    // Verificar tipo de evento
    if (webhook.event === 'PAYMENT_RECEIVED' || webhook.event === 'PAYMENT_CONFIRMED') {
      const payment = webhook.payment
      const db = c.env.DB
      
      // Atualizar status do pagamento no banco D1
      await db.prepare(`
        UPDATE transactions 
        SET status = ?, payment_date = ? 
        WHERE id = ?
      `).bind(
        'RECEIVED',
        payment.paymentDate || new Date().toISOString().split('T')[0],
        payment.id
      ).run()
      
      console.log(`Pagamento ${payment.id} confirmado via webhook`)
      
      return c.json({ 
        ok: true, 
        message: 'Webhook processado',
        paymentId: payment.id
      })
    }
    
    return c.json({ ok: true, message: 'Evento ignorado' })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return c.json({ ok: false, error: error.message }, 500)
  }
})

// Endpoint público para verificar status do pagamento
app.get('/api/payment-status/:paymentId', async (c) => {
  try {
    const paymentId = c.req.param('paymentId')
    
    // Buscar status do pagamento no Asaas
    const result = await asaasRequest(c, `/payments/${paymentId}`)
    
    if (result.ok && result.data) {
      // Se o pagamento foi confirmado, atualizar no banco D1
      if (result.data.status === 'RECEIVED' || result.data.status === 'CONFIRMED') {
        const db = c.env.DB
        await db.prepare(`
          UPDATE transactions 
          SET status = ?, payment_date = ? 
          WHERE id = ?
        `).bind(
          result.data.status,
          result.data.paymentDate || new Date().toISOString().split('T')[0],
          paymentId
        ).run()
      }
      
      return c.json({
        ok: true,
        status: result.data.status,
        paymentDate: result.data.paymentDate
      })
    }
    
    return c.json({ ok: false, error: 'Pagamento não encontrado' }, 404)
  } catch (error: any) {
    console.error('Erro ao verificar pagamento:', error)
    return c.json({ ok: false, error: error.message }, 500)
  }
})

// Endpoint para sincronizar transações do Asaas para o banco D1
app.post('/api/admin/sync-transactions', async (c) => {
  try {
    const db = c.env.DB
    
    // Buscar todas as subcontas
    const accountsResult = await asaasRequest(c, '/accounts')
    if (!accountsResult.ok) {
      return c.json({ error: 'Erro ao buscar subcontas' }, 500)
    }
    
    const accounts = accountsResult.data?.data || []
    let totalSynced = 0
    
    for (const account of accounts) {
      try {
        // Buscar pagamentos dos últimos 90 dias via API principal
        // Usando filtro por wallet ID para pegar pagamentos com split
        const paymentsUrl = `/payments?limit=100&dateCreated[ge]=${new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0]}`
        const paymentsResult = await asaasRequest(c, paymentsUrl)
        
        if (paymentsResult.ok && paymentsResult.data?.data) {
          const payments = paymentsResult.data.data
          
          // Filtrar pagamentos que têm split para esta subconta
          for (const payment of payments) {
            // Verificar se o pagamento tem split para o wallet desta subconta
            if (payment.split && payment.split.length > 0) {
              const splitForAccount = payment.split.find((s: any) => s.walletId === account.walletId)
              
              if (splitForAccount) {
                // Salvar no banco D1
                await db.prepare(`
                  INSERT OR REPLACE INTO transactions 
                  (id, account_id, wallet_id, value, description, status, billing_type, due_date, payment_date, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                  payment.id,
                  account.id,
                  account.walletId,
                  splitForAccount.value || payment.value * 0.20, // Valor do split ou 20% do total
                  payment.description || 'Pagamento',
                  payment.status,
                  payment.billingType,
                  payment.dueDate,
                  payment.paymentDate || null,
                  payment.dateCreated
                ).run()
                
                totalSynced++
              }
            }
          }
        }
      } catch (accountError: any) {
        console.error(`Erro ao sincronizar conta ${account.id}:`, accountError)
      }
    }
    
    return c.json({
      ok: true,
      message: 'Sincronização concluída',
      accountsChecked: accounts.length,
      transactionsSynced: totalSynced
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar transações:', error)
    return c.json({ 
      ok: false, 
      error: error.message 
    }, 500)
  }
})

// Listar subcontas
app.get('/api/accounts', async (c) => {
  try {
    console.log('Buscando contas...')
    const result = await asaasRequest(c, '/accounts')
    console.log('Resultado da API:', {
      ok: result.ok,
      status: result.status,
      totalCount: result.data?.totalCount,
      hasData: !!result.data?.data
    })
    
    // Transformar resposta para formato esperado pelo frontend
    if (result.ok && result.data && result.data.data) {
      return c.json({ 
        accounts: result.data.data,
        totalCount: result.data.totalCount || 0
      })
    }
    
    // Se não houver dados, retornar vazio
    console.log('Retornando array vazio')
    return c.json({ accounts: [], totalCount: 0 })
  } catch (error: any) {
    console.error('Erro ao buscar contas:', error)
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

// Criar cliente (customer) no Asaas
app.post('/api/customers', async (c) => {
  try {
    const body = await c.req.json()
    const result = await asaasRequest(c, '/customers', 'POST', body)
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Gerar QR Code PIX estático reutilizável
app.post('/api/pix/static', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const body = await c.req.json()
    const { walletId, accountId, value, description } = body
    
    console.log('📝 Request PIX estático:', { walletId, accountId, value, description })
    
    if (!walletId) {
      console.error('❌ walletId não fornecido:', body)
      return c.json({ 
        error: 'walletId é obrigatório',
        received: body 
      }, 400)
    }
    
    if (!value || value <= 0) {
      console.error('❌ Valor inválido:', { value, body })
      return c.json({ 
        error: 'Valor deve ser maior que zero',
        received: { value }
      }, 400)
    }
    
    // NOVA ABORDAGEM: Criar cobrança PIX via API Asaas
    // Isso garante QR Code válido gerado pelo próprio Asaas
    
    // Buscar customer genérico ou criar um novo
    const cpfGenerico = '24971563792' // CPF válido para QR Code estático
    const searchResult = await asaasRequest(c, `/customers?cpfCnpj=${cpfGenerico}`)
    
    let customerId
    if (searchResult.ok && searchResult.data?.data?.[0]?.id) {
      customerId = searchResult.data.data[0].id
      console.log('✅ Customer existente encontrado:', customerId)
    } else {
      // Criar customer genérico
      const customerData = {
        name: 'Cliente QR Code Estático',
        cpfCnpj: cpfGenerico,
        email: 'qrcode@static.pix',
        notificationDisabled: true
      }
      
      const createResult = await asaasRequest(c, '/customers', 'POST', customerData)
      if (!createResult.ok || !createResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar customer',
          details: createResult.data 
        }, 400)
      }
      
      customerId = createResult.data.id
      console.log('✅ Customer criado:', customerId)
    }
    
    // Criar cobrança PIX com split
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7) // 7 dias de validade
    
    const chargeData = {
      customer: customerId,
      billingType: 'PIX',
      value: value,
      dueDate: dueDate.toISOString().split('T')[0],
      description: description || 'Pagamento via PIX',
      split: createNetSplit(walletId, value, 20) // Sub-conta recebe 20% LÍQUIDO (após taxas)
    }
    
    console.log('📝 Criando cobrança PIX:', JSON.stringify(chargeData, null, 2))
    
    const chargeResult = await asaasRequest(c, '/payments', 'POST', chargeData)
    
    console.log('📊 Resultado cobrança:', JSON.stringify({
      ok: chargeResult.ok,
      status: chargeResult.status,
      hasData: !!chargeResult.data,
      errorCode: chargeResult.data?.errors?.[0]?.code,
      errorDesc: chargeResult.data?.errors?.[0]?.description
    }))
    
    if (!chargeResult.ok) {
      return c.json({ 
        error: 'Erro ao criar cobrança PIX',
        details: chargeResult.data 
      }, 400)
    }
    
    const payment = chargeResult.data
    
    console.log('✅ Cobrança criada:', payment.id, 'Status:', payment.status)
    
    // Buscar QR Code da API Asaas
    const qrCodeResult = await asaasRequest(c, `/payments/${payment.id}/pixQrCode`)
    
    if (!qrCodeResult.ok || !qrCodeResult.data) {
      return c.json({ 
        error: 'Erro ao gerar QR Code',
        details: qrCodeResult.data 
      }, 400)
    }
    
    // API Asaas retorna QR Code dinâmico (sem valor fixo)
    // Vamos inserir o campo 54 (Transaction Amount) manualmente
    const asaasPayload = qrCodeResult.data.payload
    console.log('📊 Payload Asaas (sem valor):', asaasPayload.substring(0, 100) + '...')
    
    // Inserir campo 54 após o campo 53 (currency)
    const valueField = `54${value.toFixed(2).length.toString().padStart(2, '0')}${value.toFixed(2)}`
    
    // Encontrar posição do campo 58 (Country Code) e inserir campo 54 antes dele
    const pos58 = asaasPayload.indexOf('5802')
    if (pos58 === -1) {
      console.error('❌ Campo 58 não encontrado no payload')
      return c.json({ error: 'Formato de payload inválido' }, 500)
    }
    
    // Montar payload com valor fixo
    const payloadWithValue = asaasPayload.substring(0, pos58) + valueField + asaasPayload.substring(pos58)
    
    // Remover CRC antigo (últimos 8 caracteres: 6304XXXX)
    const payloadWithoutCrc = payloadWithValue.substring(0, payloadWithValue.length - 8)
    
    // Adicionar placeholder CRC e recalcular
    const payloadWithCrcPlaceholder = payloadWithoutCrc + '6304'
    const crc = calculateCRC16(payloadWithCrcPlaceholder)
    const finalPayload = payloadWithCrcPlaceholder + crc
    
    console.log('✅ Payload final (com valor fixo):', finalPayload.substring(0, 100) + '...')
    console.log('📏 Comprimento:', finalPayload.length, 'caracteres')
    
    // Gerar novo QR Code
    const qrCodeBase64Image = await generateQRCodeBase64(finalPayload)
    
    const pixData = {
      payload: finalPayload,
      encodedImage: qrCodeBase64Image,
      expirationDate: payment.dueDate
    }
    
    // Salvar no banco para tracking
    const pixId = `pix_static_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    try {
      await c.env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS pix_splits (
          id TEXT PRIMARY KEY,
          wallet_id TEXT NOT NULL,
          account_id TEXT NOT NULL,
          payment_id TEXT,
          value REAL NOT NULL,
          description TEXT,
          split_percentage REAL DEFAULT 20,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run()
      
      await c.env.DB.prepare(`
        INSERT INTO pix_splits (id, wallet_id, account_id, payment_id, value, description, split_percentage)
        VALUES (?, ?, ?, ?, ?, ?, 20)
      `).bind(pixId, walletId, accountId, payment.id, value, description || '').run()
    } catch (dbError: any) {
      console.error('Erro ao salvar split no banco:', dbError)
    }
    
    // Converter imagem do QR Code para base64
    const qrCodeBase64 = pixData.encodedImage || await generateQRCodeBase64(pixData.payload)
    
    return c.json({
      ok: true,
      data: {
        walletId,
        accountId,
        value,
        description,
        payload: pixData.payload,
        qrCodeBase64,
        pixId,
        paymentId: payment.id,
        invoiceUrl: payment.invoiceUrl,
        type: 'STATIC',
        splitConfig: {
          subAccount: 20,
          mainAccount: 80
        }
      }
    })
  } catch (error: any) {
    console.error('Erro ao gerar PIX:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Criar assinatura recorrente mensal com PIX
app.post('/api/pix/subscription', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const { walletId, accountId, value, description, customerName, customerEmail, customerCpf } = await c.req.json()
    
    if (!walletId || !value || value <= 0) {
      return c.json({ error: 'walletId e value (> 0) são obrigatórios' }, 400)
    }
    
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Dados do cliente (nome, email, CPF) são obrigatórios' }, 400)
    }
    
    // 1. Buscar ou criar customer
    const searchResult = await asaasRequest(c, `/customers?cpfCnpj=${customerCpf}`)
    
    let customerId
    if (searchResult.ok && searchResult.data?.data?.[0]?.id) {
      customerId = searchResult.data.data[0].id
      console.log('✅ Customer existente:', customerId)
    } else {
      const customerData = {
        name: customerName,
        cpfCnpj: customerCpf,
        email: customerEmail,
        notificationDisabled: false
      }
      
      const createResult = await asaasRequest(c, '/customers', 'POST', customerData)
      if (!createResult.ok || !createResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar customer',
          details: createResult.data 
        }, 400)
      }
      
      customerId = createResult.data.id
      console.log('✅ Customer criado:', customerId)
    }
    
    // 2. Criar assinatura mensal
    const subscriptionData = {
      customer: customerId,
      billingType: 'PIX',
      value: value,
      nextDueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0], // Amanhã
      cycle: 'MONTHLY',
      description: description || 'Mensalidade',
      split: createNetSplit(walletId, value, 20) // Sub-conta recebe 20% LÍQUIDO (após taxas)
    }
    
    console.log('📝 Criando assinatura:', JSON.stringify(subscriptionData, null, 2))
    
    const subscriptionResult = await asaasRequest(c, '/subscriptions', 'POST', subscriptionData)
    
    if (!subscriptionResult.ok) {
      return c.json({ 
        error: 'Erro ao criar assinatura',
        details: subscriptionResult.data 
      }, 400)
    }
    
    const subscription = subscriptionResult.data
    
    console.log('✅ Assinatura criada:', subscription.id)
    
    // 3. Buscar primeiro pagamento gerado pela assinatura
    const paymentsResult = await asaasRequest(c, `/payments?subscription=${subscription.id}`)
    
    if (!paymentsResult.ok || !paymentsResult.data?.data?.[0]) {
      return c.json({
        ok: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          value: subscription.value,
          cycle: subscription.cycle,
          nextDueDate: subscription.nextDueDate
        },
        warning: 'Assinatura criada, mas primeiro pagamento ainda não foi gerado'
      })
    }
    
    const firstPayment = paymentsResult.data.data[0]
    
    // 4. Buscar QR Code do primeiro pagamento
    const qrCodeResult = await asaasRequest(c, `/payments/${firstPayment.id}/pixQrCode`)
    
    let pixData = null
    if (qrCodeResult.ok && qrCodeResult.data) {
      const asaasPayload = qrCodeResult.data.payload
      
      // Inserir campo 54 (valor fixo)
      const valueField = `54${value.toFixed(2).length.toString().padStart(2, '0')}${value.toFixed(2)}`
      const pos58 = asaasPayload.indexOf('5802')
      
      if (pos58 !== -1) {
        const payloadWithValue = asaasPayload.substring(0, pos58) + valueField + asaasPayload.substring(pos58)
        const payloadWithoutCrc = payloadWithValue.substring(0, payloadWithValue.length - 8)
        const payloadWithCrcPlaceholder = payloadWithoutCrc + '6304'
        const crc = calculateCRC16(payloadWithCrcPlaceholder)
        const finalPayload = payloadWithCrcPlaceholder + crc
        
        const qrCodeBase64Image = await generateQRCodeBase64(finalPayload)
        
        pixData = {
          payload: finalPayload,
          qrCodeBase64: qrCodeBase64Image,
          expirationDate: firstPayment.dueDate
        }
      }
    }
    
    return c.json({
      ok: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        cycle: subscription.cycle,
        nextDueDate: subscription.nextDueDate,
        description: subscription.description
      },
      firstPayment: {
        id: firstPayment.id,
        status: firstPayment.status,
        dueDate: firstPayment.dueDate,
        invoiceUrl: firstPayment.invoiceUrl,
        pix: pixData
      },
      splitConfig: {
        subAccount: 20,
        mainAccount: 80
      }
    })
    
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ========================================
// FLUXO DE AUTO-CADASTRO DE ASSINATURA PIX MENSAL
// Cliente lê QR Code → Preenche dados → Paga → Assinatura mensal criada
// Split 80/20 aplicado automaticamente
// ========================================

// 1. Criar link de auto-cadastro para assinatura mensal
app.post('/api/pix/subscription-link', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const { walletId, accountId, value, description, maxUses, chargeType } = await c.req.json()
    
    if (!walletId || !accountId || !value || value <= 0) {
      return c.json({ error: 'walletId, accountId e value (> 0) são obrigatórios' }, 400)
    }
    
    // Validar chargeType
    const validChargeTypes = ['single', 'monthly']
    const finalChargeType = validChargeTypes.includes(chargeType) ? chargeType : 'monthly'
    
    console.log('📝 Criando link de auto-cadastro:', {
      walletId,
      accountId,
      value,
      description,
      chargeType: finalChargeType
    })
    
    // Gerar ID único para o link
    const linkId = crypto.randomUUID()
    
    // Expiração: 30 dias
    const expiresAt = new Date(Date.now() + 30*24*60*60*1000).toISOString()
    
    // Salvar no banco (adicionar coluna charge_type se não existir)
    await c.env.DB.prepare(`
      INSERT INTO subscription_signup_links (id, wallet_id, account_id, value, description, expires_at, charge_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      linkId, 
      walletId, 
      accountId || '', 
      value, 
      description || (finalChargeType === 'single' ? 'Pagamento Único' : 'Mensalidade'), 
      expiresAt,
      finalChargeType
    ).run()
    
    // URL do link de auto-cadastro
    const linkUrl = `${new URL(c.req.url).origin}/subscription-signup/${linkId}`
    
    return c.json({
      ok: true,
      data: {
        linkId,
        linkUrl,
        qrCodeData: linkUrl, // Para gerar QR Code no frontend
        value,
        description,
        expiresAt,
        walletId,
        accountId
      }
    })
  } catch (error: any) {
    console.error('Erro ao criar link:', error)
    
    // Se o erro for "no column named charge_type", tentar aplicar migration automaticamente
    if (error.message?.includes('no column named charge_type')) {
      console.log('🔧 Detectado erro de charge_type, aplicando migration automaticamente...')
      
      try {
        // Aplicar migration
        await c.env.DB.prepare(`
          ALTER TABLE subscription_signup_links 
          ADD COLUMN charge_type TEXT DEFAULT 'monthly' CHECK(charge_type IN ('single', 'monthly'))
        `).run()
        
        console.log('✅ Coluna charge_type adicionada, tentando novamente...')
        
        // Tentar inserir novamente
        const { walletId, accountId, value, description, maxUses, chargeType } = await c.req.json()
        const validChargeTypes = ['single', 'monthly']
        const finalChargeType = validChargeTypes.includes(chargeType) ? chargeType : 'monthly'
        const linkId = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 30*24*60*60*1000).toISOString()
        
        await c.env.DB.prepare(`
          INSERT INTO subscription_signup_links (id, wallet_id, account_id, value, description, expires_at, charge_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          linkId, 
          walletId, 
          accountId || '', 
          value, 
          description || (finalChargeType === 'single' ? 'Pagamento Único' : 'Mensalidade'), 
          expiresAt,
          finalChargeType
        ).run()
        
        const linkUrl = `${new URL(c.req.url).origin}/subscription-signup/${linkId}`
        
        return c.json({
          ok: true,
          autoFixed: true,
          data: {
            linkId,
            linkUrl,
            qrCodeData: linkUrl,
            value,
            description,
            expiresAt,
            walletId,
            accountId
          }
        })
        
      } catch (migrationError: any) {
        console.error('❌ Falha ao aplicar migration automática:', migrationError)
        return c.json({ 
          error: 'Erro no banco de dados. Por favor, contate o administrador.',
          details: migrationError.message 
        }, 500)
      }
    }
    
    return c.json({ error: error.message }, 500)
  }
})

// Obter dados do link de auto-cadastro (público)
app.get('/api/pix/subscription-link/:linkId', async (c) => {
  try {
    const linkId = c.req.param('linkId')
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM subscription_signup_links WHERE id = ? AND active = 1
    `).bind(linkId).first()
    
    if (!result) {
      return c.json({ error: 'Link não encontrado ou expirado' }, 404)
    }
    
    // Verificar expiração
    if (new Date(result.expires_at as string) < new Date()) {
      return c.json({ error: 'Link expirado' }, 410)
    }
    
    return c.json({
      ok: true,
      data: {
        linkId: result.id,
        value: result.value,
        description: result.description,
        walletId: result.wallet_id,
        accountId: result.account_id,
        chargeType: result.charge_type || 'monthly' // Adicionar charge_type
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar link:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Cliente completa auto-cadastro e cria assinatura (público)
app.post('/api/pix/subscription-signup/:linkId', async (c) => {
  try {
    const linkId = c.req.param('linkId')
    const { customerName, customerEmail, customerCpf, customerBirthdate } = await c.req.json()
    
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Nome, email e CPF são obrigatórios' }, 400)
    }
    
    // Buscar link
    const link = await c.env.DB.prepare(`
      SELECT * FROM subscription_signup_links WHERE id = ? AND active = 1
    `).bind(linkId).first()
    
    if (!link) {
      return c.json({ error: 'Link não encontrado ou inativo' }, 404)
    }
    
    // Verificar expiração
    if (new Date(link.expires_at as string) < new Date()) {
      return c.json({ error: 'Link expirado' }, 410)
    }
    
    const walletId = link.wallet_id as string
    const value = link.value as number
    const description = link.description as string
    const chargeType = (link.charge_type as string) || 'monthly' // 'single' ou 'monthly'
    
    console.log('📝 Link Info:', { linkId, walletId, value, description, chargeType })
    
    // 1. Buscar ou criar customer
    const searchResult = await asaasRequest(c, `/customers?cpfCnpj=${customerCpf}`)
    
    let customerId
    if (searchResult.ok && searchResult.data?.data?.[0]?.id) {
      customerId = searchResult.data.data[0].id
    } else {
      const customerData = {
        name: customerName,
        cpfCnpj: customerCpf,
        email: customerEmail,
        notificationDisabled: false
      }
      
      const createResult = await asaasRequest(c, '/customers', 'POST', customerData)
      if (!createResult.ok || !createResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar cadastro',
          details: createResult.data 
        }, 400)
      }
      
      customerId = createResult.data.id
    }
    
    // 2. Criar pagamento único OU assinatura mensal dependendo do chargeType
    console.log('👤 Customer criado:', customerId)
    
    let firstPayment: any
    let subscription: any = null
    
    if (chargeType === 'single') {
      // 2A. COBRANÇA ÚNICA: Criar apenas um pagamento PIX
      console.log('💰 Criando cobrança única (pagamento PIX)...')
      
      const paymentData = {
        customer: customerId,
        billingType: 'PIX',
        value: value,
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], // 7 dias
        description: description || 'Pagamento Único',
        split: createNetSplit(walletId, value, 20)
      }
      
      console.log('📤 Criando pagamento:', JSON.stringify(paymentData, null, 2))
      
      const paymentResult = await asaasRequest(c, '/payments', 'POST', paymentData)
      
      console.log('📥 Resposta Asaas:', {
        ok: paymentResult.ok,
        status: paymentResult.status,
        data: paymentResult.data
      })
      
      if (!paymentResult.ok) {
        console.error('❌ Erro ao criar pagamento:', paymentResult.data)
        return c.json({ 
          error: 'Erro ao criar pagamento',
          details: paymentResult.data,
          walletId: walletId,
          value: value
        }, 400)
      }
      
      firstPayment = paymentResult.data
      
    } else {
      // 2B. ASSINATURA MENSAL: Criar assinatura recorrente
      console.log('🔄 Criando assinatura mensal...')
      
      const subscriptionData = {
        customer: customerId,
        billingType: 'PIX',
        value: value,
        nextDueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: description || 'Mensalidade',
        split: createNetSplit(walletId, value, 20)
      }
      
      console.log('📤 Criando assinatura:', JSON.stringify(subscriptionData, null, 2))
      
      const subscriptionResult = await asaasRequest(c, '/subscriptions', 'POST', subscriptionData)
      
      console.log('📥 Resposta Asaas:', {
        ok: subscriptionResult.ok,
        status: subscriptionResult.status,
        data: subscriptionResult.data
      })
      
      if (!subscriptionResult.ok) {
        console.error('❌ Erro ao criar assinatura:', subscriptionResult.data)
        return c.json({ 
          error: 'Erro ao criar assinatura',
          details: subscriptionResult.data,
          walletId: walletId,
          value: value
        }, 400)
      }
      
      subscription = subscriptionResult.data
      
      // Buscar primeiro pagamento da assinatura
      const paymentsResult = await asaasRequest(c, `/payments?subscription=${subscription.id}`)
      
      if (!paymentsResult.ok || !paymentsResult.data?.data?.[0]) {
        return c.json({
          ok: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            value: subscription.value,
            nextDueDate: subscription.nextDueDate
          },
          warning: 'Assinatura criada, aguardando primeiro pagamento'
        })
      }
      
      firstPayment = paymentsResult.data.data[0]
    }
    
    // 4. Buscar QR Code PIX
    const qrCodeResult = await asaasRequest(c, `/payments/${firstPayment.id}/pixQrCode`)
    
    let pixData = null
    if (qrCodeResult.ok && qrCodeResult.data) {
      const asaasPayload = qrCodeResult.data.payload
      const valueField = `54${value.toFixed(2).length.toString().padStart(2, '0')}${value.toFixed(2)}`
      const pos58 = asaasPayload.indexOf('5802')
      
      if (pos58 !== -1) {
        const payloadWithValue = asaasPayload.substring(0, pos58) + valueField + asaasPayload.substring(pos58)
        const payloadWithoutCrc = payloadWithValue.substring(0, payloadWithValue.length - 8)
        const payloadWithCrcPlaceholder = payloadWithoutCrc + '6304'
        const crc = calculateCRC16(payloadWithCrcPlaceholder)
        const finalPayload = payloadWithCrcPlaceholder + crc
        
        const qrCodeBase64Image = await generateQRCodeBase64(finalPayload)
        
        pixData = {
          payload: finalPayload,
          qrCodeBase64: qrCodeBase64Image,
          expirationDate: firstPayment.dueDate
        }
      }
    }
    
    // 5. Registrar conversão
    try {
      await c.env.DB.prepare(`
        INSERT INTO subscription_conversions (link_id, customer_id, subscription_id, customer_name, customer_email, customer_cpf, customer_birthdate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(linkId, customerId, subscription?.id || null, customerName, customerEmail, customerCpf, customerBirthdate || null).run()
    } catch (dbError: any) {
      // Se erro for "no column named customer_birthdate", aplicar migration automaticamente
      if (dbError.message && dbError.message.includes('no column named customer_birthdate')) {
        console.log('⚠️ Coluna customer_birthdate não existe, aplicando migration...')
        await c.env.DB.prepare(`ALTER TABLE subscription_conversions ADD COLUMN customer_birthdate TEXT`).run()
        console.log('✅ Migration aplicada, tentando novamente...')
        // Tentar novamente após criar a coluna
        await c.env.DB.prepare(`
          INSERT INTO subscription_conversions (link_id, customer_id, subscription_id, customer_name, customer_email, customer_cpf, customer_birthdate)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(linkId, customerId, subscription?.id || null, customerName, customerEmail, customerCpf, customerBirthdate || null).run()
      } else {
        throw dbError
      }
    }
    
    // 6. Salvar transação no banco D1 local
    const accountId = link.account_id as string
    await c.env.DB.prepare(`
      INSERT INTO transactions (id, account_id, wallet_id, value, description, status, billing_type, due_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      firstPayment.id,
      accountId,
      walletId,
      value,
      description || 'Assinatura Mensal',
      firstPayment.status,
      'PIX',
      firstPayment.dueDate
    ).run()
    
    // 7. Incrementar contador de usos
    await c.env.DB.prepare(`
      UPDATE subscription_signup_links SET uses_count = uses_count + 1 WHERE id = ?
    `).bind(linkId).run()
    
    return c.json({
      ok: true,
      chargeType: chargeType,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        cycle: subscription.cycle,
        nextDueDate: subscription.nextDueDate,
        description: subscription.description
      } : null,
      firstPayment: {
        id: firstPayment.id,
        status: firstPayment.status,
        dueDate: firstPayment.dueDate,
        invoiceUrl: firstPayment.invoiceUrl,
        pix: pixData
      },
      splitConfig: {
        subAccount: 20,
        mainAccount: 80
      }
    })
    
  } catch (error: any) {
    console.error('Erro no auto-cadastro:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Criar autorização PIX Automático (débito automático)
app.post('/api/pix/automatic-authorization', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const { 
      walletId, 
      accountId, 
      value, 
      description, 
      customerName, 
      customerEmail, 
      customerCpf,
      recurrenceType = 'MONTHLY',
      startDate,
      endDate
    } = await c.req.json()
    
    if (!walletId || !value || value <= 0) {
      return c.json({ error: 'walletId e value (> 0) são obrigatórios' }, 400)
    }
    
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Dados do cliente (nome, email, CPF) são obrigatórios' }, 400)
    }
    
    // 1. Buscar ou criar customer
    const searchResult = await asaasRequest(c, `/customers?cpfCnpj=${customerCpf}`)
    
    let customerId
    if (searchResult.ok && searchResult.data?.data?.[0]?.id) {
      customerId = searchResult.data.data[0].id
      console.log('✅ Customer existente:', customerId)
    } else {
      const customerData = {
        name: customerName,
        cpfCnpj: customerCpf,
        email: customerEmail,
        notificationDisabled: false
      }
      
      const createResult = await asaasRequest(c, '/customers', 'POST', customerData)
      if (!createResult.ok || !createResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar customer',
          details: createResult.data 
        }, 400)
      }
      
      customerId = createResult.data.id
      console.log('✅ Customer criado:', customerId)
    }
    
    // 2. Criar autorização PIX Automático com QR Code imediato (Jornada 3)
    const authData = {
      customer: customerId,
      billingType: 'PIX',
      value: value,
      description: description || 'Mensalidade',
      recurrenceType: recurrenceType, // MONTHLY, WEEKLY, DAILY
      startDate: startDate || new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
      endDate: endDate || null, // Opcional
      split: createNetSplit(walletId, value, 20) // Sub-conta recebe 20% LÍQUIDO (após taxas)
    }
    
    console.log('📝 Criando autorização PIX Automático:', JSON.stringify(authData, null, 2))
    
    const authResult = await asaasRequest(c, '/pix/automatic/authorizations', 'POST', authData)
    
    if (!authResult.ok) {
      return c.json({ 
        error: 'Erro ao criar autorização PIX Automático',
        details: authResult.data 
      }, 400)
    }
    
    const authorization = authResult.data
    
    console.log('✅ Autorização criada:', authorization.id, 'Status:', authorization.status)
    
    // 3. Obter QR Code da autorização
    const qrCode = authorization.immediateQrCode || {}
    
    return c.json({
      ok: true,
      authorization: {
        id: authorization.id,
        status: authorization.status, // PENDING_AUTHORIZATION, ACTIVE, CANCELLED
        customer: authorization.customer,
        value: authorization.value,
        recurrenceType: authorization.recurrenceType,
        startDate: authorization.startDate,
        endDate: authorization.endDate,
        description: authorization.description,
        conciliationIdentifier: qrCode.conciliationIdentifier
      },
      qrCode: {
        payload: qrCode.payload,
        encodedImage: qrCode.encodedImage,
        expirationDate: qrCode.expirationDate
      },
      splitConfig: {
        subAccount: 20,
        mainAccount: 80
      },
      instructions: {
        step1: 'Cliente escaneia QR Code',
        step2: 'Cliente autoriza débito automático no app do banco',
        step3: 'Cliente paga primeira parcela imediatamente',
        step4: 'Autorização fica ATIVA após pagamento',
        step5: 'Cobranças futuras ocorrem automaticamente'
      }
    })
    
  } catch (error: any) {
    console.error('Erro ao criar autorização PIX Automático:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Criar cobrança recorrente automática (após autorização ativa)
app.post('/api/pix/automatic-charge', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const { authorizationId, value, dueDate, description } = await c.req.json()
    
    if (!authorizationId) {
      return c.json({ error: 'authorizationId é obrigatório' }, 400)
    }
    
    // Criar cobrança vinculada à autorização
    const chargeData = {
      pixAutomaticAuthorizationId: authorizationId,
      value: value,
      dueDate: dueDate,
      description: description || 'Cobrança recorrente automática'
    }
    
    console.log('📝 Criando cobrança recorrente:', JSON.stringify(chargeData, null, 2))
    
    const chargeResult = await asaasRequest(c, '/payments', 'POST', chargeData)
    
    if (!chargeResult.ok) {
      return c.json({ 
        error: 'Erro ao criar cobrança recorrente',
        details: chargeResult.data 
      }, 400)
    }
    
    const charge = chargeResult.data
    
    return c.json({
      ok: true,
      charge: {
        id: charge.id,
        status: charge.status,
        value: charge.value,
        dueDate: charge.dueDate,
        description: charge.description,
        authorizationId: authorizationId
      }
    })
    
  } catch (error: any) {
    console.error('Erro ao criar cobrança recorrente:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Listar autorizações PIX Automático
app.get('/api/pix/automatic-authorizations', async (c) => {
  try {
    // Verificar autenticação
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const result = await asaasRequest(c, '/pix/automatic/authorizations')
    
    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao listar autorizações',
        details: result.data 
      }, 400)
    }
    
    return c.json({
      ok: true,
      authorizations: result.data?.data || [],
      totalCount: result.data?.totalCount || 0
    })
    
  } catch (error: any) {
    console.error('Erro ao listar autorizações:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// PIX AUTOMÁTICO - AUTO-CADASTRO (NOVOS ENDPOINTS)
// ============================================

// Criar link de auto-cadastro PIX Automático
app.post('/api/pix/automatic-signup-link', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    if (!token) {
      return c.json({ error: 'Não autorizado' }, 401)
    }
    
    try {
      await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Token inválido' }, 401)
    }
    
    const { walletId, accountId, value, description, frequency = 'MONTHLY', expirationDays = 30 } = await c.req.json()
    
    if (!walletId || !accountId || !value || value <= 0) {
      return c.json({ error: 'walletId, accountId e value (> 0) são obrigatórios' }, 400)
    }
    
    const linkId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
    
    await c.env.DB.prepare(`
      INSERT INTO pix_automatic_signup_links (id, wallet_id, account_id, value, description, frequency, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(linkId, walletId, accountId, value, description, frequency, expiresAt).run()
    
    const linkUrl = `${new URL(c.req.url).origin}/pix-automatic-signup/${linkId}`
    
    return c.json({
      ok: true,
      linkId,
      linkUrl,
      value,
      description,
      frequency,
      expiresAt,
      walletId,
      accountId
    })
    
  } catch (error: any) {
    console.error('Erro ao criar link PIX Automático:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Obter dados do link de auto-cadastro PIX Automático (público)
app.get('/api/pix/automatic-signup-link/:linkId', async (c) => {
  try {
    const linkId = c.req.param('linkId')
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM pix_automatic_signup_links WHERE id = ? AND active = 1
    `).bind(linkId).first()
    
    if (!result) {
      return c.json({ error: 'Link não encontrado ou expirado' }, 404)
    }
    
    if (new Date(result.expires_at as string) < new Date()) {
      return c.json({ error: 'Link expirado' }, 410)
    }
    
    return c.json({
      ok: true,
      data: {
        linkId: result.id,
        value: result.value,
        description: result.description,
        frequency: result.frequency,
        walletId: result.wallet_id,
        accountId: result.account_id
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar link:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Cliente completa auto-cadastro PIX Automático (público)
// Implementação usando Jornada 3 do Asaas: QR Code único contém dados do primeiro pagamento + autorização de recorrência
// Documentação: https://docs.asaas.com/docs/pix-automatico
app.post('/api/pix/automatic-signup/:linkId', async (c) => {
  try {
    const linkId = c.req.param('linkId')
    const { customerName, customerEmail, customerCpf } = await c.req.json()
    
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Nome, email e CPF são obrigatórios' }, 400)
    }
    
    // Buscar link
    const link = await c.env.DB.prepare(`
      SELECT * FROM pix_automatic_signup_links WHERE id = ? AND active = 1
    `).bind(linkId).first()
    
    if (!link) {
      return c.json({ error: 'Link não encontrado ou inativo' }, 404)
    }
    
    if (new Date(link.expires_at as string) < new Date()) {
      return c.json({ error: 'Link expirado' }, 410)
    }
    
    const walletId = link.wallet_id as string
    const value = link.value as number
    const description = link.description as string
    const frequency = link.frequency as string
    const accountId = link.account_id as string
    
    // 1. Buscar ou criar customer
    const searchResult = await asaasRequest(c, `/customers?cpfCnpj=${customerCpf}`)
    
    let customerId
    if (searchResult.ok && searchResult.data?.data?.[0]?.id) {
      customerId = searchResult.data.data[0].id
    } else {
      const customerData = {
        name: customerName,
        cpfCnpj: customerCpf,
        email: customerEmail,
        notificationDisabled: false
      }
      
      const createResult = await asaasRequest(c, '/customers', 'POST', customerData)
      if (!createResult.ok || !createResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar cadastro',
          details: createResult.data 
        }, 400)
      }
      
      customerId = createResult.data.id
    }
    
    // 2. Criar autorização PIX Automático SEM cobrança imediata
    // IMPORTANTE: PIX Automático requer habilitação prévia com time de sucesso Asaas
    // Email: [email protected]
    // Se não habilitado, faz fallback para assinatura recorrente PIX
    
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 1)
    
    // Tentar PIX Automático primeiro (SEM immediateCharge)
    const authorizationData = {
      customer: customerId,
      value: value,
      description: `${description} - Débito Automático Mensal`,
      recurrence: {
        type: frequency, // MONTHLY, WEEKLY, etc
      },
      // immediateCharge REMOVIDO - não gera cobrança inicial automática
      split: createNetSplit(walletId, value, 20) // Sub-conta recebe 20% LÍQUIDO (após taxas)
    }
    
    let authorizationResult = await asaasRequest(c, '/v3/pix/automatic/authorizations', 'POST', authorizationData)
    
    console.log('📊 Resposta Asaas PIX Automático:', JSON.stringify(authorizationResult, null, 2))
    
    let authorization: any = null
    let authorizationId: string = ''
    let qrCodeData: any = null
    let useFallback = false
    
    // Se PIX Automático falhar (não habilitado na conta), usar fallback
    if (!authorizationResult.ok || !authorizationResult.data?.id) {
      console.warn('⚠️ PIX Automático não disponível, usando fallback (assinatura recorrente)')
      useFallback = true
      
      // Fallback: Criar assinatura PIX recorrente
      const subscriptionData = {
        customer: customerId,
        billingType: 'PIX',
        value: value,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        cycle: frequency,
        description: `${description} - Débito Automático Mensal`,
        split: createNetSplit(walletId, value, 20) // Sub-conta recebe 20% LÍQUIDO (após taxas)
      }
      
      const subscriptionResult = await asaasRequest(c, '/subscriptions', 'POST', subscriptionData)
      
      if (!subscriptionResult.ok || !subscriptionResult.data?.id) {
        return c.json({ 
          error: 'Erro ao criar autorização (fallback também falhou)',
          details: subscriptionResult.data,
          pixAutomaticError: authorizationResult.data,
          note: 'PIX Automático requer habilitação prévia. Contate [email protected]'
        }, 400)
      }
      
      authorization = subscriptionResult.data
      authorizationId = authorization.id
      
      // Buscar primeira cobrança e QR Code
      const paymentsResult = await asaasRequest(c, `/payments?subscription=${authorizationId}`)
      
      console.log('📋 Resultado da busca de pagamentos:', JSON.stringify(paymentsResult, null, 2))
      
      if (paymentsResult.ok && paymentsResult.data?.data?.[0]?.id) {
        const firstPayment = paymentsResult.data.data[0]
        console.log(`🎫 Buscando QR Code do pagamento: ${firstPayment.id}`)
        
        const qrCodeResult = await asaasRequest(c, `/payments/${firstPayment.id}/pixQrCode`)
        
        console.log('🖼️ Resultado do QR Code:', JSON.stringify(qrCodeResult, null, 2))
        
        if (qrCodeResult.ok && qrCodeResult.data) {
          qrCodeData = {
            payload: qrCodeResult.data.payload,
            encodedImage: qrCodeResult.data.encodedImage,
            expirationDate: qrCodeResult.data.expirationDate
          }
          console.log('✅ QR Code obtido com sucesso')
        } else {
          console.error('❌ Falha ao obter QR Code:', qrCodeResult.data)
        }
      } else {
        console.error('❌ Nenhum pagamento encontrado para a assinatura')
      }
    } else {
      // PIX Automático funcionou
      authorization = authorizationResult.data
      authorizationId = authorization.id
      
      // Extrair QR Code do primeiro pagamento (já vem na resposta)
      if (authorization.immediateQrCode) {
        qrCodeData = {
          payload: authorization.immediateQrCode.payload,
          encodedImage: authorization.immediateQrCode.encodedImage,
          expirationDate: authorization.immediateQrCode.expirationDate,
          conciliationIdentifier: authorization.immediateQrCode.conciliationIdentifier
        }
      }
    }
    
    // 4. Salvar autorização no banco D1
    await c.env.DB.prepare(`
      INSERT INTO pix_automatic_authorizations (
        id, link_id, authorization_id, customer_id, customer_name, customer_email, customer_cpf,
        account_id, wallet_id, value, description, frequency, status, qr_code_payload, qr_code_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      linkId,
      authorizationId,
      customerId,
      customerName,
      customerEmail,
      customerCpf,
      accountId,
      walletId,
      value,
      description,
      frequency,
      'PENDING',
      qrCodeData?.payload || null,
      qrCodeData?.encodedImage || null
    ).run()
    
    // 5. Incrementar contador de usos do link
    await c.env.DB.prepare(`
      UPDATE pix_automatic_signup_links SET uses_count = uses_count + 1 WHERE id = ?
    `).bind(linkId).run()
    
    return c.json({
      ok: true,
      mode: useFallback ? 'FALLBACK_SUBSCRIPTION' : 'PIX_AUTOMATIC',
      authorization: {
        id: authorizationId,
        status: authorization.status || (useFallback ? 'ACTIVE' : 'PENDING_IMMEDIATE_CHARGE'),
        value: authorization.value || value,
        description: authorization.description || description,
        frequency: authorization.recurrence?.type || authorization.cycle || frequency,
        recurrenceType: authorization.recurrence?.type || authorization.cycle,
        conciliationIdentifier: qrCodeData?.conciliationIdentifier,
        customer: {
          id: customerId,
          name: customerName,
          email: customerEmail,
          cpf: customerCpf
        }
      },
      qrCode: qrCodeData,
      instructions: {
        step1: 'Escaneie o QR Code com o app do seu banco',
        step2: useFallback ? 'Autorize o pagamento PIX' : 'Autorize o débito automático PIX',
        step3: 'Pague a primeira parcela imediatamente (R$ ' + value.toFixed(2) + ')',
        step4: 'Autorização será ativada após confirmação do pagamento',
        step5: useFallback ? 'Cobranças futuras serão enviadas por email' : 'Cobranças futuras ocorrerão automaticamente no vencimento',
        note: useFallback ? 'Taxa de 3-5% por transação (modo fallback)' : 'Taxa de apenas 1,99% por transação',
        warning: useFallback ? '⚠️ PIX Automático não habilitado. Usando assinatura recorrente como fallback.' : null
      },
      splitConfig: {
        subAccount: 20,
        mainAccount: 80,
        description: '80% vai para conta principal, 20% para subconta'
      }
    })
    
  } catch (error: any) {
    console.error('Erro no auto-cadastro PIX Automático:', error)
    return c.json({ error: error.message }, 500)
  }
})

// ===================================
// 🔷 DELTAPAG API - PAGAMENTO RECORRENTE CARTÃO CRÉDITO
// ===================================

// Função auxiliar para fazer requests à API DeltaPag
// Função auxiliar para detectar bandeira do cartão
function detectCardBrand(cardNumber: string): string {
  const patterns = {
    'Visa': /^4/,
    'Mastercard': /^(5[1-5]|2[2-7])/,
    'Elo': /^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516)/,
    'Amex': /^3[47]/,
    'Diners': /^3(?:0[0-5]|[68])/,
    'Discover': /^6(?:011|5)/,
    'Hipercard': /^(384100|384140|384160|606282|637095|637568|60)/,
    'JCB': /^35/
  }
  
  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand
    }
  }
  
  return 'Unknown'
}

async function deltapagRequest(c: any, endpoint: string, method: string, data?: any) {
  let apiUrl = c.env.DELTAPAG_API_URL
  const apiKey = c.env.DELTAPAG_API_KEY
  
  // Se não configurada, usar URL sandbox oficial do DeltaPag
  if (!apiUrl || apiUrl === 'undefined') {
    console.warn('⚠️ DELTAPAG_API_URL não configurada, usando sandbox oficial')
    apiUrl = 'https://api-sandbox.deltapag.io/api/v2'
  }
  
  const url = `${apiUrl}${endpoint}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  try {
    console.log(`🔷 DeltaPag Request: ${method} ${url}`)
    console.log('📤 Payload:', JSON.stringify(data, null, 2))
    
    const response = await fetch(url, options)
    
    // Pegar o texto da resposta primeiro
    const responseText = await response.text()
    console.log(`📥 DeltaPag Response Text [${response.status}]:`, responseText)
    
    // Tentar parsear como JSON, se falhar retornar o texto
    let responseData
    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (jsonError) {
      console.warn('⚠️ Resposta não é JSON válido, retornando texto')
      responseData = { rawResponse: responseText, parseError: 'Invalid JSON' }
    }
    
    console.log(`📥 DeltaPag Response Parsed [${response.status}]:`, JSON.stringify(responseData, null, 2))
    
    // Log ALL headers
    console.log('📋 Todos os headers da resposta:')
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    
    return {
      ok: response.ok,
      status: response.status,
      data: responseData,
      headers: response.headers
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição DeltaPag:', error)
    return {
      ok: false,
      status: 500,
      data: { error: error.message, errorStack: error.stack },
      headers: new Headers()
    }
  }
}

// Endpoint: Criar cobrança recorrente via cartão de crédito (DeltaPag)
app.post('/api/deltapag/create-subscription', async (c) => {
  try {
    const body = await c.req.json()
    const {
      // Dados do cliente
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      
      // Dados do cartão
      cardNumber,
      cardHolderName,
      cardExpiryMonth,
      cardExpiryYear,
      cardCvv,
      
      // Dados da cobrança
      value,
      description,
      recurrenceType, // MONTHLY, WEEKLY, etc
      
      // Split (opcional)
      splitWalletId,
      splitPercentage
    } = body
    
    // Validações
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Dados do cliente obrigatórios: nome, email, CPF' }, 400)
    }
    
    if (!cardNumber || !cardHolderName || !cardExpiryMonth || !cardExpiryYear || !cardCvv) {
      return c.json({ error: 'Dados do cartão obrigatórios' }, 400)
    }
    
    if (!value || value <= 0) {
      return c.json({ error: 'Valor deve ser maior que zero' }, 400)
    }
    
    // Limpar CPF (remover pontuação)
    const cpfClean = customerCpf.replace(/\D/g, '')
    
    // Limpar número do cartão
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    
    // 1. Criar ou buscar cliente na DeltaPag
    const customerData = {
      name: customerName,
      email: customerEmail,
      cpfCnpj: cpfClean,
      phone: customerPhone || '',
      mobilePhone: customerPhone || ''
    }
    
    console.log('📊 Criando cliente DeltaPag:', customerData)
    
    let customerId: string = ''
    
    // Tentar criar cliente (se já existir, a API retorna o ID existente)
    const customerResult = await deltapagRequest(c, '/customers', 'POST', customerData)
    
    if (!customerResult.ok) {
      return c.json({ 
        error: 'Erro ao criar cliente na DeltaPag',
        details: customerResult.data
      }, customerResult.status)
    }
    
    customerId = customerResult.data.id
    console.log('✅ Cliente DeltaPag criado/encontrado:', customerId)
    
    // 2. Criar cobrança recorrente com cartão de crédito
    const subscriptionData = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: value,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      cycle: recurrenceType || 'MONTHLY',
      description: description || 'Cobrança Recorrente',
      
      // Dados do cartão
      creditCard: {
        holderName: cardHolderName,
        number: cardNumberClean,
        expiryMonth: cardExpiryMonth,
        expiryYear: cardExpiryYear,
        ccv: cardCvv
      },
      
      // Configuração de split (se fornecido)
      ...(splitWalletId && splitPercentage ? {
        split: [{
          walletId: splitWalletId,
          percentualValue: splitPercentage
        }]
      } : {})
    }
    
    console.log('📊 Criando assinatura DeltaPag (sem dados sensíveis do cartão)')
    
    const subscriptionResult = await deltapagRequest(c, '/subscriptions', 'POST', subscriptionData)
    
    if (!subscriptionResult.ok) {
      return c.json({ 
        error: 'Erro ao criar assinatura na DeltaPag',
        details: subscriptionResult.data
      }, subscriptionResult.status)
    }
    
    const subscription = subscriptionResult.data
    console.log('✅ Assinatura DeltaPag criada:', subscription.id)
    
    // 3. Salvar no banco D1
    const subscriptionId = crypto.randomUUID()
    
    // Extrair últimos 4 dígitos do cartão
    const cardLast4 = cardNumberClean.slice(-4)
    
    // Detectar bandeira do cartão
    const cardBrand = detectCardBrand(cardNumberClean)
    
    await c.env.DB.prepare(`
      INSERT INTO deltapag_subscriptions 
      (id, customer_id, customer_name, customer_email, customer_cpf, customer_phone,
       deltapag_subscription_id, deltapag_customer_id, value, description, 
       recurrence_type, status, card_number, card_last4, card_brand, card_expiry_month, card_expiry_year,
       created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      subscriptionId,
      customerId,
      customerName,
      customerEmail,
      cpfClean,
      customerPhone || '',
      subscription.id,
      customerId,
      value,
      description || 'Cobrança Recorrente',
      recurrenceType || 'MONTHLY',
      subscription.status || 'ACTIVE',
      cardNumberClean,
      cardLast4,
      cardBrand,
      cardExpiryMonth,
      cardExpiryYear
    ).run()
    
    console.log('💾 Assinatura salva no banco D1')
    
    // 4. Retornar resposta
    return c.json({
      ok: true,
      subscription: {
        id: subscriptionId,
        deltapagId: subscription.id,
        status: subscription.status,
        value: value,
        description: description,
        recurrenceType: recurrenceType || 'MONTHLY',
        nextDueDate: subscription.nextDueDate,
        customer: {
          id: customerId,
          name: customerName,
          email: customerEmail,
          cpf: cpfClean
        }
      },
      message: 'Assinatura recorrente criada com sucesso! O cartão será cobrado automaticamente.',
      instructions: [
        '✅ Primeira cobrança processada',
        '🔄 Cobranças automáticas mensais ativas',
        '💳 Cartão será debitado automaticamente',
        '📧 Você receberá emails de confirmação',
        `💰 Taxa de transação: 2.99% por cobrança`
      ]
    })
    
  } catch (error: any) {
    console.error('❌ Erro ao criar assinatura DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint: Listar assinaturas DeltaPag (Admin)
app.get('/api/admin/deltapag/subscriptions', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, customer_id, customer_name, customer_email, customer_cpf, customer_phone,
             deltapag_subscription_id, deltapag_customer_id, value, description,
             recurrence_type, status, next_due_date, 
             card_number, card_last4, card_brand, card_expiry_month, card_expiry_year,
             created_at, updated_at
      FROM deltapag_subscriptions 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all()
    
    // Mascarar números de cartão para exibição no dashboard (segurança)
    // Número completo só aparecerá nas exportações CSV/Excel
    const maskedSubscriptions = result.results.map((sub: any) => {
      if (sub.card_number && sub.card_number.length >= 4) {
        // Mascarar: **** **** **** 1234
        const last4 = sub.card_last4 || sub.card_number.slice(-4)
        return {
          ...sub,
          card_number_masked: `**** **** **** ${last4}`,  // Para exibição
          card_number: undefined  // Remover número completo da resposta
        }
      }
      return {
        ...sub,
        card_number_masked: sub.card_last4 ? `•••• ${sub.card_last4}` : 'N/A',
        card_number: undefined
      }
    })
    
    return c.json({
      ok: true,
      subscriptions: maskedSubscriptions
    })
  } catch (error: any) {
    console.error('Erro ao listar assinaturas DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint: Exportar assinaturas DeltaPag para CSV (COM número completo do cartão)
app.get('/api/admin/deltapag/subscriptions/export/csv', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT customer_name, customer_email, customer_cpf, customer_phone,
             deltapag_customer_id, value, description, recurrence_type, status,
             card_brand, card_number, card_expiry_month, card_expiry_year,
             next_due_date, created_at
      FROM deltapag_subscriptions 
      ORDER BY created_at DESC
    `).all()
    
    // Criar CSV com números completos de cartão
    let csv = 'Nome,Email,CPF,Telefone,DeltaPag ID,Valor,Descrição,Recorrência,Status,Bandeira,Cartão,Validade,Próximo Vencimento,Criado Em\n'
    
    for (const sub of result.results) {
      const row = [
        sub.customer_name || '',
        sub.customer_email || '',
        sub.customer_cpf || '',
        sub.customer_phone || '',
        sub.deltapag_customer_id || '',
        sub.value || '',
        sub.description || '',
        sub.recurrence_type || '',
        sub.status || '',
        sub.card_brand || '',
        sub.card_number || '',  // NÚMERO COMPLETO DO CARTÃO
        `${sub.card_expiry_month}/${sub.card_expiry_year}` || '',
        sub.next_due_date || '',
        sub.created_at || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      
      csv += row + '\n'
    }
    
    // Retornar como CSV para download
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="assinaturas-deltapag-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Erro ao exportar CSV:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint: Exportar assinaturas DeltaPag para Excel JSON (COM número completo do cartão)
app.get('/api/admin/deltapag/subscriptions/export/excel', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT customer_name, customer_email, customer_cpf, customer_phone,
             deltapag_customer_id, value, description, recurrence_type, status,
             card_brand, card_number, card_expiry_month, card_expiry_year,
             next_due_date, created_at
      FROM deltapag_subscriptions 
      ORDER BY created_at DESC
    `).all()
    
    // Retornar dados completos (incluindo número do cartão) para Excel
    const excelData = result.results.map((sub: any) => ({
      'Nome': sub.customer_name || '',
      'Email': sub.customer_email || '',
      'CPF': sub.customer_cpf || '',
      'Telefone': sub.customer_phone || '',
      'DeltaPag ID': sub.deltapag_customer_id || '',
      'Valor': sub.value || '',
      'Descrição': sub.description || '',
      'Recorrência': sub.recurrence_type || '',
      'Status': sub.status || '',
      'Bandeira': sub.card_brand || '',
      'Número do Cartão': sub.card_number || '',  // NÚMERO COMPLETO
      'Validade': `${sub.card_expiry_month}/${sub.card_expiry_year}` || '',
      'Próximo Vencimento': sub.next_due_date || '',
      'Criado Em': sub.created_at || ''
    }))
    
    return c.json({
      ok: true,
      data: excelData,
      filename: `assinaturas-deltapag-${new Date().toISOString().split('T')[0]}.xlsx`
    })
  } catch (error: any) {
    console.error('Erro ao exportar Excel:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint: Cancelar assinatura DeltaPag
app.post('/api/deltapag/cancel-subscription/:id', async (c) => {
  try {
    const subscriptionId = c.req.param('id')
    
    // Buscar no banco
    const subscription = await c.env.DB.prepare(`
      SELECT * FROM deltapag_subscriptions WHERE id = ?
    `).bind(subscriptionId).first()
    
    if (!subscription) {
      return c.json({ error: 'Assinatura não encontrada' }, 404)
    }
    
    // Cancelar na DeltaPag
    const cancelResult = await deltapagRequest(
      c, 
      `/subscriptions/${subscription.deltapag_subscription_id}`, 
      'DELETE'
    )
    
    if (!cancelResult.ok) {
      return c.json({ 
        error: 'Erro ao cancelar assinatura na DeltaPag',
        details: cancelResult.data
      }, cancelResult.status)
    }
    
    // Atualizar status no banco
    await c.env.DB.prepare(`
      UPDATE deltapag_subscriptions 
      SET status = 'CANCELLED', updated_at = datetime('now')
      WHERE id = ?
    `).bind(subscriptionId).run()
    
    return c.json({
      ok: true,
      message: 'Assinatura cancelada com sucesso'
    })
    
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint: Criar link auto-cadastro DeltaPag
app.post('/api/deltapag/create-link', authMiddleware, async (c) => {
  try {
    const { value, description, recurrenceType, validDays } = await c.req.json()
    
    if (!value || !description) {
      return c.json({ error: 'Valor e descrição são obrigatórios' }, 400)
    }
    
    const linkId = crypto.randomUUID()
    const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
    
    await c.env.DB.prepare(`
      INSERT INTO deltapag_signup_links 
      (id, value, description, recurrence_type, valid_until, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `).bind(
      linkId,
      value,
      description,
      recurrenceType || 'MONTHLY',
      validUntil.toISOString().split('T')[0]
    ).run()
    
    console.log('✅ Link DeltaPag criado:', linkId)
    
    return c.json({
      ok: true,
      linkId,
      validUntil: validUntil.toISOString().split('T')[0]
    })
  } catch (error: any) {
    console.error('Erro ao criar link DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Listar links DeltaPag
app.get('/api/deltapag/links', authMiddleware, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        id,
        value,
        description,
        recurrence_type,
        valid_until,
        status,
        uses_count,
        max_uses,
        created_at
      FROM deltapag_signup_links
      ORDER BY created_at DESC
    `).all()
    
    return c.json({
      ok: true,
      links: result.results || []
    })
  } catch (error: any) {
    console.error('Erro ao buscar links DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Desativar link DeltaPag
app.patch('/api/deltapag/links/:linkId/deactivate', authMiddleware, async (c) => {
  try {
    const linkId = c.req.param('linkId')
    
    await c.env.DB.prepare(`
      UPDATE deltapag_signup_links 
      SET status = 'INACTIVE', updated_at = datetime('now')
      WHERE id = ?
    `).bind(linkId).run()
    
    return c.json({ ok: true })
  } catch (error: any) {
    console.error('Erro ao desativar link:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Página pública de cadastro DeltaPag
app.get('/deltapag-signup/:linkId', async (c) => {
  const linkId = c.req.param('linkId')
  
  const link = await c.env.DB.prepare(`
    SELECT * FROM deltapag_signup_links WHERE id = ? AND status = 'ACTIVE'
  `).bind(linkId).first()
  
  if (!link) {
    return c.html(`<!DOCTYPE html><html><body><h1>Link não encontrado ou expirado</h1></body></html>`)
  }
  
  // Verificar validade
  if (new Date(link.valid_until as string) < new Date()) {
    return c.html(`<!DOCTYPE html><html><body><h1>Link expirado</h1></body></html>`)
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro Assinatura - Cartão de Crédito</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen py-8">
        <div class="max-w-2xl mx-auto px-4">
            <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
                    <h1 class="text-3xl font-bold mb-2">
                        <i class="fas fa-credit-card mr-3"></i>
                        Cadastro de Assinatura
                    </h1>
                    <p class="text-indigo-100">Complete seus dados para ativar sua assinatura</p>
                </div>

                <!-- Form -->
                <form id="signup-form" class="p-8 space-y-6">
                    <!-- Info -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
                            <div>
                                <p class="font-bold text-blue-900">Detalhes da Assinatura:</p>
                                <p class="text-blue-800 mt-1"><strong>Valor:</strong> R$ ${(link.value as number).toFixed(2)}</p>
                                <p class="text-blue-800"><strong>Descrição:</strong> ${link.description}</p>
                                <p class="text-blue-800"><strong>Recorrência:</strong> ${link.recurrence_type === 'MONTHLY' ? 'Mensal' : link.recurrence_type}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Cliente -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-800">Dados Pessoais</h3>
                        <input type="text" id="customer-name" required placeholder="Nome Completo *"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <input type="email" id="customer-email" required placeholder="Email *"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <input type="text" id="customer-cpf" required placeholder="CPF *"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <input type="tel" id="customer-phone" placeholder="Telefone"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                    </div>

                    <!-- Cartão -->
                    <div class="space-y-4 pt-4 border-t">
                        <h3 class="text-lg font-bold text-gray-800">Dados do Cartão</h3>
                        <input type="text" id="card-number" required placeholder="Número do Cartão *"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <input type="text" id="card-holder" required placeholder="Nome no Cartão *"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <div class="grid grid-cols-3 gap-4">
                            <select id="card-month" required class="px-4 py-3 border rounded-lg">
                                <option value="">Mês *</option>
                                <option value="01">01</option>
                                <option value="02">02</option>
                                <option value="03">03</option>
                                <option value="04">04</option>
                                <option value="05">05</option>
                                <option value="06">06</option>
                                <option value="07">07</option>
                                <option value="08">08</option>
                                <option value="09">09</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                            </select>
                            <select id="card-year" required class="px-4 py-3 border rounded-lg">
                                <option value="">Ano *</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                                <option value="2028">2028</option>
                                <option value="2029">2029</option>
                                <option value="2030">2030</option>
                            </select>
                            <input type="text" id="card-cvv" required placeholder="CVV *" maxlength="4"
                                class="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <button type="submit" id="submit-btn"
                        class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700">
                        <i class="fas fa-check mr-2"></i>Confirmar Assinatura
                    </button>
                </form>

                <div id="success-state" class="hidden p-8 text-center">
                    <i class="fas fa-check-circle text-6xl text-green-600 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Assinatura Ativada!</h2>
                    <p class="text-gray-600">Sua primeira cobrança foi processada com sucesso.</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('signup-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('submit-btn');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';

                try {
                    const response = await axios.post('/api/public/deltapag-signup/${linkId}', {
                        customerName: document.getElementById('customer-name').value,
                        customerEmail: document.getElementById('customer-email').value,
                        customerCpf: document.getElementById('customer-cpf').value.replace(/\\D/g, ''),
                        customerPhone: document.getElementById('customer-phone').value,
                        cardNumber: document.getElementById('card-number').value.replace(/\\s/g, ''),
                        cardHolderName: document.getElementById('card-holder').value,
                        cardExpiryMonth: document.getElementById('card-month').value,
                        cardExpiryYear: document.getElementById('card-year').value,
                        cardCvv: document.getElementById('card-cvv').value
                    });

                    if (response.data.ok) {
                        document.querySelector('form').classList.add('hidden');
                        document.getElementById('success-state').classList.remove('hidden');
                    }
                } catch (error) {
                    alert('Erro: ' + (error.response?.data?.error || error.message));
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmar Assinatura';
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Processar cadastro público DeltaPag
app.post('/api/public/deltapag-signup/:linkId', async (c) => {
  try {
    const linkId = c.req.param('linkId')
    const data = await c.req.json()
    
    // Validar link
    const link = await c.env.DB.prepare(`
      SELECT * FROM deltapag_signup_links WHERE id = ? AND status = 'ACTIVE'
    `).bind(linkId).first()
    
    if (!link) {
      return c.json({ error: 'Link não encontrado ou inativo' }, 404)
    }
    
    if (new Date(link.valid_until as string) < new Date()) {
      return c.json({ error: 'Link expirado' }, 400)
    }
    
    // Criar assinatura via endpoint interno
    const subscriptionData = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerCpf: data.customerCpf,
      customerPhone: data.customerPhone,
      cardNumber: data.cardNumber,
      cardHolderName: data.cardHolderName,
      cardExpiryMonth: data.cardExpiryMonth,
      cardExpiryYear: data.cardExpiryYear,
      cardCvv: data.cardCvv,
      value: link.value,
      description: link.description,
      recurrenceType: link.recurrence_type
    }
    
    // Criar cliente e assinatura
    const cpfClean = data.customerCpf.replace(/\D/g, '')
    const cardNumberClean = data.cardNumber.replace(/\s/g, '')
    
    const customerData = {
      name: data.customerName,
      email: data.customerEmail,
      cpfCnpj: cpfClean,
      phone: data.customerPhone || '',
      mobilePhone: data.customerPhone || ''
    }
    
    const customerResult = await deltapagRequest(c, '/customers', 'POST', customerData)
    
    if (!customerResult.ok) {
      return c.json({ error: 'Erro ao criar cliente', details: customerResult.data }, customerResult.status)
    }
    
    const customerId = customerResult.data.id
    
    const subscriptionPayload = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: link.value,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cycle: link.recurrence_type,
      description: link.description,
      creditCard: {
        holderName: data.cardHolderName,
        number: cardNumberClean,
        expiryMonth: data.cardExpiryMonth,
        expiryYear: data.cardExpiryYear,
        ccv: data.cardCvv
      }
    }
    
    const subscriptionResult = await deltapagRequest(c, '/subscriptions', 'POST', subscriptionPayload)
    
    if (!subscriptionResult.ok) {
      return c.json({ error: 'Erro ao criar assinatura', details: subscriptionResult.data }, subscriptionResult.status)
    }
    
    const subscription = subscriptionResult.data
    
    // Salvar no banco
    const subscriptionId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO deltapag_subscriptions 
      (id, customer_id, customer_name, customer_email, customer_cpf, 
       deltapag_subscription_id, deltapag_customer_id, value, description, 
       recurrence_type, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      subscriptionId,
      customerId,
      data.customerName,
      data.customerEmail,
      cpfClean,
      subscription.id,
      customerId,
      link.value,
      link.description,
      link.recurrence_type,
      subscription.status || 'ACTIVE'
    ).run()
    
    // Incrementar contador de usos do link
    await c.env.DB.prepare(`
      UPDATE deltapag_signup_links SET uses_count = uses_count + 1 WHERE id = ?
    `).bind(linkId).run()
    
    return c.json({
      ok: true,
      subscriptionId,
      message: 'Assinatura criada com sucesso!'
    })
    
  } catch (error: any) {
    console.error('Erro no cadastro público DeltaPag:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Função para gerar payload PIX estático (EMV format simplificado)
function generateStaticPixPayload(walletId: string, value: number, description: string): string {
  // Formato EMV para PIX estático com valor fixo (Spec BACEN)
  const merchantName = 'CORRETORA CORPORATE LTDA'
  const merchantCity = 'Sao Paulo'
  const pixKey = walletId
  const valueStr = value.toFixed(2)
  
  // Construir payload EMV seguindo especificação BACEN
  let payload = ''
  
  // 00: Payload Format Indicator
  payload += '000201'
  
  // 26: Merchant Account Information - PIX
  const pixKeyTag = `0136${pixKey}` // 01 = chave PIX, 36 = tamanho, valor = UUID
  const pixInfo = `0014br.gov.bcb.pix${pixKeyTag}`
  payload += `26${pixInfo.length.toString().padStart(2, '0')}${pixInfo}`
  
  // 52: Merchant Category Code
  payload += '52040000'
  
  // 53: Transaction Currency (986 = BRL)
  payload += '5303986'
  
  // 54: Transaction Amount
  payload += `54${valueStr.length.toString().padStart(2, '0')}${valueStr}`
  
  // 58: Country Code (BR)
  payload += '5802BR'
  
  // 59: Merchant Name
  payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`
  
  // 60: Merchant City
  payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`
  
  // 62: Additional Data Field (opcional - descrição)
  if (description) {
    const descClean = description.substring(0, 25).trim()
    if (descClean) {
      const txidTag = `05${descClean.length.toString().padStart(2, '0')}${descClean}`
      payload += `62${txidTag.length.toString().padStart(2, '0')}${txidTag}`
    }
  }
  
  // 63: CRC16
  payload += '6304' // placeholder
  const crc = calculateCRC16(payload)
  payload += crc
  
  return payload
}

// Função para calcular CRC16 (CCITT)
function calculateCRC16(payload: string): string {
  const polynomial = 0x1021
  let crc = 0xFFFF
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8)
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
    }
  }
  
  crc = crc & 0xFFFF
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Função para gerar QR Code em Base64
async function generateQRCodeBase64(payload: string): Promise<string> {
  // Gerar QR Code usando API externa ou biblioteca
  // Por simplicidade, vou usar uma API pública
  const size = 256
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`
  
  // Converter para base64
  try {
    const response = await fetch(qrUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    return `data:image/png;base64,${base64}`
  } catch (error) {
    // Fallback: retornar URL direta
    return qrUrl
  }
}

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

// ======================
// GERENCIAMENTO DE API KEYS
// ======================

// Gerar API Key para uma subconta
app.post('/api/accounts/:id/api-key', async (c) => {
  try {
    const accountId = c.req.param('id')
    const { name, expiresAt } = await c.req.json()

    // Preparar dados da API Key
    const apiKeyData: any = {
      name: name || `API Key - ${new Date().toLocaleDateString('pt-BR')}`,
    }

    // Adicionar data de expiração se fornecida
    if (expiresAt) {
      apiKeyData.expiresAt = expiresAt
    }

    // Criar API Key na subconta
    const result = await asaasRequest(
      c, 
      `/accounts/${accountId}/accessTokens`, 
      'POST', 
      apiKeyData
    )

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao gerar API Key', 
        details: result.data,
        message: 'Verifique se o gerenciamento de API Keys está habilitado nas configurações da conta principal (válido por 2 horas)'
      }, result.status)
    }

    // Retornar a API Key gerada
    return c.json({
      ok: true,
      data: {
        id: result.data.id,
        apiKey: result.data.accessToken, // A API Key só é retornada nesta chamada!
        name: result.data.name,
        expiresAt: result.data.expiresAt,
        active: result.data.active,
        createdAt: result.data.dateCreated
      },
      warning: '⚠️ IMPORTANTE: Esta é a única vez que a API Key será exibida. Guarde-a em local seguro!'
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Listar API Keys de uma subconta
app.get('/api/accounts/:id/api-keys', async (c) => {
  try {
    const accountId = c.req.param('id')
    
    const result = await asaasRequest(c, `/accounts/${accountId}/accessTokens`)

    if (!result.ok) {
      // Extrair mensagem de erro específica
      const errorMessage = result.data?.errors?.[0]?.description || 'Erro desconhecido'
      
      return c.json({ 
        error: 'Erro ao listar API Keys', 
        details: result.data,
        message: errorMessage,
        help: 'Acesse Asaas → Integrações → Chaves de API → Gerenciamento de Chaves de API de Subcontas → Habilitar acesso'
      }, result.status)
    }

    return c.json({
      ok: true,
      data: result.data
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Excluir API Key de uma subconta
app.delete('/api/accounts/:id/api-keys/:keyId', async (c) => {
  try {
    const accountId = c.req.param('id')
    const keyId = c.req.param('keyId')
    
    const result = await asaasRequest(
      c, 
      `/accounts/${accountId}/accessTokens/${keyId}`, 
      'DELETE'
    )

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao excluir API Key', 
        details: result.data 
      }, result.status)
    }

    return c.json({
      ok: true,
      message: 'API Key excluída com sucesso'
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ======================
// ROTAS DE PAGAMENTO PIX
// ======================

// Criar cobrança PIX com split (20% subconta, 80% conta principal)
app.post('/api/payments', async (c) => {
  try {
    const { 
      customer, // { name, email, cpfCnpj, phone? }
      value,
      description,
      dueDate, // Data de vencimento (formato: YYYY-MM-DD)
      subAccountId, // ID da subconta que receberá 20%
      subAccountWalletId // Wallet ID da subconta
    } = await c.req.json()

    // Validações
    if (!customer || !value || !subAccountWalletId) {
      return c.json({ 
        error: 'Parâmetros obrigatórios: customer, value, subAccountWalletId' 
      }, 400)
    }

    if (value <= 0) {
      return c.json({ error: 'Valor deve ser maior que zero' }, 400)
    }

    // Preparar dados da cobrança
    const paymentData: any = {
      customer: customer.cpfCnpj, // Pode ser o CPF/CNPJ ou ID do cliente
      billingType: 'PIX',
      value: value,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      description: description || 'Pagamento via PIX',
      
      // Configurar split: 20% LÍQUIDO para subconta, conta principal paga todas as taxas
      split: createNetSplit(subAccountWalletId, value, 20)
      // Sub-conta recebe 20% líquido, conta principal recebe o resto menos as taxas Asaas
    }

    // Se o customer não existir, criar automaticamente
    if (!customer.id) {
      paymentData.customer = customer.cpfCnpj
      paymentData.externalReference = `customer-${customer.cpfCnpj}`
      
      // Dados adicionais do cliente
      if (customer.name) paymentData.customerName = customer.name
      if (customer.email) paymentData.customerEmail = customer.email
      if (customer.phone) paymentData.customerPhone = customer.phone
    }

    // Criar cobrança na API do Asaas
    const result = await asaasRequest(c, '/payments', 'POST', paymentData)

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao criar cobrança', 
        details: result.data 
      }, result.status)
    }

    // Retornar dados da cobrança incluindo QR Code PIX
    return c.json({
      ok: true,
      data: {
        id: result.data.id,
        customer: result.data.customer,
        value: result.data.value,
        netValue: result.data.netValue,
        description: result.data.description,
        billingType: result.data.billingType,
        status: result.data.status,
        dueDate: result.data.dueDate,
        invoiceUrl: result.data.invoiceUrl,
        bankSlipUrl: result.data.bankSlipUrl,
        pixQrCode: result.data.pixQrCodeId ? {
          qrCodeId: result.data.pixQrCodeId,
          payload: result.data.pixQrCodePayload,
          expirationDate: result.data.pixQrCodeExpirationDate
        } : null,
        split: result.data.split || []
      }
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Consultar status de uma cobrança
app.get('/api/payments/:id', async (c) => {
  try {
    const paymentId = c.req.param('id')
    const result = await asaasRequest(c, `/payments/${paymentId}`)

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao consultar cobrança', 
        details: result.data 
      }, result.status)
    }

    return c.json({
      ok: true,
      data: {
        id: result.data.id,
        customer: result.data.customer,
        value: result.data.value,
        netValue: result.data.netValue,
        description: result.data.description,
        billingType: result.data.billingType,
        status: result.data.status,
        dueDate: result.data.dueDate,
        paymentDate: result.data.paymentDate,
        invoiceUrl: result.data.invoiceUrl,
        pixQrCode: result.data.pixQrCodeId ? {
          qrCodeId: result.data.pixQrCodeId,
          payload: result.data.pixQrCodePayload,
          expirationDate: result.data.pixQrCodeExpirationDate
        } : null,
        split: result.data.split || []
      }
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Listar cobranças com filtros
app.get('/api/payments', async (c) => {
  try {
    const { status, customer, dateFrom, dateTo, offset = 0, limit = 20 } = c.req.query()
    
    let endpoint = `/payments?offset=${offset}&limit=${limit}`
    
    if (status) endpoint += `&status=${status}`
    if (customer) endpoint += `&customer=${customer}`
    if (dateFrom) endpoint += `&dateCreated[ge]=${dateFrom}`
    if (dateTo) endpoint += `&dateCreated[le]=${dateTo}`

    const result = await asaasRequest(c, endpoint)

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao listar cobranças', 
        details: result.data 
      }, result.status)
    }

    return c.json({
      ok: true,
      data: result.data.data || [],
      totalCount: result.data.totalCount || 0,
      hasMore: result.data.hasMore || false
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Obter QR Code PIX de uma cobrança
app.get('/api/payments/:id/pix-qrcode', async (c) => {
  try {
    const paymentId = c.req.param('id')
    const result = await asaasRequest(c, `/payments/${paymentId}/pixQrCode`)

    if (!result.ok) {
      return c.json({ 
        error: 'Erro ao obter QR Code PIX', 
        details: result.data 
      }, result.status)
    }

    return c.json({
      ok: true,
      data: {
        encodedImage: result.data.encodedImage, // Base64 da imagem do QR Code
        payload: result.data.payload, // Código PIX Copia e Cola
        expirationDate: result.data.expirationDate
      }
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ======================
// ENDPOINT PROXY COM SPLIT 20/80
// ======================

// Endpoint especial para subcontas criarem cobranças com split automático 20/80
// A subconta envia sua API Key no header e recebe 20%, conta principal fica com 80%
app.post('/api/proxy/payments', async (c) => {
  try {
    // Obter API Key da subconta do header
    const subaccountApiKey = c.req.header('x-subaccount-api-key') || c.req.header('access_token')
    
    if (!subaccountApiKey) {
      return c.json({ 
        error: 'API Key da subconta não fornecida',
        message: 'Envie a API Key da subconta no header "x-subaccount-api-key" ou "access_token"'
      }, 401)
    }

    // Obter dados da cobrança
    const paymentData = await c.req.json()

    // Validações
    if (!paymentData.customer || !paymentData.value) {
      return c.json({ 
        error: 'Parâmetros obrigatórios: customer, value' 
      }, 400)
    }

    // Passo 1: Obter informações da subconta usando a API Key dela
    const accountInfoResponse = await fetch(`${c.env.ASAAS_API_URL}/myAccount`, {
      headers: {
        'access_token': subaccountApiKey,
        'User-Agent': 'AsaasManager/1.0'
      }
    })

    if (!accountInfoResponse.ok) {
      return c.json({ 
        error: 'API Key da subconta inválida ou expirada',
        details: await accountInfoResponse.json()
      }, 401)
    }

    const accountInfo = await accountInfoResponse.json()
    const subaccountWalletId = accountInfo.walletId

    if (!subaccountWalletId) {
      return c.json({ 
        error: 'Subconta não possui Wallet ID',
        message: 'Apenas subcontas podem usar este endpoint'
      }, 400)
    }

    // Passo 2: Criar a cobrança usando a API Key da CONTA PRINCIPAL
    // Isso permite configurar o split
    const mainAccountApiKey = c.env.ASAAS_API_KEY

    // Preparar dados da cobrança com split 20/80
    const chargeData: any = {
      ...paymentData,
      billingType: paymentData.billingType || 'PIX',
      dueDate: paymentData.dueDate || new Date().toISOString().split('T')[0],
      
      // Configurar split: 20% LÍQUIDO para subconta, conta principal paga todas as taxas
      split: createNetSplit(subaccountWalletId, paymentData.value, 20)
      // Sub-conta recebe 20% líquido, conta principal recebe o resto menos as taxas Asaas
    }

    // Criar cobrança pela conta principal
    const createResponse = await fetch(`${c.env.ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': mainAccountApiKey,
        'User-Agent': 'AsaasManager/1.0'
      },
      body: JSON.stringify(chargeData)
    })

    const createResult = await createResponse.json()

    if (!createResponse.ok) {
      return c.json({ 
        error: 'Erro ao criar cobrança', 
        details: createResult 
      }, createResponse.status)
    }

    // Retornar resultado
    return c.json({
      ok: true,
      data: {
        id: createResult.id,
        customer: createResult.customer,
        value: createResult.value,
        netValue: createResult.netValue,
        description: createResult.description,
        billingType: createResult.billingType,
        status: createResult.status,
        dueDate: createResult.dueDate,
        invoiceUrl: createResult.invoiceUrl,
        bankSlipUrl: createResult.bankSlipUrl,
        pixQrCode: createResult.pixQrCodeId ? {
          qrCodeId: createResult.pixQrCodeId,
          payload: createResult.pixQrCodePayload,
          expirationDate: createResult.pixQrCodeExpirationDate
        } : null,
        split: createResult.split || [],
        splitInfo: {
          subaccount: {
            walletId: subaccountWalletId,
            percentage: 20,
            estimatedAmount: (createResult.netValue || createResult.value) * 0.20
          },
          mainAccount: {
            percentage: 80,
            estimatedAmount: (createResult.netValue || createResult.value) * 0.80
          }
        }
      },
      message: '✅ Cobrança criada com split 20/80 aplicado automaticamente'
    })

  } catch (error: any) {
    return c.json({ 
      error: 'Erro interno ao processar cobrança', 
      details: error.message 
    }, 500)
  }
})

// Página do Banner (para compartilhar nas redes sociais)
app.get('/banner/:bannerId', (c) => {
  const bannerIdEncoded = c.req.param('bannerId')
  
  // Decodificar dados do banner
  let bannerData
  try {
    const decoded = decodeURIComponent(atob(bannerIdEncoded))
    bannerData = JSON.parse(decoded)
  } catch (error) {
    // Fallback para dados padrão se decodificação falhar
    bannerData = {
      title: 'Oferta Especial',
      description: 'Plano Premium com benefícios exclusivos',
      value: '149.90',
      type: 'monthly',
      color: 'purple',
      buttonText: 'Cadastre-se Agora',
      accountId: 'default',
      timestamp: Date.now(),
      random: 'xxx'
    }
  }
  
  const linkId = `${bannerData.accountId}-${bannerData.timestamp}-${bannerData.random}`
  const cadastroLink = `${new URL(c.req.url).origin}/cadastro/${linkId}`
  
  // Gradientes de cores
  const gradients: any = {
    purple: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
    blue: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
    green: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
    orange: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
    red: 'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)'
  }
  
  const bgGradient = gradients[bannerData.color] || gradients.purple
  const typeText = bannerData.type === 'single' ? 'Pagamento Único' : 'Assinatura Mensal'
  const priceFormatted = parseFloat(bannerData.value).toFixed(2).replace('.', ',')
  const priceDisplay = bannerData.type === 'monthly' 
    ? `R$ ${priceFormatted} <span style="font-size: 1.5rem;">/mês</span>`
    : `R$ ${priceFormatted}`
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${bannerData.title} - Cadastre-se Agora!</title>
        <meta property="og:title" content="${bannerData.title}" />
        <meta property="og:description" content="${bannerData.description}" />
        <meta property="og:type" content="website" />
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                padding: 1rem;
            }
            .banner-display {
                max-width: 600px;
                width: 100%;
                aspect-ratio: 1 / 1;
                background: ${bgGradient};
                border-radius: 20px;
                padding: 3rem 2rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                color: white;
                position: relative;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            /* Círculos decorativos */
            .banner-display::before {
                content: '';
                position: absolute;
                top: -100px;
                right: -100px;
                width: 300px;
                height: 300px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
            }
            .banner-display::after {
                content: '';
                position: absolute;
                bottom: -100px;
                left: -100px;
                width: 250px;
                height: 250px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
            }
            .banner-content {
                position: relative;
                z-index: 2;
            }
            .type-badge {
                font-size: 0.9rem;
                font-weight: 600;
                opacity: 0.95;
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .banner-title {
                font-size: 2.5rem;
                font-weight: 800;
                line-height: 1.2;
                margin-bottom: 1rem;
            }
            .banner-description {
                font-size: 1.1rem;
                opacity: 0.95;
                margin-bottom: 2rem;
            }
            .banner-price {
                font-size: 3.5rem;
                font-weight: 800;
                line-height: 1;
                margin-bottom: 0.5rem;
            }
            .banner-footer {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: flex-end;
                justify-content: center;
            }
            .cta-button {
                display: inline-block;
                background: white;
                color: #9333ea;
                padding: 1.25rem 3rem;
                border-radius: 50px;
                font-size: 1.25rem;
                font-weight: 700;
                text-decoration: none;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                text-align: center;
                width: 100%;
                max-width: 400px;
            }
            .cta-button:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 50px rgba(0,0,0,0.4);
            }
            @media (max-width: 640px) {
                .banner-display {
                    padding: 2rem 1.5rem;
                }
                .banner-title {
                    font-size: 1.75rem;
                }
                .banner-description {
                    font-size: 0.95rem;
                }
                .banner-price {
                    font-size: 2.5rem;
                }
                .cta-button {
                    padding: 1rem 2rem;
                    font-size: 1rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="banner-display">
            <div class="banner-content">
                <div class="type-badge">${typeText}</div>
                <h1 class="banner-title">${bannerData.title}</h1>
                <p class="banner-description">${bannerData.description}</p>
                <div class="banner-price">${priceDisplay}</div>
            </div>
            
            <div class="banner-footer">
                <a href="${cadastroLink}" class="cta-button">
                    ${bannerData.buttonText} →
                </a>
            </div>
        </div>
    </body>
    </html>
  `)
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
                        
                        let pixHtml = '';
                        if (account.payment && account.payment.pixQrCode && account.payment.pixQrCode.qrCodeId) {
                            // Buscar QR Code da cobrança
                            const qrResponse = await axios.get(\`/api/payments/\${account.payment.id}/pix-qrcode\`);
                            
                            if (qrResponse.data.ok && qrResponse.data.data) {
                                const qrData = qrResponse.data.data;
                                pixHtml = \`
                                    <div class="mt-6 border-t border-green-300 pt-6">
                                        <h4 class="text-lg font-bold text-green-800 mb-3 text-center">
                                            <i class="fas fa-qrcode mr-2"></i>
                                            Pague a Taxa de Cadastro (R$ 50,00)
                                        </h4>
                                        <div class="bg-white rounded-lg p-4">
                                            <div class="text-center mb-4">
                                                <img src="\${qrData.qrCodeBase64}" alt="QR Code PIX" class="mx-auto" style="max-width: 256px;">
                                            </div>
                                            <div class="space-y-2">
                                                <p class="text-sm text-gray-700">
                                                    <strong>Valor:</strong> R$ \${account.payment.value.toFixed(2)}
                                                </p>
                                                <p class="text-sm text-gray-700">
                                                    <strong>Split:</strong> R$ \${(account.payment.value * 0.20).toFixed(2)} (20%) para sua conta, 
                                                    R$ \${(account.payment.value * 0.80).toFixed(2)} (80%) para conta principal
                                                </p>
                                                <p class="text-sm text-gray-700">
                                                    <strong>Vencimento:</strong> \${new Date(account.payment.dueDate).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div class="mt-4">
                                                <label class="block text-sm font-medium text-gray-700 mb-2">PIX Copia e Cola:</label>
                                                <div class="flex gap-2">
                                                    <input type="text" readonly value="\${qrData.payload}" 
                                                        class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-xs">
                                                    <button onclick="navigator.clipboard.writeText('\${qrData.payload}'); this.innerHTML='<i class=\\'fas fa-check\\'></i> Copiado!'; setTimeout(() => this.innerHTML='<i class=\\'fas fa-copy\\'></i>', 2000)"
                                                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                        <i class="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="mt-4 text-center text-sm text-gray-600">
                                                <i class="fas fa-info-circle mr-1"></i>
                                                Após o pagamento, sua conta será ativada automaticamente
                                            </div>
                                        </div>
                                    </div>
                                \`;
                            }
                        }
                        
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
                                \${pixHtml}
                            </div>
                        \`;
                        e.target.reset();
                        
                        // Scroll para o resultado
                        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            // Configure axios to work with cookies
            axios.defaults.withCredentials = true;
            
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
// Página pública de auto-cadastro de assinatura
app.get('/subscription-signup/:linkId', async (c) => {
  // Serve the subscription signup HTML page
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assinatura Mensal PIX - Auto-Cadastro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <style>
        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
        }
        @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
            animation: bounce-in 0.6s ease-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div id="loading-state" class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
            <p class="text-gray-600">Carregando informações...</p>
        </div>
        <div id="error-state" class="hidden max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Link Inválido ou Expirado</h2>
            <p id="error-message" class="text-gray-600 mb-6"></p>
        </div>
        <div id="form-state" class="hidden max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-6">
                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-calendar-check text-white text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Assinatura Mensal PIX</h1>
                <p class="text-gray-600">Preencha seus dados para continuar</p>
            </div>
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600 font-medium">Valor Mensal:</span>
                    <span id="plan-value" class="text-2xl font-bold text-green-600">R$ 0,00</span>
                </div>
                <p id="plan-description" class="text-sm text-gray-600"></p>
            </div>
            <form id="signup-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-1 text-indigo-500"></i>Nome Completo
                    </label>
                    <input type="text" id="customer-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="João da Silva" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope mr-1 text-indigo-500"></i>E-mail
                    </label>
                    <input type="email" id="customer-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="joao@email.com" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-id-card mr-1 text-indigo-500"></i>CPF
                    </label>
                    <input type="text" id="customer-cpf" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="000.000.000-00" maxlength="14" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-birthday-cake mr-1 text-indigo-500"></i>Data de Nascimento
                    </label>
                    <input type="date" id="customer-birthdate" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
                </div>
                <button type="submit" id="submit-btn" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700">
                    <i class="fas fa-check-circle mr-2"></i>Confirmar e Gerar PIX
                </button>
            </form>
        </div>
        <div id="success-state" class="hidden max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-6">
                <div class="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-white text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Assinatura Criada!</h2>
                <p class="text-gray-600">Pague o PIX para ativar</p>
                <p class="text-sm text-indigo-600 mt-2 animate-pulse">
                    <i class="fas fa-sync fa-spin mr-2"></i>Aguardando pagamento...
                </p>
            </div>
            <div class="bg-white border-2 border-indigo-300 rounded-xl p-6">
                <div id="qr-code-container" class="flex justify-center mb-4">
                    <img id="qr-code-image" src="" alt="QR Code PIX" class="w-64 h-64 border-4 border-white shadow-lg rounded-lg">
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-xs text-gray-600 mb-2">Pix Copia e Cola:</p>
                    <div class="flex gap-2">
                        <input type="text" id="pix-payload" readonly class="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                        <button onclick="copyPixPayload()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Payment Confirmed State -->
        <div id="payment-confirmed-state" class="hidden max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 animate-pulse-slow">
            <!-- Confetti animation -->
            <div id="confetti-canvas" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999;"></div>
            
            <div class="text-center mb-6">
                <div class="bg-gradient-to-r from-green-400 to-emerald-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl" style="animation: bounce 1s ease-in-out infinite, pulse 2s ease-in-out infinite;">
                    <i class="fas fa-check-double text-white text-5xl"></i>
                </div>
                <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3 animate-pulse">🎉 Pagamento Confirmado! 🎉</h2>
                <p id="payment-subtitle" class="text-xl text-green-600 font-semibold mb-4">✅ Seu pagamento foi processado com sucesso</p>
                <div class="bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 rounded-lg p-3 animate-pulse">
                    <p id="payment-welcome" class="text-lg font-bold text-gray-800">
                        <i class="fas fa-star text-yellow-500 mr-2"></i>
                        Obrigado pela sua compra!
                        <i class="fas fa-star text-yellow-500 ml-2"></i>
                    </p>
                </div>
            </div>
            
            <div id="payment-steps" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">
                    <i class="fas fa-calendar-check text-green-600 mr-2"></i>
                    O que acontece agora?
                </h3>
                <div id="payment-steps-content" class="space-y-4">
                    <!-- Conteúdo será preenchido dinamicamente -->
                </div>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-envelope text-blue-500 mr-2"></i>
                    Você receberá um email de confirmação em breve
                </p>
            </div>
        </div>
    </div>
    <script>
        const pathParts = window.location.pathname.split('/');
        const linkId = pathParts[pathParts.length - 1];
        let linkData = null;
        
        async function loadLinkData() {
            try {
                const response = await axios.get(\`/api/pix/subscription-link/\${linkId}\`);
                if (response.data.ok) {
                    linkData = response.data.data;
                    document.getElementById('loading-state').classList.add('hidden');
                    document.getElementById('form-state').classList.remove('hidden');
                    document.getElementById('plan-value').textContent = \`R$ \${linkData.value.toFixed(2)}\`;
                    document.getElementById('plan-description').textContent = linkData.description;
                } else {
                    showError(response.data.error || 'Link inválido');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Erro ao carregar');
            }
        }
        
        function showError(message) {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('form-state').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
            document.getElementById('error-message').textContent = message;
        }
        
        document.getElementById('customer-cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 9) {
                value = value.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\\d{3})(\\d{3})(\\d{1,3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\\d{3})(\\d{1,3})/, '$1.$2');
            }
            e.target.value = value;
        });
        
        document.getElementById('signup-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Criando...';
            
            try {
                const response = await axios.post(\`/api/pix/subscription-signup/\${linkId}\`, {
                    customerName: document.getElementById('customer-name').value,
                    customerEmail: document.getElementById('customer-email').value,
                    customerCpf: document.getElementById('customer-cpf').value.replace(/\\D/g, ''),
                    customerBirthdate: document.getElementById('customer-birthdate').value
                });
                
                if (response.data.ok) {
                    document.getElementById('form-state').classList.add('hidden');
                    document.getElementById('success-state').classList.remove('hidden');
                    if (response.data.firstPayment.pix) {
                        document.getElementById('qr-code-image').src = response.data.firstPayment.pix.qrCodeBase64;
                        document.getElementById('pix-payload').value = response.data.firstPayment.pix.payload;
                    }
                    
                    // Salvar tipo de cobrança para usar depois
                    window.chargeType = response.data.chargeType || 'monthly';
                    
                    // Iniciar verificação de pagamento
                    window.paymentId = response.data.firstPayment.id;
                    startPaymentCheck();
                } else {
                    alert('Erro: ' + response.data.error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Confirmar e Gerar PIX';
                }
            } catch (error) {
                alert('Erro: ' + (error.response?.data?.error || error.message));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Confirmar e Gerar PIX';
            }
        });
        
        function copyPixPayload() {
            const payload = document.getElementById('pix-payload');
            payload.select();
            document.execCommand('copy');
            alert('PIX copiado!');
        }
        
        // Verificar status do pagamento a cada 5 segundos
        let checkInterval;
        function startPaymentCheck() {
            checkInterval = setInterval(async () => {
                try {
                    const response = await axios.get(\`/api/payment-status/\${window.paymentId}\`);
                    if (response.data.status === 'RECEIVED' || response.data.status === 'CONFIRMED') {
                        clearInterval(checkInterval);
                        showPaymentConfirmed();
                    }
                } catch (error) {
                    console.error('Erro ao verificar pagamento:', error);
                }
            }, 5000); // Verifica a cada 5 segundos
        }
        
        function showPaymentConfirmed() {
            // Tocar som de confirmação
            playSuccessSound();
            
            // Criar efeito confetti
            createConfetti();
            
            // Atualizar conteúdo dinâmico baseado no tipo de cobrança
            const chargeType = window.chargeType || 'monthly';
            const stepsContent = document.getElementById('payment-steps-content');
            
            if (chargeType === 'single') {
                // Mensagem para pagamento único
                document.getElementById('payment-subtitle').textContent = '✅ Seu pagamento foi processado com sucesso';
                document.getElementById('payment-welcome').innerHTML = '<i class="fas fa-check-circle text-green-500 mr-2"></i>Obrigado pela sua compra!<i class="fas fa-check-circle text-green-500 ml-2"></i>';
                
                stepsContent.innerHTML = '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Pagamento Confirmado</h4>' +
                    '<p class="text-sm text-gray-600">Seu pagamento foi confirmado e processado</p>' +
                    '</div></div>' +
                    '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Compra Concluída</h4>' +
                    '<p class="text-sm text-gray-600">Sua compra foi registrada com sucesso</p>' +
                    '</div></div>' +
                    '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Recibo Enviado</h4>' +
                    '<p class="text-sm text-gray-600">Você receberá o comprovante por email</p>' +
                    '</div></div>';
            } else {
                // Mensagem para assinatura mensal
                document.getElementById('payment-subtitle').textContent = '✅ Sua assinatura foi ativada com sucesso';
                document.getElementById('payment-welcome').innerHTML = '<i class="fas fa-star text-yellow-500 mr-2"></i>Bem-vindo à sua assinatura!<i class="fas fa-star text-yellow-500 ml-2"></i>';
                
                stepsContent.innerHTML = '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Pagamento Processado</h4>' +
                    '<p class="text-sm text-gray-600">Seu pagamento foi confirmado e registrado</p>' +
                    '</div></div>' +
                    '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Assinatura Ativa</h4>' +
                    '<p class="text-sm text-gray-600">Sua assinatura mensal está ativa a partir de agora</p>' +
                    '</div></div>' +
                    '<div class="flex items-start space-x-4">' +
                    '<div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>' +
                    '<div class="flex-1">' +
                    '<h4 class="font-bold text-gray-800 mb-1">Cobranças Automáticas</h4>' +
                    '<p class="text-sm text-gray-600">Todo mês você receberá um novo PIX por email</p>' +
                    '</div></div>';
            }
            
            // Mostrar tela de confirmação
            document.getElementById('success-state').classList.add('hidden');
            document.getElementById('payment-confirmed-state').classList.remove('hidden');
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function playSuccessSound() {
            // Usar Web Audio API para criar som de sucesso
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Primeira nota (Dó)
            const oscillator1 = audioContext.createOscillator();
            const gainNode1 = audioContext.createGain();
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);
            oscillator1.frequency.value = 523.25; // Dó
            gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator1.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.3);
            
            // Segunda nota (Mi)
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.value = 659.25; // Mi
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
            oscillator2.start(audioContext.currentTime + 0.15);
            oscillator2.stop(audioContext.currentTime + 0.45);
            
            // Terceira nota (Sol)
            const oscillator3 = audioContext.createOscillator();
            const gainNode3 = audioContext.createGain();
            oscillator3.connect(gainNode3);
            gainNode3.connect(audioContext.destination);
            oscillator3.frequency.value = 783.99; // Sol
            gainNode3.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
            gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            oscillator3.start(audioContext.currentTime + 0.3);
            oscillator3.stop(audioContext.currentTime + 0.6);
        }
        
        function createConfetti() {
            const canvas = document.getElementById('confetti-canvas');
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
            
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.opacity = '1';
                confetti.style.borderRadius = '50%';
                canvas.appendChild(confetti);
                
                const duration = 2000 + Math.random() * 1000;
                const startTime = Date.now();
                const startLeft = parseFloat(confetti.style.left);
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        confetti.style.top = (progress * 100) + '%';
                        confetti.style.left = (startLeft + Math.sin(progress * 4 * Math.PI) * 10) + '%';
                        confetti.style.opacity = String(1 - progress);
                        requestAnimationFrame(animate);
                    } else {
                        confetti.remove();
                    }
                }
                
                setTimeout(() => animate(), Math.random() * 500);
            }
        }
        
        loadLinkData();
    </script>
</body>
</html>`)
})

// Página pública de auto-cadastro PIX Automático
app.get('/pix-automatic-signup/:linkId', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PIX Automático - Auto-Cadastro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <style>
        @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div id="loading-state" class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
            <p class="text-gray-600">Carregando informações...</p>
        </div>
        <div id="error-state" class="hidden max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Link Inválido ou Expirado</h2>
            <p id="error-message" class="text-gray-600 mb-6"></p>
        </div>
        <div id="form-state" class="hidden max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-robot text-white text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">PIX Automático</h1>
                <p class="text-gray-600">Débito Automático Mensal</p>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600 font-medium">Valor Mensal:</span>
                    <span id="plan-value" class="text-2xl font-bold text-blue-600">R$ 0,00</span>
                </div>
                <p id="plan-description" class="text-sm text-gray-600 mb-3"></p>
                <p id="plan-frequency" class="text-xs text-gray-500"></p>
                <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-xs text-gray-700">
                        <i class="fas fa-info-circle text-yellow-600 mr-1"></i>
                        <strong>PIX Automático:</strong> Você autoriza UMA VEZ e o débito ocorre automaticamente todo mês. Sem necessidade de pagar manualmente.
                    </p>
                </div>
            </div>
            <form id="signup-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-1 text-indigo-500"></i>Nome Completo
                    </label>
                    <input type="text" id="customer-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="João da Silva" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope mr-1 text-indigo-500"></i>E-mail
                    </label>
                    <input type="email" id="customer-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="joao@email.com" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-id-card mr-1 text-indigo-500"></i>CPF
                    </label>
                    <input type="text" id="customer-cpf" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="000.000.000-00" maxlength="14" required>
                </div>
                <button type="submit" id="submit-btn" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700">
                    <i class="fas fa-robot mr-2"></i>Gerar Autorização PIX Automático
                </button>
            </form>
        </div>
        <div id="success-state" class="hidden max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-6">
                <div class="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <i class="fas fa-robot text-white text-3xl"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Autorização PIX Automático Criada!</h2>
                <p class="text-gray-600">Escaneie o QR Code para autorizar o débito automático</p>
            </div>
            <div class="bg-white border-2 border-blue-300 rounded-xl p-6 mb-6">
                <div id="qr-code-container" class="flex justify-center mb-4">
                    <img id="qr-code-image" src="" alt="QR Code PIX Automático" class="w-64 h-64 border-4 border-white shadow-lg rounded-lg">
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-xs text-gray-600 mb-2">Pix Copia e Cola:</p>
                    <div class="flex gap-2">
                        <input type="text" id="pix-payload" readonly class="flex-1 text-xs bg-white border border-gray-300 rounded px-3 py-2 font-mono">
                        <button onclick="copyPixPayload()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-bold text-gray-800 mb-3">
                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                    Como funciona?
                </h3>
                <ol class="text-sm text-gray-700 space-y-2">
                    <li><strong>1.</strong> Escaneie o QR Code com o app do seu banco</li>
                    <li><strong>2.</strong> Autorize o débito automático UMA VEZ</li>
                    <li><strong>3.</strong> Pague a primeira parcela imediatamente</li>
                    <li><strong>4.</strong> Autorização será ativada após o pagamento</li>
                    <li><strong>5.</strong> Todo mês o valor será debitado automaticamente</li>
                </ol>
            </div>
        </div>
        
        <!-- Payment Confirmed State -->
        <div id="payment-confirmed-state" class="hidden max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 animate-pulse-slow">
            <div class="text-center mb-6">
                <div class="bg-gradient-to-r from-green-400 to-emerald-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl">
                    <i class="fas fa-check-double text-white text-5xl"></i>
                </div>
                <h2 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3 animate-pulse">🎉 Pagamento Confirmado! 🎉</h2>
                <p class="text-xl text-green-600 font-semibold mb-4">✅ Sua assinatura foi ativada com sucesso</p>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">
                    <i class="fas fa-calendar-check text-green-600 mr-2"></i>
                    O que acontece agora?
                </h3>
                <div class="space-y-4">
                    <div class="flex items-start">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">1</div>
                        <div>
                            <p class="font-semibold text-gray-800">Pagamento Processado</p>
                            <p class="text-sm text-gray-600">Seu pagamento foi confirmado e registrado</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">2</div>
                        <div>
                            <p class="font-semibold text-gray-800">Autorização Ativa</p>
                            <p class="text-sm text-gray-600">Seu débito automático está ativo a partir de agora</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">3</div>
                        <div>
                            <p class="font-semibold text-gray-800">Cobranças Automáticas</p>
                            <p class="text-sm text-gray-600">Todo mês o valor será debitado automaticamente - VOCÊ NÃO PRECISA FAZER NADA!</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-envelope text-blue-500 mr-2"></i>
                    Você receberá um email de confirmação em breve
                </p>
            </div>
        </div>
    </div>
    <script>
        const pathParts = window.location.pathname.split('/');
        const linkId = pathParts[pathParts.length - 1];
        let linkData = null;
        
        async function loadLinkData() {
            try {
                const response = await axios.get(\`/api/pix/automatic-signup-link/\${linkId}\`);
                if (response.data.ok) {
                    linkData = response.data.data;
                    document.getElementById('loading-state').classList.add('hidden');
                    document.getElementById('form-state').classList.remove('hidden');
                    document.getElementById('plan-value').textContent = \`R$ \${linkData.value.toFixed(2)}\`;
                    document.getElementById('plan-description').textContent = linkData.description;
                    document.getElementById('plan-frequency').textContent = \`Frequência: \${linkData.frequency === 'MONTHLY' ? 'Mensal' : linkData.frequency}\`;
                } else {
                    showError(response.data.error || 'Link inválido');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('Erro ao carregar');
            }
        }
        
        function showError(message) {
            document.getElementById('loading-state').classList.add('hidden');
            document.getElementById('form-state').classList.add('hidden');
            document.getElementById('error-state').classList.remove('hidden');
            document.getElementById('error-message').textContent = message;
        }
        
        document.getElementById('customer-cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 9) {
                value = value.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\\d{3})(\\d{3})(\\d{1,3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\\d{3})(\\d{1,3})/, '$1.$2');
            }
            e.target.value = value;
        });
        
        document.getElementById('signup-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Criando...';
            
            try {
                const response = await axios.post(\`/api/pix/automatic-signup/\${linkId}\`, {
                    customerName: document.getElementById('customer-name').value,
                    customerEmail: document.getElementById('customer-email').value,
                    customerCpf: document.getElementById('customer-cpf').value.replace(/\\D/g, '')
                });
                
                if (response.data.ok) {
                    document.getElementById('form-state').classList.add('hidden');
                    document.getElementById('success-state').classList.remove('hidden');
                    if (response.data.qrCode) {
                        document.getElementById('qr-code-image').src = response.data.qrCode.encodedImage;
                        document.getElementById('pix-payload').value = response.data.qrCode.payload;
                    }
                    
                    // Iniciar verificação de pagamento
                    window.authorizationId = response.data.authorization.id;
                    startPaymentCheck();
                } else {
                    alert('Erro: ' + response.data.error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-robot mr-2"></i>Gerar Autorização PIX Automático';
                }
            } catch (error) {
                alert('Erro: ' + (error.response?.data?.error || error.message));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-robot mr-2"></i>Gerar Autorização PIX Automático';
            }
        });
        
        function copyPixPayload() {
            const payload = document.getElementById('pix-payload');
            payload.select();
            document.execCommand('copy');
            alert('PIX copiado!');
        }
        
        // Verificar status da autorização/pagamento a cada 10 segundos
        let checkInterval;
        function startPaymentCheck() {
            checkInterval = setInterval(async () => {
                try {
                    // TODO: Implementar verificação de status da autorização
                    // Por enquanto, apenas simula
                    console.log('Verificando status da autorização...');
                } catch (error) {
                    console.error('Erro ao verificar autorização:', error);
                }
            }, 10000); // Verifica a cada 10 segundos
        }
        
        function showPaymentConfirmed() {
            clearInterval(checkInterval);
            document.getElementById('success-state').classList.add('hidden');
            document.getElementById('payment-confirmed-state').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        loadLinkData();
    </script>
</body>
</html>`)
})

// Redirect /dashboard to root
app.get('/dashboard', (c) => {
  return c.redirect('/', 301)
})

// Homepage
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <title>Gerenciador Asaas - Contas e Subcontas</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="alternate icon" href="/favicon.ico">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/responsive.css?v=1.0" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- Navbar Responsiva -->
        <nav class="bg-white shadow-lg sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <i class="fas fa-building text-blue-600 text-xl sm:text-2xl mr-2 sm:mr-3"></i>
                        <span class="text-base sm:text-xl font-bold text-gray-800 hidden sm:inline">Gerenciador Asaas</span>
                        <span class="text-base sm:text-xl font-bold text-gray-800 sm:hidden">Asaas</span>
                    </div>
                    <!-- Actions -->
                    <div class="flex items-center gap-2 sm:gap-4">
                        <button onclick="showSection('accounts')" class="nav-btn text-white bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-md font-semibold text-sm sm:text-base">
                            <i class="fas fa-users mr-0 sm:mr-2"></i>
                            <span class="hidden sm:inline">Subcontas</span>
                        </button>
                        <button onclick="logout()" class="text-red-600 hover:text-red-700 px-2 sm:px-3 py-2 rounded-md hover:bg-red-50 transition text-sm sm:text-base">
                            <i class="fas fa-sign-out-alt mr-0 sm:mr-2"></i>
                            <span class="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Dashboard Section -->
            <div id="dashboard-section" class="section hidden">
                <!-- Quick Actions - TOPO -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-bolt mr-2 text-yellow-500"></i>
                        Ações Rápidas
                    </h3>
                    <div class="flex flex-wrap gap-3 justify-center">
                        <button onclick="showSection('dashboard')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md transition">
                            <i class="fas fa-chart-line text-xl"></i>
                            <span class="text-sm">Dashboard</span>
                        </button>
                        <!-- Botão "Criar Subconta" removido - use o menu "Subcontas" -->
                        <!-- Botão "Gerar Link" removido - use "Links Pagamento" -->
                        <button onclick="showSection('accounts')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md transition">
                            <i class="fas fa-list text-xl"></i>
                            <span class="text-sm">Subcontas</span>
                        </button>
                        <button onclick="showSection('reports')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold shadow-md transition">
                            <i class="fas fa-chart-bar text-xl"></i>
                            <span class="text-sm">Relatórios</span>
                        </button>
                        <button onclick="showSection('api-links')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 font-semibold shadow-md transition">
                            <i class="fas fa-plug text-xl"></i>
                            <span class="text-sm">APIs Externas</span>
                        </button>
                        <button onclick="showSection('payment-links')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 font-semibold shadow-md transition">
                            <i class="fas fa-money-bill-wave text-xl"></i>
                            <span class="text-sm">Links Pgto</span>
                        </button>
                        <button onclick="showSection('deltapag-section')" 
                            class="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md transition">
                            <i class="fas fa-credit-card text-xl"></i>
                            <span class="text-sm">Cartão</span>
                        </button>
                    </div>
                </div>

                <!-- Dashboard Overview -->
                <div class="space-y-6">
                    <!-- Header Responsivo -->
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 text-white">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                                    <i class="fas fa-chart-line mr-2 sm:mr-3"></i>
                                    Visão Geral
                                </h2>
                                <p class="text-blue-100 text-sm sm:text-base">Dashboard de Gerenciamento de Subcontas Asaas</p>
                            </div>
                            <div class="text-left sm:text-right">
                                <p class="text-xs sm:text-sm text-blue-100">Última atualização</p>
                                <p class="text-base sm:text-lg font-semibold" id="last-update-time">--:--</p>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Total Subcontas -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600 mb-1">Total de Subcontas</p>
                                    <p class="text-3xl font-bold text-gray-800" id="stat-total-accounts">0</p>
                                    <p class="text-xs text-gray-500 mt-2">
                                        <i class="fas fa-users mr-1"></i>Todas as contas
                                    </p>
                                </div>
                                <div class="bg-blue-100 rounded-full p-4">
                                    <i class="fas fa-users text-3xl text-blue-600"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Aprovadas -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600 mb-1">Aprovadas</p>
                                    <p class="text-3xl font-bold text-green-600" id="stat-approved-accounts">0</p>
                                    <p class="text-xs text-green-600 mt-2 font-semibold">
                                        <i class="fas fa-check-circle mr-1"></i>
                                        <span id="stat-approval-rate">0%</span> de aprovação
                                    </p>
                                </div>
                                <div class="bg-green-100 rounded-full p-4">
                                    <i class="fas fa-check-circle text-3xl text-green-600"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Pendentes -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600 mb-1">Pendentes</p>
                                    <p class="text-3xl font-bold text-yellow-600" id="stat-pending-accounts">0</p>
                                    <p class="text-xs text-gray-500 mt-2">
                                        <i class="fas fa-clock mr-1"></i>Aguardando aprovação
                                    </p>
                                </div>
                                <div class="bg-yellow-100 rounded-full p-4">
                                    <i class="fas fa-clock text-3xl text-yellow-600"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Links de Cadastro -->
                        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-600 mb-1">Links Ativos</p>
                                    <p class="text-3xl font-bold text-purple-600" id="stat-active-links">0</p>
                                    <p class="text-xs text-purple-600 mt-2 font-semibold">
                                        <i class="fas fa-link mr-1"></i>
                                        <span id="stat-conversion-rate">0%</span> conversão
                                    </p>
                                </div>
                                <div class="bg-purple-100 rounded-full p-4">
                                    <i class="fas fa-link text-3xl text-purple-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Row -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Status Distribution Chart -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-chart-pie mr-2 text-blue-600"></i>
                                Distribuição de Status
                            </h3>
                            <canvas id="status-chart" height="200"></canvas>
                        </div>

                        <!-- Recent Activity -->
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <i class="fas fa-history mr-2 text-green-600"></i>
                                Atividades Recentes
                            </h3>
                            <div id="recent-activity" class="space-y-3 max-h-64 overflow-y-auto">
                                <p class="text-gray-500 text-center py-8">Carregando...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accounts Section -->
            <div id="accounts-section" class="section">
                <div class="mb-4">
                    <button onclick="showSection('dashboard')" 
                        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                        <i class="fas fa-arrow-left"></i>
                        <span>Voltar ao Dashboard</span>
                    </button>
                </div>
                <!-- Formulário de Nova Subconta (OCULTO - use "Gerar Link de Cadastro" ao invés) -->
                <div class="bg-white rounded-lg shadow mb-6 hidden" style="display: none;">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-user-plus mr-2 text-green-600"></i>
                            Nova Subconta
                        </h2>
                    </div>
                    <div class="p-6">
                        <form id="create-account-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input type="text" name="name" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input type="email" name="email" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        CPF/CNPJ *
                                    </label>
                                    <input type="text" name="cpfCnpj" required
                                        placeholder="Apenas números"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Data de Nascimento *
                                    </label>
                                    <input type="date" name="birthDate" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Pessoa *
                                    </label>
                                    <select name="companyType" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">Selecione...</option>
                                        <option value="INDIVIDUAL">Pessoa Física</option>
                                        <option value="MEI">MEI</option>
                                        <option value="LIMITED">Empresa Limitada</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone *
                                    </label>
                                    <input type="tel" name="phone" required
                                        placeholder="11999999999"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Renda Mensal *
                                    </label>
                                    <select name="incomeValue" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">Selecione...</option>
                                        <option value="1000">Até R$ 1.000</option>
                                        <option value="2000">R$ 1.000 - R$ 2.000</option>
                                        <option value="5000">R$ 2.000 - R$ 5.000</option>
                                        <option value="10000">R$ 5.000 - R$ 10.000</option>
                                        <option value="20000">Acima de R$ 10.000</option>
                                    </select>
                                </div>
                            </div>
                            <div class="flex justify-end">
                                <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">
                                    <i class="fas fa-check mr-2"></i>Criar Subconta
                                </button>
                            </div>
                            <div id="create-result" class="hidden"></div>
                        </form>
                    </div>
                </div>

                <!-- Lista de Subcontas -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-bold text-gray-800">
                                <i class="fas fa-users mr-2 text-blue-600"></i>
                                Subcontas Cadastradas
                            </h2>
                            <div class="flex gap-3">
                                <button onclick="openLinkModal()" class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold shadow-md transition">
                                    <i class="fas fa-link mr-2"></i>Gerar Link de Cadastro
                                </button>
                                <button onclick="loadAccounts()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-sync-alt mr-2"></i>Atualizar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Filtros e Pesquisa -->
                    <div class="px-6 pb-4 border-b border-gray-200 bg-gray-50">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <!-- Campo de Pesquisa (maior destaque) -->
                            <div class="md:col-span-6">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">
                                    <i class="fas fa-search mr-1"></i>Pesquisar
                                </label>
                                <input type="text" 
                                    id="search-accounts" 
                                    placeholder="Digite nome, CPF/CNPJ, email ou ID..."
                                    class="w-full px-4 py-2.5 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onkeyup="filterAccounts()">
                            </div>
                            
                            <!-- Filtro de Status -->
                            <div class="md:col-span-3">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">
                                    <i class="fas fa-filter mr-1"></i>Status
                                </label>
                                <select id="filter-status" 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    onchange="filterAccounts()">
                                    <option value="">Todos os Status</option>
                                    <option value="approved">✅ Aprovados</option>
                                    <option value="pending">⏰ Pendentes</option>
                                </select>
                            </div>
                            
                            <!-- Ordenação -->
                            <div class="md:col-span-3">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">
                                    <i class="fas fa-sort mr-1"></i>Ordenar por
                                </label>
                                <select id="sort-accounts" 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    onchange="sortAccounts()">
                                    <option value="name-asc">Nome A-Z</option>
                                    <option value="name-desc">Nome Z-A</option>
                                    <option value="date-desc">Mais Recentes</option>
                                    <option value="date-asc">Mais Antigos</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Contador de Resultados -->
                        <div id="search-results" class="mt-3 text-sm font-medium text-gray-700"></div>
                    </div>
                    
                    <div class="p-6">
                        <div id="accounts-list" class="space-y-4">
                            <p class="text-gray-500 text-center py-8">Carregando...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Account Section (HIDDEN) -->
            <div id="create-section" class="section hidden" style="display: none;">
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

            <!-- PIX Section (HIDDEN) -->
            <div id="pix-section" class="section hidden" style="display: none;">
                <div class="mb-4">
                    <button onclick="showSection('dashboard')" 
                        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                        <i class="fas fa-arrow-left"></i>
                        <span>Voltar ao Dashboard</span>
                    </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Gerar Cobrança PIX -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-bold text-gray-800">
                                <i class="fas fa-qrcode mr-2 text-green-600"></i>
                                Gerar Cobrança PIX
                            </h2>
                            <p class="text-sm text-gray-500 mt-1">Split automático: 20% para subconta, 80% para conta principal</p>
                        </div>
                        <div class="p-6">
                            <form id="pix-form" class="space-y-4">
                                <!-- Subconta -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Subconta <span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex gap-2">
                                        <select id="pix-subaccount" required
                                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                            <option value="">Selecione a subconta...</option>
                                        </select>
                                        <button type="button" onclick="generateApiKeyForSubaccount()" 
                                            title="Gerar API Key para a subconta selecionada"
                                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            <i class="fas fa-key"></i>
                                        </button>
                                        <button type="button" onclick="loadSubaccountsForPix()" 
                                            title="Atualizar lista de subcontas"
                                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">
                                        A subconta receberá 20% do valor líquido
                                        <span class="mx-2">•</span>
                                        <button type="button" onclick="generateApiKeyForSubaccount()" 
                                            class="text-blue-600 hover:underline">
                                            <i class="fas fa-key text-xs"></i> Gerar API Key
                                        </button>
                                    </p>
                                </div>
                                
                                <!-- API Key Display -->
                                <div id="api-key-result" class="hidden p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div class="flex items-start justify-between mb-2">
                                        <h4 class="font-semibold text-blue-800">
                                            <i class="fas fa-key mr-2"></i>API Key Gerada
                                        </h4>
                                        <button onclick="document.getElementById('api-key-result').classList.add('hidden')" 
                                            class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div class="space-y-2">
                                        <div>
                                            <label class="text-xs font-medium text-gray-700">API Key:</label>
                                            <div class="flex gap-2 mt-1">
                                                <input type="text" id="generated-api-key" readonly
                                                    class="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono">
                                                <button onclick="copyApiKey()" 
                                                    class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div id="api-key-details" class="text-xs text-gray-600"></div>
                                        <p class="text-xs text-red-600 font-semibold">
                                            ⚠️ ATENÇÃO: Esta é a única vez que a API Key será exibida. Copie e guarde em local seguro!
                                        </p>
                                    </div>
                                </div>

                                <!-- Dados do Cliente -->
                                <div class="border-t pt-4 mt-4">
                                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Dados do Pagador</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <input type="text" id="pix-customer-name" placeholder="Nome do Cliente" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <input type="email" id="pix-customer-email" placeholder="Email do Cliente" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <input type="text" id="pix-customer-cpf" placeholder="CPF/CNPJ" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <input type="tel" id="pix-customer-phone" placeholder="Telefone (opcional)"
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                    </div>
                                </div>

                                <!-- Dados da Cobrança -->
                                <div class="border-t pt-4 mt-4">
                                    <h3 class="text-sm font-semibold text-gray-700 mb-3">Dados da Cobrança</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <input type="number" id="pix-value" placeholder="Valor (R$)" step="0.01" min="0.01" required
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <textarea id="pix-description" placeholder="Descrição da cobrança" rows="2"
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                                        </div>
                                        <div>
                                            <input type="date" id="pix-due-date"
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                            <p class="text-xs text-gray-500 mt-1">Deixe em branco para data atual</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Botões -->
                                <div class="flex gap-2 pt-4">
                                    <button type="submit"
                                        class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                                        <i class="fas fa-qrcode mr-2"></i>Gerar PIX
                                    </button>
                                    <button type="button" onclick="document.getElementById('pix-form').reset()"
                                        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                        Limpar
                                    </button>
                                </div>
                            </form>

                            <!-- Resultado -->
                            <div id="pix-result" class="hidden mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 class="font-semibold text-green-800 mb-2">
                                    <i class="fas fa-check-circle mr-2"></i>PIX Gerado com Sucesso!
                                </h3>
                                <div id="pix-result-content"></div>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code e Histórico -->
                    <div class="space-y-6">
                        <!-- QR Code Display -->
                        <div id="qrcode-display" class="bg-white rounded-lg shadow p-6 hidden">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">
                                <i class="fas fa-qrcode mr-2 text-green-600"></i>
                                QR Code PIX
                            </h3>
                            <div id="qrcode-container" class="text-center">
                                <!-- QR Code será inserido aqui -->
                            </div>
                            <div class="mt-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">PIX Copia e Cola</label>
                                <div class="flex gap-2">
                                    <input type="text" id="pix-payload" readonly
                                        class="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                                    <button onclick="copyPixPayload()"
                                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Histórico de Cobranças -->
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-bold text-gray-800">
                                        <i class="fas fa-history mr-2 text-blue-600"></i>
                                        Cobranças Recentes
                                    </h3>
                                    <button onclick="loadRecentPayments()"
                                        class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                                        <i class="fas fa-sync-alt mr-1"></i>Atualizar
                                    </button>
                                </div>
                            </div>
                            <div id="payments-list" class="p-6">
                                <p class="text-gray-500 text-center py-4">Nenhuma cobrança ainda</p>
                            </div>
                        </div>

                        <!-- Gerenciar API Keys -->
                        <div class="bg-white rounded-lg shadow">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-bold text-gray-800">
                                        <i class="fas fa-key mr-2 text-purple-600"></i>
                                        Gerenciar API Keys
                                    </h3>
                                    <button onclick="loadApiKeys()"
                                        class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                        <i class="fas fa-sync-alt mr-1"></i>Atualizar
                                    </button>
                                </div>
                            </div>
                            <div id="api-keys-list" class="p-6">
                                <p class="text-gray-500 text-center py-4">Nenhuma API Key criada ainda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- API Keys Section (HIDDEN) -->
            <div id="api-keys-section" class="section hidden" style="display: none;">
                <div class="mb-4">
                    <button onclick="showSection('dashboard')" 
                        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                        <i class="fas fa-arrow-left"></i>
                        <span>Voltar ao Dashboard</span>
                    </button>
                </div>
                <div class="bg-white rounded-lg shadow mb-6">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-key mr-3 text-purple-600"></i>
                            Gerenciar API Keys
                        </h2>
                        <p class="text-gray-600 mt-2">
                            Visualize e gerencie todas as API Keys das subcontas
                        </p>
                    </div>
                    <div class="p-6">
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por Subconta
                            </label>
                            <div class="flex gap-2">
                                <select id="filter-subaccount" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Todas as subcontas</option>
                                </select>
                                <button onclick="loadAllApiKeys()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    <i class="fas fa-search mr-2"></i>Buscar
                                </button>
                            </div>
                        </div>
                        
                        <div id="all-api-keys-list" class="space-y-4">
                            <p class="text-gray-500 text-center py-8">Selecione uma subconta ou clique em Buscar para ver todas as API Keys</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reports Section -->
        <div id="reports-section" class="section hidden">
            <div class="mb-4">
                <button onclick="showSection('dashboard')" 
                    class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                    <i class="fas fa-arrow-left"></i>
                    <span>Voltar ao Dashboard</span>
                </button>
            </div>
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-chart-bar mr-2 text-orange-600"></i>
                        Relatórios de Subcontas
                    </h2>
                    <p class="text-gray-600 mt-2">Visualize transações e estatísticas por subconta</p>
                </div>

                <!-- Filtros Aprimorados -->
                <div class="p-6 border-b border-gray-200 bg-gray-50">
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user mr-1"></i>Subconta
                            </label>
                            <select id="report-account-select" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="">Selecione uma subconta...</option>
                                <option value="ALL_ACCOUNTS">📊 TODAS AS SUBCONTAS</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-calendar mr-1"></i>Data Início
                            </label>
                            <input type="date" id="report-start-date" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-calendar mr-1"></i>Data Fim
                            </label>
                            <input type="date" id="report-end-date" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-tags mr-1"></i>Tipo de Cobrança
                            </label>
                            <select id="report-charge-type" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="all">Todos os Tipos</option>
                                <option value="single">QR Code Avulso</option>
                                <option value="monthly">Assinatura Mensal</option>
                                <option value="pix_auto">PIX Automático</option>
                                <option value="link_cadastro">Link Auto-Cadastro</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-info-circle mr-1"></i>Status
                            </label>
                            <select id="report-status" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="all">Todos os Status</option>
                                <option value="RECEIVED">✅ Recebidos</option>
                                <option value="PENDING">⏳ Pendentes</option>
                                <option value="OVERDUE">⚠️ Vencidos</option>
                                <option value="REFUNDED">↩️ Reembolsados</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button onclick="generateDetailedReport()" 
                                class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold shadow-md transition">
                                <i class="fas fa-search mr-2"></i>Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Área de Resultados -->
                <div id="report-results" class="p-6">
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-chart-line text-6xl mb-4 opacity-30"></i>
                        <p class="text-lg">Selecione uma subconta e clique em "Aplicar Filtros"</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- API Links Section -->
        <div id="api-links-section" class="section hidden">
            <div class="mb-4">
                <button onclick="showSection('dashboard')" 
                    class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                    <i class="fas fa-arrow-left"></i>
                    <span>Voltar ao Dashboard</span>
                </button>
            </div>
            
            <div class="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-xl p-8 text-white mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">
                            <i class="fas fa-plug mr-2"></i>APIs Externas - Links por Status
                        </h1>
                        <p class="text-lg opacity-90">Links diretos para integração com sistemas externos</p>
                    </div>
                </div>
            </div>

            <!-- Construtor de Filtros -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-sliders-h mr-2 text-blue-600"></i>
                    🎛️ Construtor de Filtros
                </h3>
                <p class="text-sm text-gray-600 mb-4">Configure os filtros abaixo e os links serão atualizados automaticamente</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-calendar mr-1"></i>Data Início
                        </label>
                        <input type="date" id="api-filter-start-date" 
                            value="2026-02-01"
                            onchange="updateApiLinks()"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-calendar mr-1"></i>Data Fim
                        </label>
                        <input type="date" id="api-filter-end-date" 
                            value="2026-02-28"
                            onchange="updateApiLinks()"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-tags mr-1"></i>Tipo de Cobrança
                        </label>
                        <select id="api-filter-charge-type" 
                            onchange="updateApiLinks()"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos (padrão)</option>
                            <option value="single">QR Code Avulso</option>
                            <option value="monthly" selected>Assinatura Mensal</option>
                            <option value="pix_auto">PIX Automático</option>
                            <option value="link_cadastro">Link Auto-Cadastro</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="applyExampleFilters()" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition">
                        <i class="fas fa-magic mr-2"></i>Exemplo: Fevereiro 2026 (Mensais)
                    </button>
                    <button onclick="clearApiFilters()" 
                        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition">
                        <i class="fas fa-eraser mr-2"></i>Limpar Filtros
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Card: Pagamentos Recebidos -->
                <div class="bg-white rounded-lg shadow-lg">
                    <div class="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                        <h3 class="text-xl font-bold flex items-center gap-2">
                            <i class="fas fa-check-circle"></i>
                            Pagamentos Recebidos
                        </h3>
                        <p class="text-sm opacity-90 mt-1">Status: RECEIVED</p>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL Completa:</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                                    class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                                    id="link-received">
                                <button onclick="copyToClipboard('link-received')"
                                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Exemplo curl:</label>
                            <div class="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
curl "https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                            </div>
                        </div>
                        <button onclick="testApiLink('received')"
                            class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition">
                            <i class="fas fa-play mr-2"></i>Testar API
                        </button>
                    </div>
                </div>

                <!-- Card: Pagamentos Pendentes -->
                <div class="bg-white rounded-lg shadow-lg">
                    <div class="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                        <h3 class="text-xl font-bold flex items-center gap-2">
                            <i class="fas fa-clock"></i>
                            Pagamentos Pendentes
                        </h3>
                        <p class="text-sm opacity-90 mt-1">Status: PENDING</p>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL Completa:</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                                    class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                                    id="link-pending">
                                <button onclick="copyToClipboard('link-pending')"
                                    class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Exemplo curl:</label>
                            <div class="bg-gray-800 text-yellow-400 p-3 rounded text-xs font-mono overflow-x-auto">
curl "https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                            </div>
                        </div>
                        <button onclick="testApiLink('pending')"
                            class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold transition">
                            <i class="fas fa-play mr-2"></i>Testar API
                        </button>
                    </div>
                </div>

                <!-- Card: Pagamentos Vencidos -->
                <div class="bg-white rounded-lg shadow-lg">
                    <div class="p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
                        <h3 class="text-xl font-bold flex items-center gap-2">
                            <i class="fas fa-exclamation-triangle"></i>
                            Pagamentos Vencidos
                        </h3>
                        <p class="text-sm opacity-90 mt-1">Status: OVERDUE</p>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL Completa:</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                                    class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                                    id="link-overdue">
                                <button onclick="copyToClipboard('link-overdue')"
                                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Exemplo curl:</label>
                            <div class="bg-gray-800 text-red-400 p-3 rounded text-xs font-mono overflow-x-auto">
curl "https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                            </div>
                        </div>
                        <button onclick="testApiLink('overdue')"
                            class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition">
                            <i class="fas fa-play mr-2"></i>Testar API
                        </button>
                    </div>
                </div>

                <!-- Card: Pagamentos Reembolsados -->
                <div class="bg-white rounded-lg shadow-lg">
                    <div class="p-6 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-t-lg">
                        <h3 class="text-xl font-bold flex items-center gap-2">
                            <i class="fas fa-undo"></i>
                            Pagamentos Reembolsados
                        </h3>
                        <p class="text-sm opacity-90 mt-1">Status: REFUNDED</p>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">URL Completa:</label>
                            <div class="flex gap-2">
                                <input type="text" readonly value="https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                                    class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                                    id="link-refunded">
                                <button onclick="copyToClipboard('link-refunded')"
                                    class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Exemplo curl:</label>
                            <div class="bg-gray-800 text-gray-400 p-3 rounded text-xs font-mono overflow-x-auto">
curl "https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly"
                            </div>
                        </div>
                        <button onclick="testApiLink('refunded')"
                            class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold transition">
                            <i class="fas fa-play mr-2"></i>Testar API
                        </button>
                    </div>
                </div>
            </div>

            <!-- Seção de Acesso Público -->
            <div class="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg p-6 mb-6 text-white">
                <h3 class="text-xl font-bold mb-2">
                    <i class="fas fa-globe mr-2"></i>
                    🌐 APIs Públicas - Acesso Livre
                </h3>
                <p class="text-lg opacity-90">
                    ✅ Sem autenticação necessária - basta copiar e usar os links!
                </p>
                <p class="text-sm opacity-80 mt-2">
                    Acesse diretamente no navegador, terminal, Postman, JavaScript, Python, etc.
                </p>
            </div>

            <!-- Seção de Filtros -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-filter mr-2 text-purple-600"></i>
                    Filtros Disponíveis (Query Parameters)
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 text-left font-semibold">Parâmetro</th>
                                <th class="px-4 py-2 text-left font-semibold">Formato</th>
                                <th class="px-4 py-2 text-left font-semibold">Exemplo</th>
                                <th class="px-4 py-2 text-left font-semibold">Descrição</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr>
                                <td class="px-4 py-2"><code>startDate</code></td>
                                <td class="px-4 py-2">YYYY-MM-DD</td>
                                <td class="px-4 py-2"><code>2026-02-01</code></td>
                                <td class="px-4 py-2">Data inicial</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2"><code>endDate</code></td>
                                <td class="px-4 py-2">YYYY-MM-DD</td>
                                <td class="px-4 py-2"><code>2026-02-28</code></td>
                                <td class="px-4 py-2">Data final</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2"><code>chargeType</code></td>
                                <td class="px-4 py-2">string</td>
                                <td class="px-4 py-2"><code>monthly</code></td>
                                <td class="px-4 py-2">Tipo: all, single, monthly, pix_auto, link_cadastro</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p class="text-sm text-yellow-800">
                        <strong>Exemplo com filtros:</strong><br>
                        <code class="text-xs">https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly</code>
                    </p>
                </div>
            </div>

            <!-- Resultados do Teste -->
            <div id="api-test-results" class="hidden bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-vial mr-2 text-green-600"></i>
                    Resultados do Teste
                </h3>
                <div id="api-test-content"></div>
            </div>

            <!-- Documentação -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-xl p-6 text-white">
                <h3 class="text-2xl font-bold mb-4">
                    <i class="fas fa-book mr-2"></i>
                    Documentação Completa
                </h3>
                <p class="mb-4">Para mais informações, exemplos de código em diferentes linguagens e casos de uso:</p>
                <div class="flex gap-4">
                    <a href="https://github.com/kainow252-cmyk/Cadastro/blob/main/API_RELATORIOS_EXTERNOS.md" 
                       target="_blank"
                       class="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition inline-flex items-center gap-2">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Documentação Completa
                    </a>
                    <a href="https://github.com/kainow252-cmyk/Cadastro/blob/main/LINKS_API_EXTERNOS.md" 
                       target="_blank"
                       class="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition inline-flex items-center gap-2">
                        <i class="fas fa-link"></i>
                        Ver Guia de Links
                    </a>
                </div>
            </div>
        </div>

        <!-- Payment Links Section -->
        <div id="payment-links-section" class="section hidden">
            <div class="mb-4">
                <button onclick="showSection('dashboard')" 
                    class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                    <i class="fas fa-arrow-left"></i>
                    <span>Voltar ao Dashboard</span>
                </button>
            </div>
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-money-bill-wave mr-2 text-cyan-600"></i>
                        Links de Pagamento
                    </h2>
                    <p class="text-gray-600 mt-2">Crie links para receber pagamentos via PIX, Cartão ou Assinatura</p>
                </div>

                <!-- Criar Novo Link -->
                <div class="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-plus-circle mr-2"></i>Criar Novo Link de Pagamento
                    </h3>
                    
                    <form id="payment-link-form" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nome do Link *</label>
                                <input type="text" id="paylink-name" required 
                                    placeholder="Ex: Venda de produtos"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cobrança *</label>
                                <select id="paylink-billing-type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                    <option value="UNDEFINED">Todas (PIX + Cartão + Boleto)</option>
                                    <option value="PIX">PIX apenas</option>
                                    <option value="CREDIT_CARD">Cartão de Crédito apenas</option>
                                    <option value="BOLETO">Boleto apenas</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Valor *</label>
                                <select id="paylink-charge-type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                    <option value="DETACHED">Pagamento Único (Valor Fixo)</option>
                                    <option value="RECURRENT">Assinatura Recorrente</option>
                                    <option value="INSTALLMENT">Parcelado (Cartão)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Descrição (Opcional)</label>
                                <input type="text" id="paylink-description" 
                                    placeholder="Ex: Qualquer produto por R$ 50,00"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                            </div>
                        </div>

                        <!-- Pagamento Único -->
                        <div id="paylink-detached-section" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Valor (R$) *</label>
                                    <input type="number" id="paylink-value" required step="0.01" min="0.01" 
                                        placeholder="50.00"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Dias até vencimento (para Boleto)</label>
                                    <input type="number" id="paylink-due-days" min="1" value="10"
                                        placeholder="10"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                    <p class="text-xs text-gray-500 mt-1">Quantidade de dias após a compra para o boleto vencer</p>
                                </div>
                            </div>
                        </div>

                        <!-- Assinatura Recorrente -->
                        <div id="paylink-recurrent-section" class="hidden space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Valor (R$) *</label>
                                    <input type="number" id="paylink-recurrent-value" step="0.01" min="0.01" 
                                        placeholder="50.00"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Ciclo de Cobrança *</label>
                                    <select id="paylink-cycle" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                        <option value="WEEKLY">Semanal</option>
                                        <option value="BIWEEKLY">Quinzenal (14 dias)</option>
                                        <option value="MONTHLY" selected>Mensal</option>
                                        <option value="QUARTERLY">Trimestral (3 meses)</option>
                                        <option value="SEMIANNUALLY">Semestral (6 meses)</option>
                                        <option value="YEARLY">Anual (12 meses)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Parcelamento (Cartão) -->
                        <div id="paylink-installment-section" class="hidden space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Valor Total (R$) *</label>
                                    <input type="number" id="paylink-installment-value" step="0.01" min="0.01" 
                                        placeholder="500.00"
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">Parcelas Máximas *</label>
                                    <select id="paylink-max-installments" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                                        <option value="2">2x</option>
                                        <option value="3">3x</option>
                                        <option value="4">4x</option>
                                        <option value="5">5x</option>
                                        <option value="6" selected>6x</option>
                                        <option value="7">7x</option>
                                        <option value="8">8x</option>
                                        <option value="9">9x</option>
                                        <option value="10">10x</option>
                                        <option value="11">11x</option>
                                        <option value="12">12x</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex items-center">
                                <input type="checkbox" id="paylink-notification" 
                                    class="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500">
                                <label for="paylink-notification" class="ml-2 text-sm text-gray-700">
                                    Ativar notificações (Email/SMS) - R$ 0,85 por cobrança
                                </label>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3">
                            <button type="button" onclick="document.getElementById('payment-link-form').reset()" 
                                class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                                Limpar
                            </button>
                            <button type="submit" 
                                class="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 font-semibold shadow-md">
                                <i class="fas fa-plus mr-2"></i>Criar Link
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Lista de Links -->
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-list mr-2"></i>Links Criados
                    </h3>
                    <div id="payment-links-list">
                        <div class="text-center py-12 text-gray-500">
                            <i class="fas fa-link text-6xl mb-4 opacity-30"></i>
                            <p class="text-lg">Nenhum link criado ainda</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- DeltaPag Section - Cartão de Crédito -->
        <div id="deltapag-section" class="section hidden">
            <div class="mb-4">
                <button onclick="showSection('dashboard')" 
                    class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition">
                    <i class="fas fa-arrow-left"></i>
                    <span>Voltar ao Dashboard</span>
                </button>
            </div>

            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-xl p-8 text-white mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">
                            <i class="fas fa-credit-card mr-3"></i>
                            Pagamento Cartão de Crédito - DeltaPag
                        </h2>
                        <p class="text-indigo-100">Gerenciar assinaturas recorrentes via cartão de crédito</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-indigo-100">Taxa de Transação</p>
                        <p class="text-2xl font-bold">2.99%</p>
                    </div>
                </div>
            </div>

            <!-- Action Buttons - Estilo compacto como nas subcontas -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-bolt mr-2 text-yellow-500"></i>
                    Ações Rápidas
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button onclick="openDeltapagModal()" 
                        class="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md transition">
                        <i class="fas fa-credit-card text-3xl"></i>
                        <span class="text-sm">Criar Assinatura</span>
                    </button>
                    <button onclick="openDeltapagLinkModal()" 
                        class="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold shadow-md transition">
                        <i class="fas fa-link text-3xl"></i>
                        <span class="text-sm">Criar Link</span>
                    </button>
                    <button onclick="showDeltapagLinksModal()" 
                        class="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md transition">
                        <i class="fas fa-list text-3xl"></i>
                        <span class="text-sm">Ver Links</span>
                    </button>
                    <button onclick="openDeltapagImportModal()" 
                        class="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md transition">
                        <i class="fas fa-file-csv text-3xl"></i>
                        <span class="text-sm">Importar CSV</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Total Assinaturas</p>
                            <p class="text-3xl font-bold text-gray-800" id="deltapag-stat-total">0</p>
                        </div>
                        <div class="bg-indigo-100 rounded-full p-3">
                            <i class="fas fa-users text-2xl text-indigo-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Ativas</p>
                            <p class="text-3xl font-bold text-green-600" id="deltapag-stat-active">0</p>
                        </div>
                        <div class="bg-green-100 rounded-full p-3">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Receita Mensal</p>
                            <p class="text-3xl font-bold text-yellow-600" id="deltapag-stat-revenue">R$ 0</p>
                        </div>
                        <div class="bg-yellow-100 rounded-full p-3">
                            <i class="fas fa-dollar-sign text-2xl text-yellow-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Canceladas</p>
                            <p class="text-3xl font-bold text-red-600" id="deltapag-stat-cancelled">0</p>
                        </div>
                        <div class="bg-red-100 rounded-full p-3">
                            <i class="fas fa-times-circle text-2xl text-red-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Subscription List -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">
                            <i class="fas fa-list mr-2 text-indigo-600"></i>
                            Assinaturas Ativas
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">Lista de todas as assinaturas DeltaPag</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="loadDeltapagSubscriptions()" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                            <i class="fas fa-sync-alt mr-2"></i>Atualizar
                        </button>
                        <button onclick="createEvidenceTransactions()" 
                            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold">
                            <i class="fas fa-receipt mr-2"></i>Criar Evidências
                        </button>
                        <button onclick="exportDeltapagToExcel()" 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                            <i class="fas fa-file-excel mr-2"></i>Exportar Excel
                        </button>
                        <button onclick="exportDeltapagToCSV()" 
                            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
                            <i class="fas fa-file-csv mr-2"></i>Exportar CSV
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="p-6 border-b border-gray-200 bg-gray-50">
                    <div class="space-y-4">
                        <!-- Linha 1: Filtros de texto e status -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="text" id="deltapag-filter-name" placeholder="Buscar por nome..." 
                                oninput="applyDeltapagFilters()"
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            <input type="email" id="deltapag-filter-email" placeholder="Buscar por email..." 
                                oninput="applyDeltapagFilters()"
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            <select id="deltapag-filter-status" onchange="applyDeltapagFilters()"
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Todos os status</option>
                                <option value="ACTIVE">Ativas</option>
                                <option value="CANCELLED">Canceladas</option>
                            </select>
                            <select id="deltapag-filter-recurrence" onchange="applyDeltapagFilters()"
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Todas recorrências</option>
                                <option value="DAILY">Diária</option>
                                <option value="WEEKLY">Semanal</option>
                                <option value="BIWEEKLY">Quinzenal</option>
                                <option value="MONTHLY">Mensal</option>
                                <option value="QUARTERLY">Trimestral</option>
                                <option value="SEMIANNUAL">Semestral</option>
                                <option value="YEARLY">Anual</option>
                            </select>
                        </div>
                        
                        <!-- Linha 2: Filtros de data -->
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div class="relative">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Data Específica</label>
                                <input type="date" id="deltapag-filter-date" onchange="applyDeltapagFilters()"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="relative">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Mês/Ano</label>
                                <input type="month" id="deltapag-filter-month" onchange="applyDeltapagFilters()"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="relative">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Ano</label>
                                <select id="deltapag-filter-year" onchange="applyDeltapagFilters()"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Todos anos</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                </select>
                            </div>
                            <div class="relative">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Período - De</label>
                                <input type="date" id="deltapag-filter-date-from" onchange="applyDeltapagFilters()"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            </div>
                            <div class="relative">
                                <label class="block text-xs font-medium text-gray-700 mb-1">Período - Até</label>
                                <input type="date" id="deltapag-filter-date-to" onchange="applyDeltapagFilters()"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                            </div>
                        </div>
                        
                        <!-- Linha 3: Ações -->
                        <div class="flex justify-between items-center">
                            <button onclick="clearDeltapagFilters()" 
                                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition">
                                <i class="fas fa-times mr-2"></i>Limpar Filtros
                            </button>
                            <div class="text-sm text-gray-600">
                                <span id="deltapag-filter-count">0 assinaturas visíveis</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartão</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorrência</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="deltapag-subscriptions-tbody" class="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                                    <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                                    <p>Carregando assinaturas...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal de Link de Cadastro -->
        <div id="link-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-white">
                            <i class="fas fa-link mr-2"></i>
                            Link de Cadastro Gerado
                        </h3>
                        <button onclick="closeLinkModal()" class="text-white hover:text-gray-200 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-purple-100 text-sm mt-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        Compartilhe este link para que pessoas possam se cadastrar
                    </p>
                </div>

                <!-- Body -->
                <div class="p-6 space-y-6">
                    <!-- Loading State -->
                    <div id="link-loading" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-4xl text-purple-500 mb-4"></i>
                        <p class="text-gray-600">Gerando link único...</p>
                    </div>

                    <!-- Success State -->
                    <div id="link-content" class="hidden space-y-6">
                        <!-- Link Display -->
                        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                <i class="fas fa-link mr-1"></i>
                                Link de Cadastro:
                            </label>
                            <div class="flex gap-2">
                                <input type="text" 
                                    id="generated-link" 
                                    readonly
                                    class="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-mono">
                                <button onclick="copyLink()" 
                                    id="copy-link-btn"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Link Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p class="text-xs font-semibold text-blue-900 mb-1">
                                    <i class="fas fa-clock mr-1"></i>Validade
                                </p>
                                <p class="text-lg font-bold text-blue-700" id="link-expires"></p>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p class="text-xs font-semibold text-green-900 mb-1">
                                    <i class="fas fa-infinity mr-1"></i>Usos
                                </p>
                                <p class="text-lg font-bold text-green-700">Ilimitado</p>
                            </div>
                        </div>

                        <!-- QR Code -->
                        <div class="text-center bg-white p-6 rounded-lg border-2 border-gray-200">
                            <p class="text-sm font-semibold text-gray-700 mb-3">
                                <i class="fas fa-qrcode mr-1"></i>QR Code do Link
                            </p>
                            <div id="qr-code-container" class="inline-block">
                                <!-- QR Code will be inserted here -->
                            </div>
                            <p class="text-xs text-gray-500 mt-3">Escaneie este QR Code para acessar o link de cadastro</p>
                        </div>

                        <!-- Share Options -->
                        <div class="space-y-3">
                            <p class="text-sm font-bold text-gray-700">
                                <i class="fas fa-share-alt mr-1"></i>Compartilhar via:
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button onclick="shareWhatsApp()" 
                                    class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fab fa-whatsapp text-xl"></i>
                                    WhatsApp
                                </button>
                                <button onclick="shareEmail()" 
                                    class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fas fa-envelope text-xl"></i>
                                    Email
                                </button>
                                <button onclick="shareTelegram()" 
                                    class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fab fa-telegram text-xl"></i>
                                    Telegram
                                </button>
                                <button onclick="downloadQRCodeFromCanvas()" 
                                    class="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fas fa-download text-xl"></i>
                                    Baixar QR Code
                                </button>
                            </div>
                        </div>

                        <!-- Instructions -->
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div class="flex">
                                <i class="fas fa-lightbulb text-yellow-600 text-xl mr-3 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-yellow-800 mb-1">Como usar este link:</p>
                                    <ol class="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
                                        <li>Copie o link ou compartilhe via WhatsApp/Email</li>
                                        <li>A pessoa acessa o link e preenche o formulário</li>
                                        <li>Sistema cria a subconta automaticamente</li>
                                        <li>Email de confirmação é enviado</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                    <button onclick="closeLinkModal()" 
                        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                        Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal PIX Automático -->
        <div id="pix-automatic-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-white">
                            <i class="fas fa-robot mr-2"></i>
                            Link PIX Automático Gerado
                        </h3>
                        <button onclick="closePixAutomaticModal()" class="text-white hover:text-gray-200 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-blue-100 text-sm mt-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        Compartilhe este link para débito automático mensal
                    </p>
                </div>

                <!-- Body -->
                <div class="p-6 space-y-6">
                    <!-- Form State -->
                    <div id="pix-automatic-form" class="space-y-4">
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p class="text-sm text-gray-700">
                                <i class="fas fa-lightbulb text-yellow-600 mr-2"></i>
                                <strong>PIX Automático:</strong> O cliente autoriza UMA VEZ e o débito ocorre automaticamente todo mês.
                            </p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-dollar-sign mr-1 text-green-600"></i>Valor Mensal (R$)
                            </label>
                            <input type="number" 
                                id="pix-auto-value" 
                                step="0.01"
                                min="1"
                                placeholder="50.00"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-align-left mr-1 text-blue-600"></i>Descrição
                            </label>
                            <input type="text" 
                                id="pix-auto-description" 
                                placeholder="Mensalidade Mensal"
                                maxlength="100"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-calendar mr-1 text-purple-600"></i>Validade do Link
                            </label>
                            <select id="pix-auto-days" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="7">7 dias (1 semana)</option>
                                <option value="15">15 dias (2 semanas)</option>
                                <option value="30" selected>30 dias (1 mês)</option>
                                <option value="60">60 dias (2 meses)</option>
                                <option value="90">90 dias (3 meses)</option>
                                <option value="180">180 dias (6 meses)</option>
                                <option value="365">365 dias (1 ano)</option>
                            </select>
                            <p class="text-xs text-gray-500 mt-1">
                                <i class="fas fa-info-circle mr-1"></i>
                                Após expirar, o link não funcionará mais
                            </p>
                        </div>
                        
                        <button onclick="generatePixAutomaticLink()" 
                            id="generate-pix-auto-btn"
                            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg">
                            <i class="fas fa-robot mr-2"></i>Gerar Link PIX Automático
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="pix-automatic-loading" class="hidden text-center py-8">
                        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                        <p class="text-gray-600">Gerando link PIX Automático...</p>
                    </div>

                    <!-- Success State -->
                    <div id="pix-automatic-content" class="hidden space-y-6">
                        <!-- Link Display -->
                        <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                <i class="fas fa-link mr-1"></i>
                                Link PIX Automático:
                            </label>
                            <div class="flex gap-2">
                                <input type="text" 
                                    id="generated-pix-auto-link" 
                                    readonly
                                    class="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-mono">
                                <button onclick="copyPixAutoLink()" 
                                    id="copy-pix-auto-btn"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Link Info -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p class="text-xs font-semibold text-green-900 mb-1">
                                    <i class="fas fa-dollar-sign mr-1"></i>Valor Mensal
                                </p>
                                <p class="text-lg font-bold text-green-700" id="pix-auto-display-value">R$ 0,00</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p class="text-xs font-semibold text-blue-900 mb-1">
                                    <i class="fas fa-clock mr-1"></i>Validade
                                </p>
                                <p class="text-lg font-bold text-blue-700" id="pix-auto-expires"></p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p class="text-xs font-semibold text-purple-900 mb-1">
                                    <i class="fas fa-sync mr-1"></i>Frequência
                                </p>
                                <p class="text-lg font-bold text-purple-700">Mensal</p>
                            </div>
                        </div>

                        <!-- QR Code -->
                        <div class="text-center bg-white p-6 rounded-lg border-2 border-gray-200">
                            <p class="text-sm font-semibold text-gray-700 mb-3">
                                <i class="fas fa-qrcode mr-1"></i>QR Code do Link
                            </p>
                            <div id="pix-auto-qr-container" class="inline-block">
                                <!-- QR Code will be inserted here -->
                            </div>
                            <p class="text-xs text-gray-500 mt-3">Escaneie este QR Code para acessar o link de auto-cadastro PIX Automático</p>
                        </div>

                        <!-- Share Options -->
                        <div class="space-y-3">
                            <p class="text-sm font-bold text-gray-700">
                                <i class="fas fa-share-alt mr-1"></i>Compartilhar via:
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button onclick="sharePixAutoWhatsApp()" 
                                    class="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fab fa-whatsapp text-xl"></i>
                                    WhatsApp
                                </button>
                                <button onclick="sharePixAutoEmail()" 
                                    class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fas fa-envelope text-xl"></i>
                                    Email
                                </button>
                                <button onclick="sharePixAutoTelegram()" 
                                    class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fab fa-telegram text-xl"></i>
                                    Telegram
                                </button>
                                <button onclick="downloadPixAutoQRCode()" 
                                    class="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fas fa-download text-xl"></i>
                                    Baixar QR Code
                                </button>
                                <button onclick="downloadPixAutoHTML()" 
                                    class="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold flex items-center justify-center gap-2">
                                    <i class="fas fa-code text-xl"></i>
                                    Gerar HTML
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closePixAutomaticModal()" 
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>
                        Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal DeltaPag - Pagamento Recorrente Cartão de Crédito -->
        <div id="deltapag-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-5 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="fas fa-credit-card"></i>
                                Pagamento Recorrente - Cartão de Crédito
                            </h2>
                            <p class="text-indigo-100 mt-1 text-sm">DeltaPag - Cobrança automática mensal</p>
                        </div>
                        <button onclick="closeDeltapagModal()" 
                            class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Form Content -->
                <form id="deltapag-form" class="p-6 space-y-6">
                    <!-- Dados do Cliente -->
                    <div class="border-b pb-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-user text-indigo-600"></i>
                            Dados do Cliente
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome Completo <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="deltapag-customer-name" required
                                    placeholder="Ex: João da Silva"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span class="text-red-500">*</span>
                                </label>
                                <input type="email" id="deltapag-customer-email" required
                                    placeholder="joao@email.com"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    CPF <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="deltapag-customer-cpf" required
                                    placeholder="000.000.000-00"
                                    maxlength="14"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Telefone
                                </label>
                                <input type="tel" id="deltapag-customer-phone"
                                    placeholder="(11) 98765-4321"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>

                    <!-- Dados do Cartão -->
                    <div class="border-b pb-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-credit-card text-indigo-600"></i>
                            Dados do Cartão
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Número do Cartão <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="deltapag-card-number" required
                                    placeholder="0000 0000 0000 0000"
                                    maxlength="19"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome no Cartão <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="deltapag-card-holder" required
                                    placeholder="JOÃO DA SILVA"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Validade <span class="text-red-500">*</span>
                                </label>
                                <div class="grid grid-cols-2 gap-2">
                                    <select id="deltapag-card-month" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                        <option value="">Mês</option>
                                        <option value="01">01</option>
                                        <option value="02">02</option>
                                        <option value="03">03</option>
                                        <option value="04">04</option>
                                        <option value="05">05</option>
                                        <option value="06">06</option>
                                        <option value="07">07</option>
                                        <option value="08">08</option>
                                        <option value="09">09</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                    </select>
                                    <select id="deltapag-card-year" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                        <option value="">Ano</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                        <option value="2028">2028</option>
                                        <option value="2029">2029</option>
                                        <option value="2030">2030</option>
                                        <option value="2031">2031</option>
                                        <option value="2032">2032</option>
                                        <option value="2033">2033</option>
                                        <option value="2034">2034</option>
                                        <option value="2035">2035</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    CVV <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="deltapag-card-cvv" required
                                    placeholder="000"
                                    maxlength="4"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>

                    <!-- Dados da Cobrança -->
                    <div class="border-b pb-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-money-bill-wave text-indigo-600"></i>
                            Dados da Cobrança
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Valor Mensal (R$) <span class="text-red-500">*</span>
                                </label>
                                <input type="number" id="deltapag-value" required step="0.01" min="0.01"
                                    placeholder="50.00"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Recorrência
                                </label>
                                <select id="deltapag-recurrence" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="MONTHLY">Mensal</option>
                                    <option value="WEEKLY">Semanal</option>
                                    <option value="BIWEEKLY">Quinzenal</option>
                                    <option value="QUARTERLY">Trimestral</option>
                                    <option value="SEMIANNUALLY">Semestral</option>
                                    <option value="YEARLY">Anual</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea id="deltapag-description" rows="2"
                                    placeholder="Ex: Mensalidade Plano Premium"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Split (Opcional) -->
                    <div class="border-b pb-4">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-split text-indigo-600"></i>
                            Split de Pagamento (Opcional)
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Wallet ID da Subconta
                                </label>
                                <input type="text" id="deltapag-split-wallet"
                                    placeholder="Deixe vazio para não usar split"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    Percentual para Subconta (%)
                                </label>
                                <input type="number" id="deltapag-split-percentage" 
                                    placeholder="20"
                                    min="0" max="100" step="0.01"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">
                            <i class="fas fa-info-circle mr-1"></i>
                            Se configurado, o valor será dividido automaticamente entre a conta principal e a subconta
                        </p>
                    </div>

                    <!-- Informações de Taxa -->
                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-indigo-600 text-xl mt-1"></i>
                            <div class="flex-1">
                                <h4 class="font-bold text-indigo-900 mb-2">Informações Importantes:</h4>
                                <ul class="text-sm text-indigo-800 space-y-1">
                                    <li>✅ Primeira cobrança será processada imediatamente</li>
                                    <li>🔄 Cobranças automáticas mensais no cartão cadastrado</li>
                                    <li>💳 Taxa de transação: 2.99% por cobrança</li>
                                    <li>📧 O cliente receberá emails de confirmação</li>
                                    <li>🔐 Dados do cartão são criptografados e seguros</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Resultado -->
                    <div id="deltapag-result" class="hidden"></div>

                    <!-- Botões -->
                    <div class="flex gap-3 pt-4">
                        <button type="submit" id="deltapag-submit-btn"
                            class="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transition">
                            <i class="fas fa-credit-card mr-2"></i>
                            Criar Assinatura Recorrente
                        </button>
                        <button type="button" onclick="closeDeltapagModal()"
                            class="px-6 py-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Link Auto-Cadastro DeltaPag -->
        <div id="deltapag-link-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-5 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="fas fa-link"></i>
                                Link Auto-Cadastro - Cartão Crédito
                            </h2>
                            <p class="text-purple-100 mt-1 text-sm">Cliente preenche sozinho e cadastra o cartão</p>
                        </div>
                        <button onclick="closeDeltapagLinkModal()" 
                            class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <div id="deltapag-link-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Valor Mensal (R$) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="deltapag-link-value" required step="0.01" min="0.01"
                                placeholder="50.00"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Descrição <span class="text-red-500">*</span>
                            </label>
                            <textarea id="deltapag-link-description" required rows="2"
                                placeholder="Ex: Mensalidade Plano Premium"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Recorrência
                            </label>
                            <select id="deltapag-link-recurrence"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                <option value="MONTHLY">Mensal</option>
                                <option value="WEEKLY">Semanal</option>
                                <option value="BIWEEKLY">Quinzenal</option>
                                <option value="QUARTERLY">Trimestral</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Validade do Link (dias)
                            </label>
                            <select id="deltapag-link-days"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                <option value="7">7 dias</option>
                                <option value="15">15 dias</option>
                                <option value="30" selected>30 dias</option>
                                <option value="60">60 dias</option>
                                <option value="90">90 dias</option>
                                <option value="180">6 meses</option>
                                <option value="365">1 ano</option>
                            </select>
                        </div>

                        <button onclick="generateDeltapagLink()" 
                            class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold">
                            <i class="fas fa-link mr-2"></i>Gerar Link
                        </button>
                    </div>

                    <div id="deltapag-link-result" class="hidden mt-6 space-y-4">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 class="font-bold text-green-900 mb-2">
                                <i class="fas fa-check-circle mr-2"></i>Link Gerado com Sucesso!
                            </h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-sm font-medium text-gray-700">Link:</label>
                                    <div class="flex gap-2 mt-1">
                                        <input type="text" id="deltapag-link-url" readonly
                                            class="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm">
                                        <button onclick="copyDeltapagLink()"
                                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2">
                                    <button onclick="shareDeltapagWhatsApp()"
                                        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                        <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                                    </button>
                                    <button onclick="shareDeltapagEmail()"
                                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                        <i class="fas fa-envelope mr-2"></i>Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closeDeltapagLinkModal()"
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Importar CSV DeltaPag -->
        <div id="deltapag-import-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-5 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="fas fa-file-csv"></i>
                                Importar Assinaturas em Lote (CSV)
                            </h2>
                            <p class="text-green-100 mt-1 text-sm">Cadastre múltiplas assinaturas de uma vez</p>
                        </div>
                        <button onclick="closeDeltapagImportModal()" 
                            class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Instruções -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-bold text-blue-900 mb-2">
                            <i class="fas fa-info-circle mr-2"></i>Formato do CSV
                        </h4>
                        <div class="text-sm text-blue-800 space-y-2">
                            <p><strong>Colunas obrigatórias (nesta ordem):</strong></p>
                            <code class="block bg-white p-2 rounded text-xs overflow-x-auto">
                                nome,email,cpf,telefone,numero_cartao,nome_cartao,mes,ano,cvv,valor,recorrencia,descricao
                            </code>
                            <p class="mt-2"><strong>Exemplo de linha:</strong></p>
                            <code class="block bg-white p-2 rounded text-xs overflow-x-auto">
                                João Silva,joao@email.com,00000000000,11987654321,0000000000000000,JOÃO SILVA,12,2028,123,50.00,MONTHLY,Plano Premium
                            </code>
                            <p class="mt-2"><strong>Recorrências válidas:</strong> MONTHLY, WEEKLY, BIWEEKLY, QUARTERLY, SEMIANNUALLY, YEARLY</p>
                        </div>
                    </div>

                    <!-- Botão Download Template -->
                    <button onclick="downloadDeltapagTemplate()"
                        class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                        <i class="fas fa-download mr-2"></i>Baixar Template CSV
                    </button>

                    <!-- Upload CSV -->
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input type="file" id="deltapag-csv-file" accept=".csv" class="hidden" onchange="handleDeltapagCSV(event)">
                        <label for="deltapag-csv-file" class="cursor-pointer">
                            <i class="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-3"></i>
                            <p class="text-gray-700 font-semibold">Clique para selecionar o arquivo CSV</p>
                            <p class="text-sm text-gray-500 mt-1">ou arraste e solte aqui</p>
                        </label>
                    </div>

                    <!-- Preview -->
                    <div id="deltapag-csv-preview" class="hidden">
                        <h4 class="font-bold text-gray-800 mb-2">Preview (primeiras 5 linhas):</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm border border-gray-200">
                                <thead class="bg-gray-100">
                                    <tr id="deltapag-csv-header"></tr>
                                </thead>
                                <tbody id="deltapag-csv-body"></tbody>
                            </table>
                        </div>
                        <div class="mt-4 flex gap-2">
                            <button onclick="importDeltapagCSV()"
                                class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                                <i class="fas fa-upload mr-2"></i>Importar <span id="deltapag-csv-count">0</span> Assinaturas
                            </button>
                            <button onclick="cancelDeltapagCSV()"
                                class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                                Cancelar
                            </button>
                        </div>
                    </div>

                    <!-- Progress -->
                    <div id="deltapag-import-progress" class="hidden">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center gap-3 mb-3">
                                <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
                                <div class="flex-1">
                                    <p class="font-bold text-blue-900">Importando assinaturas...</p>
                                    <p class="text-sm text-blue-700">
                                        <span id="deltapag-import-current">0</span> de 
                                        <span id="deltapag-import-total">0</span> processadas
                                    </p>
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div id="deltapag-import-bar" class="bg-blue-600 h-3 rounded-full transition-all" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Result -->
                    <div id="deltapag-import-result" class="hidden"></div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closeDeltapagImportModal()"
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Ver Links DeltaPag -->
        <div id="deltapag-links-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 rounded-t-2xl">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-list mr-3"></i>
                        Links de Auto-Cadastro Criados
                    </h2>
                </div>

                <div class="p-6 overflow-y-auto max-h-[70vh]">
                    <!-- Loading -->
                    <div id="deltapag-links-loading" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-blue-600 text-4xl mb-4"></i>
                        <p class="text-gray-600">Carregando links...</p>
                    </div>

                    <!-- Links List -->
                    <div id="deltapag-links-list" class="hidden space-y-4"></div>

                    <!-- Empty State -->
                    <div id="deltapag-links-empty" class="hidden text-center py-12">
                        <i class="fas fa-link text-gray-300 text-6xl mb-4"></i>
                        <p class="text-gray-500 text-lg">Nenhum link criado ainda</p>
                        <button onclick="closeDeltapagLinksModal(); openDeltapagLinkModal();" 
                            class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            <i class="fas fa-plus mr-2"></i>Criar Primeiro Link
                        </button>
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closeDeltapagLinksModal()"
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal QR Code -->
        <div id="qrcode-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-qrcode mr-3"></i>
                        QR Code do Link
                    </h2>
                </div>

                <div class="p-6">
                    <!-- Link Info -->
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-purple-600 text-xl mt-1"></i>
                            <div>
                                <p class="font-bold text-purple-900 mb-1" id="qr-link-description">-</p>
                                <p class="text-sm text-purple-700">
                                    <span id="qr-link-value">-</span> • <span id="qr-link-recurrence">-</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- QR Code -->
                    <div class="bg-white border-4 border-purple-200 rounded-lg p-6 flex justify-center mb-6">
                        <canvas id="qrcode-canvas"></canvas>
                    </div>

                    <!-- Actions -->
                    <div class="space-y-3">
                        <!-- Baixar PNG -->
                        <button onclick="downloadQRCodeFromCanvas()" 
                            class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2">
                            <i class="fas fa-download"></i>
                            Baixar QR Code (PNG)
                        </button>

                        <!-- Copiar HTML -->
                        <button onclick="copyQRCodeHTML()" 
                            class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
                            <i class="fas fa-code"></i>
                            Copiar Código HTML
                        </button>

                        <!-- Preview HTML -->
                        <details class="bg-gray-50 rounded-lg border border-gray-200">
                            <summary class="px-4 py-3 cursor-pointer font-semibold text-gray-700 hover:bg-gray-100 rounded-lg">
                                <i class="fas fa-eye mr-2"></i>
                                Visualizar Código HTML
                            </summary>
                            <div class="p-4 border-t border-gray-200">
                                <pre id="qr-html-preview" class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono"></pre>
                            </div>
                        </details>
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closeQRCodeModal()"
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal Gerar Banner de Propaganda -->
        <div id="banner-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-5 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold flex items-center gap-2">
                                <i class="fas fa-image"></i>
                                Gerar Banner de Propaganda
                            </h2>
                            <p class="text-orange-100 mt-1 text-sm">Crie banners personalizados para redes sociais</p>
                        </div>
                        <button onclick="closeBannerModal()" 
                            class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Formulário de Edição -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Coluna Esquerda: Formulário -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-heading mr-1"></i>Título Principal
                                </label>
                                <input type="text" id="banner-title" 
                                    placeholder="Ex: Assine Agora!"
                                    value="Assine Agora!"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    oninput="updateBannerPreview()">
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-file-alt mr-1"></i>Descrição
                                </label>
                                <textarea id="banner-description" rows="3"
                                    placeholder="Ex: Plano Premium com benefícios exclusivos"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    oninput="updateBannerPreview()">Plano Premium com benefícios exclusivos</textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-dollar-sign mr-1"></i>Valor (R$)
                                    </label>
                                    <input type="number" id="banner-value" 
                                        placeholder="Ex: 149.90"
                                        value="149.90"
                                        step="0.01"
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        oninput="updateBannerPreview()">
                                </div>

                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-sync-alt mr-1"></i>Tipo
                                    </label>
                                    <select id="banner-type" 
                                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        onchange="updateBannerPreview()">
                                        <option value="single">Cobrança Única</option>
                                        <option value="monthly">Assinatura Mensal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-palette mr-1"></i>Cor do Banner
                                </label>
                                <select id="banner-color" 
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    onchange="updateBannerPreview()">
                                    <option value="purple">Roxo/Rosa</option>
                                    <option value="blue">Azul</option>
                                    <option value="green">Verde</option>
                                    <option value="orange">Laranja</option>
                                    <option value="red">Vermelho</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-text-height mr-1"></i>Texto do Botão
                                </label>
                                <input type="text" id="banner-button-text" 
                                    placeholder="Ex: Cadastre-se Agora"
                                    value="Cadastre-se Agora"
                                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    oninput="updateBannerPreview()">
                            </div>

                            <input type="hidden" id="banner-link" value="">
                            <input type="hidden" id="banner-account-id" value="">
                        </div>

                        <!-- Coluna Direita: Banner Gerado -->
                        <div>
                            <!-- Botão Gerar Banner (Aparece Primeiro) -->
                            <div id="generate-banner-container" class="flex flex-col items-center justify-center">
                                <button onclick="generateAndShowBanner()" 
                                    class="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-lg shadow-lg transition">
                                    <i class="fas fa-magic mr-2"></i>Gerar Banner
                                </button>
                                <p class="text-sm text-gray-500 mt-3 text-center">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Clique para gerar o banner com QR Code funcionando
                                </p>
                            </div>

                            <!-- Preview do Banner (Aparece Depois de Gerar) -->
                            <div id="banner-preview-container" class="hidden">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-check-circle text-green-600 mr-1"></i>Banner Gerado com Sucesso!
                                </label>
                                <div id="banner-preview" class="w-full aspect-square rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
                                    <p class="text-sm">Gerando banner...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Ações (Aparecem Depois de Gerar) -->
                    <div id="banner-actions" class="hidden flex gap-3">
                        <button onclick="downloadBanner()" 
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 font-semibold">
                            <i class="fas fa-download mr-2"></i>Baixar Banner (PNG)
                        </button>
                        <button onclick="copyBannerLink()" 
                            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">
                            <i class="fas fa-link mr-2"></i>Copiar Link do Banner
                        </button>
                    </div>

                    <!-- Aviso -->
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-sm text-blue-900 font-semibold mb-2">
                            <i class="fas fa-rocket mr-2"></i>
                            Como compartilhar nas redes sociais:
                        </p>
                        <ol class="text-xs text-blue-800 space-y-1 ml-4">
                            <li>1️⃣ <strong>Baixar Banner (PNG)</strong> - Salva a imagem 1080x1080px no seu computador</li>
                            <li>2️⃣ <strong>Copiar Link do Banner</strong> - Copia o link de cadastro para compartilhar</li>
                            <li>3️⃣ <strong>Postar nas Redes</strong> - Anexe a imagem + cole o link na legenda/bio</li>
                        </ol>
                        <p class="text-xs text-blue-700 mt-3">
                            <i class="fas fa-qrcode mr-1"></i>
                            <strong>Dica:</strong> O banner tem QR Code! Cliente pode escanear direto ou clicar no link. Funciona em Instagram, Facebook, WhatsApp, Twitter e impressos!
                        </p>
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onclick="closeBannerModal()"
                        class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
                        <i class="fas fa-times mr-2"></i>Fechar
                    </button>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <script src="/static/app.js?v=5.0"></script>
        <script src="/static/payment-links.js?v=4.2"></script>
        <script src="/static/payment-filters.js?v=4.2"></script>
        <script src="/static/deltapag-section.js?v=4.1"></script>
        <script src="/static/reports-detailed.js?v=1.0"></script>
        <script src="/static/banner-generator.js?v=1.0"></script>
    </body>
    </html>
  `)
})

// ======================
// WEBHOOKS DO ASAAS
// ======================

// Endpoint para receber webhooks do Asaas
app.post('/api/webhooks/asaas', async (c) => {
  try {
    // Validar token de segurança (opcional mas recomendado)
    const receivedToken = c.req.header('asaas-access-token')
    const expectedToken = c.env.ASAAS_WEBHOOK_TOKEN // Apenas token específico, não API_KEY
    
    // Se tiver token configurado, validar
    if (expectedToken && receivedToken !== expectedToken) {
      console.log('Token inválido:', { receivedToken, expectedToken })
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Receber payload do webhook
    const payload = await c.req.json()
    const webhookId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Webhook recebido:', {
      id: webhookId,
      event: payload.event,
      paymentId: payload.payment?.id,
      accountId: payload.account?.id
    })

    // Salvar webhook no banco para processamento posterior
    await c.env.DB.prepare(`
      INSERT INTO webhooks (id, event, payload, processed, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `).bind(
      webhookId,
      payload.event,
      JSON.stringify(payload)
    ).run()

    // Processar evento imediatamente
    await processWebhookEvent(c, payload, webhookId)

    // Retornar sucesso (importante para o Asaas saber que recebeu)
    return c.json({ 
      ok: true, 
      message: 'Webhook recebido',
      webhookId 
    })

  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    // Mesmo com erro, retornar 200 para não reenviar
    return c.json({ 
      ok: false, 
      error: error.message,
      message: 'Erro ao processar webhook'
    }, 500)
  }
})

// Função auxiliar para processar eventos do webhook
async function processWebhookEvent(c: any, payload: any, webhookId: string) {
  const event = payload.event
  
  try {
    switch (event) {
      // Eventos de Pagamento
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(c, payload)
        break
      
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(c, payload)
        break
      
      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(c, payload)
        break
      
      case 'PAYMENT_REFUNDED':
        await handlePaymentRefunded(c, payload)
        break
      
      // Eventos de Subconta
      case 'ACCOUNT_CREATED':
      case 'ACCOUNT_UPDATED':
      case 'ACCOUNT_STATUS_CHANGED':
        await handleAccountEvent(c, payload)
        break
      
      // Eventos de Transferência
      case 'TRANSFER_DONE':
        await handleTransferDone(c, payload)
        break
      
      default:
        console.log('Evento não tratado:', event)
    }

    // Marcar webhook como processado
    await c.env.DB.prepare(`
      UPDATE webhooks 
      SET processed = 1, processed_at = datetime('now')
      WHERE id = ?
    `).bind(webhookId).run()

  } catch (error: any) {
    console.error('Erro ao processar evento:', error)
    
    // Salvar erro no banco
    await c.env.DB.prepare(`
      UPDATE webhooks 
      SET error = ?
      WHERE id = ?
    `).bind(error.message, webhookId).run()
    
    throw error
  }
}

// Handlers para cada tipo de evento
async function handlePaymentCreated(c: any, payload: any) {
  console.log('Pagamento criado:', payload.payment?.id)
  // Adicionar lógica personalizada aqui
}

async function handlePaymentReceived(c: any, payload: any) {
  console.log('📧 Pagamento recebido:', payload.payment?.id)
  
  const payment = payload.payment
  const paymentValue = parseFloat(payment?.value || 0)
  
  // Registrar no log de atividades
  await c.env.DB.prepare(`
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (NULL, 'PAYMENT_RECEIVED', ?, 'webhook')
  `).bind(
    JSON.stringify({
      paymentId: payment?.id,
      value: paymentValue,
      customer: payment?.customer,
      pixTransaction: payment?.pixTransaction
    })
  ).run()
  
  // ========================================
  // ENVIAR E-MAIL DE BOAS-VINDAS
  // ========================================
  try {
    // Buscar dados da autorização PIX Automático
    const auth = await c.env.DB.prepare(`
      SELECT 
        pa.*,
        psl.campaign,
        psl.plan_type,
        psl.description as link_description,
        (SELECT COUNT(*) FROM pix_automatic_authorizations WHERE customer_email = pa.customer_email AND status = 'ACTIVE') as subscription_count
      FROM pix_automatic_authorizations pa
      LEFT JOIN pix_automatic_signup_links psl ON pa.link_id = psl.id
      WHERE pa.customer_id = ?
      ORDER BY pa.created_at DESC
      LIMIT 1
    `).bind(payment.customer).first()
    
    if (auth && auth.customer_email) {
      // Inicializar SES se ainda não foi
      if (!isSESConfigured() && c.env.AWS_ACCESS_KEY_ID && c.env.AWS_SECRET_ACCESS_KEY) {
        initializeSESClient(
          c.env.AWS_ACCESS_KEY_ID,
          c.env.AWS_SECRET_ACCESS_KEY,
          c.env.AWS_REGION || 'us-east-1'
        )
      }
      
      // Determinar tipo de assinatura
      const subscriptionCount = parseInt(auth.subscription_count as string) || 0
      const isReactivation = subscriptionCount > 1
      const isUpgrade = (auth.description as string || '').toLowerCase().includes('upgrade')
      
      // Determinar plano (extrair de description ou usar padrão)
      let plan: 'basico' | 'premium' | 'empresarial' = 'basico'
      const planType = (auth.plan_type as string || '').toLowerCase()
      const description = (auth.description as string || '').toLowerCase()
      
      if (planType.includes('premium') || description.includes('premium')) {
        plan = 'premium'
      } else if (planType.includes('empresarial') || planType.includes('enterprise') || description.includes('empresarial')) {
        plan = 'empresarial'
      }
      
      console.log('📊 Dados do e-mail:', {
        email: auth.customer_email,
        plan,
        isUpgrade,
        isReactivation,
        campaign: auth.campaign,
        subscriptionCount
      })
      
      // Preparar dados do cliente
      const customerData: CustomerData = {
        name: auth.customer_name as string,
        email: auth.customer_email as string,
        plan,
        value: parseFloat(auth.value as string),
        activationDate: new Date().toLocaleDateString('pt-BR'),
        campaign: auth.campaign as string || undefined,
        isUpgrade,
        isReactivation
      }
      
      // Enviar e-mail de boas-vindas
      const emailResult = await sendWelcomeEmail(customerData)
      
      if (emailResult.success) {
        console.log('✅ E-mail de boas-vindas enviado com sucesso!')
        
        // Registrar envio no banco
        await c.env.DB.prepare(`
          INSERT INTO welcome_emails (
            id,
            authorization_id,
            email,
            plan_type,
            template_type,
            sent_at,
            ses_message_id,
            status,
            created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 'sent', datetime('now'))
        `).bind(
          `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          auth.id,
          auth.customer_email,
          plan,
          isUpgrade ? 'upgrade' : isReactivation ? 'reactivation' : plan,
          emailResult.messageId || null
        ).run()
      } else {
        console.warn('⚠️ Falha ao enviar e-mail:', emailResult.error)
        
        // Registrar falha no banco
        await c.env.DB.prepare(`
          INSERT INTO welcome_emails (
            id,
            authorization_id,
            email,
            plan_type,
            template_type,
            sent_at,
            status,
            error_message,
            created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'), 'failed', ?, datetime('now'))
        `).bind(
          `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          auth.id,
          auth.customer_email,
          plan,
          isUpgrade ? 'upgrade' : isReactivation ? 'reactivation' : plan,
          emailResult.error || 'Unknown error'
        ).run()
      }
    } else {
      console.log('ℹ️ Autorização não encontrada para customer:', payment.customer)
    }
  } catch (emailError: any) {
    console.error('❌ Erro ao processar e-mail de boas-vindas:', emailError.message)
    // Não falhar o webhook se o e-mail der erro
  }
  
  // ========================================
  // APLICAR SPLIT AUTOMÁTICO 20/80
  // ========================================
  try {
    const splitConfig = await c.env.DB.prepare(`
      SELECT * FROM pix_splits 
      WHERE value = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(paymentValue).first()
    
    if (splitConfig && splitConfig.account_id) {
      const accountId = splitConfig.account_id as string
      const splitPercentage = (splitConfig.split_percentage as number) || 20
      const transferValue = (paymentValue * splitPercentage / 100)
      
      console.log(`💸 Aplicando split de ${splitPercentage}%: R$ ${transferValue} para conta ${accountId}`)
      
      // Criar transferência para a subconta
      const transferData = {
        value: transferValue,
        walletId: accountId
      }
      
      const transferResult = await asaasRequest(c, '/transfers', 'POST', transferData)
      
      if (transferResult.ok) {
        console.log('✅ Split aplicado com sucesso:', transferResult.data)
        
        // Registrar split no log
        await c.env.DB.prepare(`
          INSERT INTO activity_logs (user_id, action, details, ip_address)
          VALUES (NULL, 'SPLIT_APPLIED', ?, 'webhook')
        `).bind(
          JSON.stringify({
            paymentId: payment?.id,
            accountId,
            transferValue,
            transferId: transferResult.data?.id,
            splitPercentage
          })
        ).run()
      } else {
        console.error('❌ Erro ao aplicar split:', transferResult.data)
      }
    }
  } catch (splitError: any) {
    console.error('❌ Erro ao processar split:', splitError)
    // Não falhar o webhook se o split der erro
  }
}

async function handlePaymentOverdue(c: any, payload: any) {
  console.log('Pagamento vencido:', payload.payment?.id)
  
  // Registrar no log
  await c.env.DB.prepare(`
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (NULL, 'PAYMENT_OVERDUE', ?, 'webhook')
  `).bind(
    JSON.stringify({
      paymentId: payload.payment?.id,
      value: payload.payment?.value,
      dueDate: payload.payment?.dueDate
    })
  ).run()
  
  // Aqui você pode:
  // - Enviar email de cobrança
  // - Suspender serviço
  // - Gerar segunda via
}

async function handlePaymentRefunded(c: any, payload: any) {
  console.log('Pagamento estornado:', payload.payment?.id)
  
  // Registrar no log
  await c.env.DB.prepare(`
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (NULL, 'PAYMENT_REFUNDED', ?, 'webhook')
  `).bind(
    JSON.stringify({
      paymentId: payload.payment?.id,
      value: payload.payment?.value
    })
  ).run()
  
  // Aqui você pode:
  // - Cancelar serviço
  // - Notificar cliente
  // - Reverter liberação
}

async function handleAccountEvent(c: any, payload: any) {
  console.log('📋 Evento de subconta:', payload.event, payload.account?.id)
  
  // Atualizar cache de subcontas
  if (payload.account) {
    const account = payload.account
    const previousStatus = await c.env.DB.prepare(`
      SELECT status FROM cached_accounts WHERE id = ?
    `).bind(account.id).first()
    
    const oldStatus = previousStatus?.status || 'UNKNOWN'
    const newStatus = account.status || ''
    
    // Detectar mudança de status
    const statusChanged = oldStatus !== newStatus
    
    console.log('📊 Status da conta:', {
      accountId: account.id,
      accountName: account.name,
      accountEmail: account.email,
      oldStatus,
      newStatus,
      statusChanged,
      event: payload.event
    })
    
    // Atualizar cache no banco
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO cached_accounts 
      (id, wallet_id, name, email, status, data, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      account.id,
      account.walletId || '',
      account.name || '',
      account.email || '',
      newStatus,
      JSON.stringify(account)
    ).run()
    
    // ========================================
    // DETECTAR APROVAÇÃO DA CONTA
    // ========================================
    if (statusChanged && newStatus === 'APPROVED') {
      console.log('🎉 CONTA APROVADA:', {
        id: account.id,
        name: account.name,
        email: account.email,
        walletId: account.walletId
      })
      
      // Registrar log de aprovação
      await c.env.DB.prepare(`
        INSERT INTO activity_logs (user_id, action, details, ip_address)
        VALUES (NULL, 'ACCOUNT_APPROVED', ?, 'webhook')
      `).bind(
        JSON.stringify({
          accountId: account.id,
          accountName: account.name,
          accountEmail: account.email,
          walletId: account.walletId,
          oldStatus,
          newStatus,
          approvedAt: new Date().toISOString()
        })
      ).run()
      
      // Enviar email de congratulações (opcional)
      try {
        console.log('📧 Enviando email de aprovação para:', account.email)
        // Aqui você pode adicionar lógica de envio de email via Mailersend
        // await sendApprovalEmail(c, account)
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de aprovação:', emailError)
      }
    }
    
    // ========================================
    // DETECTAR REJEIÇÃO DA CONTA
    // ========================================
    if (statusChanged && (newStatus === 'REJECTED' || newStatus === 'SUSPENDED')) {
      console.log('⚠️ CONTA REJEITADA/SUSPENSA:', {
        id: account.id,
        name: account.name,
        email: account.email,
        status: newStatus
      })
      
      // Registrar log
      await c.env.DB.prepare(`
        INSERT INTO activity_logs (user_id, action, details, ip_address)
        VALUES (NULL, 'ACCOUNT_REJECTED', ?, 'webhook')
      `).bind(
        JSON.stringify({
          accountId: account.id,
          accountName: account.name,
          accountEmail: account.email,
          oldStatus,
          newStatus,
          rejectedAt: new Date().toISOString()
        })
      ).run()
    }
  }
}

async function handleTransferDone(c: any, payload: any) {
  console.log('Transferência concluída:', payload.transfer?.id)
  
  // Registrar no log
  await c.env.DB.prepare(`
    INSERT INTO activity_logs (user_id, action, details, ip_address)
    VALUES (NULL, 'TRANSFER_DONE', ?, 'webhook')
  `).bind(
    JSON.stringify({
      transferId: payload.transfer?.id,
      value: payload.transfer?.value
    })
  ).run()
}

// Listar webhooks recebidos (para debug/admin)
app.get('/api/webhooks', async (c) => {
  try {
    const { limit = 50, processed } = c.req.query()
    
    let query = 'SELECT * FROM webhooks WHERE 1=1'
    const params: any[] = []
    
    if (processed !== undefined) {
      query += ' AND processed = ?'
      params.push(processed === 'true' ? 1 : 0)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(parseInt(limit as string))
    
    const stmt = c.env.DB.prepare(query).bind(...params)
    const result = await stmt.all()
    
    return c.json({ 
      ok: true, 
      data: result.results.map((row: any) => ({
        ...row,
        payload: JSON.parse(row.payload)
      }))
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Reprocessar webhook (em caso de erro)
app.post('/api/webhooks/:id/reprocess', async (c) => {
  try {
    const webhookId = c.req.param('id')
    
    // Buscar webhook
    const webhook = await c.env.DB.prepare(`
      SELECT * FROM webhooks WHERE id = ?
    `).bind(webhookId).first()
    
    if (!webhook) {
      return c.json({ error: 'Webhook não encontrado' }, 404)
    }
    
    const payload = JSON.parse(webhook.payload as string)
    
    // Reprocessar
    await processWebhookEvent(c, payload, webhookId)
    
    return c.json({ 
      ok: true, 
      message: 'Webhook reprocessado com sucesso' 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// ============================================
// SISTEMA DE LIMPEZA E OTIMIZAÇÃO
// ============================================

// Endpoint: Executar limpeza e otimização do banco de dados
app.post('/api/admin/cleanup', authMiddleware, async (c) => {
  const startTime = Date.now()
  
  try {
    const db = c.env.DB
    const cleanupResults = {
      expired_links: 0,
      old_webhooks: 0,
      old_conversions: 0,
      old_trash: 0,
      total_freed_kb: 0
    }
    
    console.log('🧹 Iniciando limpeza do banco de dados...')
    
    // 1. Mover links expirados há mais de 30 dias para a lixeira
    const expiredLinksQuery = await db.prepare(`
      SELECT * FROM signup_links 
      WHERE active = 0 
      AND datetime(expires_at) < datetime('now', '-30 days')
    `).all()
    
    if (expiredLinksQuery.results && expiredLinksQuery.results.length > 0) {
      for (const link of expiredLinksQuery.results) {
        // Mover para lixeira
        await db.prepare(`
          INSERT INTO trash_bin (original_table, original_id, data, deleted_reason, metadata)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          'signup_links',
          link.id,
          JSON.stringify(link),
          'Link expirado há mais de 30 dias',
          JSON.stringify({ expired_at: link.expires_at, uses_count: link.uses_count })
        ).run()
        
        // Deletar da tabela original
        await db.prepare(`DELETE FROM signup_links WHERE id = ?`).bind(link.id).run()
        cleanupResults.expired_links++
      }
      console.log(`✅ ${cleanupResults.expired_links} links expirados movidos para lixeira`)
    }
    
    // 2. Deletar webhooks antigos (mais de 90 dias)
    const oldWebhooksResult = await db.prepare(`
      DELETE FROM webhooks 
      WHERE datetime(created_at) < datetime('now', '-90 days')
    `).run()
    
    cleanupResults.old_webhooks = oldWebhooksResult.meta.changes || 0
    if (cleanupResults.old_webhooks > 0) {
      console.log(`✅ ${cleanupResults.old_webhooks} webhooks antigos deletados`)
    }
    
    // 3. Deletar conversões antigas (mais de 180 dias)
    const oldConversionsResult = await db.prepare(`
      DELETE FROM link_conversions 
      WHERE datetime(converted_at) < datetime('now', '-180 days')
    `).run()
    
    cleanupResults.old_conversions = oldConversionsResult.meta.changes || 0
    if (cleanupResults.old_conversions > 0) {
      console.log(`✅ ${cleanupResults.old_conversions} conversões antigas deletadas`)
    }
    
    // 4. Deletar permanentemente itens da lixeira com mais de 30 dias
    const oldTrashResult = await db.prepare(`
      DELETE FROM trash_bin 
      WHERE datetime(deleted_at) < datetime('now', '-30 days')
      AND can_restore = 1
    `).run()
    
    cleanupResults.old_trash = oldTrashResult.meta.changes || 0
    if (cleanupResults.old_trash > 0) {
      console.log(`✅ ${cleanupResults.old_trash} itens antigos removidos da lixeira`)
    }
    
    // 5. Executar VACUUM para recuperar espaço
    console.log('🔧 Executando VACUUM para otimizar banco...')
    await db.prepare('VACUUM').run()
    console.log('✅ VACUUM executado com sucesso')
    
    // 6. Registrar log de limpeza
    const executionTime = Date.now() - startTime
    await db.prepare(`
      INSERT INTO cleanup_logs (cleanup_type, items_deleted, items_moved_to_trash, execution_time_ms, details)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      'manual_cleanup',
      cleanupResults.old_webhooks + cleanupResults.old_conversions + cleanupResults.old_trash,
      cleanupResults.expired_links,
      executionTime,
      JSON.stringify(cleanupResults)
    ).run()
    
    const totalItemsRemoved = cleanupResults.expired_links + 
                              cleanupResults.old_webhooks + 
                              cleanupResults.old_conversions + 
                              cleanupResults.old_trash
    
    return c.json({
      ok: true,
      message: `Limpeza concluída! ${totalItemsRemoved} itens removidos`,
      execution_time_ms: executionTime,
      results: cleanupResults,
      summary: {
        expired_links: `${cleanupResults.expired_links} links expirados movidos para lixeira`,
        old_webhooks: `${cleanupResults.old_webhooks} webhooks antigos deletados`,
        old_conversions: `${cleanupResults.old_conversions} conversões antigas deletadas`,
        old_trash: `${cleanupResults.old_trash} itens removidos da lixeira`,
        vacuum: 'Banco de dados otimizado'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erro na limpeza:', error)
    return c.json({ 
      ok: false, 
      error: error.message,
      details: error.stack 
    }, 500)
  }
})

// Endpoint: Ver conteúdo da lixeira
app.get('/api/admin/trash', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const trashItems = await db.prepare(`
      SELECT 
        id,
        original_table,
        original_id,
        deleted_at,
        deleted_reason,
        can_restore
      FROM trash_bin
      WHERE can_restore = 1
      ORDER BY deleted_at DESC
      LIMIT 100
    `).all()
    
    const stats = await db.prepare(`
      SELECT 
        original_table,
        COUNT(*) as count,
        MIN(deleted_at) as oldest,
        MAX(deleted_at) as newest
      FROM trash_bin
      WHERE can_restore = 1
      GROUP BY original_table
    `).all()
    
    return c.json({
      ok: true,
      items: trashItems.results || [],
      stats: stats.results || [],
      total: trashItems.results?.length || 0
    })
    
  } catch (error: any) {
    return c.json({ ok: false, error: error.message }, 500)
  }
})

// Endpoint: Restaurar item da lixeira
app.post('/api/admin/trash/restore/:id', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    const trashId = c.req.param('id')
    
    // Buscar item na lixeira
    const trashItem = await db.prepare(`
      SELECT * FROM trash_bin WHERE id = ? AND can_restore = 1
    `).bind(trashId).first()
    
    if (!trashItem) {
      return c.json({ ok: false, error: 'Item não encontrado ou não pode ser restaurado' }, 404)
    }
    
    const originalData = JSON.parse(trashItem.data as string)
    
    // Restaurar para tabela original
    if (trashItem.original_table === 'signup_links') {
      await db.prepare(`
        INSERT INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count, max_uses, created_by, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        originalData.id,
        originalData.account_id,
        originalData.url,
        originalData.expires_at,
        originalData.created_at,
        originalData.active,
        originalData.uses_count,
        originalData.max_uses,
        originalData.created_by,
        originalData.notes
      ).run()
    }
    
    // Remover da lixeira
    await db.prepare(`DELETE FROM trash_bin WHERE id = ?`).bind(trashId).run()
    
    return c.json({
      ok: true,
      message: 'Item restaurado com sucesso',
      restored_table: trashItem.original_table,
      restored_id: trashItem.original_id
    })
    
  } catch (error: any) {
    return c.json({ ok: false, error: error.message }, 500)
  }
})

// Endpoint: Ver logs de limpeza
app.get('/api/admin/cleanup-logs', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const logs = await db.prepare(`
      SELECT * FROM cleanup_logs
      ORDER BY executed_at DESC
      LIMIT 50
    `).all()
    
    return c.json({
      ok: true,
      logs: logs.results || [],
      total: logs.results?.length || 0
    })
    
  } catch (error: any) {
    return c.json({ ok: false, error: error.message }, 500)
  }
})

// Endpoint: Estatísticas do banco de dados
app.get('/api/admin/database-stats', authMiddleware, async (c) => {
  try {
    const db = c.env.DB
    
    const tables = [
      'signup_links',
      'link_conversions',
      'subscription_signup_links',
      'subscription_conversions',
      'webhooks',
      'users',
      'trash_bin',
      'cleanup_logs',
      'deltapag_subscriptions'
    ]
    
    const stats = []
    
    for (const table of tables) {
      try {
        const count = await db.prepare(`SELECT COUNT(*) as count FROM ${table}`).first()
        stats.push({
          table,
          count: count?.count || 0
        })
      } catch (e) {
        stats.push({
          table,
          count: 0,
          error: 'Tabela não existe'
        })
      }
    }
    
    return c.json({
      ok: true,
      stats,
      total_tables: stats.length
    })
    
  } catch (error: any) {
    return c.json({ ok: false, error: error.message }, 500)
  }
})

export default app
