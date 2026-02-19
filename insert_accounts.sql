-- INSERIR CONTAS/SUBCONTAS NO BANCO D1
-- Para que as transações possam ser visualizadas

-- Verificar se a tabela signup_links existe e tem as colunas corretas
-- Se não, vamos usar uma abordagem diferente

-- Conta 1: Franklin (e59d37d7-2f9b-462c-b1c1-c730322c8236)
INSERT OR IGNORE INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count) 
VALUES (
  'link_franklin',
  'e59d37d7-2f9b-462c-b1c1-c730322c8236',
  'https://example.com/signup/franklin',
  '2027-12-31',
  '2026-02-16',
  1,
  0
);

-- Conta 2: Outra conta (e5ccd253-e50e-4a5b-b759-07689dd79862)
INSERT OR IGNORE INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count) 
VALUES (
  'link_conta2',
  'e5ccd253-e50e-4a5b-b759-07689dd79862',
  'https://example.com/signup/conta2',
  '2027-12-31',
  '2026-02-16',
  1,
  0
);

-- Conta 3: Saulo (acc_saulo_123)
INSERT OR IGNORE INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count) 
VALUES (
  'link_saulo',
  'acc_saulo_123',
  'https://example.com/signup/saulo',
  '2027-12-31',
  '2026-02-16',
  1,
  0
);

-- Conta 4: Outra (f98acbad-47e7-4014-8710-a784ebdf1d42)
INSERT OR IGNORE INTO signup_links (id, account_id, url, expires_at, created_at, active, uses_count) 
VALUES (
  'link_conta4',
  'f98acbad-47e7-4014-8710-a784ebdf1d42',
  'https://example.com/signup/conta4',
  '2027-12-31',
  '2026-02-16',
  1,
  0
);

-- Verificar inserções
SELECT COUNT(*) as total_contas FROM signup_links;
