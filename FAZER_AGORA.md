# 🚀 FAÇA AGORA (3 Passos)

## 📱 VIA CELULAR - 5 MINUTOS

---

## 1️⃣ CRIAR WORKFLOW (2 min)

### Abra no navegador:
👉 **https://github.com/kainow252-cmyk/Cadastro**

### Clique:
**Add file** → **Create new file**

### Nome do arquivo:
```
.github/workflows/deploy.yml
```

### Cole o código:
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

### Clique:
**Commit new file**

---

## 2️⃣ CONFIGURAR SECRETS (2 min)

### A) Obter Token Cloudflare:
👉 **https://dash.cloudflare.com/profile/api-tokens**

1. Clique: **Create Token**
2. Use template: **Edit Cloudflare Workers**
3. Clique: **Continue to summary** → **Create Token**
4. **COPIE O TOKEN** ⚠️ (só aparece uma vez!)

### B) Obter Account ID:
👉 **https://dash.cloudflare.com**

- Lado direito: **Account ID** (copie)

### C) Adicionar no GitHub:
👉 **https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions**

Clique: **New repository secret**

**Secret 1:**
```
Name: CLOUDFLARE_API_TOKEN
Value: (cole o token)
```

**Secret 2:**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: (cole o account ID)
```

---

## 3️⃣ RODAR WORKFLOW (1 min)

### Abra:
👉 **https://github.com/kainow252-cmyk/Cadastro/actions**

### Clique:
1. **Build and Deploy**
2. **Run workflow** → **Run workflow**
3. Aguarde **2-3 minutos** ⏳
4. ✅ **Pronto!**

---

## 🎯 APÓS O DEPLOY

### Teste o sistema:
👉 **https://gerenciador.corretoracorporate.com.br/dashboard**

Login:
```
Usuário: admin
Senha: admin123
```

### Criar evidências DeltaPag:
1. Clique: **💳 Cartão Crédito**
2. Clique: **📧 Criar Evidências** (botão laranja)
3. **Copie os 5 IDs DeltaPag**
4. Envie para equipe DeltaPag

---

## 🔗 LINKS DIRETOS

| Ação | Link |
|------|------|
| Criar arquivo | https://github.com/kainow252-cmyk/Cadastro |
| Token Cloudflare | https://dash.cloudflare.com/profile/api-tokens |
| Account ID | https://dash.cloudflare.com |
| Secrets GitHub | https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions |
| Rodar workflow | https://github.com/kainow252-cmyk/Cadastro/actions |
| Dashboard app | https://gerenciador.corretoracorporate.com.br/dashboard |

---

## ⚡ POR QUÊ?

**Sandbox não consegue compilar:**
- Arquivo `src/index.tsx`: **8.670 linhas** (376KB)
- Sandbox: 1 CPU, 512MB RAM → ❌ **TRAVA**
- GitHub Actions: 4 CPUs, 16GB RAM → ✅ **2-3 MIN**

---

## 🆘 PROBLEMAS?

**Não consigo criar token:**
- Ative "Modo Desktop" no navegador
- Ou peça ajuda a alguém com PC

**Workflow não roda:**
- Verifique os nomes dos secrets (exatos):
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

**Build falhou:**
- Veja logs: https://github.com/kainow252-cmyk/Cadastro/actions
- Me envie o erro

---

**✅ TUDO PRONTO! SIGA OS 3 PASSOS ACIMA** 🚀
