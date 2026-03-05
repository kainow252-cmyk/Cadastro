# 💳 API DeltaPag - Cartões Salvos (Saved Cards)

## 📝 Descrição
Sistema completo para salvar e gerenciar cartões de crédito tokenizados do DeltaPag, permitindo vendas futuras sem re-digitação de dados.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `saved_cards`
```sql
CREATE TABLE saved_cards (
  id TEXT PRIMARY KEY,                    -- UUID do cartão salvo
  account_id TEXT NOT NULL,               -- ID da subconta
  customer_id TEXT NOT NULL,              -- ID do cliente no DeltaPag
  customer_name TEXT NOT NULL,            -- Nome do cliente
  customer_email TEXT NOT NULL,           -- Email do cliente
  customer_cpf_cnpj TEXT NOT NULL,        -- CPF/CNPJ do cliente
  customer_phone TEXT,                    -- Telefone do cliente
  customer_postal_code TEXT,              -- CEP
  customer_address TEXT,                  -- Endereço
  customer_address_number TEXT,           -- Número
  customer_province TEXT,                 -- Bairro
  card_token TEXT NOT NULL,               -- Token do cartão (NUNCA expor!)
  card_brand TEXT,                        -- Bandeira (Visa, Master, etc)
  card_last_four TEXT NOT NULL,           -- Últimos 4 dígitos
  card_holder_name TEXT NOT NULL,         -- Nome no cartão
  card_expiry_month TEXT NOT NULL,        -- Mês de expiração (MM)
  card_expiry_year TEXT NOT NULL,         -- Ano de expiração (YYYY)
  billing_type TEXT DEFAULT 'CREDIT_CARD',-- Tipo de cobrança
  is_active INTEGER DEFAULT 1,            -- 1 = ativo, 0 = inativo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,                  -- Última vez usado
  metadata TEXT                           -- JSON com dados extras
);
```

## 🚀 Endpoints da API

### 1. Salvar Cartão
**POST** `/api/deltapag/save-card`

Salva um cartão de crédito tokenizado após uma transação bem-sucedida.

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Body:**
```json
{
  "accountId": "uuid-da-subconta",
  "customerId": "cus_000000000000",
  "customerName": "João da Silva",
  "customerEmail": "joao@example.com",
  "customerCpfCnpj": "12345678900",
  "customerPhone": "11999999999",
  "customerPostalCode": "01234567",
  "customerAddress": "Rua Exemplo",
  "customerAddressNumber": "123",
  "customerProvince": "Centro",
  "cardToken": "tok_abcdef123456",
  "cardBrand": "VISA",
  "cardLastFour": "1234",
  "cardHolderName": "JOAO DA SILVA",
  "cardExpiryMonth": "12",
  "cardExpiryYear": "2028",
  "metadata": {
    "source": "subscription",
    "plan": "premium"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "cardId": "uuid-do-cartao-salvo",
  "message": "Cartão salvo com sucesso"
}
```

---

### 2. Listar Cartões de uma Subconta
**GET** `/api/deltapag/saved-cards/:accountId`

Retorna todos os cartões ativos de uma subconta específica.

**Response:**
```json
{
  "ok": true,
  "cards": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "customer_name": "João da Silva",
      "customer_email": "joao@example.com",
      "customer_cpf_cnpj": "12345678900",
      "card_brand": "VISA",
      "card_last_four": "1234",
      "card_holder_name": "JOAO DA SILVA",
      "card_expiry_month": "12",
      "card_expiry_year": "2028",
      "created_at": "2026-03-05 02:30:00",
      "last_used_at": null
    }
  ]
}
```

---

### 3. Listar Todos os Cartões (Admin)
**GET** `/api/admin/deltapag/saved-cards`

Retorna todos os cartões salvos no sistema (apenas admin).

**Response:**
```json
{
  "ok": true,
  "cards": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "account_name": "Subconta Exemplo",
      "customer_name": "João da Silva",
      "customer_email": "joao@example.com",
      "customer_cpf_cnpj": "12345678900",
      "card_brand": "VISA",
      "card_last_four": "1234",
      "card_holder_name": "JOAO DA SILVA",
      "card_expiry_month": "12",
      "card_expiry_year": "2028",
      "created_at": "2026-03-05 02:30:00",
      "last_used_at": "2026-03-05 10:15:00"
    }
  ]
}
```

---

### 4. Buscar Cartão por ID
**GET** `/api/deltapag/saved-card/:cardId`

Retorna detalhes completos de um cartão específico (incluindo token).

**Response:**
```json
{
  "ok": true,
  "card": {
    "id": "uuid",
    "account_id": "uuid",
    "customer_id": "cus_000000000000",
    "customer_name": "João da Silva",
    "customer_email": "joao@example.com",
    "customer_cpf_cnpj": "12345678900",
    "customer_phone": "11999999999",
    "customer_postal_code": "01234567",
    "customer_address": "Rua Exemplo",
    "customer_address_number": "123",
    "customer_province": "Centro",
    "card_token": "tok_abcdef123456",
    "card_brand": "VISA",
    "card_last_four": "1234",
    "card_holder_name": "JOAO DA SILVA",
    "card_expiry_month": "12",
    "card_expiry_year": "2028",
    "is_active": 1,
    "created_at": "2026-03-05 02:30:00",
    "last_used_at": null,
    "metadata": "{\"source\":\"subscription\",\"plan\":\"premium\"}"
  }
}
```

