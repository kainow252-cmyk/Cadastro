╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     🚀 DEPLOY DO GERENCIADOR ASAAS PARA PRODUÇÃO                           ║
║     Domínio: cadastro.corretoracorporate.com.br                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 STATUS ATUAL: 80% PRONTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CÓDIGO:              [████████████████████] 100% PRONTO
✅ TESTES:              [████████████████████] 100% PRONTO  
✅ INTEGRAÇÃO ASAAS:    [████████████████████] 100% PRONTO
⏳ DEPLOY CLOUDFLARE:   [░░░░░░░░░░░░░░░░░░░░]   0% FALTA
⏳ DOMÍNIO CUSTOMIZADO: [░░░░░░░░░░░░░░░░░░░░]   0% FALTA


╔══════════════════════════════════════════════════════════════════════════════╗
║  O QUE FALTA FAZER (4 PASSOS SIMPLES - ~1h30min + propagação DNS)          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│ PASSO 1: CONFIGURAR CLOUDFLARE API KEY (~5 min)                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Ir em: https://dash.cloudflare.com/profile/api-tokens                  │
│  2. Criar token com permissão: "Cloudflare Pages - Edit"                   │
│  3. Copiar token gerado                                                     │
│  4. Configurar no sistema (Deploy tab)                                      │
│                                                                              │
│  ⏱️  TEMPO: 5 minutos                                                        │
│  👤 QUEM FAZ: Você (manual)                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ PASSO 2: FAZER DEPLOY NO CLOUDFLARE PAGES (~10 min)                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMANDOS:                                                                  │
│                                                                              │
│  $ npx wrangler login                                                       │
│  $ npx wrangler pages project create gerenciador-asaas \                   │
│      --production-branch main                                               │
│  $ cd /home/user/webapp                                                     │
│  $ npm run build                                                            │
│  $ npx wrangler pages deploy dist --project-name gerenciador-asaas         │
│                                                                              │
│  RESULTADO:                                                                 │
│  → App disponível em: https://gerenciador-asaas.pages.dev                  │
│                                                                              │
│  ⏱️  TEMPO: 10 minutos                                                       │
│  👤 QUEM FAZ: Terminal (comandos)                                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ PASSO 3: CONFIGURAR DOMÍNIO CUSTOMIZADO (~30 min + 2-48h propagação)       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  3.1. ADICIONAR DOMÍNIO AO CLOUDFLARE:                                     │
│       → https://dash.cloudflare.com → Add a Site                           │
│       → Adicionar: corretoracorporate.com.br                               │
│       → Copiar nameservers (ex: adrian.ns.cloudflare.com)                  │
│                                                                              │
│  3.2. ATUALIZAR NAMESERVERS NO REGISTRO.BR:                                │
│       → https://registro.br → Login                                         │
│       → Selecionar domínio → Alterar Servidores DNS                        │
│       → Colar nameservers do Cloudflare                                    │
│       → ⏰ AGUARDAR 2-48 horas (propagação DNS)                             │
│                                                                              │
│  3.3. ADICIONAR SUBDOMÍNIO NO CLOUDFLARE PAGES:                            │
│       → Dashboard → Workers & Pages → gerenciador-asaas                    │
│       → Custom domains → Set up a custom domain                            │
│       → Adicionar: cadastro.corretoracorporate.com.br                      │
│       → SSL provisionado automaticamente (~5-15 min)                       │
│                                                                              │
│  ⏱️  TEMPO: 30 min + 2-48h propagação                                        │
│  👤 QUEM FAZ: Você (manual) + automático                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ PASSO 4: CONFIGURAR SECRETS DE PRODUÇÃO (~10 min)                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Via Dashboard (RECOMENDADO):                                               │
│  → Cloudflare → Workers & Pages → gerenciador-asaas                        │
│  → Settings → Environment variables                                         │
│                                                                              │
│  ADICIONAR ESTAS VARIÁVEIS:                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ ASAAS_API_KEY       = $aact_prod_000... (produção)                │   │
│  │ ASAAS_API_URL       = https://api.asaas.com/v3                    │   │
│  │ ADMIN_USERNAME      = admin_novo (mude de "admin")                │   │
│  │ ADMIN_PASSWORD      = Senha@Forte123 (mude de "admin123")         │   │
│  │ JWT_SECRET          = (gerar: openssl rand -hex 64)               │   │
│  │ MAILERSEND_API_KEY  = mlsn.ae31... (sua chave)                    │   │
│  │ MAILERSEND_FROM_EMAIL = noreply@trial-... (verificado)            │   │
│  │ MAILERSEND_FROM_NAME = Gerenciador Asaas                          │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ⚠️  CRÍTICO: NÃO use admin/admin123 em produção!                          │
│                                                                              │
│  ⏱️  TEMPO: 10 minutos                                                       │
│  👤 QUEM FAZ: Você (manual via dashboard)                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║  TIMELINE COMPLETA                                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

