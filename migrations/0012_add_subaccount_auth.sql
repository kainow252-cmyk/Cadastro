-- Adicionar campos de autenticação para subcontas
-- Permite que subcontas façam login e vejam apenas seus banners

-- Adicionar colunas de autenticação na tabela users (que representa as subcontas)
ALTER TABLE users ADD COLUMN login_username TEXT;
ALTER TABLE users ADD COLUMN login_password TEXT;
ALTER TABLE users ADD COLUMN login_enabled INTEGER DEFAULT 0; -- 0 = desabilitado, 1 = habilitado
ALTER TABLE users ADD COLUMN last_login_at DATETIME;

-- Criar índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_users_login_username ON users(login_username);
