-- Tabela de bilhetes da Loteria Federal
CREATE TABLE IF NOT EXISTS lottery_tickets (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT,
  ticket_number TEXT NOT NULL,  -- 6 dígitos (ex: 022925)
  draw_date TEXT NOT NULL,      -- Data do sorteio (YYYY-MM-DD)
  draw_number INTEGER,           -- Número do concurso (ex: 6046)
  status TEXT DEFAULT 'PENDING', -- PENDING, CHECKED, WINNER, LOSER
  prize_type TEXT,               -- 1ST, 2ND, 3RD, 4TH, 5TH, THOUSAND, HUNDRED, TEN, APPROXIMATE
  prize_value REAL,              -- Valor do prêmio em R$
  checked_at TEXT,               -- Data/hora da conferência
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_lottery_payment_id ON lottery_tickets(payment_id);
CREATE INDEX IF NOT EXISTS idx_lottery_ticket_number ON lottery_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_lottery_draw_date ON lottery_tickets(draw_date);
CREATE INDEX IF NOT EXISTS idx_lottery_status ON lottery_tickets(status);
CREATE INDEX IF NOT EXISTS idx_lottery_customer_email ON lottery_tickets(customer_email);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_lottery_timestamp 
AFTER UPDATE ON lottery_tickets
BEGIN
  UPDATE lottery_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
