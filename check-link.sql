-- Verificar se o link existe
SELECT id, account_id, wallet_id, value, description, charge_type, active, expires_at 
FROM subscription_signup_links 
WHERE id = '295f0e48-2d43-4806-b390-f8bb497c7540';
