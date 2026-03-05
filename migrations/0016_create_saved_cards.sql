-- Migration: Criar tabela para cartões de crédito salvos (DeltaPag)
-- Data: 2026-03-05
-- Descrição: Armazena dados de cartões tokenizados para vendas futuras

CREATE TABLE IF NOT EXISTS saved_cards (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf_cnpj TEXT NOT NULL,
  customer_phone TEXT,
  customer_postal_code TEXT,
  customer_address TEXT,
  customer_address_number TEXT,
  customer_province TEXT,
  card_token TEXT NOT NULL,
  card_brand TEXT,
  card_last_four TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  card_expiry_month TEXT NOT NULL,
  card_expiry_year TEXT NOT NULL,
  billing_type TEXT DEFAULT 'CREDIT_CARD',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  metadata TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_saved_cards_account_id ON saved_cards(account_id);
CREATE INDEX IF NOT EXISTS idx_saved_cards_customer_cpf ON saved_cards(customer_cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_saved_cards_customer_email ON saved_cards(customer_email);
CREATE INDEX IF NOT EXISTS idx_saved_cards_token ON saved_cards(card_token);
CREATE INDEX IF NOT EXISTS idx_saved_cards_active ON saved_cards(is_active);
