-- Adicionar campos personalizáveis para o sorteio
ALTER TABLE lottery_tickets ADD COLUMN draw_description TEXT;
ALTER TABLE lottery_tickets ADD COLUMN prize_description TEXT DEFAULT '1º Prêmio - R$ 500.000,00';
ALTER TABLE lottery_tickets ADD COLUMN custom_draw_date TEXT;
ALTER TABLE lottery_tickets ADD COLUMN is_custom_lottery INTEGER DEFAULT 0;

-- Adicionar campos na tabela de links de assinatura para configurar sorteio
ALTER TABLE subscription_signup_links ADD COLUMN lottery_enabled INTEGER DEFAULT 1;
ALTER TABLE subscription_signup_links ADD COLUMN lottery_draw_date TEXT;
ALTER TABLE subscription_signup_links ADD COLUMN lottery_description TEXT;
ALTER TABLE subscription_signup_links ADD COLUMN lottery_prize_description TEXT;
