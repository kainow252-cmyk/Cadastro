# 📱 INSTRUÇÕES - Como Fazer Deploy (Mobile)

## 🎯 SOLUÇÃO: GitHub Actions (Automático)

Criei um workflow do GitHub que faz tudo automaticamente! 🚀

## ✅ O QUE VOCÊ PRECISA FAZER (3 Passos Rápidos)

### Passo 1️⃣: Autorizar GitHub (GenSpark)

**No seu celular:**
1. Abra o GenSpark
2. Vá na aba **#github** (ícone do gato)
3. Clique em **"Connect GitHub"**
4. Faça login no GitHub
5. Autorize o acesso

### Passo 2️⃣: Configurar Secrets (GitHub.com)

**No navegador do celular:**
1. Acesse: https://github.com/SEU-USER/SEU-REPO/settings/secrets/actions
2. Clique em **"New repository secret"**

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Secret: Seu token Cloudflare
- Clique em **Add secret**

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`  
- Secret: Seu Account ID
- Clique em **Add secret**

**Como pegar os valores:**
- Token: https://dash.cloudflare.com/profile/api-tokens
- Account ID: https://dash.cloudflare.com (lado direito)

### Passo 3️⃣: Fazer Push (GenSpark)

**De volta ao GenSpark:**

No chat, peça:
```
"Fazer push para o GitHub"
```

Ou execute manualmente (se possível):
```bash
git push origin main
```

## 🎬 O Que Acontece Depois

1. ⚡ GitHub detecta o push
2. 🖥️ Inicia máquina Ubuntu (4 cores, 16GB)
3. 📦 Instala dependências
4. 🔨 Faz build (2-3 minutos)
5. 🚀 Deploy para Cloudflare
6. ✅ **PRONTO!**

## 📊 Acompanhar o Deploy

No navegador:
1. Vá em: https://github.com/SEU-USER/SEU-REPO/actions
2. Clique no workflow em andamento
3. Veja os logs em tempo real
4. Aguarde ✅ verde (sucesso)

## 🎯 Depois do Deploy

**Acesse:**
https://gerenciador.corretoracorporate.com.br/dashboard

**Login:**
- User: `admin`
- Pass: `admin123`

**Gerar Evidências DeltaPag:**
1. Clique em "💳 Cartão Crédito"
2. Clique no botão laranja **"📧 Criar Evidências"**
3. Aguarde 30-60 segundos
4. Copie os 5 IDs DeltaPag que aparecerem
5. Envie para equipe DeltaPag

**Template email:** Ver arquivo `EVIDENCIAS_DELTAPAG.md`

## ⚠️ Troubleshooting

**"GitHub não conectado"**
- Autorize no #github tab do GenSpark

**"Secret not found"**
- Adicione os 2 secrets no GitHub.com

**"Build failed"**
- Veja os logs no GitHub Actions
- Me chame se precisar ajuda

**"Deploy failed"**
- Verifique se os tokens estão corretos
- Verifique se tem permissão no projeto Cloudflare

## 💡 Por Que Funciona Agora?

| Sandbox | GitHub Actions |
|---------|---------------|
| 1 core | 4 cores |
| 512MB | 16GB RAM |
| Trava | ✅ Funciona |
| 5 min timeout | 6 horas |

**GitHub Actions tem recursos suficientes para compilar o arquivo grande!**

## 📋 Checklist Rápido

- [ ] Autorizar GitHub no GenSpark
- [ ] Adicionar CLOUDFLARE_API_TOKEN no GitHub
- [ ] Adicionar CLOUDFLARE_ACCOUNT_ID no GitHub  
- [ ] Fazer push (git push origin main)
- [ ] Aguardar 2-3 min (GitHub Actions)
- [ ] Testar no dashboard
- [ ] Criar evidências DeltaPag
- [ ] Enviar IDs para equipe DeltaPag

## 🔗 Links Rápidos

- **GitHub Repo**: https://github.com/SEU-USER/SEU-REPO
- **GitHub Actions**: /actions
- **Cloudflare**: https://dash.cloudflare.com
- **Dashboard**: https://gerenciador.corretoracorporate.com.br/dashboard

---

**Data**: 2026-02-19  
**Status**: ✅ GitHub Actions configurado  
**Próximo**: Autorizar GitHub + Configurar secrets + Push

🎉 **Depois disso, todo push fará deploy automático!**
