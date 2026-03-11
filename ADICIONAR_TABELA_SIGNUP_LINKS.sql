-- ============================================================================
-- ADICIONAR TABELA signup_links NO D1
-- Execute este SQL no Console do Cloudflare D1
-- ============================================================================

-- Tabela de links de cadastro
CREATE TABLE IF NOT EXISTS signup_links (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  url TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  notes TEXT,
  active INTEGER DEFAULT 1,
  qr_code TEXT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_signup_links_account ON signup_links(account_id);
CREATE INDEX IF NOT EXISTS idx_signup_links_expires ON signup_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_signup_links_active ON signup_links(active);
CREATE INDEX IF NOT EXISTS idx_signup_links_created ON signup_links(created_at);

-- Verificar se a tabela foi criada
SELECT name FROM sqlite_master WHERE type='table' AND name='signup_links';
