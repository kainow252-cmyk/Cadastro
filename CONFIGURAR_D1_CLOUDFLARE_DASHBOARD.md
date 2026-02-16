# 🎯 Guia: Configurar D1 no Cloudflare Pages Dashboard

## 📋 Informações para Copiar e Colar

### 🗄️ Binding do Banco de Dados D1

Quando você ver a tela **"Configure uma vinculação a um banco de dados D1"**, preencha:

```
Nome da variável: DB
Banco de dados D1: [Selecione: gerenciador-asaas-db]
```

**Explicação:**
- **Nome da variável (binding):** `DB` - Este é o nome que o código usa para acessar o banco
- **Banco de dados D1:** Você precisa PRIMEIRO criar o banco via console

---

## 🚀 Passo a Passo Completo

### ⚠️ IMPORTANTE: Você NÃO pode criar o D1 ainda!

Seu token API atual **NÃO TEM** as permissões necessárias:
- ❌ Cloudflare D1:Read
- ❌ Cloudflare D1:Edit

Você tem 2 opções:

---

## 📍 Opção A: Deploy SEM D1 (Recomendado - 10 minutos)

### ✅ Vantagens:
- Deploy rápido
- Sistema 100% funcional
- Pode adicionar D1 depois

### 📝 Passos:

1. **Criar projeto no Cloudflare Pages**
   ```bash
   npx wrangler pages project create gerenciador-asaas --production-branch main
   ```

2. **Build do projeto**
   ```bash
   cd /home/user/webapp
   npm run build
   ```

3. **Deploy**
   ```bash
   npx wrangler pages deploy dist --project-name gerenciador-asaas
   ```

4. **Configurar Variáveis de Ambiente no Dashboard**
   - Acesse: https://dash.cloudflare.com
   - Navegue: Workers & Pages → gerenciador-asaas → Settings → Environment variables
   - Adicione as seguintes variáveis (uma por uma):

   ```
   ASAAS_API_KEY=aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJjN2I5NTIwLTU5YTUtNDg3NS05ZGIzLWMzYzk5YTdlMTJkZjo6JGFhY2hfMTNjN2U2YmMtMDhlOC00M2YyLTgyNjEtMzI0YzZhNjBlYTU1
   ASAAS_API_URL=https://api.asaas.com/v3
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao
   MAILERSEND_API_KEY=mlsn.ae314393b75a2a0588bcd6d6f4a235f658f9a8ad28b5be49b3800518fde78fbc
   MAILERSEND_FROM_EMAIL=noreply@trial-0r83ql3x7v3lzw1j.mlsender.net
   MAILERSEND_FROM_NAME=Gerenciador Asaas
   ```

5. **Configurar Domínio Customizado**
   - No mesmo dashboard: Custom domains → Add custom domain
   - Digite: `cadastro.corretoracorporate.com.br`
   - Siga as instruções de DNS

---

## 📍 Opção B: Adicionar D1 ANTES do Deploy (45 minutos)

### ✅ Vantagens:
- Banco de dados SQLite global
- Cache local
- Analytics e logs persistentes
- Suporte a múltiplos admins

### 📝 Passos:

#### 1️⃣ Adicionar Permissões ao Token API

1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Localize seu token atual: `ATBOK...U8Kbi`
3. Clique em **"Edit"** (Editar)
4. Na seção **"Permissions"** (Permissões), adicione:
   - **Account** → **D1** → **Read** ✅
   - **Account** → **D1** → **Edit** ✅
5. Clique em **"Continue to summary"** → **"Save"**

#### 2️⃣ Criar o Banco de Dados D1

```bash
# Criar o banco
npx wrangler d1 create gerenciador-asaas-db
```

**Você receberá uma saída assim:**
```
✅ Successfully created DB 'gerenciador-asaas-db'!

[[d1_databases]]
binding = "DB"
database_name = "gerenciador-asaas-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**⚠️ COPIE O `database_id` que aparecer!**

#### 3️⃣ Atualizar wrangler.jsonc

Edite o arquivo e substitua:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gerenciador-asaas-db",
      "database_id": "COLE-O-ID-AQUI"  // ← Cole o ID que você copiou
    }
  ]
}
```

