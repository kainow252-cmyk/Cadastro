// Sistema de Templates de E-mail Personalizados
// Suporta 10.000+ emails/dia com Amazon SES

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface CustomerData {
  name: string
  email: string
  plan: 'basico' | 'premium' | 'empresarial'
  value: number
  activationDate: string
  campaign?: string
  isUpgrade?: boolean
  isReactivation?: boolean
  referrer?: string
}

// Template Base HTML
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 13px;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #6c757d;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    h1, h2, h3 { color: #2c3e50; }
    p { margin: 10px 0; }
    ul, ol { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>Este e-mail foi enviado porque você ativou uma assinatura em nossa plataforma.</p>
      <p><strong>Corretora Corporate</strong> © 2026 - Todos os direitos reservados</p>
      <p style="margin-top: 15px;">
        <a href="https://gerenciador.corretoracorporate.com.br/politica-privacidade">Política de Privacidade</a> | 
        <a href="https://gerenciador.corretoracorporate.com.br/termos-uso">Termos de Uso</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ==========================================
// TEMPLATE 1: PLANO BÁSICO
// ==========================================
function getBasicPlanTemplate(data: CustomerData): EmailTemplate {
  const content = `
    <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: white;">💼 Bem-vindo ao Plano Básico!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">Sua jornada começa aqui</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px;">Olá <strong>${data.name}</strong>,</p>
      
      <p>É com alegria que confirmamos sua assinatura no <strong>Plano Básico</strong>! Seu pagamento foi processado com sucesso. 🎉</p>
      
      <div style="background: #e3f2fd; padding: 20px; border-left: 4px solid #3498db; margin: 25px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #3498db;">📋 Detalhes da sua assinatura</h3>
        <p style="margin: 8px 0;"><strong>💰 Valor mensal:</strong> R$ ${data.value.toFixed(2)}</p>
        <p style="margin: 8px 0;"><strong>📅 Data de ativação:</strong> ${data.activationDate}</p>
        <p style="margin: 8px 0;"><strong>🔄 Cobrança:</strong> Débito automático via PIX</p>
        <p style="margin: 8px 0;"><strong>🏦 Taxa:</strong> 1,99% (processada pela Asaas)</p>
      </div>
      
      <h3 style="color: #3498db;">✨ Recursos incluídos no seu plano:</h3>
      <ul style="line-height: 1.8;">
        <li>✅ Acesso ao painel administrativo completo</li>
        <li>📊 Relatórios básicos mensais</li>
        <li>📧 Suporte por e-mail (resposta em até 48h)</li>
        <li>🔄 Atualizações automáticas do sistema</li>
        <li>📱 Acesso via dispositivos móveis</li>
        <li>🔒 Backup automático dos seus dados</li>
      </ul>
      
      <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Dica:</strong> Explore o painel administrativo para conhecer todos os recursos disponíveis. Se precisar de mais funcionalidades, você pode fazer upgrade a qualquer momento!</p>
      </div>
      
      <center>
        <a href="https://gerenciador.corretoracorporate.com.br" 
           style="background: #3498db; color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 25px 10px; font-weight: 600; font-size: 16px;">
          🚀 Acessar Minha Conta
        </a>
        <a href="https://gerenciador.corretoracorporate.com.br/guia-inicio" 
           style="background: white; color: #3498db; padding: 15px 35px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 25px 10px; font-weight: 600; border: 2px solid #3498db;">
          📖 Guia de Início Rápido
        </a>
      </center>
      
      <h3>🚀 Primeiros passos recomendados:</h3>
      <ol style="line-height: 1.8;">
        <li>Complete seu perfil com informações adicionais</li>
        <li>Configure suas preferências no sistema</li>
        <li>Explore o dashboard e relatórios</li>
        <li>Salve nossos contatos de suporte</li>
      </ol>
      
      <h3>❓ Precisa de ajuda?</h3>
      <p>Nossa equipe está disponível para ajudar:</p>
      <p>📧 <strong>E-mail:</strong> suporte@corretoracorporate.com.br</p>
      <p>📱 <strong>WhatsApp:</strong> (11) 98765-4321</p>
      <p>🌐 <strong>Central de Ajuda:</strong> <a href="https://ajuda.corretoracorporate.com.br" style="color: #3498db;">ajuda.corretoracorporate.com.br</a></p>
      
      <div style="background: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>🎯 Quer mais recursos?</strong> Conheça nossos planos Premium e Empresarial com recursos avançados e suporte prioritário!</p>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/planos" 
             style="background: #4caf50; color: white; padding: 10px 25px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; font-weight: 600;">
            Ver Planos
          </a>
        </center>
      </div>
    </div>
  `
  
  return {
    subject: `✅ Bem-vindo ao Plano Básico, ${data.name}!`,
    html: getBaseTemplate(content),
    text: `Olá ${data.name},\n\nBem-vindo ao Plano Básico da Corretora Corporate!\n\nSua assinatura de R$ ${data.value.toFixed(2)}/mês está ativa desde ${data.activationDate}.\n\nAcesse sua conta: https://gerenciador.corretoracorporate.com.br\n\nDúvidas? suporte@corretoracorporate.com.br`
  }
}

// ==========================================
// TEMPLATE 2: PLANO PREMIUM
// ==========================================
function getPremiumPlanTemplate(data: CustomerData): EmailTemplate {
  const content = `
    <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 50px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 36px; color: white;">⭐ Bem-vindo ao Plano Premium!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 20px;">Você está no topo! 🚀</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px;">Olá <strong>${data.name}</strong>,</p>
      
      <p>Parabéns por escolher o <strong>Plano Premium</strong>! Você agora tem acesso a todos os recursos avançados da nossa plataforma. Prepare-se para uma experiência incrível! 🎉⭐</p>
      
      <div style="background: linear-gradient(135deg, #f5eeff 0%, #ede7f6 100%); padding: 30px; border-left: 4px solid #9b59b6; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(155,89,182,0.1);">
        <h3 style="margin-top: 0; color: #9b59b6;">👑 Sua assinatura Premium</h3>
        <p style="margin: 8px 0;"><strong>💰 Investimento mensal:</strong> R$ ${data.value.toFixed(2)}</p>
        <p style="margin: 8px 0;"><strong>📅 Data de ativação:</strong> ${data.activationDate}</p>
        <p style="margin: 8px 0;"><strong>🔄 Cobrança:</strong> Débito automático via PIX</p>
        <p style="margin: 8px 0;"><strong>🏦 Taxa:</strong> 1,99% (processada pela Asaas)</p>
        <p style="margin: 8px 0;"><strong>⭐ Status:</strong> <span style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">PREMIUM</span></p>
      </div>
      
      <h3 style="color: #9b59b6;">🎁 Recursos Premium exclusivos:</h3>
      <ul style="line-height: 2;">
        <li><strong style="color: #9b59b6;">✨ Tudo do Plano Básico</strong> + recursos avançados</li>
        <li><strong>📊 Relatórios avançados</strong> com insights detalhados e exportação</li>
        <li><strong>🤖 Automações inteligentes</strong> para economizar tempo</li>
        <li><strong>📱 Suporte prioritário</strong> via WhatsApp + E-mail (resposta em até 4h)</li>
        <li><strong>🔌 Integrações API</strong> ilimitadas com outros sistemas</li>
        <li><strong>👥 Até 10 usuários</strong> na mesma conta com permissões customizadas</li>
        <li><strong>📈 Dashboard analytics</strong> em tempo real com gráficos interativos</li>
        <li><strong>🎨 Personalização avançada</strong> de interface e relatórios</li>
        <li><strong>📤 Exportação ilimitada</strong> de dados (Excel, PDF, CSV)</li>
        <li><strong>🔔 Notificações personalizadas</strong> via e-mail e SMS</li>
      </ul>
      
      <div style="background: #fff3cd; padding: 25px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>💡 Dica Premium:</strong> Agende uma call gratuita de 30 minutos com nosso especialista para configurar sua conta e aproveitar 100% dos recursos Premium!</p>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/agendar-onboarding" 
             style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; font-weight: 600;">
            📞 Agendar Onboarding Gratuito
          </a>
        </center>
      </div>
      
      <center>
        <a href="https://gerenciador.corretoracorporate.com.br" 
           style="background: #9b59b6; color: white; padding: 18px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 17px;">
          🚀 Explorar Recursos Premium
        </a>
        <a href="https://gerenciador.corretoracorporate.com.br/premium-guia" 
           style="background: white; color: #9b59b6; padding: 18px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 10px; font-weight: 600; border: 2px solid #9b59b6;">
          📖 Guia Premium Completo
        </a>
      </center>
      
      <h3 style="color: #9b59b6;">🎓 Materiais exclusivos para você:</h3>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 12px 0;">📘 <strong>E-book:</strong> "Guia Completo do Plano Premium" (45 páginas)</li>
          <li style="margin: 12px 0;">🎥 <strong>Vídeo:</strong> "Como aproveitar 100% dos recursos" (15 min)</li>
          <li style="margin: 12px 0;">📋 <strong>Checklist:</strong> "Primeiros 30 dias no Premium"</li>
          <li style="margin: 12px 0;">🛠️ <strong>Templates:</strong> Modelos prontos de relatórios</li>
        </ul>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/premium-materiais" 
             style="background: #9b59b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600;">
            📦 Baixar Materiais Premium
          </a>
        </center>
      </div>
      
      <h3>🚀 Roteiro de sucesso Premium:</h3>
      <ol style="line-height: 2;">
        <li><strong>Semana 1:</strong> Configure sua conta e adicione usuários</li>
        <li><strong>Semana 2:</strong> Explore relatórios avançados e analytics</li>
        <li><strong>Semana 3:</strong> Configure automações inteligentes</li>
        <li><strong>Semana 4:</strong> Integre com seus sistemas via API</li>
      </ol>
      
      <h3>❓ Suporte Premium 24/7:</h3>
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
        <p style="margin: 5px 0;">📧 <strong>E-mail prioritário:</strong> premium@corretoracorporate.com.br</p>
        <p style="margin: 5px 0;">📱 <strong>WhatsApp Premium:</strong> (11) 98765-4321</p>
        <p style="margin: 5px 0;">💬 <strong>Chat ao vivo:</strong> Disponível no painel (ícone roxo)</p>
        <p style="margin: 5px 0;">📞 <strong>Telefone:</strong> 0800 123 4567</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">⚡ Tempo médio de resposta: <strong style="color: #9b59b6;">4 horas</strong></p>
      </div>
    </div>
  `
  
  return {
    subject: `⭐ Bem-vindo ao Premium, ${data.name}! Seus recursos exclusivos estão ativos 🚀`,
    html: getBaseTemplate(content),
    text: `Olá ${data.name},\n\nParabéns por escolher o Plano Premium!\n\nVocê agora tem acesso a todos os recursos avançados:\n- Relatórios avançados\n- Automações inteligentes\n- Suporte prioritário (4h)\n- API ilimitada\n- Até 10 usuários\n- E muito mais!\n\nValor: R$ ${data.value.toFixed(2)}/mês\nAtivação: ${data.activationDate}\n\nAcesse: https://gerenciador.corretoracorporate.com.br\nSuporte Premium: premium@corretoracorporate.com.br`
  }
}

// ==========================================
// TEMPLATE 3: PLANO EMPRESARIAL
// ==========================================
function getEnterprisePlanTemplate(data: CustomerData): EmailTemplate {
  const content = `
    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 50px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 40px; color: white;">🏢 Bem-vindo ao Plano Empresarial!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 22px;">Solução completa para sua empresa</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px;">Olá <strong>${data.name}</strong>,</p>
      
      <p style="font-size: 16px;">É uma <strong>honra</strong> tê-lo(a) conosco no <strong>Plano Empresarial</strong>! Você agora faz parte de um grupo seleto de empresas que confiam em nossa solução premium para gerenciar seus negócios. 🏢✨</p>
      
      <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 35px; border-left: 4px solid #e74c3c; margin: 30px 0; border-radius: 8px; box-shadow: 0 2px 12px rgba(231,76,60,0.15);">
        <h3 style="margin-top: 0; color: #e74c3c;">🎯 Sua solução Empresarial</h3>
        <p style="margin: 10px 0;"><strong>💰 Investimento mensal:</strong> R$ ${data.value.toFixed(2)}</p>
        <p style="margin: 10px 0;"><strong>📅 Data de ativação:</strong> ${data.activationDate}</p>
        <p style="margin: 10px 0;"><strong>🔄 Cobrança:</strong> Débito automático via PIX</p>
        <p style="margin: 10px 0;"><strong>🏦 Taxa:</strong> 1,99% (processada pela Asaas)</p>
        <p style="margin: 10px 0;"><strong>🏢 Status:</strong> <span style="background: #e74c3c; color: white; padding: 5px 15px; border-radius: 12px; font-size: 14px; font-weight: 700;">ENTERPRISE</span></p>
        <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 1px solid rgba(231,76,60,0.2);"><strong>👤 Gerente de conta dedicado:</strong> <span style="color: #e74c3c;">Você receberá contato em até 24 horas</span></p>
      </div>
      
      <h3 style="color: #e74c3c; font-size: 22px;">🚀 Recursos Empresariais completos:</h3>
      <ul style="line-height: 2.2; font-size: 15px;">
        <li><strong style="color: #e74c3c;">👑 Tudo do Premium</strong> + recursos corporativos exclusivos</li>
        <li><strong>👥 Usuários ilimitados</strong> com gestão avançada de permissões e roles</li>
        <li><strong>🎯 Gerente de conta dedicado</strong> para suporte estratégico</li>
        <li><strong>📞 Suporte 24/7 prioritário</strong> (telefone, WhatsApp, e-mail) - resposta imediata</li>
        <li><strong>🔒 SLA de 99,9%</strong> de uptime garantido com compensação</li>
        <li><strong>🛠️ Customizações personalizadas</strong> de acordo com suas necessidades</li>
        <li><strong>📊 Relatórios corporativos</strong> e BI avançado com Power BI/Tableau</li>
        <li><strong>🔌 API dedicada</strong> com rate limit aumentado e webhooks prioritários</li>
        <li><strong>🏦 Integração com ERP/CRM</strong> (SAP, Salesforce, etc.)</li>
        <li><strong>🎓 Treinamento completo</strong> da equipe incluído (presencial ou online)</li>
        <li><strong>🔐 Segurança avançada</strong> com SSO, 2FA obrigatório, auditoria completa</li>
        <li><strong>💾 Backup dedicado</strong> com retenção de 365 dias</li>
        <li><strong>🌍 Multi-idioma</strong> e multi-moeda para operações globais</li>
      </ul>
      
      <div style="background: #d4edda; padding: 30px; border-left: 4px solid #28a745; margin: 30px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #28a745;">🎉 Bônus de Boas-Vindas Empresarial:</h4>
        <ul style="margin: 15px 0 0 0; line-height: 1.8;">
          <li>✅ <strong>1 mês de consultoria estratégica gratuita</strong> (valor R$ 5.000)</li>
          <li>✅ <strong>Setup personalizado</strong> pela nossa equipe técnica</li>
          <li>✅ <strong>Treinamento completo</strong> para sua equipe (até 50 pessoas)</li>
          <li>✅ <strong>Migração de dados</strong> de sistemas anteriores</li>
          <li>✅ <strong>Documento de arquitetura</strong> personalizado</li>
        </ul>
      </div>
      
      <center>
        <a href="https://gerenciador.corretoracorporate.com.br/enterprise" 
           style="background: #e74c3c; color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 12px rgba(231,76,60,0.3);">
          🏢 Acessar Portal Empresarial
        </a>
        <a href="https://gerenciador.corretoracorporate.com.br/agendar-gerente" 
           style="background: white; color: #e74c3c; padding: 20px 50px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 18px; border: 3px solid #e74c3c;">
          📞 Falar com Gerente
        </a>
      </center>
      
      <h3 style="color: #e74c3c;">📚 Kit Empresarial exclusivo:</h3>
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 15px 0;">📘 <strong>Guia de Implementação Empresarial</strong> (120 páginas + vídeos)</li>
          <li style="margin: 15px 0;">🎥 <strong>Biblioteca de vídeos</strong> de treinamento (20+ horas)</li>
          <li style="margin: 15px 0;">📋 <strong>Templates corporativos</strong> de documentação e processos</li>
          <li style="margin: 15px 0;">🔧 <strong>Ferramentas de migração</strong> e importação de dados</li>
          <li style="margin: 15px 0;">📊 <strong>Dashboards prontos</strong> para C-level</li>
        </ul>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/enterprise-kit" 
             style="background: #e74c3c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600;">
            📦 Baixar Kit Empresarial Completo
          </a>
        </center>
      </div>
      
      <h3 style="color: #e74c3c;">🤝 Roadmap de implementação:</h3>
      <ol style="line-height: 2.2; font-size: 15px;">
        <li><strong>Semana 1:</strong> Kickoff meeting + análise de requisitos + plano de implementação</li>
        <li><strong>Semana 2:</strong> Setup personalizado + migração de dados + configuração de integrações</li>
        <li><strong>Semana 3:</strong> Treinamento da equipe (todos os níveis) + criação de documentação</li>
        <li><strong>Semana 4:</strong> Testes em homologação + ajustes finais + preparação go-live</li>
        <li><strong>Semana 5:</strong> Go-live em produção + suporte intensivo + monitoramento 24/7</li>
        <li><strong>Mês 2+:</strong> Consultoria estratégica contínua + otimizações + novos recursos</li>
      </ol>
      
      <div style="background: #fff3cd; padding: 25px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px;"><strong>⏰ Próximas 24 horas:</strong> Seu gerente de conta dedicado, <strong>responsável exclusivo pela sua empresa</strong>, entrará em contato para agendar o kickoff meeting e entender suas necessidades específicas.</p>
      </div>
      
      <h3 style="color: #e74c3c;">📞 Suporte Empresarial 24/7/365:</h3>
      <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); padding: 30px; border-radius: 8px; border: 2px solid #e74c3c;">
        <p style="margin: 8px 0; font-size: 15px;">📧 <strong>E-mail corporativo:</strong> enterprise@corretoracorporate.com.br</p>
        <p style="margin: 8px 0; font-size: 15px;">📱 <strong>WhatsApp Empresarial:</strong> (11) 91234-5678</p>
        <p style="margin: 8px 0; font-size: 15px;">☎️ <strong>Telefone direto:</strong> 0800 123 4567 (ramal empresarial)</p>
        <p style="margin: 8px 0; font-size: 15px;">💬 <strong>Slack dedicado:</strong> Acesso ao canal exclusivo da sua empresa</p>
        <p style="margin: 8px 0; font-size: 15px;">🎫 <strong>Portal de tickets:</strong> Prioridade CRÍTICA garantida</p>
        <p style="margin: 15px 0 0 0; padding-top: 15px; border-top: 2px solid #e74c3c; font-size: 16px;"><strong>⚡ SLA de resposta:</strong> <span style="background: #e74c3c; color: white; padding: 5px 12px; border-radius: 20px; font-weight: 700;">IMEDIATO</span> (casos críticos: 15 minutos)</p>
      </div>
      
      <div style="background: #e8f5e9; padding: 25px; border-left: 4px solid #4caf50; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px;"><strong>🌟 Garantia de Satisfação:</strong> Se nos primeiros 30 dias você não estiver 100% satisfeito, devolvemos seu investimento sem perguntas. Simples assim.</p>
      </div>
    </div>
  `
  
  return {
    subject: `🏢 Bem-vindo ao Empresarial, ${data.name}! Seu gerente dedicado entrará em contato em 24h`,
    html: getBaseTemplate(content),
    text: `Olá ${data.name},\n\nÉ uma honra tê-lo no Plano Empresarial!\n\nRecursos corporativos completos:\n- Usuários ilimitados\n- Gerente dedicado (contato em 24h)\n- Suporte 24/7 imediato\n- SLA 99,9% garantido\n- Customizações personalizadas\n- Treinamento incluído\n- E muito mais!\n\nValor: R$ ${data.value.toFixed(2)}/mês\nAtivação: ${data.activationDate}\n\nBônus: 1 mês consultoria grátis + setup + treinamento\n\nAcesse: https://gerenciador.corretoracorporate.com.br/enterprise\nSuporte: enterprise@corretoracorporate.com.br | 0800 123 4567`
  }
}

// ==========================================
// TEMPLATE 4: UPGRADE DE PLANO
// ==========================================
function getUpgradeTemplate(data: CustomerData): EmailTemplate {
  const planNames = {
    basico: 'Básico',
    premium: 'Premium',
    empresarial: 'Empresarial'
  }
  
  const content = `
    <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 50px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 36px; color: white;">🎉 Parabéns pelo Upgrade!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 20px;">Novos recursos desbloqueados 🚀</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 17px;">Olá <strong>${data.name}</strong>,</p>
      
      <p style="font-size: 16px;">Que <strong>ótima decisão</strong>! Seu upgrade para o <strong>Plano ${planNames[data.plan]}</strong> foi confirmado e todos os novos recursos já estão disponíveis na sua conta! 🚀✨</p>
      
      <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); padding: 30px; border-left: 4px solid #f39c12; margin: 30px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(243,156,18,0.2);">
        <h3 style="margin-top: 0; color: #f39c12;">⭐ Novo plano ativo agora!</h3>
        <p style="margin: 10px 0; font-size: 15px;"><strong>📊 Plano:</strong> ${planNames[data.plan]}</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>💰 Novo valor mensal:</strong> R$ ${data.value.toFixed(2)}</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>📅 Efetivado em:</strong> ${data.activationDate}</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>🔄 Próxima cobrança:</strong> Automática via PIX</p>
      </div>
      
      <h3 style="color: #f39c12; font-size: 22px;">🆕 Novos recursos disponíveis para você:</h3>
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
        <ul style="line-height: 2; font-size: 15px;">
          <li>✅ <strong>Todos os recursos do plano anterior</strong> mantidos</li>
          <li><strong style="color: #f39c12; font-size: 16px;">+ Recursos exclusivos do ${planNames[data.plan]}</strong></li>
          ${data.plan === 'premium' ? `
          <li>📊 Relatórios avançados com insights</li>
          <li>🤖 Automações inteligentes</li>
          <li>📱 Suporte prioritário (4h)</li>
          <li>🔌 API ilimitada</li>
          <li>👥 Até 10 usuários</li>
          ` : ''}
          ${data.plan === 'empresarial' ? `
          <li>👥 Usuários ilimitados</li>
          <li>🎯 Gerente dedicado</li>
          <li>📞 Suporte 24/7 imediato</li>
          <li>🔒 SLA 99,9% garantido</li>
          <li>🛠️ Customizações personalizadas</li>
          <li>🎓 Treinamento da equipe</li>
          ` : ''}
        </ul>
      </div>
      
      <div style="background: #e3f2fd; padding: 25px; border-left: 4px solid #2196f3; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px;"><strong>💡 Dica:</strong> Explore o painel agora para descobrir todos os novos recursos. Preparamos um tour guiado especialmente para você!</p>
      </div>
      
      <center>
        <a href="https://gerenciador.corretoracorporate.com.br/novos-recursos" 
           style="background: #f39c12; color: white; padding: 18px 45px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 17px; box-shadow: 0 4px 12px rgba(243,156,18,0.3);">
          🆕 Explorar Novos Recursos
        </a>
        <a href="https://gerenciador.corretoracorporate.com.br/tour-upgrade" 
           style="background: white; color: #f39c12; padding: 18px 45px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 17px; border: 2px solid #f39c12;">
          🎯 Iniciar Tour Guiado
        </a>
      </center>
      
      <h3 style="color: #f39c12;">📚 Materiais do novo plano:</h3>
      <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f39c12;">
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 12px 0;">📘 Guia completo do Plano ${planNames[data.plan]}</li>
          <li style="margin: 12px 0;">🎥 Vídeos dos novos recursos (10-15 min)</li>
          <li style="margin: 12px 0;">📋 Checklist de transição</li>
          <li style="margin: 12px 0;">🎯 Dicas de aproveitamento máximo</li>
        </ul>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/materiais-${data.plan}" 
             style="background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600;">
            📥 Baixar Materiais
          </a>
        </center>
      </div>
      
      ${data.plan === 'empresarial' ? `
      <div style="background: #d4edda; padding: 25px; border-left: 4px solid #28a745; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px;"><strong>🎁 Bônus de Upgrade Empresarial:</strong> Seu gerente de conta dedicado entrará em contato em até 24 horas para agendar o kickoff e treinamento da equipe!</p>
      </div>
      ` : ''}
      
      <h3>❓ Precisa de ajuda com os novos recursos?</h3>
      <p>Nossa equipe está pronta para ajudar você a aproveitar 100% do novo plano:</p>
      <p>📧 <strong>E-mail:</strong> ${data.plan === 'empresarial' ? 'enterprise@' : data.plan === 'premium' ? 'premium@' : 'suporte@'}corretoracorporate.com.br</p>
      <p>📱 <strong>WhatsApp:</strong> (11) ${data.plan === 'empresarial' ? '91234-5678' : '98765-4321'}</p>
      ${data.plan === 'empresarial' ? '<p>☎️ <strong>Telefone direto:</strong> 0800 123 4567</p>' : ''}
    </div>
  `
  
  return {
    subject: `🎉 Upgrade confirmado para ${planNames[data.plan]}! Novos recursos desbloqueados, ${data.name}`,
    html: getBaseTemplate(content),
    text: `Olá ${data.name},\n\nParabéns! Seu upgrade para o Plano ${planNames[data.plan]} foi confirmado!\n\nNovo valor: R$ ${data.value.toFixed(2)}/mês\nEfetivado em: ${data.activationDate}\n\nTodos os novos recursos já estão disponíveis na sua conta.\n\nAcesse: https://gerenciador.corretoracorporate.com.br/novos-recursos\n\nDúvidas? ${data.plan === 'empresarial' ? 'enterprise@' : data.plan === 'premium' ? 'premium@' : 'suporte@'}corretoracorporate.com.br`
  }
}

// ==========================================
// TEMPLATE 5: REATIVAÇÃO
// ==========================================
function getReactivationTemplate(data: CustomerData): EmailTemplate {
  const content = `
    <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 50px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 36px; color: white;">🔄 Que bom ter você de volta!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 20px;">Sentimos sua falta 💚</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 17px;">Olá <strong>${data.name}</strong>,</p>
      
      <p style="font-size: 16px;">Ficamos <strong>muito felizes</strong> com seu retorno! Sua assinatura foi reativada com sucesso e você já pode aproveitar todos os recursos novamente. 🎉💚</p>
      
      <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 30px; border-left: 4px solid #27ae60; margin: 30px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(39,174,96,0.2);">
        <h3 style="margin-top: 0; color: #27ae60;">✅ Assinatura reativada com sucesso!</h3>
        <p style="margin: 10px 0; font-size: 15px;"><strong>💰 Valor mensal:</strong> R$ ${data.value.toFixed(2)}</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>📅 Reativação:</strong> ${data.activationDate}</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>🔄 Cobrança:</strong> Débito automático via PIX</p>
        <p style="margin: 10px 0; font-size: 15px;"><strong>✨ Status:</strong> <span style="background: #27ae60; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">ATIVO</span></p>
      </div>
      
      <h3 style="color: #27ae60; font-size: 22px;">🆕 Novidades desde sua última assinatura:</h3>
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
        <ul style="line-height: 2; font-size: 15px;">
          <li>🎨 <strong>Novo dashboard</strong> completamente redesenhado e mais intuitivo</li>
          <li>📊 <strong>Relatórios aprimorados</strong> com novos gráficos e insights</li>
          <li>🤖 <strong>Novos recursos de automação</strong> para economizar tempo</li>
          <li>⚡ <strong>Performance 2x mais rápida</strong> em todas as operações</li>
          <li>📱 <strong>App mobile atualizado</strong> com nova interface</li>
          <li>🔔 <strong>Sistema de notificações</strong> melhorado</li>
          <li>🔐 <strong>Segurança reforçada</strong> com autenticação em dois fatores</li>
          <li>🌐 <strong>Novas integrações</strong> com ferramentas populares</li>
        </ul>
      </div>
      
      <div style="background: #fff3cd; padding: 25px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px;"><strong>🎁 Presente de boas-vindas:</strong> Como agradecimento pelo seu retorno, preparamos um tour guiado especial com todas as novidades. Clique no botão abaixo para começar!</p>
      </div>
      
      <center>
        <a href="https://gerenciador.corretoracorporate.com.br/novidades" 
           style="background: #27ae60; color: white; padding: 18px 45px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 17px; box-shadow: 0 4px 12px rgba(39,174,96,0.3);">
          🆕 Ver Todas as Novidades
        </a>
        <a href="https://gerenciador.corretoracorporate.com.br/tour-volta" 
           style="background: white; color: #27ae60; padding: 18px 45px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 15px 10px; font-weight: 600; font-size: 17px; border: 2px solid #27ae60;">
          🎯 Iniciar Tour
        </a>
      </center>
      
      <h3 style="color: #27ae60;">📈 Dados restaurados:</h3>
      <div style="background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;">✅ Todos os seus dados anteriores foram <strong>preservados</strong></p>
        <p style="margin: 5px 0;">✅ Suas configurações foram <strong>mantidas</strong></p>
        <p style="margin: 5px 0;">✅ Histórico completo está <strong>disponível</strong></p>
        <p style="margin: 15px 0 5px 0; padding-top: 10px; border-top: 1px solid #90caf9;">💡 Você pode continuar de onde parou!</p>
      </div>
      
      <h3>🎯 Sugestões para recomeçar:</h3>
      <ol style="line-height: 2; font-size: 15px;">
        <li>Explore as novidades no dashboard</li>
        <li>Confira os novos recursos de automação</li>
        <li>Atualize suas preferências (se necessário)</li>
        <li>Teste a nova performance (está muito mais rápido!)</li>
      </ol>
      
      <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h4 style="margin-top: 0; color: #f39c12;">💬 Feedback é importante!</h4>
        <p style="margin: 10px 0;">Queremos melhorar ainda mais. Se puder, nos conte:</p>
        <ul style="margin: 10px 0;">
          <li>Por que você voltou? 😊</li>
          <li>O que podemos melhorar?</li>
          <li>Quais recursos você mais sente falta?</li>
        </ul>
        <center>
          <a href="https://gerenciador.corretoracorporate.com.br/feedback" 
             style="background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600;">
            💬 Enviar Feedback
          </a>
        </center>
      </div>
      
      <h3>❓ Precisa de ajuda?</h3>
      <p>Estamos aqui para garantir que você tenha a melhor experiência:</p>
      <p>📧 <strong>E-mail:</strong> suporte@corretoracorporate.com.br</p>
      <p>📱 <strong>WhatsApp:</strong> (11) 98765-4321</p>
      <p>💬 <strong>Chat:</strong> Disponível no painel (canto inferior direito)</p>
      
      <div style="background: #d4edda; padding: 25px; border-left: 4px solid #28a745; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px;"><strong>💚 Obrigado por voltar!</strong> Sua confiança é muito importante para nós. Vamos fazer valer a pena!</p>
      </div>
    </div>
  `
  
  return {
    subject: `🔄 Bem-vindo de volta, ${data.name}! Veja tudo o que mudou 🆕`,
    html: getBaseTemplate(content),
    text: `Olá ${data.name},\n\nQue bom ter você de volta! Sua assinatura foi reativada com sucesso.\n\nValor: R$ ${data.value.toFixed(2)}/mês\nReativação: ${data.activationDate}\n\nNovidades desde sua última assinatura:\n- Dashboard redesenhado\n- Relatórios aprimorados\n- Novos recursos de automação\n- Performance 2x mais rápida\n- E muito mais!\n\nVer novidades: https://gerenciador.corretoracorporate.com.br/novidades\n\nDúvidas? suporte@corretoracorporate.com.br`
  }
}

// ==========================================
// FUNÇÃO PRINCIPAL: SELECIONAR TEMPLATE
// ==========================================
export function getWelcomeEmailTemplate(data: CustomerData): EmailTemplate {
  // Prioridade 1: Upgrade
  if (data.isUpgrade) {
    return getUpgradeTemplate(data)
  }
  
  // Prioridade 2: Reativação
  if (data.isReactivation) {
    return getReactivationTemplate(data)
  }
  
  // Prioridade 3: Templates por plano
  switch (data.plan) {
    case 'premium':
      return getPremiumPlanTemplate(data)
    case 'empresarial':
      return getEnterprisePlanTemplate(data)
    case 'basico':
    default:
      return getBasicPlanTemplate(data)
  }
}
