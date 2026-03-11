-- Sistema de Lixeira para otimização do banco de dados
-- Criado em: 2026-02-20

-- Tabela para armazenar dados removidos (lixeira)
CREATE TABLE IF NOT EXISTS trash_bin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_table TEXT NOT NULL,
  original_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON com os dados originais
  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_reason TEXT,
  can_restore INTEGER DEFAULT 1, -- 1 = pode restaurar, 0 = deletado permanentemente
  metadata TEXT -- JSON com informações adicionais
);

CREATE INDEX IF NOT EXISTS idx_trash_original_table ON trash_bin(original_table);
CREATE INDEX IF NOT EXISTS idx_trash_deleted_at ON trash_bin(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trash_can_restore ON trash_bin(can_restore);

-- Tabela para logs de limpeza automática
CREATE TABLE IF NOT EXISTS cleanup_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cleanup_type TEXT NOT NULL, -- 'expired_links', 'old_webhooks', 'inactive_users', etc
  items_deleted INTEGER DEFAULT 0,
  items_moved_to_trash INTEGER DEFAULT 0,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  details TEXT -- JSON com detalhes da limpeza
);

CREATE INDEX IF NOT EXISTS idx_cleanup_logs_executed_at ON cleanup_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_cleanup_type ON cleanup_logs(cleanup_type);

-- Tabela para configurações de limpeza automática
CREATE TABLE IF NOT EXISTS cleanup_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT OR IGNORE INTO cleanup_config (config_key, config_value, description) VALUES
  ('expired_links_days', '30', 'Dias após expiração para mover links para lixeira'),
  ('old_webhooks_days', '90', 'Dias para manter logs de webhooks antigos'),
  ('trash_retention_days', '30', 'Dias para manter itens na lixeira antes de deletar permanentemente'),
  ('cleanup_enabled', '1', 'Ativar limpeza automática (1 = sim, 0 = não)'),
  ('cleanup_interval_hours', '24', 'Intervalo em horas entre limpezas automáticas');
