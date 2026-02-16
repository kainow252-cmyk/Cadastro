# Guia de Deploy no Cloudflare Pages com Domínio Customizado
## Domínio: cadastro.corretoracorporate.com.br

---

## 📋 Checklist de Implementação

### ✅ **1. Código Pronto**
- [x] Aplicação funcionando no sandbox
- [x] Build funcionando (`npm run build`)
- [x] Testes realizados localmente
- [x] Git repository criado
- [x] Código commitado

### ⚠️ **2. Configuração do Cloudflare (PENDENTE)**

#### A. **Setup Inicial Cloudflare**
- [ ] Ter conta no Cloudflare (https://dash.cloudflare.com)
- [ ] Configurar API Key do Cloudflare no sistema
- [ ] Autenticar wrangler: `npx wrangler login`

#### B. **Criar Projeto Cloudflare Pages**
- [ ] Criar projeto via wrangler ou dashboard
- [ ] Nome sugerido: `gerenciador-asaas` ou `cadastro-corretoracorporate`
- [ ] Configurar branch de produção: `main`

#### C. **Configurar Domínio no Cloudflare**
- [ ] Adicionar domínio `corretoracorporate.com.br` ao Cloudflare
- [ ] Atualizar nameservers no Registro.br:
  - NS1: `adrian.ns.cloudflare.com`
  - NS2: `becky.ns.cloudflare.com`
  (valores podem variar - verificar no Cloudflare)
- [ ] Aguardar propagação DNS (2-48h)

#### D. **Adicionar Subdomínio ao Projeto**
- [ ] No Cloudflare Pages, ir em Custom Domains
- [ ] Adicionar: `cadastro.corretoracorporate.com.br`
- [ ] Cloudflare criará registro DNS automaticamente
- [ ] Aguardar ativação do SSL (alguns minutos)

#### E. **Configurar Variáveis de Ambiente**
- [ ] No Cloudflare Pages → Settings → Environment Variables
- [ ] Adicionar variáveis de produção (secrets):
  - `ASAAS_API_KEY` = (sua chave de produção)
  - `ASAAS_API_URL` = `https://api.asaas.com/v3`
  - `ADMIN_USERNAME` = (seu admin username)
  - `ADMIN_PASSWORD` = (senha forte de produção)
  - `JWT_SECRET` = (chave secreta forte - gerar nova)
  - `MAILERSEND_API_KEY` = (sua chave MailerSend)
  - `MAILERSEND_FROM_EMAIL` = (email verificado)
  - `MAILERSEND_FROM_NAME` = `Gerenciador Asaas`

#### F. **Deploy para Produção**
- [ ] Build local: `npm run build`
- [ ] Deploy: `npx wrangler pages deploy dist --project-name gerenciador-asaas`
- [ ] Verificar URL temporária: `https://gerenciador-asaas.pages.dev`
- [ ] Verificar domínio customizado: `https://cadastro.corretoracorporate.com.br`

---

## 🚀 Comandos de Deploy

### **1. Setup Inicial (Primeira Vez)**

```bash
# 1. Instalar Cloudflare CLI (se ainda não tiver)
npm install -g wrangler

# 2. Login no Cloudflare
npx wrangler login

# 3. Verificar autenticação
npx wrangler whoami

# 4. Criar projeto Cloudflare Pages (primeira vez)
npx wrangler pages project create gerenciador-asaas \
  --production-branch main \
  --compatibility-date 2024-01-01

# 5. Build do projeto
cd /home/user/webapp
npm run build

# 6. Deploy inicial
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

### **2. Deploy Subsequente (Atualizações)**

```bash
# Build
cd /home/user/webapp
npm run build

# Deploy
npx wrangler pages deploy dist --project-name gerenciador-asaas

# Ou usar o script package.json
npm run deploy:prod
```

### **3. Configurar Secrets (Variáveis de Ambiente)**

```bash
# Adicionar secrets via CLI
npx wrangler pages secret put ASAAS_API_KEY --project-name gerenciador-asaas
npx wrangler pages secret put ADMIN_PASSWORD --project-name gerenciador-asaas
npx wrangler pages secret put JWT_SECRET --project-name gerenciador-asaas

# Listar secrets configurados
npx wrangler pages secret list --project-name gerenciador-asaas
```

### **4. Adicionar Domínio Customizado**

```bash
# Via CLI (após domínio estar no Cloudflare)
npx wrangler pages domain add cadastro.corretoracorporate.com.br \
  --project-name gerenciador-asaas

# Verificar domínios configurados
npx wrangler pages domain list --project-name gerenciador-asaas
```

---

## 🌐 Configuração DNS no Cloudflare

### **Registros DNS Necessários**

Após adicionar o domínio ao Cloudflare Pages, o seguinte registro será criado automaticamente:

```
Tipo: CNAME
Nome: cadastro
Conteúdo: gerenciador-asaas.pages.dev
Proxy: ✅ Proxied (laranja)
TTL: Auto
```

**Se precisar criar manualmente:**

1. Vá para Cloudflare Dashboard → seu domínio → DNS
2. Clique em "Add record"
3. Configure:
   - **Type**: CNAME
   - **Name**: cadastro
   - **Target**: gerenciador-asaas.pages.dev (ou o nome do seu projeto)
   - **Proxy status**: Proxied (nuvem laranja)
   - **TTL**: Auto

---

## 🔒 Segurança - Secrets de Produção

### **IMPORTANTE: Gerar Novos Secrets para Produção**

**NÃO USE OS VALORES DO .dev.vars EM PRODUÇÃO!**

```bash
# Gerar JWT Secret forte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Gerar senha de admin forte
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Secrets Obrigatórios (Production)**

1. **ASAAS_API_KEY**: Sua chave de produção Asaas (começa com `$aact_prod_`)
2. **ASAAS_API_URL**: `https://api.asaas.com/v3` (produção)
3. **ADMIN_USERNAME**: Nome de usuário admin (mude de `admin`)
4. **ADMIN_PASSWORD**: Senha forte (mude de `admin123`)
5. **JWT_SECRET**: Chave secreta forte (64+ caracteres)
6. **MAILERSEND_API_KEY**: Chave MailerSend de produção
7. **MAILERSEND_FROM_EMAIL**: Email verificado no MailerSend
8. **MAILERSEND_FROM_NAME**: Nome do remetente

---

## 📁 Estrutura de Deploy

```
webapp/
├── dist/                    # Pasta de build (será deployada)
│   ├── _worker.js          # Código do Cloudflare Worker
│   ├── _routes.json        # Configuração de rotas
│   └── static/             # Assets estáticos
├── wrangler.jsonc          # Configuração do Cloudflare
├── package.json            # Scripts de deploy
└── .dev.vars              # Variáveis locais (NÃO commitar)
```

---

## 🧪 Verificação Pós-Deploy

### **Checklist de Testes**

1. **Acesso ao domínio**:
   ```bash
   curl -I https://cadastro.corretoracorporate.com.br
   # Deve retornar: HTTP/2 200
   ```

2. **SSL funcionando**:
   - Abrir https://cadastro.corretoracorporate.com.br no navegador
   - Verificar cadeado verde
   - Certificado válido do Cloudflare

3. **Funcionalidades**:
   - [ ] Login funcionando
   - [ ] Dashboard carregando
   - [ ] Criar subconta funcionando
   - [ ] Gerar link de cadastro funcionando
   - [ ] Ver subcontas listando corretamente
   - [ ] Relatórios gerando
   - [ ] Links de pagamento criando

4. **Integração Asaas**:
   - [ ] API conectando em produção
   - [ ] Subcontas sendo criadas na conta real
   - [ ] Emails sendo enviados
   - [ ] Wallet ID sendo retornado

---

## 🚨 Troubleshooting

### **Problema 1: "Project not found"**
```bash
# Criar projeto primeiro
npx wrangler pages project create gerenciador-asaas \
  --production-branch main
```

### **Problema 2: "Domain already exists"**
```bash
# Verificar domínios existentes
npx wrangler pages domain list --project-name gerenciador-asaas

# Remover domínio antigo se necessário
npx wrangler pages domain remove cadastro.corretoracorporate.com.br \
  --project-name gerenciador-asaas
```

### **Problema 3: "SSL Certificate Error"**
- Aguardar alguns minutos após adicionar domínio
- Cloudflare provisiona certificado automaticamente
- Pode levar até 15 minutos

### **Problema 4: "DNS_PROBE_FINISHED_NXDOMAIN"**
- Verificar se domínio está no Cloudflare
- Verificar se nameservers foram atualizados
- Aguardar propagação DNS (2-48h)

---

## 📞 Suporte

### **Cloudflare**
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com/pages
- Community: https://community.cloudflare.com

### **Asaas**
- Painel: https://www.asaas.com
- Docs: https://docs.asaas.com
- Suporte: suporte@asaas.com

### **Registro.br** (para DNS)
- Painel: https://registro.br
- Docs: https://registro.br/ajuda/

---

## ✅ Status Atual

- [x] Código desenvolvido e testado
- [x] Git repository configurado
- [x] Build funcionando localmente
- [x] Integração Asaas de produção ativa
- [ ] **Deploy no Cloudflare Pages** ← PRÓXIMO PASSO
- [ ] **Configurar domínio customizado** ← APÓS DEPLOY
- [ ] **Testar em produção**

---

## 🎯 Próximos Passos (EM ORDEM)

### **Passo 1: Setup Cloudflare API Key**
```bash
# No sistema, ir em Deploy tab e configurar Cloudflare API Key
# Ou chamar: setup_cloudflare_api_key
```

### **Passo 2: Criar Projeto e Deploy Inicial**
```bash
cd /home/user/webapp
npx wrangler login
npx wrangler pages project create gerenciador-asaas --production-branch main
npm run build
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

### **Passo 3: Configurar Secrets**
```bash
# Via dashboard Cloudflare ou CLI
npx wrangler pages secret put ASAAS_API_KEY --project-name gerenciador-asaas
# ... outros secrets
```

### **Passo 4: Configurar Domínio**
1. Adicionar `corretoracorporate.com.br` ao Cloudflare
2. Atualizar nameservers no Registro.br
3. Adicionar subdomínio `cadastro` ao projeto
4. Aguardar ativação SSL

### **Passo 5: Testar Produção**
- Acessar https://cadastro.corretoracorporate.com.br
- Fazer login
- Testar todas as funcionalidades
- Criar subconta de teste
- Verificar emails

---

**Data**: 16/02/2026  
**Versão**: 3.1  
**Status**: Código pronto, aguardando deploy no Cloudflare

