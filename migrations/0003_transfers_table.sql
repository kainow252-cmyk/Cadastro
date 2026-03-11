-- Tabela para armazenar histórico de transferências/saques
CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  net_value REAL NOT NULL,
  transfer_fee REAL DEFAULT 0,
  status TEXT NOT NULL,
  operation_type TEXT,
  date_created TEXT NOT NULL,
  effective_date TEXT,
  confirmed_date TEXT,
  schedule_date TEXT,
  can_be_cancelled INTEGER DEFAULT 0,
  fail_reason TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_date_created ON transfers(date_created);
CREATE INDEX IF NOT EXISTS idx_transfers_operation_type ON transfers(operation_type);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_transfers_timestamp 
AFTER UPDATE ON transfers
BEGIN
  UPDATE transfers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