DIA 1 (~1 hora de trabalho):
  09:00 → Configurar Cloudflare API Key         (5 min)
  09:05 → Deploy no Cloudflare Pages            (10 min)
  09:15 → Testar URL temporária (.pages.dev)    (5 min)
  09:20 → Adicionar domínio ao Cloudflare       (10 min)
  09:30 → Atualizar nameservers Registro.br     (5 min)
  09:35 → ⏸️  PAUSA - Aguardar propagação DNS    (2-48 horas)

DIA 2 ou 3 (~30 min de trabalho):
  10:00 → Verificar propagação DNS               (5 min)
  10:05 → Adicionar subdomínio ao projeto        (10 min)
  10:15 → Aguardar SSL ser provisionado          (5-15 min)
  10:30 → Configurar secrets de produção         (10 min)
  10:40 → Testar aplicação em produção           (15 min)
  10:55 → ✅ APLICAÇÃO NO AR!


╔══════════════════════════════════════════════════════════════════════════════╗
║  FUNCIONALIDADES QUE ESTARÃO DISPONÍVEIS                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ Dashboard com estatísticas em tempo real
✅ Criar subcontas Asaas (com Wallet ID)
✅ Gerar links de cadastro únicos com QR Code
✅ Ver todas subcontas cadastradas (aprovadas/pendentes)
✅ Gerar relatórios financeiros (PDF e Excel)
✅ Criar links de pagamento:
   • PIX (valor fixo)
   • Cartão de Crédito (único ou parcelado 2-12x)
   • Assinatura recorrente (semanal, mensal, anual)
   • Boleto (valor fixo ou recorrente)
✅ Sistema de autenticação (login/logout)
✅ Integração Asaas API produção
✅ Envio de emails (MailerSend)
✅ Split automático 80/20 (PIX)


╔══════════════════════════════════════════════════════════════════════════════╗
║  ARQUIVOS DE REFERÊNCIA                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

📄 DEPLOY_CLOUDFLARE_DOMAIN.md   → Guia técnico completo (9KB)
📄 PASSOS_DEPLOY.md               → Checklist executivo (7KB)
📄 README.md                      → Visão geral do projeto
📄 wrangler.jsonc                 → Configuração Cloudflare
📄 package.json                   → Scripts de deploy


╔══════════════════════════════════════════════════════════════════════════════╗
║  COMANDOS ÚTEIS (CHEAT SHEET)                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

# Login Cloudflare
$ npx wrangler login
$ npx wrangler whoami

# Deploy
$ cd /home/user/webapp
$ npm run build
$ npx wrangler pages deploy dist --project-name gerenciador-asaas

# Domínio
$ npx wrangler pages domain add cadastro.corretoracorporate.com.br \
    --project-name gerenciador-asaas
$ npx wrangler pages domain list --project-name gerenciador-asaas

# Secrets
$ npx wrangler pages secret put ASAAS_API_KEY --project-name gerenciador-asaas
$ npx wrangler pages secret list --project-name gerenciador-asaas

# Gerar JWT Secret
$ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"


╔══════════════════════════════════════════════════════════════════════════════╗
║  LINKS IMPORTANTES                                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

🌐 Cloudflare Dashboard:  https://dash.cloudflare.com
📚 Cloudflare Pages Docs: https://developers.cloudflare.com/pages
🌐 Registro.br:           https://registro.br
💳 Asaas Painel:          https://www.asaas.com
📧 MailerSend:            https://www.mailersend.com


╔══════════════════════════════════════════════════════════════════════════════╗
║  RESULTADO FINAL                                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Após completar todos os passos, você terá:

✅ Aplicação rodando em: https://cadastro.corretoracorporate.com.br
✅ SSL/HTTPS habilitado automaticamente (Cloudflare)
✅ CDN global (Cloudflare)
✅ 100% funcional e integrado com Asaas API produção
✅ Pronto para uso comercial
✅ Zero downtime
✅ Escalável globalmente


╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎉 CÓDIGO 100% PRONTO!                                                     ║
║  📦 FALTA APENAS DEPLOY E CONFIGURAÇÃO DE DOMÍNIO                          ║
║                                                                              ║
║  Data: 16/02/2026                                                           ║
║  Versão: 3.1                                                                ║
║  Status: ⏳ Aguardando deploy                                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
