-- Tabela para links de auto-cadastro PIX Automático
CREATE TABLE IF NOT EXISTS pix_automatic_signup_links (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'MONTHLY',
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL
);

-- Tabela para autorizações PIX Automático
CREATE TABLE IF NOT EXISTS pix_automatic_authorizations (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  authorization_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  account_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT NOT NULL,
  frequency TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  first_payment_id TEXT,
  first_payment_status TEXT,
  qr_code_payload TEXT,
  qr_code_image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  activated_at TEXT,
  FOREIGN KEY (link_id) REFERENCES pix_automatic_signup_links(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pix_automatic_links_wallet_id ON pix_automatic_signup_links(wallet_id);
CREATE INDEX IF NOT EXISTS idx_pix_automatic_links_active ON pix_automatic_signup_links(active);
CREATE INDEX IF NOT EXISTS idx_pix_automatic_links_expires_at ON pix_automatic_signup_links(expires_at);

CREATE INDEX IF NOT EXISTS idx_pix_automatic_auth_link_id ON pix_automatic_authorizations(link_id);
CREATE INDEX IF NOT EXISTS idx_pix_automatic_auth_customer_id ON pix_automatic_authorizations(customer_id);
CREATE INDEX IF NOT EXISTS idx_pix_automatic_auth_authorization_id ON pix_automatic_authorizations(authorization_id);
CREATE INDEX IF NOT EXISTS idx_pix_automatic_auth_status ON pix_automatic_authorizations(status);
