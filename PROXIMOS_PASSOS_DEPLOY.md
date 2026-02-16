# 🚀 Próximos Passos para Deploy - Gerenciador Asaas

## ✅ Status Atual

| Item | Status |
|------|--------|
| Código completo | ✅ 100% |
| Git repository | ✅ Pronto |
| Banco D1 criado | ✅ `corretoracorporate-db` |
| Schema D1 | ✅ 4 tabelas criadas |
| Usuário admin | ✅ admin/admin123 |

---

## 📍 Passo 1: Voltar para Settings do Projeto (2 minutos)

1. No Cloudflare Dashboard, navegue:
   - Workers & Pages
   - Seu projeto: `project-839f9256` (ou nome do projeto)
   - Aba: **Settings**
   - Seção: **Bindings**

2. Na seção **"D1 database bindings"**:
   - Clique em **"Add binding"**
   - **Nome da variável:** `DB`
   - **Banco de dados D1:** Selecione `corretoracorporate-db`
   - Clique em **"Save"**

---

## 📍 Passo 2: Configurar Environment Variables (5 minutos)

Na mesma página de Settings, procure a seção **"Environment variables"**:

Adicione as seguintes variáveis **uma por uma**:

### 🔑 Variáveis Obrigatórias:

```env
# API Asaas (Produção)
ASAAS_API_KEY=aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJjN2I5NTIwLTU5YTUtNDg3NS05ZGIzLWMzYzk5YTdlMTJkZjo6JGFhY2hfMTNjN2U2YmMtMDhlOC00M2YyLTgyNjEtMzI0YzZhNjBlYTU1

# URL da API Asaas
ASAAS_API_URL=https://api.asaas.com/v3

# Credenciais Admin (MUDE EM PRODUÇÃO!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# JWT Secret (GERE UM NOVO EM PRODUÇÃO!)
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao

# MailerSend
MAILERSEND_API_KEY=mlsn.ae314393b75a2a0588bcd6d6f4a235f658f9a8ad28b5be49b3800518fde78fbc
MAILERSEND_FROM_EMAIL=noreply@trial-0r83ql3x7v3lzw1j.mlsender.net
MAILERSEND_FROM_NAME=Gerenciador Asaas
```

### 📝 Como Adicionar:

Para cada variável:
1. Clique em **"Add variable"**
2. **Name:** Cole o nome (ex: `ASAAS_API_KEY`)
3. **Value:** Cole o valor
4. **Environment:** Selecione `Production` e `Preview`
5. Clique em **"Save"**

Repita para todas as 8 variáveis.

---

## 📍 Passo 3: Atualizar wrangler.jsonc Local (1 minuto)

Precisamos atualizar o `database_id` no arquivo `wrangler.jsonc`:

### 🔍 Descobrir o Database ID:

No Cloudflare Dashboard:
- Workers & Pages
- Lado esquerdo: **"Banco de dados SQL D1"**
- Clique em `corretoracorporate-db`
- Copie o **Database ID** (algo como `728ee55c-d607-4846-969a-741a4f0dfb82`)

### ✏️ Editar wrangler.jsonc:

Substitua `"database_id": "local"` pelo ID real:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "corretoracorporate-db",
      "database_id": "728ee55c-d607-4846-969a-741a4f0dfb82"  // ← SEU ID AQUI
    }
  ]
}
```

---

## 📍 Passo 4: Build do Projeto (1 minuto)

Execute no terminal:

```bash
cd /home/user/webapp
npm run build
```

Aguarde a mensagem:
```
✓ built in 1.01s
dist/_worker.js  184.09 kB
```

---

## 📍 Passo 5: Deploy para Cloudflare Pages (3 minutos)

### 5.1 - Criar Projeto (primeira vez):

```bash
npx wrangler pages project create gerenciador-asaas --production-branch main
```

### 5.2 - Deploy:

```bash
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

Aguarde a mensagem:
```
✨ Deployment complete!
🌍 https://gerenciador-asaas.pages.dev
```

---

## 📍 Passo 6: Configurar Domínio Customizado (30 minutos + 2-48h DNS)

### 6.1 - No Cloudflare Dashboard:

1. Workers & Pages → `gerenciador-asaas`
2. Aba **"Custom domains"**
3. Clique em **"Set up a custom domain"**
4. Digite: `cadastro.corretoracorporate.com.br`
5. Clique em **"Continue"**

### 6.2 - Configurar DNS:

O Cloudflare vai mostrar os registros DNS necessários. Você precisa:

**Opção A - Se o domínio já está no Cloudflare:**
- O DNS será configurado automaticamente ✅