---

### 5. Atualizar Último Uso
**PATCH** `/api/deltapag/saved-card/:cardId/use`

Atualiza a data de último uso do cartão (chamar após cada transação).

**Response:**
```json
{
  "ok": true,
  "message": "Data de uso atualizada"
}
```

---

### 6. Desativar Cartão (Soft Delete)
**DELETE** `/api/deltapag/saved-card/:cardId`

Desativa um cartão (não remove do banco, apenas marca como inativo).

**Response:**
```json
{
  "ok": true,
  "message": "Cartão removido com sucesso"
}
```

---

### 7. Buscar Cartões por CPF/CNPJ
**GET** `/api/deltapag/saved-cards/cpf/:cpfCnpj`

Retorna todos os cartões de um cliente específico (por CPF/CNPJ).

**Response:**
```json
{
  "ok": true,
  "cards": [...]
}
```

---

### 8. Buscar Cartões por Email
**GET** `/api/deltapag/saved-cards/email/:email`

Retorna todos os cartões de um cliente específico (por email).

**Response:**
```json
{
  "ok": true,
  "cards": [...]
}
```

---

### 9. Exportar Cartões para CSV
**GET** `/api/admin/deltapag/saved-cards/export/csv`

Exporta todos os cartões salvos em formato CSV.

**Response:**
```csv
ID,Conta ID,Conta Nome,Cliente Nome,Cliente Email,CPF/CNPJ,...
uuid,uuid,Subconta Exemplo,João da Silva,joao@example.com,12345678900,...
```

---

## 🔒 Segurança

### ⚠️ Dados Sensíveis
- **NUNCA** retorne `card_token` em APIs públicas ou listagens
- **SEMPRE** use HTTPS (Cloudflare garante isso)
- **APENAS** retorne `card_token` quando for criar nova cobrança
- **USE** o endpoint `/api/deltapag/saved-card/:cardId` (GET) apenas internamente

### ✅ Boas Práticas
1. **Tokenização**: Sempre use tokens do DeltaPag, nunca armazene números de cartão completos
2. **Soft Delete**: Use `is_active = 0` em vez de `DELETE` (auditoria)
3. **Auditoria**: Campo `last_used_at` para rastrear uso
4. **Metadata**: Armazene informações extras em JSON para flexibilidade

---

## 📊 Exemplo de Fluxo Completo

### 1. Cliente Faz Primeira Compra
```javascript
// 1. Criar assinatura com cartão novo
const response = await fetch('/api/deltapag/create-subscription', {
  method: 'POST',
  body: JSON.stringify({
    accountId: 'uuid',
    value: 29.90,
    // ... dados do cartão
  })
});

const { customerId, creditCard } = await response.json();

// 2. Salvar cartão para uso futuro
await fetch('/api/deltapag/save-card', {
  method: 'POST',
  body: JSON.stringify({
    accountId: 'uuid',
    customerId: customerId,
    customerName: 'João da Silva',
    // ... dados do cliente
    cardToken: creditCard.ccv_token,  // Token retornado pelo DeltaPag
    cardBrand: creditCard.brand,
    cardLastFour: creditCard.last_digits,
    // ... dados do cartão
  })
});
```

### 2. Cliente Faz Compra Futura (Cartão Salvo)
```javascript
// 1. Buscar cartões salvos do cliente
const cards = await fetch('/api/deltapag/saved-cards/cpf/12345678900');

// 2. Cliente escolhe cartão
const selectedCard = cards[0];

// 3. Buscar detalhes completos (incluindo token)
const cardDetails = await fetch(`/api/deltapag/saved-card/${selectedCard.id}`);

// 4. Criar nova cobrança usando token salvo
const charge = await fetch('/api/deltapag/create-subscription', {
  method: 'POST',
  body: JSON.stringify({
    accountId: selectedCard.account_id,
    customerId: selectedCard.customer_id,
    value: 49.90,
    cardToken: cardDetails.card.card_token,  // Usar token salvo!
    // ... outros dados
  })
});

// 5. Atualizar último uso
await fetch(`/api/deltapag/saved-card/${selectedCard.id}/use`, {
  method: 'PATCH'
});
```

---

## 🎯 Casos de Uso

### 1. Upsell/Cross-sell
Cliente já tem cartão salvo → oferecer produtos adicionais com 1 clique

### 2. Renovação Automática
Assinatura expirando → cobrar automaticamente no cartão salvo

### 3. Retry de Pagamentos
Cobrança falhou → tentar outros cartões salvos do cliente

### 4. Checkout Expresso
Cliente retorna → selecionar cartão salvo em vez de digitar tudo novamente

---

## 📅 Próximos Passos Recomendados

1. **Frontend**: Criar interface para listar/selecionar cartões salvos
2. **Notificações**: Avisar cliente quando cartão estiver próximo de expirar
3. **Analytics**: Dashboard mostrando taxa de reuso de cartões
4. **Segurança**: Implementar 2FA para transações com cartões salvos
5. **Compliance**: Adicionar termo de consentimento para salvar cartão

---

**Versão**: 1.0  
**Data**: 2026-03-05  
**Migration**: 0016_create_saved_cards.sql
