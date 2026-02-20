-- Migration: Adicionar coluna charge_type para suportar cobrança única ou mensal
-- Data: 20/02/2026

-- Adicionar coluna charge_type na tabela subscription_signup_links
ALTER TABLE subscription_signup_links 
ADD COLUMN charge_type TEXT DEFAULT 'monthly' CHECK(charge_type IN ('single', 'monthly'));

-- Adicionar coluna charge_type na tabela pix_automatic_signup_links
ALTER TABLE pix_automatic_signup_links 
ADD COLUMN charge_type TEXT DEFAULT 'monthly' CHECK(charge_type IN ('single', 'monthly'));

-- Atualizar registros existentes (todos serão 'monthly' por padrão)
UPDATE subscription_signup_links SET charge_type = 'monthly' WHERE charge_type IS NULL;
UPDATE pix_automatic_signup_links SET charge_type = 'monthly' WHERE charge_type IS NULL;