**Opção B - Se o domínio está em outro lugar:**
- Adicione um registro CNAME no seu provedor DNS:
  ```
  Nome: cadastro
  Tipo: CNAME
  Valor: gerenciador-asaas.pages.dev
  ```

### 6.3 - Aguardar Propagação:

- DNS leva de 2 a 48 horas para propagar
- SSL será ativado automaticamente
- Você receberá uma notificação quando estiver pronto

---

## 📍 Passo 7: Testar o Deploy (5 minutos)

### 7.1 - URL Temporária:

```bash
curl https://gerenciador-asaas.pages.dev
```

Ou abra no navegador: `https://gerenciador-asaas.pages.dev`

### 7.2 - Fazer Login:

```
URL: https://gerenciador-asaas.pages.dev
Username: admin
Password: admin123
```

### 7.3 - Testar Funcionalidades:

1. ✅ Dashboard carrega
2. ✅ Criar subconta funciona
3. ✅ Gerar link de pagamento funciona
4. ✅ Ver subcontas funciona
5. ✅ Gerar QR Code funciona
6. ✅ Relatórios funcionam

---

## 🎯 Checklist Final

Antes de considerar o deploy completo:

- [ ] Binding D1 configurado (`DB` → `corretoracorporate-db`)
- [ ] 8 Environment Variables adicionadas
- [ ] `wrangler.jsonc` atualizado com database_id real
- [ ] Build executado com sucesso
- [ ] Deploy realizado (`https://gerenciador-asaas.pages.dev`)
- [ ] Login funciona (admin/admin123)
- [ ] Dashboard aparece após login
- [ ] Criar subconta funciona
- [ ] Gerar QR Code funciona
- [ ] Domínio customizado configurado
- [ ] DNS propagado (pode levar 2-48h)
- [ ] SSL ativo no domínio customizado

---

## 🔐 Segurança Pós-Deploy

### ⚠️ IMPORTANTE - Alterar em Produção:

Depois do deploy inicial, **MUDE IMEDIATAMENTE**:

1. **ADMIN_PASSWORD:**
   ```bash
   npx wrangler pages secret put ADMIN_PASSWORD --project-name gerenciador-asaas
   ```
   Digite uma senha forte!

2. **JWT_SECRET:**
   Gere um novo secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   
   Depois adicione via:
   ```bash
   npx wrangler pages secret put JWT_SECRET --project-name gerenciador-asaas
   ```

3. **No D1, atualize o password_hash do admin:**
   ```sql
   -- Primeiro, gere o hash da nova senha com bcrypt
   -- Depois execute:
   UPDATE admin_users 
   SET password_hash = 'NOVO_HASH_BCRYPT_AQUI' 
   WHERE username = 'admin';
   ```

---

## 📊 Timeline Estimado

| Passo | Tempo | Total Acumulado |
|-------|-------|-----------------|
| 1. Configurar binding D1 | 2 min | 2 min |
| 2. Adicionar env vars | 5 min | 7 min |
| 3. Atualizar wrangler.jsonc | 1 min | 8 min |
| 4. Build | 1 min | 9 min |
| 5. Deploy | 3 min | 12 min |
| 6. Configurar domínio | 5 min | 17 min |
| 7. Testar | 5 min | 22 min |
| **Total Trabalho Ativo** | **~25 minutos** | - |
| Propagação DNS | 2-48 horas | - |

---

## 🆘 Problemas Comuns

### Erro: "Cannot find binding DB"
**Solução:** Volte ao Passo 1 e configure o binding D1

### Erro: "ASAAS_API_KEY is undefined"
**Solução:** Volte ao Passo 2 e adicione as environment variables

### Erro 500 ao fazer login
**Solução:** Verifique o D1:
```sql
SELECT * FROM admin_users;
```
Se vazio, execute novamente o INSERT do usuário admin

### Dashboard em branco após login
**Solução:** Limpe o cache do navegador (Ctrl+Shift+R)

### Domínio customizado não funciona
**Solução:** Aguarde propagação DNS (24-48h) ou verifique os registros DNS

---

## 📞 Comandos Úteis

```bash
# Ver status do projeto
npx wrangler pages project list

# Ver deployments
npx wrangler pages deployment list --project-name gerenciador-asaas

# Ver logs em tempo real
npx wrangler pages deployment tail --project-name gerenciador-asaas

# Consultar D1
npx wrangler d1 execute corretoracorporate-db --command="SELECT * FROM admin_users"

# Ver secrets configurados
npx wrangler pages secret list --project-name gerenciador-asaas
```

---

**Pronto para começar o Passo 1?** 🚀

Vá para: Workers & Pages → Seu projeto → Settings → Bindings

**Me avise quando configurar o binding D1 para continuarmos!**
