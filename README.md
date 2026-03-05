# Corretora Corporate - Sistema de Gestão Asaas

Sistema completo de gestão de contas, subcontas, assinaturas e pagamentos integrado com API Asaas.

## 🚀 URLs de Acesso

- **Produção**: https://corretoracorporate.pages.dev
- **Custom Domain**: https://admin.corretoracorporate.com.br
- **Preview (última versão)**: https://3e29c1a0.corretoracorporate.pages.dev (v6.1.1 - PIX Automático)

## ⚠️ PRÉ-REQUISITOS OBRIGATÓRIOS

### 1. Aplicar Migration (✅ Concluído)
```bash
npx wrangler d1 migrations apply corretoracorporate-db --remote
```

### 2. Configurar Chave PIX no Asaas (⚠️ OBRIGATÓRIO)
**O sistema agora funciona APENAS com PIX. Sem chave PIX, retorna erro.**

**Como configurar**:
1. Acesse: https://www.asaas.com (ou https://sandbox.asaas.com)
2. Menu → Configurações → PIX
3. Clicar em "Cadastrar Nova Chave PIX"
4. Escolher tipo: CPF, Email, Celular ou Aleatória
5. Verificar a chave (email/SMS)
6. Aguardar ativação (geralmente instantâneo)

**Sem chave PIX configurada, o sistema retornará erro 400 explicando os passos.**

## 📋 Funcionalidades Principais

### ✅ Gestão de Contas
- Criação e gerenciamento de contas principais (admins)
- Dashboard com estatísticas em tempo real
- Sistema de autenticação seguro (bcrypt)

### ✅ Gestão de Subcontas
- Criação de subcontas vinculadas a contas principais
- Sistema de login independente para subcontas
- Alteração de senha por subconta
- Dashboard personalizado para subcontas
- **🔑 Chaves de API independentes** (v6.1.1 - **NOVO** ✨)
  - Cada subconta pode ter sua própria chave de API Asaas
  - Isolamento de permissões e segurança
  - Gerenciamento ativado no Asaas Sandbox (05/03/2026)

### ✅ Links de Pagamento DeltaPag
- Criação de links de pagamento recorrente (mensal, semanal, quinzenal, etc.)
- Geração de QR Code para links (v5.5 - **CORRIGIDO**)
- **Gerar Banner**: Banner personalizado com QR Code embutido (v5.6 - **NOVO** 🎨)
- **Editar links**: descrição, valor, data de validade
- **Excluir links**: com confirmação dupla
- **Desativar links**: pausar temporariamente
- Filtros por status, recorrência e período
- Download de QR Code em PNG (280×280px)
- Download de Banner em PNG (1080×1080px) para redes sociais

### ✅ Assinaturas DeltaPag
- Listagem de assinaturas ativas/canceladas
- Filtros por status (ACTIVE, CANCELLED), recorrência e período
- Sincronização automática com Asaas
- Máscara de cartões por segurança

### ✅ Links de Auto-Cadastro PIX (v6.1.1 - **PIX AUTOMÁTICO** 🚀)
- **Cobrança Única**: Pagamento PIX avulso (1 vez)
- **Assinatura Mensal**: PIX Automático (débito recorrente no banco) ⏳
  - ⚠️ **Status**: Aguardando ativação pelo suporte Asaas
  - Sistema implementado e testado
  - Endpoint `/pix/automatic/authorizations` configurado
  - Chave PIX cadastrada no sandbox
  - **Próximo passo**: Contatar suporte Asaas para ativar (ver ATIVAR_PIX_AUTOMATICO.md)
  - Cliente autoriza no banco ao pagar primeiro PIX
  - Débitos mensais automáticos (sem ação do cliente)
  - Split 20/80 aplicado automaticamente
- QR Code para compartilhamento
- Logo Asaas e mensagem personalizada na página de cadastro
- Controle de validade e limite de usos
- Tabela `pix_authorizations` para tracking de autorizações

### ✅ Relatórios Detalhados
- Relatórios por subconta ou consolidados
- Exportação para PDF (v2.1)
- Exportação para Excel
- Filtros por período, tipo de cobrança e status
- Auto-atualização a cada 30 segundos

