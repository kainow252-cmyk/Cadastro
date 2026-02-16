-- ============================================================================
-- SCHEMA DO BANCO DE DADOS GERENCIADOR ASAAS
-- Execute este SQL no Console do Cloudflare D1
-- ============================================================================

-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões (para autenticação JWT)
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

-- Tabela de cache de subcontas (opcional - para performance)
CREATE TABLE IF NOT EXISTS cached_accounts (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT,
  data TEXT NOT NULL, -- JSON com todos os dados
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_cached_accounts_wallet ON cached_accounts(wallet_id);
CREATE INDEX IF NOT EXISTS idx_cached_accounts_updated ON cached_accounts(last_updated);

-- Inserir usuário admin padrão (senha: admin123)
-- Hash bcrypt para 'admin123': $2b$10$rGHqZqvVqpYQxW4K8YXZJeDdAzQ8vZ4QKU.FjKLmPkNlT0pYvZDnq
INSERT OR IGNORE INTO admin_users (id, username, password_hash, email) 
VALUES (1, 'admin', '$2b$10$rGHqZqvVqpYQxW4K8YXZJeDdAzQ8vZ4QKU.FjKLmPkNlT0pYvZDnq', 'admin@gerenciador.local');

-- Log inicial do sistema
INSERT INTO activity_logs (user_id, action, details, ip_address)
VALUES (1, 'SYSTEM_INIT', 'Banco de dados inicializado', '127.0.0.1');
