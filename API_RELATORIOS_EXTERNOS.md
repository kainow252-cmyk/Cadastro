# 📊 APIs de Relatórios para Sistemas Externos

## Visão Geral

APIs RESTful específicas por status de pagamento para integração com sistemas externos. Cada endpoint retorna relatórios consolidados de todas as subcontas filtrados por um status específico.

---

## 🎯 Endpoints Disponíveis

### 1. Pagamentos Recebidos
```
GET /api/reports/all-accounts/received
```

Retorna apenas pagamentos com status **RECEIVED** (pagos e confirmados).

**Query Parameters opcionais:**
- `startDate` (string): Data inicial no formato `YYYY-MM-DD`
- `endDate` (string): Data final no formato `YYYY-MM-DD`
- `chargeType` (string): Tipo de cobrança
  - `all` (padrão): todos os tipos
  - `single`: QR Code Avulso
  - `monthly`: Assinatura Mensal
  - `pix_auto`: PIX Automático
  - `link_cadastro`: Link Auto-Cadastro

**Exemplo de Request:**
```bash
curl -H "X-API-Key: sua-api-key" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28&chargeType=all"
```

---

### 2. Pagamentos Pendentes
```
GET /api/reports/all-accounts/pending
```

Retorna apenas pagamentos com status **PENDING** (aguardando pagamento dentro do prazo).

**Query Parameters:** (mesmos do endpoint anterior)

**Exemplo de Request:**
```bash
curl -H "X-API-Key: sua-api-key" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?startDate=2026-02-20"
```

---

### 3. Pagamentos Vencidos
```
GET /api/reports/all-accounts/overdue
```

Retorna apenas pagamentos com status **OVERDUE** (vencidos e não pagos).

**Query Parameters:** (mesmos do endpoint anterior)

**Exemplo de Request:**
```bash
curl -H "X-API-Key: sua-api-key" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?chargeType=monthly"
```

---

### 4. Pagamentos Reembolsados
```
GET /api/reports/all-accounts/refunded
```

Retorna apenas pagamentos com status **REFUNDED** (pagamentos estornados/reembolsados).

**Query Parameters:** (mesmos do endpoint anterior)

**Exemplo de Request:**
```bash
curl -H "X-API-Key: sua-api-key" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?endDate=2026-02-28"
```

---

## 📋 Estrutura de Resposta

Todos os endpoints retornam JSON no seguinte formato:

```json
{
  "ok": true,
  "data": {
    "account": {
      "id": "ALL_ACCOUNTS",
      "name": "Todas as Subcontas",
      "email": "consolidado@sistema.com",
      "cpfCnpj": "-",
      "walletId": "-"
    },
    "period": {
      "startDate": "2026-02-01",
      "endDate": "2026-02-28"
    },
    "filters": {
      "chargeType": "all",
      "status": "RECEIVED"
    },
    "summary": {
      "totalValue": 1500.00,
      "totalTransactions": 15,
      "totalAccounts": 3,
      "status": "RECEIVED"
    },
    "transactions": [
      {
        "id": "pay_abc123",
        "accountId": "acc_xyz789",
        "accountName": "Roberto Silva",
        "value": 100.00,
        "description": "Assinatura Mensal",
        "dueDate": "2026-02-15",
        "status": "RECEIVED",
        "dateCreated": "2026-02-15T10:30:00",
        "billingType": "PIX",
        "paymentDate": "2026-02-15T11:45:00",
        "chargeType": "monthly",
        "customer": {
          "name": "João da Silva",
          "email": "joao@exemplo.com",
          "cpf": "123.456.789-00",
          "birthdate": "1990-05-15"
        }
      }
    ]
  }
}
```

---

## 🔑 Campos da Transação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da transação na API Asaas/DeltaPag |
| `accountId` | string | ID da subconta que recebeu o pagamento |
| `accountName` | string | Nome da subconta |
| `value` | number | Valor da transação (R$) |
| `description` | string | Descrição do pagamento |
| `dueDate` | string | Data de vencimento (ISO 8601) |
| `status` | string | Status do pagamento (RECEIVED/PENDING/OVERDUE/REFUNDED) |
| `dateCreated` | string | Data de criação (ISO 8601) |
| `billingType` | string | Tipo de cobrança (PIX, BOLETO, etc.) |
| `paymentDate` | string | Data do pagamento efetivo (null se não pago) |
| `chargeType` | string | Tipo de cobrança (single/monthly/pix_auto/link_cadastro) |
| `customer.name` | string | Nome do cliente |
| `customer.email` | string | E-mail do cliente |
| `customer.cpf` | string | CPF do cliente (formato: XXX.XXX.XXX-XX) |
| `customer.birthdate` | string | Data de nascimento do cliente |

---

## 🚀 Casos de Uso

### 1. Integração com Dashboard Externo
```javascript
// Buscar todos os pagamentos recebidos do mês atual
const response = await fetch(
  'https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28',
  {
    headers: {
      'X-API-Key': 'sua-api-key-aqui'
    }
  }
)
const data = await response.json()

console.log(`Total recebido: R$ ${data.data.summary.totalValue.toFixed(2)}`)
console.log(`Total de transações: ${data.data.summary.totalTransactions}`)
```

### 2. Alerta de Pagamentos Vencidos
```javascript
// Verificar pagamentos vencidos nos últimos 7 dias
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
const startDate = sevenDaysAgo.toISOString().split('T')[0]

const response = await fetch(
  `https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?startDate=${startDate}`,
  {
    headers: {
      'X-API-Key': 'sua-api-key-aqui'
    }
  }
)
const data = await response.json()

if (data.data.summary.totalTransactions > 0) {
  console.log(`⚠️ ALERTA: ${data.data.summary.totalTransactions} pagamentos vencidos!`)
}
```

