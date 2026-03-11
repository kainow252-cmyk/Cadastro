-- Tabela de webhooks recebidos
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  payload TEXT NOT NULL,
  processed INTEGER DEFAULT 0,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhooks_event ON webhooks(event);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_created ON webhooks(created_at);
