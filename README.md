# Corretora Corporate - Sistema de Gestão Asaas

Sistema completo de gestão de contas, subcontas, assinaturas e pagamentos integrado com API Asaas.

## 🚀 URLs de Acesso

- **Produção**: https://corretoracorporate.pages.dev
- **Custom Domain**: https://admin.corretoracorporate.com.br
- **Preview (última versão)**: https://17b0d0f0.corretoracorporate.pages.dev

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

### ✅ Links de Pagamento DeltaPag
- Criação de links de pagamento recorrente (mensal, semanal, quinzenal, etc.)
- Geração de QR Code para links (v5.4)
- **Editar links**: descrição, valor, data de validade
- **Excluir links**: com confirmação dupla
- **Desativar links**: pausar temporariamente
- Filtros por status, recorrência e período

### ✅ Assinaturas DeltaPag
- Listagem de assinaturas ativas/canceladas
- Filtros por status (ACTIVE, CANCELLED), recorrência e período
- Sincronização automática com Asaas
- Máscara de cartões por segurança

### ✅ Links de Auto-Cadastro
- Geração de links para cadastro automático de subcontas
- QR Code para compartilhamento
- Logo Asaas e mensagem personalizada na página de cadastro
- Controle de validade e limite de usos

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
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>

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

### v5.4 (2026-03-05)
- ✅ **QR Code**: Adicionado `defer` e `onload` para garantir carregamento
- ✅ **Editar/Excluir Links**: Endpoints corrigidos (sem `updated_at`)
- ✅ **Polling**: Aguarda biblioteca carregar até 5 segundos

### v7.6 (2026-03-03)
- ✅ **Logo Asaas**: Adicionado na página de cadastro
- ✅ **Mensagem personalizada**: "Abra sua conta Digital no Asaas..."

### v7.5 (2026-03-03)
- ✅ **Trocar Senha**: Botão para subcontas alterarem própria senha

### v7.4 (2026-03-03)
- ✅ **Filtros DeltaPag**: Status (ACTIVE/CANCELLED) e recorrência funcionando

### v2.1 (2026-03-03)
- ✅ **Exportar PDF**: Corrigido carregamento de jsPDF

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verificar console do navegador (F12)
2. Fazer **hard refresh**: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
3. Verificar logs do Wrangler (backend)

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

**Última atualização**: 2026-03-05  
**Versão**: 5.4  
**Status**: ✅ Produção
