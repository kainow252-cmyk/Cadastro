-- Migration: Adicionar coluna birthdate para armazenar data de nascimento dos clientes
-- Data: 20/02/2026

-- Adicionar coluna birthdate na tabela subscription_conversions
ALTER TABLE subscription_conversions ADD COLUMN customer_birthdate TEXT;

-- Comentário: Data de nascimento armazenada em formato ISO (YYYY-MM-DD)
-- Não é enviado para Asaas, mas armazenado localmente para uso futuro
