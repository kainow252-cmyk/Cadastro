// Serviço de Envio de E-mails com Amazon SES
// Suporta 10.000+ emails/dia

import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses'
import { getWelcomeEmailTemplate, CustomerData } from './email-templates'

// Interface para resultado do envio
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// Criar cliente SES (será inicializado quando tiver credenciais)
let sesClient: SESClient | null = null

// Inicializar cliente SES com credenciais
export function initializeSESClient(accessKeyId: string, secretAccessKey: string, region: string = 'us-east-1') {
  sesClient = new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
  
  console.log(`✅ Amazon SES client inicializado (região: ${region})`)
}

// Verificar se SES está configurado
export function isSESConfigured(): boolean {
  return sesClient !== null
}

// Enviar e-mail de boas-vindas
export async function sendWelcomeEmail(data: CustomerData): Promise<EmailSendResult> {
  try {
    // Verificar se SES está configurado
    if (!sesClient) {
      console.warn('⚠️ Amazon SES não configurado. E-mail não enviado.')
      return {
        success: false,
        error: 'SES_NOT_CONFIGURED'
      }
    }
    
    // Gerar template baseado nos dados do cliente
    const template = getWelcomeEmailTemplate(data)
    
    console.log(`📧 Preparando e-mail de boas-vindas para ${data.email}`)
    console.log(`   Plano: ${data.plan}`)
    console.log(`   Upgrade: ${data.isUpgrade ? 'Sim' : 'Não'}`)
    console.log(`   Reativação: ${data.isReactivation ? 'Sim' : 'Não'}`)
    console.log(`   Campanha: ${data.campaign || 'N/A'}`)
    
    // Preparar comando de envio
    const emailParams: SendEmailCommandInput = {
      Source: 'Corretora Corporate <boas-vindas@corretoracorporate.com.br>',
      Destination: {
        ToAddresses: [data.email]
      },
      Message: {
        Subject: {
          Data: template.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: template.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: template.text,
            Charset: 'UTF-8'
          }
        }
      },
      // Tags para rastreamento e analytics
      Tags: [
        { Name: 'campaign', Value: data.campaign || 'welcome' },
        { Name: 'plan', Value: data.plan },
        { Name: 'type', Value: data.isUpgrade ? 'upgrade' : data.isReactivation ? 'reactivation' : 'new' },
        { Name: 'system', Value: 'pix_automatic' }
      ]
    }
    
    // Enviar e-mail
    const command = new SendEmailCommand(emailParams)
    const response = await sesClient.send(command)
    
    console.log(`✅ E-mail enviado com sucesso!`)
    console.log(`   Message ID: ${response.MessageId}`)
    console.log(`   Para: ${data.email}`)
    
    return {
      success: true,
      messageId: response.MessageId
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail:', error.message)
    
    // Log detalhado do erro
    if (error.$metadata) {
      console.error('   HTTP Status:', error.$metadata.httpStatusCode)
      console.error('   Request ID:', error.$metadata.requestId)
    }
    
    return {
      success: false,
      error: error.message || 'UNKNOWN_ERROR'
    }
  }
}

// Enviar e-mail genérico (para casos especiais)
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
  tags?: { name: string; value: string }[]
}): Promise<EmailSendResult> {
  try {
    // Verificar se SES está configurado
    if (!sesClient) {
      console.warn('⚠️ Amazon SES não configurado. E-mail não enviado.')
      return {
        success: false,
        error: 'SES_NOT_CONFIGURED'
      }
    }
    
    const emailParams: SendEmailCommandInput = {
      Source: 'Corretora Corporate <noreply@corretoracorporate.com.br>',
      Destination: {
        ToAddresses: [params.to]
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: params.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: params.text || params.subject,
            Charset: 'UTF-8'
          }
        }
      }
    }
    
    // Adicionar tags se fornecidas
    if (params.tags && params.tags.length > 0) {
      emailParams.Tags = params.tags.map(tag => ({
        Name: tag.name,
        Value: tag.value
      }))
    }
    
    const command = new SendEmailCommand(emailParams)
    const response = await sesClient.send(command)
    
    console.log(`✅ E-mail enviado: ${params.subject} → ${params.to}`)
    
    return {
      success: true,
      messageId: response.MessageId
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail:', error.message)
    return {
      success: false,
      error: error.message || 'UNKNOWN_ERROR'
    }
  }
}

// Teste de conexão SES
export async function testSESConnection(): Promise<boolean> {
  try {
    if (!sesClient) {
      console.error('❌ SES não configurado')
      return false
    }
    
    // Tentar enviar um e-mail de teste (será rejeitado se domínio não verificado, mas testa a conexão)
    const testParams: SendEmailCommandInput = {
      Source: 'test@corretoracorporate.com.br',
      Destination: {
        ToAddresses: ['test@corretoracorporate.com.br']
      },
      Message: {
        Subject: {
          Data: 'Test',
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: 'Test',
            Charset: 'UTF-8'
          }
        }
      }
    }
    
    const command = new SendEmailCommand(testParams)
    await sesClient.send(command)
    
    console.log('✅ Conexão SES OK')
    return true
    
  } catch (error: any) {
    // Se erro for de domínio não verificado, a conexão está OK
    if (error.message.includes('Email address is not verified')) {
      console.log('✅ Conexão SES OK (domínio não verificado ainda)')
      return true
    }
    
    console.error('❌ Erro na conexão SES:', error.message)
    return false
  }
}
