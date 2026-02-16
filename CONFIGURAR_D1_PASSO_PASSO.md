# 🗄️ CONFIGURAR CLOUDFLARE D1 - PASSO A PASSO

## ⚠️ PROBLEMA ATUAL

Seu token API não tem permissões para Cloudflare D1:

```
❌ Cloudflare D1:Read   (faltando)
❌ Cloudflare D1:Edit   (faltando)
```

**Erro recebido**:
```
Authentication error [code: 10000]
A request to the Cloudflare API (/accounts/.../d1/database) failed.
```

---

## 🎯 SOLUÇÃO COMPLETA (3 PASSOS)

### **PASSO 1: ADICIONAR PERMISSÕES D1 AO TOKEN** (5 min)

#### **1.1. Acessar API Tokens**
```
https://dash.cloudflare.com/profile/api-tokens
```

#### **1.2. Encontrar Seu Token**
- Procure o token que termina em `...U8Kbi`
- Clique no ícone de **lápis** (Edit)

#### **1.3. Adicionar Permissões**

Na seção **"Permissions"**, adicione:

```
Account Permissions:
  ✅ Account Settings:Read        (já tem)
  ➕ Cloudflare D1:Read           (ADICIONAR)
  ➕ Cloudflare D1:Edit           (ADICIONAR)
  ✅ Cloudflare Workers:Read      (já tem)
  ✅ Cloudflare Workers:Edit      (já tem)

Zone Permissions:
  ✅ Zone:Read                    (já tem)
```

**Como adicionar**:
1. Clicar em **"+ Add more"** na seção Account Permissions
2. Selecionar: **Cloudflare D1** → **Read**
3. Clicar em **"+ Add more"** novamente
4. Selecionar: **Cloudflare D1** → **Edit**

#### **1.4. Salvar**
1. Clicar em **"Continue to summary"**
2. Revisar as novas permissões
3. Clicar em **"Update Token"**

#### **1.5. Atualizar no Sistema**
⚠️ **Se o token mudar**, você precisará:
1. Copiar o novo token
2. Remover a API Key antiga no sistema
3. Adicionar a nova API Key

**IMPORTANTE**: Geralmente só adicionar permissões **NÃO muda o token**, mas se mudar, você verá o novo token na tela.

---

### **PASSO 2: CRIAR BANCO DE DADOS D1** (5 min)

Depois de adicionar as permissões, execute os comandos:

#### **2.1. Criar Database de Produção**
```bash
cd /home/user/webapp
npx wrangler d1 create gerenciador-asaas-db
```

**Saída esperada**:
```
✅ Successfully created DB 'gerenciador-asaas-db'!

Add the following to your wrangler.toml:

[[d1_databases]]
binding = "DB"
database_name = "gerenciador-asaas-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**⚠️ IMPORTANTE**: Copie o `database_id` que aparecerá!

#### **2.2. Atualizar wrangler.jsonc**

Abra o arquivo `wrangler.jsonc` e atualize:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-02-14",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gerenciador-asaas-db",
      "database_id": "COLE-O-ID-AQUI"  // ← Colar o ID que você copiou
    }
  ]
}
```

---

### **PASSO 3: CRIAR TABELAS (SCHEMA)** (5 min)

#### **3.1. Criar Diretório de Migrations**
```bash
cd /home/user/webapp
mkdir -p migrations
```

#### **3.2. Criar Arquivo de Schema**
```bash
cat > migrations/0001_initial_schema.sql << 'EOF'
-- Tabela de Usuários Admin
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Tabela de Logs de Atividades
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
EOF
```

#### **3.3. Aplicar Migrations (Local)**
```bash
npx wrangler d1 migrations apply gerenciador-asaas-db --local
```

**Saída esperada**:
```
🌀 Executing on local database gerenciador-asaas-db...
🌀 To execute on your remote database, add a --remote flag to your wrangler command.

🚣 Executed 1 migration(s) in 0.12s
```

#### **3.4. Aplicar Migrations (Produção)**
```bash
npx wrangler d1 migrations apply gerenciador-asaas-db --remote
```

**Saída esperada**:
```
🌀 Executing on remote database gerenciador-asaas-db...
🚣 Executed 1 migration(s) in 0.54s
✅ Success!
```

---

## 🧪 TESTAR D1

### **Teste 1: Listar Databases**
```bash
npx wrangler d1 list
```

**Saída esperada**:
```
┌──────────────────────────┬──────────────────────────────────────┐
│ name                     │ uuid                                 │
├──────────────────────────┼──────────────────────────────────────┤
│ gerenciador-asaas-db     │ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx │
└──────────────────────────┴──────────────────────────────────────┘
```

### **Teste 2: Executar Query Local**
```bash
npx wrangler d1 execute gerenciador-asaas-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Saída esperada**:
```
🌀 Executing on local database gerenciador-asaas-db...

┌─────────────────────┐
│ name                │
├─────────────────────┤
│ admin_users         │
│ sessions            │
│ activity_logs       │
└─────────────────────┘
```

### **Teste 3: Executar Query Remota**
```bash
npx wrangler d1 execute gerenciador-asaas-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📊 ESTRUTURA DO BANCO

