# 🚀 Guia de Deploy - Migration 0016 (Cartões Salvos)

## ⚠️ IMPORTANTE: Migration Manual Necessária

A migration `0016_create_saved_cards.sql` foi aplicada localmente com sucesso, mas **precisa ser aplicada na produção manualmente** devido a permissões da API Cloudflare.

## 📋 Opções de Deploy

### Opção 1: Cloudflare Dashboard (Recomendado)
1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Vá em **Workers & Pages** → **D1** → **corretoracorporate-db**
3. Clique na aba **"Console"**
4. Copie e cole o conteúdo de `migrations/0016_create_saved_cards.sql`
5. Clique em **"Execute"**

### Opção 2: Wrangler CLI (Se tiver permissões)
```bash
cd /home/user/webapp
npx wrangler d1 migrations apply corretoracorporate-db --remote
```

**Se der erro de permissão**, use a Opção 1 acima.

## 📄 SQL a Executar (se usar Dashboard)

```sql
-- Migration: Criar tabela para cartões de crédito salvos (DeltaPag)
-- Data: 2026-03-05

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
```

## ✅ Verificação Após Deploy

1. Execute no Console D1:
```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='saved_cards';
```

**Resultado esperado:**
```
name
--------------
saved_cards
```

2. Verificar índices:
```sql
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='saved_cards';
```

**Resultado esperado (5 índices):**
```
name
--------------------------------
idx_saved_cards_account_id
idx_saved_cards_customer_cpf
idx_saved_cards_customer_email
idx_saved_cards_token
idx_saved_cards_active
```

## 🧪 Teste das APIs

Após aplicar a migration, teste as APIs:

### 1. Salvar um cartão teste
```bash
curl -X POST https://admin.corretoracorporate.com.br/api/deltapag/save-card \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "uuid-teste",
    "customerId": "cus_test",
    "customerName": "Teste Cliente",
    "customerEmail": "teste@example.com",
    "customerCpfCnpj": "12345678900",
    "cardToken": "tok_test123",
    "cardLastFour": "1234",
    "cardHolderName": "TESTE CLIENTE",
    "cardExpiryMonth": "12",
    "cardExpiryYear": "2028"
  }'
```

### 2. Listar cartões salvos (Admin)
```bash
curl -X GET https://admin.corretoracorporate.com.br/api/admin/deltapag/saved-cards \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 📊 Status das Migrations

| ID | Nome | Status Local | Status Produção |
|---|---|---|---|
| 0001 | create_signup_links.sql | ✅ Aplicado | ✅ Aplicado |
| 0002 | add_signup_links.sql | ✅ Aplicado | ✅ Aplicado |
| ... | ... | ... | ... |
| 0015 | create_banners.sql | ✅ Aplicado | ✅ Aplicado |
| **0016** | **create_saved_cards.sql** | ✅ **Aplicado** | ⚠️ **PENDENTE** |

## 🚀 URLs de Deploy

- **Preview**: https://cd2aa372.corretoracorporate.pages.dev
- **Produção**: https://corretoracorporate.pages.dev
- **Custom Domain**: https://admin.corretoracorporate.com.br

## 📝 Documentação Completa

Consulte `DELTAPAG_SAVED_CARDS_API.md` para:
- Estrutura completa do banco
- Todos os endpoints da API
- Exemplos de uso
- Fluxos de integração
- Boas práticas de segurança

---

**Data**: 2026-03-05  
**Versão**: 1.0  
**Commit**: 16e6d79
