-- Criar tabela para credenciais de login de subcontas
-- Separada da tabela users (que é para admins)

CREATE TABLE IF NOT EXISTS subaccount_credentials (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  account_id TEXT UNIQUE NOT NULL,  -- ID da subconta no Asaas
  account_name TEXT NOT NULL,
  account_email TEXT NOT NULL,
  login_username TEXT UNIQUE NOT NULL,
  login_password TEXT NOT NULL,
  login_enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  wallet_id TEXT
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_subaccount_credentials_username ON subaccount_credentials(login_username);
CREATE INDEX IF NOT EXISTS idx_subaccount_credentials_account_id ON subaccount_credentials(account_id);
CREATE INDEX IF NOT EXISTS idx_subaccount_credentials_enabled ON subaccount_credentials(login_enabled);
