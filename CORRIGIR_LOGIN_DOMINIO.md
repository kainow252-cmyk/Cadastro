# 🔧 CORRIGIR LOGIN NO DOMÍNIO CUSTOMIZADO

## ❌ PROBLEMA IDENTIFICADO:

Login funciona em:
- ✅ Local (sandbox): https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
- ❌ Produção (domínio): https://cadastro.corretoracorporate.com.br

**Erro:** "Usuário ou senha inválidos"

---

## 🔍 CAUSA RAIZ:

As **Environment Variables** estão configuradas, mas podem estar:
1. Aplicadas apenas no environment "Preview"
2. Não aplicadas no environment "Production"
3. Deployment antigo sem as variáveis

---

## ✅ SOLUÇÃO 1 - Verificar Environment Variables

### 1️⃣ Acesse o Dashboard:

```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/settings/environment-variables
```

### 2️⃣ Verifique CADA Variável:

Para **CADA UMA** das 8 variáveis, verifique se está marcada como:
- ✅ **Production** ← DEVE ESTAR MARCADO!
- ✅ **Preview** ← Opcional, mas recomendado

**Variáveis que DEVEM ter Production marcado:**

1. ✅ `ASAAS_API_KEY` → Production ✓
2. ✅ `ASAAS_API_URL` → Production ✓
3. ✅ `ADMIN_USERNAME` → Production ✓
4. ✅ `ADMIN_PASSWORD` → Production ✓
5. ✅ `JWT_SECRET` → Production ✓
6. ✅ `MAILERSEND_API_KEY` → Production ✓
7. ✅ `MAILERSEND_FROM_EMAIL` → Production ✓
8. ✅ `MAILERSEND_FROM_NAME` → Production ✓

### 3️⃣ Se alguma NÃO tiver Production marcado:

1. Clique no ícone **✏️ (Edit)** da variável
2. Marque **"Production"** no dropdown "Environment"
3. Clique em **"Save"**

---

## ✅ SOLUÇÃO 2 - Verificar Binding D1

### 1️⃣ Acesse Bindings:

```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/settings/bindings
```

### 2️⃣ Verifique D1 Binding:

Na seção **"D1 database bindings"**, deve ter:

```
Variable name: DB
D1 database: corretoracorporate-db
Environment: Production ✓
```

### 3️⃣ Se não tiver ou estiver errado:

1. Clique em **"Edit"** ou **"Add binding"**
2. **Variable name:** `DB`
3. **D1 database:** Selecione `corretoracorporate-db`
4. **Environment:** Marque **"Production"**
5. Clique em **"Save"**

---

## ✅ SOLUÇÃO 3 - Re-deploy Forçado

Depois de verificar as variáveis e binding, faça um **re-deploy**:

### Opção A - Via Dashboard (Mais Fácil):

1. Acesse: https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/deployments
2. Localize o deployment: `0747b934-30d1-4399-95c8-6eea01bec7e9`
3. Clique no menu **⋮** (três pontos)
4. Clique em **"Retry deployment"** ou **"Redeploy"**
5. Aguarde ~2 minutos

### Opção B - Via CLI (se preferir):

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name project-839f9256
```

---

## ✅ SOLUÇÃO 4 - Teste com Credenciais Padrão

### Após re-deploy, teste com:

```
URL: https://cadastro.corretoracorporate.com.br/login
Username: admin
Password: admin123
```

### Credenciais alternativas (hint na tela):

A tela mostra:
```
Credenciais padrão: admin / admin123
```

Se mesmo assim não funcionar, pode ser cache do navegador.

---

## 🧹 SOLUÇÃO 5 - Limpar Cache

### No Navegador:

1. **Chrome/Edge:**
   - Pressione `Ctrl + Shift + Delete` (Win) ou `Cmd + Shift + Delete` (Mac)
   - Selecione "Cached images and files"
   - Clique em "Clear data"

2. **Ou tente:**
   - `Ctrl + Shift + R` (force refresh)
   - Aba anônima/privada
   - Outro navegador

### No Cloudflare (Purge Cache):

1. Acesse: https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/corretoracorporate.com.br/caching/configuration
2. Clique em **"Purge Everything"**
3. Confirme
4. Aguarde 30 segundos
5. Teste novamente

---

## 🔍 SOLUÇÃO 6 - Debug via Console

### Abra o Console do Navegador:

1. Pressione `F12`
2. Vá para a aba **"Console"**
3. Tente fazer login
4. Veja se aparece algum erro em vermelho

### Erros Comuns:

**❌ "Cannot read property 'env' of undefined"**
- Causa: Environment variables não configuradas
- Solução: Verifique Solução 1

**❌ "DB is not defined"**
- Causa: Binding D1 não configurado
- Solução: Verifique Solução 2

**❌ "401 Unauthorized"**
- Causa: Credenciais incorretas ou JWT_SECRET diferente
- Solução: Verifique se digitou `admin` / `admin123` corretamente

**❌ "500 Internal Server Error"**
- Causa: Erro no servidor, falta variável de ambiente
- Solução: Re-deploy (Solução 3)

---

## 📝 CHECKLIST DE VERIFICAÇÃO

Marque cada item conforme verifica:

### Environment Variables:
- [ ] ASAAS_API_KEY → Production ✓
- [ ] ASAAS_API_URL → Production ✓
- [ ] ADMIN_USERNAME → Production ✓
- [ ] ADMIN_PASSWORD → Production ✓
- [ ] JWT_SECRET → Production ✓
- [ ] MAILERSEND_API_KEY → Production ✓
- [ ] MAILERSEND_FROM_EMAIL → Production ✓
- [ ] MAILERSEND_FROM_NAME → Production ✓

### Bindings:
- [ ] D1 Binding: DB → corretoracorporate-db (Production ✓)

### Deployment:
- [ ] Re-deploy executado
- [ ] Aguardado 2-3 minutos
- [ ] Cache limpo

### Teste:
- [ ] Login testado: admin / admin123
- [ ] Console do navegador verificado
- [ ] Testado em aba anônima

---

## 🎯 SOLUÇÃO RÁPIDA (5 minutos)

Se você quer a solução mais rápida:

1. **Vá para Environment Variables:**
   ```
   https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/settings/environment-variables
   ```

2. **Para CADA variável, clique em Edit (✏️) e:**
   - Marque **"Production"**
   - Clique **"Save"**

3. **Vá para Bindings:**
   ```
   https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/settings/bindings
   ```

4. **Verifique D1 Binding:**
   - Se não existir, adicione: `DB` → `corretoracorporate-db` → **Production**

5. **Re-deploy:**
   - Deployments → Último deploy → Menu ⋮ → **Retry deployment**

6. **Aguarde 2 minutos e teste:**
   ```
   https://cadastro.corretoracorporate.com.br/login
   admin / admin123
   ```

---

## 🆘 SE AINDA NÃO FUNCIONAR

Execute este comando para eu ver os logs:

```bash
npx wrangler pages deployment tail --project-name project-839f9256
```

Depois tente fazer login novamente e me mostre os logs que aparecerem.

---

**Me avise qual solução você tentou e o resultado!**