### 3. Exportação de Dados
```javascript
// Exportar todas as transações recebidas para processamento externo
const response = await fetch(
  'https://corretoracorporate.pages.dev/api/reports/all-accounts/received',
  {
    headers: {
      'X-API-Key': 'sua-api-key-aqui'
    }
  }
)
const data = await response.json()

// Converter para CSV, Excel, etc.
const transactions = data.data.transactions
```

---

## 🔒 Segurança e Autenticação

### ✅ Autenticação via API Key (Implementada)

**Todas as APIs externas requerem autenticação via API Key no header `X-API-Key`.**

### Como usar:

**1. Desenvolvimento (Sandbox/Local)**
```bash
# API Key padrão para desenvolvimento
curl -H "X-API-Key: demo-key-123" \
  "http://localhost:3000/api/reports/all-accounts/received"
```

**2. Produção**
```bash
# Use a API Key configurada no Cloudflare
curl -H "X-API-Key: sua-chave-secreta-aqui" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/received"
```

### Configurar API Key em Produção:

```bash
# 1. Gerar uma chave segura
openssl rand -base64 32

# 2. Adicionar no Cloudflare Pages
npx wrangler pages secret put EXTERNAL_API_KEY --project-name corretoracorporate

# 3. Digitar a chave quando solicitado
```

### Respostas de Erro:

**401 Unauthorized (sem API Key):**
```json
{
  "error": "API Key obrigatória. Envie no header X-API-Key",
  "docs": "https://github.com/kainow252-cmyk/Cadastro/blob/main/API_RELATORIOS_EXTERNOS.md"
}
```

**403 Forbidden (API Key inválida):**
```json
{
  "error": "API Key inválida",
  "docs": "https://github.com/kainow252-cmyk/Cadastro/blob/main/API_RELATORIOS_EXTERNOS.md"
}
```

### Próximas melhorias:

1. **Rate Limiting** (a implementar)
```typescript
// Limitar requisições por IP (a implementar)
// Ex: 100 requisições por hora
```

3. **CORS Configuration**
```typescript
// Configurar domínios permitidos
app.use('/api/reports/all-accounts/*', cors({
  origin: ['https://seu-sistema-externo.com'],
  allowMethods: ['GET'],
}))
```

4. **Cloudflare Environment Variables**
```bash
# Adicionar no Cloudflare Pages
npx wrangler pages secret put EXTERNAL_API_KEY --project-name corretoracorporate

# Valor: gerar um token seguro
# Ex: openssl rand -base64 32
```

---

## 📊 Comparação: APIs Específicas vs Query Parameters

| Característica | Query Parameter (`?status=RECEIVED`) | APIs Específicas (`/received`) |
|---------------|--------------------------------------|--------------------------------|
| Semântica | ⚠️ Menos clara | ✅ Mais RESTful |
| Cache | ⚠️ Difícil por URL | ✅ Fácil por endpoint |
| Monitoramento | ⚠️ Dificulta logs | ✅ Fácil rastreamento |
| Segurança | ⚠️ Difícil granularidade | ✅ Pode limitar por endpoint |
| Uso Externo | ⚠️ Pode confundir | ✅ Mais intuitivo |
| Performance | 🟰 Igual | 🟰 Igual |

---

## 🧪 Testes

### Teste Local (Sandbox)
```bash
# Com PM2 rodando (API Key padrão: demo-key-123)
curl -H "X-API-Key: demo-key-123" http://localhost:3000/api/reports/all-accounts/received
curl -H "X-API-Key: demo-key-123" http://localhost:3000/api/reports/all-accounts/pending
curl -H "X-API-Key: demo-key-123" http://localhost:3000/api/reports/all-accounts/overdue
curl -H "X-API-Key: demo-key-123" http://localhost:3000/api/reports/all-accounts/refunded
```

### Teste em Produção
```bash
# Após deploy (use sua API Key real)
curl -H "X-API-Key: sua-api-key" https://corretoracorporate.pages.dev/api/reports/all-accounts/received
curl -H "X-API-Key: sua-api-key" https://corretoracorporate.pages.dev/api/reports/all-accounts/pending
curl -H "X-API-Key: sua-api-key" https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue
curl -H "X-API-Key: sua-api-key" https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded

# Testar sem API Key (deve retornar 401)
curl https://corretoracorporate.pages.dev/api/reports/all-accounts/received

# Testar com API Key inválida (deve retornar 403)
curl -H "X-API-Key: chave-errada" https://corretoracorporate.pages.dev/api/reports/all-accounts/received
```

---

## 📈 Próximos Passos

- [x] ✅ Implementar autenticação via API Key
- [ ] Adicionar rate limiting
- [ ] Configurar CORS para domínios específicos
- [ ] Criar documentação OpenAPI/Swagger
- [ ] Adicionar logs de auditoria
- [ ] Implementar paginação para grandes volumes
- [ ] Adicionar webhooks para notificações

---

## 📝 Notas Técnicas

### Performance
- Cada endpoint executa uma query SQL com `WHERE status = ?`
- Índices no banco de dados melhoram performance:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
  ```

### Diferença do Endpoint `/detailed`
O endpoint antigo `/api/reports/all-accounts/detailed?status=X` ainda existe e funciona com query parameters. Os novos endpoints são **alternativos** para sistemas externos que preferem URLs semânticas.

---

**Última atualização:** 21/02/2026
**Versão da API:** 1.0
**Base URL:** https://corretoracorporate.pages.dev