#### 4️⃣ Criar Schema do Banco

```bash
mkdir -p migrations
```

Crie o arquivo `migrations/0001_initial_schema.sql`:

```sql
-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
```

#### 5️⃣ Aplicar Migrations

```bash
# Local (para desenvolvimento)
npx wrangler d1 migrations apply gerenciador-asaas-db --local

# Produção (para o banco remoto)
npx wrangler d1 migrations apply gerenciador-asaas-db --remote
```

#### 6️⃣ Deploy com D1

```bash
# Criar projeto
npx wrangler pages project create gerenciador-asaas --production-branch main

# Build
cd /home/user/webapp
npm run build

# Deploy
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

#### 7️⃣ Configurar no Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com
2. Navegue: Workers & Pages → gerenciador-asaas → Settings → Bindings
3. Na seção **"D1 database bindings"**:
   - Clique em **"Add binding"**
   - **Nome da variável:** `DB`
   - **Banco de dados D1:** Selecione `gerenciador-asaas-db` no dropdown
   - Clique em **"Save"**

4. Adicione as Environment Variables (mesmas da Opção A)

---

## 🎯 Resumo Comparativo

| Característica | Sem D1 (Opção A) | Com D1 (Opção B) |
|---|---|---|
| ⏱️ Tempo de deploy | ~10 minutos | ~45 minutos |
| ✅ Sistema funcional | 100% | 100% |
| 💾 Persistência local | ❌ (usa API Asaas) | ✅ SQLite global |
| 📊 Analytics | ❌ | ✅ |
| 📝 Logs persistentes | ❌ | ✅ |
| 👥 Múltiplos admins | ❌ | ✅ |
| 🚀 Pode adicionar D1 depois | ✅ | N/A |

---

## 💡 Recomendação

**Para deploy HOJE:** Escolha **Opção A** (sem D1)
- Sistema 100% funcional
- Deploy em 10 minutos
- Pode adicionar D1 depois se precisar

**Para sistema completo:** Escolha **Opção B** (com D1)
- Requer adicionar permissões ao token primeiro
- Tempo total: ~45 minutos
- Terá banco de dados persistente

---

## 📞 Próximos Passos

Escolha sua opção e me avise:
- **"Vamos com a Opção A"** → Deploy rápido agora
- **"Vamos com a Opção B"** → Vou te guiar passo a passo na configuração D1

---

## 📚 Arquivos de Referência

- `CONFIGURAR_D1_PASSO_PASSO.md` - Guia detalhado D1
- `CORRIGIR_API_KEY_CLOUDFLARE.md` - Como adicionar permissões D1
- `DEPLOY_CLOUDFLARE_DOMAIN.md` - Configuração de domínio customizado
- `PASSOS_DEPLOY.md` - Guia geral de deploy
- `README_DEPLOY_RAPIDO.txt` - Resumo executivo

---

## 🔑 Variáveis de Ambiente (para copiar)

```env
ASAAS_API_KEY=aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJjN2I5NTIwLTU5YTUtNDg3NS05ZGIzLWMzYzk5YTdlMTJkZjo6JGFhY2hfMTNjN2U2YmMtMDhlOC00M2YyLTgyNjEtMzI0YzZhNjBlYTU1
ASAAS_API_URL=https://api.asaas.com/v3
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao
MAILERSEND_API_KEY=mlsn.ae314393b75a2a0588bcd6d6f4a235f658f9a8ad28b5be49b3800518fde78fbc
MAILERSEND_FROM_EMAIL=noreply@trial-0r83ql3x7v3lzw1j.mlsender.net
MAILERSEND_FROM_NAME=Gerenciador Asaas
```

---

**Data:** 16/02/2026  
**Versão:** 3.1  
**Status:** Aguardando escolha de deploy