### **Tabelas Criadas**

#### **1. admin_users**
Armazena usuários administradores:
```sql
- id: INTEGER PRIMARY KEY
- username: TEXT UNIQUE (login)
- password_hash: TEXT (senha criptografada)
- created_at: DATETIME
```

#### **2. sessions**
Armazena sessões ativas:
```sql
- id: TEXT PRIMARY KEY
- user_id: INTEGER (referência ao admin_users)
- token: TEXT UNIQUE (JWT token)
- expires_at: DATETIME
- created_at: DATETIME
```

#### **3. activity_logs**
Logs de atividades do sistema:
```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (quem fez a ação)
- action: TEXT (tipo de ação)
- details: TEXT (detalhes JSON)
- ip_address: TEXT
- created_at: DATETIME
```

---

## 🔧 COMANDOS ÚTEIS D1

### **Listar Databases**
```bash
npx wrangler d1 list
```

### **Informações do Database**
```bash
npx wrangler d1 info gerenciador-asaas-db
```

### **Executar SQL Local**
```bash
npx wrangler d1 execute gerenciador-asaas-db --local --command="SELECT * FROM admin_users;"
```

### **Executar SQL Remoto**
```bash
npx wrangler d1 execute gerenciador-asaas-db --remote --command="SELECT * FROM admin_users;"
```

### **Executar Arquivo SQL**
```bash
npx wrangler d1 execute gerenciador-asaas-db --local --file=./seed.sql
```

### **Backup do Database**
```bash
npx wrangler d1 export gerenciador-asaas-db --local --output=backup.sql
```

### **Console Interativo (Local)**
```bash
npx wrangler d1 execute gerenciador-asaas-db --local
```

### **Deletar Database** (Cuidado!)
```bash
npx wrangler d1 delete gerenciador-asaas-db
```

---

## 📝 SCRIPTS ÚTEIS

Adicione ao `package.json`:

```json
{
  "scripts": {
    "db:create": "wrangler d1 create gerenciador-asaas-db",
    "db:list": "wrangler d1 list",
    "db:info": "wrangler d1 info gerenciador-asaas-db",
    "db:migrate:local": "wrangler d1 migrations apply gerenciador-asaas-db --local",
    "db:migrate:remote": "wrangler d1 migrations apply gerenciador-asaas-db --remote",
    "db:console:local": "wrangler d1 execute gerenciador-asaas-db --local",
    "db:console:remote": "wrangler d1 execute gerenciador-asaas-db --remote",
    "db:backup:local": "wrangler d1 export gerenciador-asaas-db --local --output=backup.sql",
    "db:seed:local": "wrangler d1 execute gerenciador-asaas-db --local --file=./seed.sql"
  }
}
```

Uso:
```bash
npm run db:list
npm run db:migrate:local
npm run db:console:local
```

---

## 🔄 INTEGRAR D1 NO CÓDIGO

### **Atualizar Type Bindings**

Arquivo: `src/index.tsx` (ou onde estiver o código Hono)

```typescript
import { Hono } from 'hono'

// Definir tipos para D1
type Bindings = {
  DB: D1Database;
  ASAAS_API_KEY: string;
  ASAAS_API_URL: string;
  // ... outras env vars
}

const app = new Hono<{ Bindings: Bindings }>()

// Exemplo de uso
app.get('/api/admin/users', async (c) => {
  const { DB } = c.env
  
  const result = await DB.prepare(
    'SELECT id, username, created_at FROM admin_users'
  ).all()
  
  return c.json({ users: result.results })
})
```

---

## ⚠️ IMPORTANTE: ESTE PROJETO NÃO USA D1 ATUALMENTE

**O sistema atual funciona sem D1**:
- ✅ Dados armazenados na API Asaas
- ✅ Sessões usando JWT em memória
- ✅ Sem persistência local necessária

**Você só precisa D1 se quiser**:
- 🔄 Cache de dados Asaas
- 📊 Analytics locais
- 🗂️ Logs de atividades persistentes
- 👥 Múltiplos usuários admin

---

## 📊 RESUMO

### **Você JÁ PODE fazer deploy SEM D1!**

**Para usar D1 (OPCIONAL)**:
1. ⏱️ Adicionar permissões D1 ao token (5 min)
2. ⏱️ Criar database (5 min)
3. ⏱️ Criar schema (5 min)
4. ⏱️ Integrar no código (30 min)

**Total**: ~45 minutos

**Para fazer deploy SEM D1 (ATUAL)**:
1. ✅ Token atual funciona
2. ✅ Código já funciona
3. ✅ Deploy imediato

**Total**: ~10 minutos

---

## 🎯 DECISÃO

**Você decide**:

**A)** Fazer deploy AGORA sem D1? → **Prosseguir com deploy**

**B)** Configurar D1 primeiro? → **Seguir este guia**

---

**Status**: Guia completo de D1 criado!  
**Recomendação**: Deploy primeiro, D1 depois (opcional)

**Data**: 16/02/2026  
**Arquivo**: `/home/user/webapp/CONFIGURAR_D1_PASSO_PASSO.md`

