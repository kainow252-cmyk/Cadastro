-- Criar tabela para links de auto-cadastro de assinatura
CREATE TABLE IF NOT EXISTS subscription_signup_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  wallet_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_subscription_links_wallet ON subscription_signup_links(wallet_id);
CREATE INDEX IF NOT EXISTS idx_subscription_links_active ON subscription_signup_links(active);
CREATE INDEX IF NOT EXISTS idx_subscription_links_expires ON subscription_signup_links(expires_at);

-- Criar tabela para rastrear conversões (clientes que se cadastraram)
CREATE TABLE IF NOT EXISTS subscription_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  FOREIGN KEY (link_id) REFERENCES subscription_signup_links(id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_conversions_link ON subscription_conversions(link_id);
CREATE INDEX IF NOT EXISTS idx_subscription_conversions_customer ON subscription_conversions(customer_id);
