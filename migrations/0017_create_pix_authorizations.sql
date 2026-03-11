-- Migration: Criar tabela de autorizações PIX automático
-- Data: 2026-03-05
-- Descrição: Armazena autorizações de débito recorrente PIX (PIX Automático Asaas)

-- Tabela de autorizações PIX
CREATE TABLE IF NOT EXISTS pix_authorizations (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  authorization_id TEXT NOT NULL, -- ID da autorização no Asaas
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_birthdate TEXT,
  value REAL NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MONTHLY', -- MONTHLY, WEEKLY, etc.
  first_due_date TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING_AUTHORIZATION', -- PENDING_AUTHORIZATION, AUTHORIZED, CANCELLED, EXPIRED
  authorization_date TEXT, -- Data em que o cliente autorizou no banco
  payload TEXT, -- QR Code payload
  expiration_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES subscription_signup_links(id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pix_auth_link ON pix_authorizations(link_id);
CREATE INDEX IF NOT EXISTS idx_pix_auth_customer ON pix_authorizations(customer_id);
CREATE INDEX IF NOT EXISTS idx_pix_auth_authorization ON pix_authorizations(authorization_id);
CREATE INDEX IF NOT EXISTS idx_pix_auth_status ON pix_authorizations(status);
CREATE INDEX IF NOT EXISTS idx_pix_auth_cpf ON pix_authorizations(customer_cpf);
