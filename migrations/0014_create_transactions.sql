-- Migration: Create transactions table
-- Created: 2026-03-03

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf_cnpj TEXT,
  value REAL NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'PIX',
  due_date DATE,
  payment_date DATE,
  qr_code_base64 TEXT,
  pix_copy_paste TEXT,
  charge_type TEXT DEFAULT 'one_time',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
