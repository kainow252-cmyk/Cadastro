# 🚀 Setup GitHub Actions - Deploy Automático

## ✅ Workflow Criado

Arquivo: `.github/workflows/deploy.yml`

**O que faz:**
- ✅ Build automático quando você faz push
- ✅ Deploy automático para Cloudflare Pages
- ✅ Roda em servidores do GitHub (recursos ilimitados)
- ✅ Build leva 2-3 minutos

## 📋 Configuração Necessária (3 Passos)

### Passo 1: Autorizar GitHub

No GenSpark:
1. Vá na aba **#github** 
2. Clique em **"Connect GitHub"**
3. Autorize o acesso

### Passo 2: Configurar Secrets no GitHub

No seu repositório GitHub:

1. Vá em **Settings** → **Secrets and variables** → **Actions**

2. Adicione 2 secrets:

**Secret 1: CLOUDFLARE_API_TOKEN**
- Nome: `CLOUDFLARE_API_TOKEN`
- Valor: Seu token da Cloudflare
- Como obter:
  1. https://dash.cloudflare.com/profile/api-tokens
  2. **Create Token** → **Edit Cloudflare Workers** template
  3. Copie o token

**Secret 2: CLOUDFLARE_ACCOUNT_ID**
- Nome: `CLOUDFLARE_ACCOUNT_ID`  
- Valor: Seu Account ID da Cloudflare
- Como obter:
  1. https://dash.cloudflare.com
  2. No lado direito, copie **Account ID**

### Passo 3: Fazer Push

No GenSpark ou terminal local:
```bash
git add .
git commit -m "feat: Add GitHub Actions auto-deploy"
git push origin main
```

## 🎯 Como Funciona

### Trigger Automático

Quando você fizer `git push`:
1. GitHub Actions detecta o push
2. Inicia VM Ubuntu (16 GB RAM, 4 cores)
3. Instala Node.js 18
4. Roda `npm ci` (instalar deps)
5. Roda `npm run build` (2-3 min)
6. Faz deploy para Cloudflare Pages
7. ✅ Site atualizado!

### Trigger Manual

Você também pode rodar manualmente:
1. Vá em **Actions** no GitHub
2. Selecione **Build and Deploy to Cloudflare Pages**
3. Clique em **Run workflow**
4. Escolha branch `main`
5. Clique em **Run workflow**

## 📊 Monitorar o Deploy

1. Vá em **Actions** no seu repositório
2. Clique no workflow em andamento
3. Veja os logs em tempo real
4. Aguarde ✅ verde (sucesso) ou ❌ vermelho (erro)

## 🔍 Troubleshooting

### Erro: "Repository not found"
- Autorize o GitHub no GenSpark primeiro

### Erro: "Secret not found"
- Adicione os 2 secrets no GitHub

### Erro: "Build failed"
- Veja os logs no GitHub Actions
- Pode ser falta de memória (improvável no GitHub)

### Erro: "Deploy failed"
- Verifique se o token Cloudflare está correto
- Verifique se o Account ID está correto

## ✅ Vantagens do GitHub Actions

| Item | Sandbox | GitHub Actions |
|------|---------|----------------|
| CPU | 1 core | 4 cores |
| RAM | 512 MB | 16 GB |
| Timeout | 5 min | 6 horas |
| Build | ❌ Trava | ✅ 2-3 min |
| Custo | Grátis | Grátis (2000 min/mês) |

## 📝 Próximos Passos

Depois que o deploy funcionar:

1. ✅ Acesse: https://gerenciador.corretoracorporate.com.br/dashboard
2. ✅ Login: `admin` / `admin123`
3. ✅ Abra "Cartão Crédito"
4. ✅ Clique em "Criar Evidências" (botão laranja)
5. ✅ Copie os 5 IDs DeltaPag
6. ✅ Envie para equipe DeltaPag

Use o template em `EVIDENCIAS_DELTAPAG.md`

## 🔗 Links Úteis

- **GitHub Actions**: https://github.com/seu-repo/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Cloudflare Pages**: https://dash.cloudflare.com/pages
- **Documentação**: EVIDENCIAS_DELTAPAG.md

---

**Criado**: 2026-02-19  
**Status**: ✅ Pronto para usar  
**Build**: Automático no push
