# 📱 SOLUÇÃO PARA DEPLOY VIA MOBILE

## 🚨 SITUAÇÃO ATUAL

- ❌ Sandbox não consegue compilar `src/index.tsx` (8.670 linhas, 376KB)
- ❌ Build trava após 2-5 minutos
- ✅ Código está no GitHub: https://github.com/kainow252-cmyk/Cadastro
- ✅ GitHub Actions configurado (workflow pronto)

## ✅ MELHOR SOLUÇÃO: GitHub Actions

### Por que?
- ✅ Compila em VM com **4 CPUs + 16GB RAM** (muito mais poderoso que sandbox)
- ✅ Build em **2-3 minutos** (sandbox trava)
- ✅ Deploy automático após o build
- ✅ **FUNCIONA DIRETO DO CELULAR!**

### Passo a Passo (5 minutos)

#### 1️⃣ Criar Workflow (2 min)

Acesse no navegador do celular:
https://github.com/kainow252-cmyk/Cadastro

Clique: **Add file** → **Create new file**

Nome do arquivo:
```
.github/workflows/deploy.yml
```

Cole este conteúdo:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
        env:
          NODE_ENV: production
      
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: corretoracorporate
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

Clique: **Commit new file**

#### 2️⃣ Configurar Secrets (2 min)

**Obter Token Cloudflare:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique: **Create Token**
3. Use: **Edit Cloudflare Workers** (template)
4. Clique: **Continue to summary** → **Create Token**
5. **COPIE O TOKEN** (só aparece uma vez!)

**Obter Account ID:**
1. Acesse: https://dash.cloudflare.com
2. Lado direito: **Account ID** (copie)

**Adicionar no GitHub:**
1. Vá em: https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions
2. Clique: **New repository secret**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (cole o token copiado)
- Clique: **Add secret**

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: (cole o account ID)
- Clique: **Add secret**

#### 3️⃣ Rodar o Workflow (1 min)

1. Acesse: https://github.com/kainow252-cmyk/Cadastro/actions
2. Clique: **Build and Deploy**
3. Clique: **Run workflow** → **Run workflow**
4. Aguarde 2-3 minutos ⏳
5. ✅ Pronto!

## 🎯 DEPOIS DO DEPLOY

1. Acesse: https://gerenciador.corretoracorporate.com.br/dashboard
2. Login: **admin** / **admin123**
3. Clique: **💳 Cartão Crédito**
4. Clique: **📧 Criar Evidências** (botão laranja)
5. Copie os 5 IDs DeltaPag
6. Envie para equipe DeltaPag

## 📋 CHECKLIST

- [ ] Criar `.github/workflows/deploy.yml` no GitHub
- [ ] Obter CLOUDFLARE_API_TOKEN
- [ ] Obter CLOUDFLARE_ACCOUNT_ID
- [ ] Adicionar secrets no GitHub
- [ ] Rodar workflow manualmente
- [ ] Aguardar 2-3 min
- [ ] Testar dashboard
- [ ] Criar evidências DeltaPag
- [ ] Enviar IDs para DeltaPag

## 🔗 LINKS RÁPIDOS

**GitHub:**
- Repositório: https://github.com/kainow252-cmyk/Cadastro
- Actions: https://github.com/kainow252-cmyk/Cadastro/actions
- Secrets: https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions

**Cloudflare:**
- Dashboard: https://dash.cloudflare.com
- API Tokens: https://dash.cloudflare.com/profile/api-tokens
- Pages: https://dash.cloudflare.com/pages

**Aplicação:**
- Dashboard: https://gerenciador.corretoracorporate.com.br/dashboard
- Produção: https://gerenciador.corretoracorporate.com.br

## ⚡ POR QUE ISSO FUNCIONA?

| Recurso | Sandbox | GitHub Actions |
|---------|---------|----------------|
| CPU | 1 core | **4 cores** ✅ |
| RAM | 512MB | **16GB** ✅ |
| Timeout | 5 min | **6 horas** ✅ |
| Build | ❌ Trava | ✅ 2-3 min |

## 🆘 PROBLEMAS?

**"Não consigo criar token Cloudflare"**
- Use o computador em modo desktop no navegador
- Ou peça ajuda a alguém com PC

**"Workflow não roda"**
- Verifique se adicionou os 2 secrets
- Nomes devem ser EXATAMENTE:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

**"Build falhou"**
- Veja os logs em: https://github.com/kainow252-cmyk/Cadastro/actions
- Copie o erro e me envie

---

**RESUMO**: Use GitHub Actions. É a única forma que funciona via mobile! 🚀