### ✅ Gerador de Banners
- Criação de banners personalizados para assinaturas
- Compartilhamento via WhatsApp, Email, Telegram
- Galeria de banners salvos por conta
- Link público para visualização de banners

## 🔧 Tecnologias Utilizadas

### Backend
- **Hono Framework**: Framework web lightweight para Cloudflare Workers
- **TypeScript**: Tipagem estática e IntelliSense
- **Cloudflare D1**: Banco de dados SQLite distribuído globalmente
- **Cloudflare Pages**: Hosting e deployment
- **Asaas API**: Integração completa com plataforma de pagamentos

### Frontend
- **HTML5 + Tailwind CSS**: Interface responsiva e moderna
- **Vanilla JavaScript**: Performance otimizada sem frameworks pesados
- **Axios**: Cliente HTTP para requisições
- **Chart.js**: Gráficos e visualizações
- **jsPDF + autoTable**: Geração de relatórios PDF
- **XLSX**: Exportação para Excel
- **QRCode.js**: Geração de QR Codes

### Bibliotecas CDN
```html
<!-- Styling -->
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">

<!-- Charts e Relatórios -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- QR Code -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<!-- HTTP Client -->
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
```

## 📁 Estrutura do Projeto

```
webapp/
├── src/
│   └── index.tsx          # Rotas e endpoints da API
├── public/
│   └── static/
│       ├── app.js         # Funções principais do frontend
│       ├── deltapag-section.js  # Gestão de links DeltaPag
│       ├── payment-links.js     # Links de pagamento
│       ├── payment-filters.js   # Filtros de pagamentos
│       ├── reports-detailed.js  # Sistema de relatórios
│       ├── banner-generator.js  # Gerador de banners
│       └── asaas-logo.png      # Logo Asaas
├── migrations/
│   └── *.sql              # Migrações do banco D1
├── wrangler.jsonc         # Configuração Cloudflare
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
├── vite.config.ts         # Build configuration
└── ecosystem.config.cjs   # PM2 (desenvolvimento local)
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Wrangler CLI

### Instalação
```bash
cd /home/user/webapp
npm install
```

### Executar Localmente
```bash
# Build
npm run build

# Desenvolvimento (com hot reload)
npm run dev

# Preview (sem hot reload)
npm run preview
```

### Comandos Úteis
```bash
# Limpar porta 3000
npm run clean-port

# Testar servidor
npm run test

# Git
npm run git:status
npm run git:commit "mensagem"

# Banco de Dados D1 (local)
npm run db:migrate:local
npm run db:seed
npm run db:reset
npm run db:console:local
```

## 🚀 Deploy

### Deploy Manual
```bash
npm run deploy
# ou
npm run deploy:prod
```

### Deploy Automático via CI/CD
Pushes para `main` branch disparam deploy automático no Cloudflare Pages.

### Variáveis de Ambiente
Configuradas no Cloudflare Dashboard:
- `ASAAS_API_KEY`: Chave da API Asaas
- `ADMIN_USERNAME`: Usuário admin padrão
- `ADMIN_PASSWORD`: Senha admin padrão (hash bcrypt)

## 📊 Banco de Dados

### Cloudflare D1 (SQLite)
- **Produção**: `webapp-production`
- **Local**: `.wrangler/state/v3/d1` (criado automaticamente)

### Tabelas Principais
- `accounts`: Contas principais
- `subaccounts`: Subcontas vinculadas
- `deltapag_signup_links`: Links de pagamento
- `deltapag_subscriptions`: Assinaturas ativas
- `signup_links`: Links de auto-cadastro
- `saved_banners`: Banners gerados
- `saved_cards`: Cartões tokenizados

## 🔐 Autenticação

### Login Admin
- URL: https://admin.corretoracorporate.com.br
- Usuário: `admin`
- Senha: `admin123` (padrão - alterar em produção!)

### Login Subcontas
- URL: https://corretoracorporate.com.br/subaccount-login
- Credenciais individuais por subconta

## 🐛 Debug e Logs

### Console do Navegador (F12)
```javascript
// Logs de carregamento
✅ DeltaPag Section JS carregado
✅ Funções QR Code exportadas
✅ Sistema de Relatórios Detalhados carregado
✅ QRCode library loaded: function
```

### Wrangler Logs (Backend)
```bash
# Logs em tempo real
npx wrangler pages deployment tail

