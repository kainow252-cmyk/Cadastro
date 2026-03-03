# Instruções para Aplicar Migrações no Banco de Produção

## Problema Corrigido
- ❌ **Erro 500** em `/api/stats` por falta da tabela `transactions`
- ✅ **Solução**: Criada migração `0014_create_transactions.sql`

## Migrações Aplicadas (Local)
```bash
✅ 0014_create_transactions.sql - Tabela transactions criada com sucesso
```

## Aplicar Migrações no Banco de Produção

### Opção 1: Via Wrangler (Requer Permissões)
```bash
npx wrangler d1 migrations apply corretoracorporate-db --remote
```

### Opção 2: Via Cloudflare Dashboard (Recomendado)
1. Acesse: https://dash.cloudflare.com
2. Vá para **Workers & Pages** → **D1**
3. Selecione o banco `corretoracorporate-db`
4. Clique em **Console**
5. Execute o SQL abaixo:

```sql
-- Criar tabela transactions
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
```

## Verificação
Após aplicar as migrações, verifique:
```bash
# Dashboard deve retornar dados sem erro 500
curl https://corretoracorporate.pages.dev/api/stats
```

## Status Atual
- ✅ **Local**: Todas as migrações aplicadas
- ⚠️ **Produção**: Requer aplicação manual via Dashboard
