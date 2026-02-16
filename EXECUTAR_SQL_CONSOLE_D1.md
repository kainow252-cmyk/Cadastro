# 🎯 Como Executar SQL no Console D1 do Cloudflare

## 📍 Você está AQUI:
✅ Console do banco `corretoracorporate-db` aberto  
✅ Campo de consulta SQL vazio esperando comandos  
✅ Botão "Executar" azul visível no canto direito  

---

## 🚀 Passo a Passo

### 1️⃣ Copie o SQL Completo

Copie TODO o SQL abaixo (Ctrl+A, Ctrl+C):

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

-- Tabela de logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Tabela de cache de subcontas
CREATE TABLE IF NOT EXISTS cached_accounts (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT,
  data TEXT NOT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_cached_accounts_wallet ON cached_accounts(wallet_id);
CREATE INDEX IF NOT EXISTS idx_cached_accounts_updated ON cached_accounts(last_updated);

-- Usuário admin padrão (admin/admin123)
INSERT OR IGNORE INTO admin_users (id, username, password_hash, email) 
VALUES (1, 'admin', '$2b$10$rGHqZqvVqpYQxW4K8YXZJeDdAzQ8vZ4QKU.FjKLmPkNlT0pYvZDnq', 'admin@gerenciador.local');

-- Log inicial
INSERT INTO activity_logs (user_id, action, details, ip_address)
VALUES (1, 'SYSTEM_INIT', 'Banco de dados inicializado', '127.0.0.1');
```

### 2️⃣ Cole no Campo de Consulta

- Clique no campo grande onde está escrito "Você pode inserir consultas SQL aqui"
- Cole o SQL copiado (Ctrl+V)

### 3️⃣ Clique em "Executar"

- Clique no botão azul **"Executar"** no canto direito
- Aguarde a execução (~5 segundos)

### 4️⃣ Verifique o Resultado

Você deve ver:
```
✅ Query executed successfully
```

---

## 🔍 Como Verificar se Funcionou

Execute estas consultas uma por uma para confirmar:

```sql
-- Ver todas as tabelas criadas
SELECT name FROM sqlite_master WHERE type='table';
```

```sql
-- Ver usuário admin criado
SELECT id, username, email, created_at FROM admin_users;
```

```sql
-- Ver logs do sistema
SELECT * FROM activity_logs;
```

---

## 📊 O Que Cada Tabela Faz

| Tabela | Função |
|--------|--------|
| **admin_users** | Armazena usuários admin do sistema |
| **sessions** | Gerencia sessões JWT de autenticação |
| **activity_logs** | Registra todas as ações no sistema |
| **cached_accounts** | Cache de subcontas Asaas para performance |

---

## ✅ Credenciais Criadas

Usuário admin padrão:
```
Username: admin
Password: admin123
```

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

---

## 🎯 Próximos Passos Após Executar

1. ✅ SQL executado com sucesso
2. ⏭️ Voltar para o dashboard do projeto
3. ⏭️ Configurar binding D1 (Nome: DB, Database: corretoracorporate-db)
4. ⏭️ Adicionar Environment Variables
5. ⏭️ Deploy final

---

## 🆘 Problemas?

**Erro de sintaxe:**
- Certifique-se de copiar TODO o SQL
- Não edite nenhuma linha
- Cole exatamente como está

**Erro "table already exists":**
- Tudo certo! Significa que já existe
- Pode continuar normalmente

**Timeout:**
- Execute em partes menores
- Primeiro: CREATE TABLE
- Depois: CREATE INDEX  
- Por último: INSERT

---

**Arquivo:** `/home/user/webapp/sql_console_cloudflare.sql`  
**Data:** 16/02/2026  
**Status:** Pronto para executar
