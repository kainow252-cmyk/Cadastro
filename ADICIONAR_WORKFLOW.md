# 🚀 Como Adicionar o Workflow do GitHub Actions

## ✅ Código JÁ ESTÁ NO GITHUB!

URL: https://github.com/kainow252-cmyk/Cadastro

## 📋 Agora Você Precisa Fazer (3 Passos)

### Passo 1: Criar o Workflow

**No navegador do celular:**

1. Acesse: https://github.com/kainow252-cmyk/Cadastro
2. Clique em **"Add file"** → **"Create new file"**
3. No nome do arquivo digite: `.github/workflows/deploy.yml`
4. Cole o conteúdo abaixo:

```yaml
name: Build and Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Build and Deploy
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: corretoracorporate
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: main
      
      - name: Deployment Summary
        run: |
          echo "✅ Build e Deploy concluídos com sucesso!"
          echo ""
          echo "🔗 URLs:"
          echo "- Produção: https://gerenciador.corretoracorporate.com.br"
          echo "- Dashboard: https://gerenciador.corretoracorporate.com.br/dashboard"
```

5. Clique em **"Commit new file"**

### Passo 2: Configurar Secrets

1. Vá em: **Settings** → **Secrets and variables** → **Actions**
2. Clique em **"New repository secret"**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Secret: (seu token da Cloudflare)
- Clique em **"Add secret"**

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Secret: (seu Account ID)
- Clique em **"Add secret"**

**Como obter os valores:**
- Token: https://dash.cloudflare.com/profile/api-tokens
  - Clique em "Create Token"
  - Use template "Edit Cloudflare Workers"
  - Copie o token gerado
  
- Account ID: https://dash.cloudflare.com
  - No lado direito da página
  - Copie o "Account ID"

### Passo 3: Rodar o Workflow

**Opção A - Automático:**
- Faça qualquer alteração no código
- Commit e push
- GitHub Actions roda automaticamente

**Opção B - Manual (RECOMENDADO AGORA):**
1. Vá em: https://github.com/kainow252-cmyk/Cadastro/actions
2. Clique em **"Build and Deploy to Cloudflare Pages"**
3. Clique em **"Run workflow"**
4. Selecione branch **"main"**
5. Clique em **"Run workflow"**

## 📊 Acompanhar o Deploy

1. Vá em: https://github.com/kainow252-cmyk/Cadastro/actions
2. Clique no workflow em andamento (círculo amarelo)
3. Veja os logs em tempo real
4. Aguarde ✅ verde (2-3 minutos)

## 🎯 Depois do Deploy

1. Acesse: https://gerenciador.corretoracorporate.com.br/dashboard
2. Login: `admin` / `admin123`
3. Clique em "💳 Cartão Crédito"
4. Clique no botão laranja "📧 Criar Evidências"
5. Copie os 5 IDs DeltaPag
6. Envie para equipe DeltaPag (use template em EVIDENCIAS_DELTAPAG.md)

## 🔗 Links Rápidos

- **Repositório**: https://github.com/kainow252-cmyk/Cadastro
- **Actions**: https://github.com/kainow252-cmyk/Cadastro/actions
- **Settings**: https://github.com/kainow252-cmyk/Cadastro/settings
- **Secrets**: https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions
- **Cloudflare**: https://dash.cloudflare.com

## ✅ Checklist

- [x] Código enviado para GitHub ✅
- [ ] Criar workflow (.github/workflows/deploy.yml)
- [ ] Adicionar CLOUDFLARE_API_TOKEN
- [ ] Adicionar CLOUDFLARE_ACCOUNT_ID
- [ ] Rodar workflow manualmente
- [ ] Aguardar 2-3 min
- [ ] Testar dashboard
- [ ] Criar evidências DeltaPag

---

**Status**: Código no GitHub, falta adicionar workflow + secrets
**Próximo**: Criar arquivo deploy.yml no GitHub
