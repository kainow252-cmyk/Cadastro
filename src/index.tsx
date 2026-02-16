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
  const publicRoutes = [
    '/api/login', 
    '/api/check-auth', 
    '/api/public/signup',
    '/api/proxy/payments' // Rota pública para subcontas
  ]
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
    
    // 3. Gerar cobrança PIX automática de R$ 50,00 (taxa de cadastro)
    if (customerId && account.walletId) {
      const paymentData = {
        customer: customerId,
        billingType: 'PIX',
        value: 50.00, // Taxa de cadastro
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        description: 'Taxa de cadastro e ativação da conta',
        
        // Split 20/80
        split: [{
          walletId: account.walletId,
          percentualValue: 20.00 // 20% para a subconta
        }]
      }
      
      const paymentResult = await asaasRequest(c, '/payments', 'POST', paymentData)
      
      // Adicionar dados da cobrança ao retorno
      if (paymentResult.ok && paymentResult.data) {
        account.payment = {
          id: paymentResult.data.id,
          value: paymentResult.data.value,
          status: paymentResult.data.status,
          dueDate: paymentResult.data.dueDate,
          invoiceUrl: paymentResult.data.invoiceUrl,
          pixQrCode: {
            qrCodeId: paymentResult.data.pixQrCodeId,
            payload: paymentResult.data.pixQrCodePayload,
            expirationDate: paymentResult.data.pixQrCodeExpirationDate
          }
        }
      }
    }
    
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
    // Buscar subcontas
    const accountsResult = await asaasRequest(c, '/accounts')
    const accounts = accountsResult?.data?.data || []
    
    // Buscar links de cadastro do banco D1
    const linksResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active,
        SUM(uses_count) as total_uses
      FROM signup_links
    `).first()
    
    // Calcular estatísticas
    const totalAccounts = accounts.length
    const approvedAccounts = accounts.filter((a: any) => a.walletId).length
    const pendingAccounts = totalAccounts - approvedAccounts
    
    // Links de cadastro
    const totalLinks = linksResult?.total || 0
    const activeLinks = linksResult?.active || 0
    const totalConversions = linksResult?.total_uses || 0
    
    // Taxa de conversão
    const conversionRate = totalLinks > 0 ? ((totalConversions / totalLinks) * 100).toFixed(1) : '0'
    
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
          name: a.name,
          email: a.email,
          dateCreated: a.dateCreated,
          status: a.walletId ? 'approved' : 'pending'
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
    const accountId = c.req.param('accountId')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    
    // Buscar informações da subconta
    const accountResult = await asaasRequest(c, `/accounts/${accountId}`)
    if (!accountResult.ok) {
      return c.json({ error: 'Subconta não encontrada' }, 404)
    }
    
    const account = accountResult.data
    
    // Buscar cobranças da subconta com filtro de data
    let paymentsUrl = `/payments?customer=${accountId}`
    if (startDate) paymentsUrl += `&dateCreated[ge]=${startDate}`
    if (endDate) paymentsUrl += `&dateCreated[le]=${endDate}`
    
    const paymentsResult = await asaasRequest(c, paymentsUrl)
    const payments = paymentsResult?.data?.data || []
    
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
      dueDate: p.dueDate,
      status: p.status,
      dateCreated: p.dateCreated,
      billingType: p.billingType,
      invoiceUrl: p.invoiceUrl
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
    return c.json({ error: error.message }, 500)
  }
})

// Listar subcontas
app.get('/api/accounts', async (c) => {
  try {
    const result = await asaasRequest(c, '/accounts')
    
    // Transformar resposta para formato esperado pelo frontend
    if (result.ok && result.data && result.data.data) {
      return c.json({ 
        accounts: result.data.data,
        totalCount: result.data.totalCount || 0
      })
    }
    
    return c.json({ accounts: [], totalCount: 0 })
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
    
    const { walletId, accountId, value, description } = await c.req.json()
    
    if (!walletId) {
      return c.json({ error: 'walletId é obrigatório' }, 400)
    }
    
    if (!value || value <= 0) {
      return c.json({ error: 'Valor deve ser maior que zero' }, 400)
    }
    
    // Gerar payload PIX manualmente (EMV format)
    const payload = generateStaticPixPayload(walletId, value, description || '')
    
    // Gerar QR Code em base64
    const qrCodeBase64 = await generateQRCodeBase64(payload)
    
    return c.json({
      ok: true,
      data: {
        walletId,
        accountId,
        value,
        description,
        payload,
        qrCodeBase64,
        type: 'STATIC',
        splitConfig: {
          subAccount: 20,
          mainAccount: 80
        }
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Função para gerar payload PIX estático (EMV format simplificado)
function generateStaticPixPayload(walletId: string, value: number, description: string): string {
  // Formato EMV para PIX estático com valor fixo
  const merchantName = 'ASAAS PAGAMENTOS'
  const merchantCity = 'SAO PAULO'
  const pixKey = walletId
  const valueStr = value.toFixed(2)
  
  // Construir payload EMV
  let payload = '00020126'  // Payload Format Indicator
  payload += '0014br.gov.bcb.pix'  // GUI
  payload += `01${pixKey.length.toString().padStart(2, '0')}${pixKey}`  // Chave PIX
  payload += '52040000'  // Merchant Category Code
  payload += '5303986'   // Transaction Currency (BRL)
  payload += `54${valueStr.length.toString().padStart(2, '0')}${valueStr}`  // Transaction Amount
  payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`
  payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`
  
  // Adicionar descrição se fornecida
  if (description) {
    const descClean = description.substring(0, 25) // Máximo 25 caracteres
    payload += `62${(descClean.length + 4).toString().padStart(2, '0')}05${descClean.length.toString().padStart(2, '0')}${descClean}`
  }
  
  payload += '6304'  // CRC placeholder
  
  // Calcular CRC16
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
      
      // Configurar split: 20% para subconta, 80% fica com conta principal
      split: [
        {
          walletId: subAccountWalletId,
          percentualValue: 20.00 // 20% para subconta
        }
        // 80% fica automaticamente com a conta principal (emissor da cobrança)
      ]
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
      
      // Configurar split: 20% para subconta (quem está criando)
      split: [
        {
          walletId: subaccountWalletId,
          percentualValue: 20.00 // Subconta recebe 20%
        }
        // 80% fica automaticamente com a conta principal
      ]
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
                        <button onclick="showSection('accounts')" class="nav-btn text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold">
                            <i class="fas fa-users mr-2"></i>Subcontas
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
            <div id="dashboard-section" class="section hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                                <p class="text-gray-500 text-sm">Cobranças PIX</p>
                                <p class="text-3xl font-bold text-gray-800" id="total-payments">0</p>
                            </div>
                            <div class="bg-green-100 rounded-full p-3">
                                <i class="fas fa-qrcode text-green-600 text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dashboard Overview -->
                <div class="space-y-6">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-3xl font-bold mb-2">
                                    <i class="fas fa-chart-line mr-3"></i>
                                    Visão Geral
                                </h2>
                                <p class="text-blue-100">Dashboard de Gerenciamento de Subcontas Asaas</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-blue-100">Última atualização</p>
                                <p class="text-lg font-semibold" id="last-update-time">--:--</p>
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

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-bolt mr-2 text-yellow-500"></i>
                            Ações Rápidas
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <button onclick="showSection('dashboard')" 
                                class="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md transition">
                                <i class="fas fa-chart-line text-2xl"></i>
                                <span>Dashboard</span>
                            </button>
                            <button onclick="showSection('accounts')" 
                                class="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md transition">
                                <i class="fas fa-user-plus text-2xl"></i>
                                <span>Criar Subconta</span>
                            </button>
                            <button onclick="showSection('accounts'); setTimeout(() => document.querySelector('#link-modal') && openLinkModal(), 100)" 
                                class="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold shadow-md transition">
                                <i class="fas fa-link text-2xl"></i>
                                <span>Gerar Link</span>
                            </button>
                            <button onclick="showSection('accounts')" 
                                class="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md transition">
                                <i class="fas fa-list text-2xl"></i>
                                <span>Ver Subcontas</span>
                            </button>
                            <button onclick="showSection('reports')" 
                                class="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold shadow-md transition">
                                <i class="fas fa-chart-bar text-2xl"></i>
                                <span>Relatórios</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accounts Section -->
            <div id="accounts-section" class="section">
                <!-- Formulário de Nova Subconta -->
                <div class="bg-white rounded-lg shadow mb-6">
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
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-chart-bar mr-2 text-orange-600"></i>
                        Relatórios de Subcontas
                    </h2>
                    <p class="text-gray-600 mt-2">Visualize transações e estatísticas por subconta</p>
                </div>

                <!-- Filtros -->
                <div class="p-6 border-b border-gray-200 bg-gray-50">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user mr-1"></i>Subconta
                            </label>
                            <select id="report-account-select" 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="">Selecione uma subconta...</option>
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
                        <div class="flex items-end">
                            <button onclick="generateReport()" 
                                class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 font-semibold shadow-md transition">
                                <i class="fas fa-search mr-2"></i>Gerar Relatório
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Área de Resultados -->
                <div id="report-results" class="p-6">
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-chart-line text-6xl mb-4 opacity-30"></i>
                        <p class="text-lg">Selecione uma subconta e clique em "Gerar Relatório"</p>
                    </div>
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
                                <button onclick="downloadQRCode()" 
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
        <script src="/static/app.js?v=2.8"></script>
    </body>
    </html>
  `)
})

export default app