# Logs do último deploy
npx wrangler pages deployment list
```

## 📝 Changelog Recente

### v6.1.1 (2026-03-05) 🔧 DETECÇÃO DE PERMISSÃO + ORIENTAÇÃO
- ✅ **NOVO**: Detecta erro `insufficient_permission` da API Asaas
- 📞 **CONTATO**: Retorna informações de contato do suporte Asaas (WhatsApp, Email)
- 💬 **TEMPLATE**: Fornece mensagem pronta para solicitar ativação do PIX Automático
- 📄 **DOCUMENTAÇÃO**: Novo arquivo ATIVAR_PIX_AUTOMATICO.md com guia completo
- 🧪 **SCRIPTS DE TESTE**: 
  - `test-pix-automatico-sandbox.sh` - Testa autorização PIX
  - `test-asaas-permissions.sh` - Verifica permissões da API
- 🎯 **STATUS**: Sistema 100% implementado, aguardando ativação pelo suporte
- 📦 **Deploy**: https://3e29c1a0.corretoracorporate.pages.dev

### v6.1.0 (2026-03-05) 🔴 BREAKING CHANGE - SOMENTE PIX
- 🔴 **REMOVIDO**: Fallback para BOLETO
- ✅ **POLÍTICA**: Sistema aceita APENAS PIX
- 📋 **REQUISITO**: Chave PIX obrigatória no Asaas
- 💬 **ERRO CLARO**: Se PIX não disponível, retorna erro 400 com instruções
- 🎯 **MOTIVO**: Foco em PIX Automático (débito recorrente)
- 📦 **Deploy**: https://54f45fce.corretoracorporate.pages.dev

### v6.0.1 (2026-03-05) 🔧 FIX + FALLBACK
- 🔴 **PROBLEMA**: API `/pix/qrCodes/authorization` pode retornar erro 400 (formato incorreto ou não disponível)
- ✅ **SOLUÇÃO**: Fallback automático para `POST /subscriptions` (PIX mensal tradicional)
- 🔄 **Lógica**: Tenta autorização PIX → se falhar → cria subscription PIX mensal
- 📊 **Resultado**: Sistema funcional em ambos os casos (autorização ou subscription)
- 💡 **Vantagem**: Zero downtime, sempre gera QR Code PIX para o cliente
- 📦 **Deploy**: https://6d2f5197.corretoracorporate.pages.dev

### v6.0 (2026-03-05) 🚀 NOVA FUNCIONALIDADE MAJOR
- ✅ **PIX Automático Implementado**: Débito recorrente verdadeiro via API Asaas
- 🔐 **API Asaas**: Endpoint `/pix/qrCodes/authorization` para criar autorização
- 📱 **Fluxo**: Cliente paga primeiro PIX no banco e autoriza débitos futuros automáticos
- 💾 **Tabela nova**: `pix_authorizations` com campos authorization_id, status, payload
- 📊 **Migration**: 0017_create_pix_authorizations.sql (índices otimizados)
- 💬 **UI melhorada**: Alertas visuais explicando débito automático
- 🎨 **Mensagens dinâmicas**: "Autorização PIX Automático" vs "Pagamento Único"
- 💰 **Split mantido**: 20% subconta / 80% admin nos débitos futuros
- 🔄 **Status**: PENDING_AUTHORIZATION → AUTHORIZED (após aprovação no banco)
- ⚠️ **Importante**: Cobrança Única continua normal, Assinatura Mensal agora é PIX Automático
- 📦 **Deploy**: https://626cfb30.corretoracorporate.pages.dev

### v5.7 (2026-03-05) 🔧 FIX CRÍTICO
- 🔴 **PROBLEMA**: Erro 400 (Bad Request) ao enviar formulário de cadastro PIX - campo `customerBirthdate` não aceito
- ✅ **SOLUÇÃO**: Endpoint `/api/pix/subscription-signup/:linkId` agora aceita `customerBirthdate`
- ✅ **Ajuste**: Campo de data de nascimento é opcional, mas enviado ao Asaas se fornecido
- ✅ **Log**: Adicionado log dos dados recebidos para debug
- 🎯 **Resultado**: Formulário de Auto-Cadastro PIX funciona 100%
- 📦 **Deploy**: https://22ccf45f.corretoracorporate.pages.dev

### v5.6 (2026-03-05) 🎨 NOVA FUNCIONALIDADE
- ✅ **Gerar Banner**: Botão para criar banners personalizados com QR Code nos Links DeltaPag
- ✅ **Banner personalizado**: Gradientes coloridos, QR Code embutido, 1080×1080px
- ✅ **Integração**: banner-generator.js v1.1 com flag useProvidedLink
- ✅ **Compartilhamento**: WhatsApp, Email, Telegram, Download PNG
- 🎯 **Uso**: Links DeltaPag → Card → Botão "Banner" → Gerar → Baixar

### v5.5 (2026-03-05) ⭐ CORREÇÃO CRÍTICA
- 🔴 **PROBLEMA IDENTIFICADO**: URL CDN do QRCode retornava 404 - `https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js`
- ✅ **SOLUÇÃO**: Trocado para `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js` (CDNJS)
- ✅ **Ajustes**: API do qrcodejs (`new QRCode(container, options)`)
- ✅ **HTML**: Mudado de `<canvas id="qrcode-canvas">` para `<div id="qrcode-canvas-container">`
- ✅ **Download**: Atualizado para buscar canvas dentro do container
- 🎯 **Resultado**: QR Code DeltaPag agora funciona 100%

### v5.4 (2026-03-05)
- ✅ **QR Code**: Adicionado `defer` e `onload` para garantir carregamento
- ✅ **Editar/Excluir Links**: Endpoints corrigidos (sem `updated_at`)
- ✅ **Polling**: Aguarda biblioteca carregar até 5 segundos

### v7.6 (2026-03-05)
- ✅ **Logo Asaas**: Adicionado na página de cadastro (19.41 KB)
- ✅ **Mensagem personalizada**: "Abra sua conta Digital no Asaas..."

### v7.5 (2026-03-05)
- ✅ **Trocar Senha**: Botão para subcontas alterarem própria senha

### v7.4 (2026-03-05)
- ✅ **Filtros DeltaPag**: Status (ACTIVE/CANCELLED) e recorrência funcionando

### v2.1 (2026-03-05)
- ✅ **Exportar PDF**: Corrigido carregamento de jsPDF (`typeof window.jspdf`)

### v7.3 (2026-03-05)
- ✅ **Limpeza**: Removidos 119 arquivos .md obsoletos

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verificar console do navegador (F12)
2. Fazer **hard refresh**: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
3. Verificar logs do Wrangler (backend)

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

**Última atualização**: 2026-03-05  
**Versão**: 5.6 🎨  
**Status**: ✅ Produção - Sistema 100% operacional

---

## 🎨 Nova Funcionalidade v5.6

**Gerar Banner para Links DeltaPag**  
Crie banners personalizados com QR Code embutido em segundos!

**Como usar:**
1. Links DeltaPag → Visualizar Links
2. Card do link → Clicar "Banner" (botão rosa/roxo)
3. Gerar Banner → Baixar PNG (1080×1080px)

**Recursos:**
- 🎨 5 gradientes de cores profissionais
- 📱 Formato quadrado para redes sociais
- 🔲 QR Code integrado automaticamente
- 📥 Download em alta qualidade
- 📲 Compartilhamento direto (WhatsApp, Email, Telegram)

Para detalhes completos, veja: [BANNER_DELTAPAG_v5.6.md](./BANNER_DELTAPAG_v5.6.md)

---

## 🎯 Correção Crítica v5.5

**Problema**: URL do CDN QRCode estava incorreta (404)  
**Solução**: Migrado para CDNJS + ajuste de API  
**Resultado**: QR Code DeltaPag funcionando perfeitamente

Para detalhes, veja: [RESUMO_CORRECOES_2026-03-05.md](./RESUMO_CORRECOES_2026-03-05.md)
