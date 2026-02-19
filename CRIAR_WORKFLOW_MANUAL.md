# 🔧 Como Criar o Workflow Manualmente

## ❌ Por que não consegui fazer push?

O GitHub App não tem permissão para criar arquivos `.github/workflows/` por segurança.

**Você precisa fazer isso manualmente via interface web do GitHub.**

---

## ✅ SOLUÇÃO MAIS SIMPLES

### **Passo 1: Fazer Login**

1. Acesse: https://github.com
2. **Certifique-se** de estar logado como: **kainow252-cmyk**
3. Se não estiver, faça logout e login novamente

---

### **Passo 2: Acessar o Repositório**

👉 **https://github.com/kainow252-cmyk/Cadastro**

---

### **Passo 3: Ativar GitHub Actions**

1. Clique na aba **"Actions"** (no topo)
2. Se aparecer um botão **"I understand my workflows, go ahead and enable them"**, clique nele
3. Depois clique em **"set up a workflow yourself"** (link azul)

---

### **Passo 4: Colar o Código**

Apague tudo que estiver no editor e cole este código:

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

---

### **Passo 5: Commit**

1. No campo "Commit new file", pode deixar o nome padrão
2. Clique em **"Commit changes"** (botão verde)

---

## 🎯 PRÓXIMO PASSO: Configurar Secrets

Após criar o workflow, você precisa adicionar os secrets:

### **1. Obter Token Cloudflare**

👉 **https://dash.cloudflare.com/profile/api-tokens**

1. Clique: **Create Token**
2. Use template: **Edit Cloudflare Workers**
3. Clique: **Continue to summary** → **Create Token**
4. **COPIE O TOKEN** ⚠️ (só aparece uma vez!)

---

### **2. Obter Account ID**

👉 **https://dash.cloudflare.com**

- Lado direito da página
- Copie o **Account ID**

---

### **3. Adicionar no GitHub**

👉 **https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions**

Clique em **"New repository secret"**

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

## 🚀 RODAR O WORKFLOW

Após adicionar os secrets:

1. Vá para: https://github.com/kainow252-cmyk/Cadastro/actions
2. Clique em **"Build and Deploy"**
3. Clique em **"Run workflow"** → **"Run workflow"**
4. Aguarde 2-3 minutos ⏳
5. ✅ Pronto!

---

## 🎯 TESTAR O DEPLOY

1. Acesse: https://gerenciador.corretoracorporate.com.br/dashboard
2. Login: **admin** / **admin123**
3. Clique: **💳 Cartão Crédito**
4. Clique: **📧 Criar Evidências**
5. Copie os 5 IDs DeltaPag
6. Envie para equipe DeltaPag

---

## 📋 CHECKLIST COMPLETO

```
☐ 1. Fazer login no GitHub como kainow252-cmyk
☐ 2. Acessar https://github.com/kainow252-cmyk/Cadastro
☐ 3. Clicar em "Actions"
☐ 4. Ativar Actions se necessário
☐ 5. Clicar em "set up a workflow yourself"
☐ 6. Colar código YAML
☐ 7. Commit
☐ 8. Obter CLOUDFLARE_API_TOKEN
☐ 9. Obter CLOUDFLARE_ACCOUNT_ID
☐ 10. Adicionar secrets
☐ 11. Rodar workflow
☐ 12. Aguardar 2-3 min
☐ 13. Testar dashboard
☐ 14. Criar evidências
☐ 15. Enviar para DeltaPag
```

---

## 🔗 LINKS RÁPIDOS

| Item | Link |
|------|------|
| Repositório | https://github.com/kainow252-cmyk/Cadastro |
| Actions | https://github.com/kainow252-cmyk/Cadastro/actions |
| Token CF | https://dash.cloudflare.com/profile/api-tokens |
| Account ID | https://dash.cloudflare.com |
| Secrets | https://github.com/kainow252-cmyk/Cadastro/settings/secrets/actions |
| Dashboard | https://gerenciador.corretoracorporate.com.br/dashboard |

---

**💡 DICA**: Se o GitHub continuar pedindo fork, é porque você **não está logado** na conta `kainow252-cmyk` ou está usando um navegador em modo anônimo/privado.

---

**🎯 PRIORIDADE AGORA:**
1. Fazer login correto no GitHub
2. Criar o workflow via Actions tab
3. Adicionar secrets
4. Rodar!

Boa sorte! 🚀
