# 💸 API de Saques/Transferências - Documentação Completa

**Data:** 06/03/2026  
**Status:** ✅ ATIVA E FUNCIONANDO

---

## 🎉 Confirmação de Ativação

A permissão de **saques via API** foi ativada com sucesso pela Asaas!

**Prova:**
- ✅ Transferência ID: `93e925a5-41c0-4213-a033-877cc30c9197`
- ✅ Valor: R$ 220,00
- ✅ Taxa: R$ 0,00 (PIX para própria conta)
- ✅ Status: PENDING
- ✅ Tipo: PIX

---

## 📋 Endpoints Disponíveis

### 1️⃣ Listar Saques

```http
GET /api/transfers?limit=20&offset=0&status=PENDING
```

**Query Parameters:**
- `limit` (opcional): Número de registros (padrão: 20)
- `offset` (opcional): Paginação (padrão: 0)
- `status` (opcional): Filtrar por status (PENDING, DONE, CANCELLED, FAILED)

**Resposta:**
```json
{
  "ok": true,
  "transfers": [
    {
      "id": "93e925a5-41c0-4213-a033-877cc30c9197",
      "value": 220.00,
      "netValue": 220.00,
      "transferFee": 0.00,
      "status": "PENDING",
      "operationType": "PIX",
      "dateCreated": "2026-03-06",
      "canBeCancelled": true
    }
  ],
  "totalCount": 1,
  "hasMore": false
}
```

---

### 2️⃣ Consultar Saque Específico

```http
GET /api/transfers/:id
```

**Exemplo:**
```bash
curl https://corretoracorporate.pages.dev/api/transfers/93e925a5-41c0-4213-a033-877cc30c9197
```

**Resposta:**
```json
{
  "ok": true,
  "transfer": {
    "id": "93e925a5-41c0-4213-a033-877cc30c9197",
    "value": 220.00,
    "netValue": 220.00,
    "transferFee": 0.00,
    "status": "PENDING",
    "operationType": "PIX",
    "effectiveDate": null,
    "confirmedDate": null,
    "canBeCancelled": true,
    "bankAccount": {
      "bank": {
        "code": "323",
        "name": "MERCADO PAGO"
      },
      "pixAddressKey": "9b217cf8-29b8-4943-b2e7-00294f26724f"
    }
  }
}
```

---

### 3️⃣ Criar Novo Saque

```http
POST /api/transfers
Content-Type: application/json
```

#### Opção A: Saque via PIX

```json
{
  "value": 100.00,
  "bankAccount": {
    "bank": {
      "code": "323"
    },
    "ownerName": "CORRETORA CORPORATE LTDA",
    "cpfCnpj": "63300111000133",
    "pixAddressKey": "9b217cf8-29b8-4943-b2e7-00294f26724f"
  }
}
```

#### Opção B: Saque via TED/DOC

```json
{
  "value": 100.00,
  "bankAccount": {
    "bank": {
      "code": "341"
    },
    "accountName": "João Silva",
    "ownerName": "João Silva",
    "ownerBirthDate": "1990-01-01",
    "cpfCnpj": "12345678909",
    "agency": "1234",
    "account": "12345",
    "accountDigit": "6",
    "type": "CONTA_CORRENTE"
  }
}
```

**Resposta de Sucesso:**
```json
{
  "ok": true,
  "transfer": {
    "id": "tra_abc123xyz",
    "value": 100.00,
    "netValue": 97.00,
    "transferFee": 3.00,
    "status": "PENDING",
    "operationType": "PIX",
    "dateCreated": "2026-03-06",
    "canBeCancelled": true
  },
  "message": "Transferência criada com sucesso"
}
```

**Resposta de Erro:**
```json
{
  "ok": false,
  "error": "Erro ao criar transferência",
  "details": [
    {
      "code": "insufficient_balance",
      "description": "Saldo insuficiente para realizar a transferência"
    }
  ]
}
```

---

### 4️⃣ Cancelar Saque

```http
DELETE /api/transfers/:id
```

**Exemplo:**
```bash
curl -X DELETE https://corretoracorporate.pages.dev/api/transfers/93e925a5-41c0-4213-a033-877cc30c9197
```

**Resposta:**
```json
{
  "ok": true,
  "message": "Transferência cancelada com sucesso",
  "transferId": "93e925a5-41c0-4213-a033-877cc30c9197"
}
```

**Nota:** Só é possível cancelar transferências com `canBeCancelled: true` e status `PENDING`.

---

### 5️⃣ Consultar Saldo Disponível

```http
GET /api/balance
```

**Resposta:**
```json
{
  "ok": true,
  "balance": 228.02,
  "availableForWithdrawal": 228.02
}
```

---

## 💰 Taxas de Transferência

| Tipo | Destino | Taxa |
|------|---------|------|
| PIX | Própria conta | **R$ 0,00** ✨ |
| PIX | Terceiros | R$ 1,00 - R$ 3,00 |
| TED | Qualquer banco | R$ 3,00 - R$ 5,00 |
| DOC | Qualquer banco | R$ 2,00 - R$ 4,00 |

**Importante:** Taxas podem variar conforme seu contrato com a Asaas.

---

## 🔔 Webhooks de Transferência

Quando uma transferência muda de status, a Asaas envia um webhook:

```json
{
  "type": "TRANSFER",
  "transfer": {
    "id": "93e925a5-41c0-4213-a033-877cc30c9197",
    "value": 220.00,
    "status": "DONE",
    "operationType": "PIX",
    "effectiveDate": "2026-03-06",
    "confirmedDate": "2026-03-06 14:35:22"
  }
}
```

**Possíveis Status:**
- `PENDING` - Aguardando processamento
- `DONE` - Concluída com sucesso
- `CANCELLED` - Cancelada
- `FAILED` - Falhou (ver `failReason`)

---

## 📊 Status de Transferência

### PENDING (Pendente)
- Transferência criada e aguardando processamento
- Pode ser cancelada (`canBeCancelled: true`)
- Prazo: Até 1 dia útil para PIX, até 2 dias para TED

### DONE (Concluída)
- Transferência foi processada com sucesso
- `effectiveDate` e `confirmedDate` preenchidos
- Não pode mais ser cancelada

### CANCELLED (Cancelada)
- Transferência foi cancelada pelo usuário
- Valor retornou ao saldo disponível

### FAILED (Falhou)
- Erro no processamento
- Ver campo `failReason` para detalhes
- Valor retornou ao saldo disponível

---

## 🧪 Exemplos de Teste

### Teste 1: Saque PIX para Mercado Pago (Taxa Zero)

```bash
curl -X POST https://corretoracorporate.pages.dev/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10.00,
    "bankAccount": {
      "bank": { "code": "323" },
      "ownerName": "CORRETORA CORPORATE LTDA",
      "cpfCnpj": "63300111000133",
      "pixAddressKey": "9b217cf8-29b8-4943-b2e7-00294f26724f"
    }
  }'
```

### Teste 2: Saque PIX para Chave Aleatória

```bash
curl -X POST https://corretoracorporate.pages.dev/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "value": 50.00,
    "bankAccount": {
      "bank": { "code": "341" },
      "ownerName": "João Silva",
      "cpfCnpj": "12345678909",
      "pixAddressKey": "joao@exemplo.com"
    }
  }'
```

### Teste 3: Listar Últimas Transferências

```bash
curl https://corretoracorporate.pages.dev/api/transfers?limit=10
```

### Teste 4: Cancelar Transferência Pendente

```bash
curl -X DELETE https://corretoracorporate.pages.dev/api/transfers/tra_abc123
```

---

## 🛡️ Validações Implementadas

### Antes de Criar Transferência

✅ Valor deve ser maior que zero  
✅ Dados bancários obrigatórios:
  - `bank.code` (código do banco)
  - `ownerName` (nome do titular)
  - `cpfCnpj` (CPF ou CNPJ)
  
✅ Para PIX: `pixAddressKey` obrigatória  
✅ Para TED/DOC: `agency` e `account` obrigatórios

### Erros Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| `insufficient_balance` | Saldo insuficiente | Aguardar recebimentos |
| `invalid_pix_key` | Chave PIX inválida | Verificar chave |
| `invalid_bank_account` | Conta bancária inválida | Conferir dados |
| `transfer_limit_exceeded` | Limite diário excedido | Aguardar próximo dia |

---

## 📈 Integração no Dashboard

### Adicionar no Painel Admin

```javascript
// Listar saques
async function loadTransfers() {
  const response = await fetch('/api/transfers?limit=50')
  const data = await response.json()
  
  if (data.ok) {
    renderTransfersTable(data.transfers)
  }
}

// Criar novo saque
async function createTransfer(value, pixKey) {
  const response = await fetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value: parseFloat(value),
      bankAccount: {
        bank: { code: '323' },
        ownerName: 'CORRETORA CORPORATE LTDA',
        cpfCnpj: '63300111000133',
        pixAddressKey: pixKey
      }
    })
  })
  
  const data = await response.json()
  
  if (data.ok) {
    alert('Saque criado com sucesso!')
    loadTransfers()
  } else {
    alert('Erro: ' + data.error)
  }
}

// Cancelar saque
async function cancelTransfer(transferId) {
  if (!confirm('Deseja realmente cancelar este saque?')) return
  
  const response = await fetch(`/api/transfers/${transferId}`, {
    method: 'DELETE'
  })
  
  const data = await response.json()
  
  if (data.ok) {
    alert('Saque cancelado!')
    loadTransfers()
  }
}
```

---

## 🗄️ Banco de Dados

### Tabela `transfers`

```sql
CREATE TABLE transfers (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  net_value REAL NOT NULL,
  transfer_fee REAL DEFAULT 0,
  status TEXT NOT NULL,
  operation_type TEXT,
  date_created TEXT NOT NULL,
  effective_date TEXT,
  confirmed_date TEXT,
  can_be_cancelled INTEGER DEFAULT 0,
  fail_reason TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Consultas Úteis

```sql
-- Saques pendentes
SELECT * FROM transfers WHERE status = 'PENDING';

-- Total sacado no mês
SELECT SUM(net_value) as total 
FROM transfers 
WHERE status = 'DONE' 
AND strftime('%Y-%m', date_created) = strftime('%Y-%m', 'now');

-- Taxas pagas
SELECT SUM(transfer_fee) as total_fees 
FROM transfers 
WHERE status = 'DONE';
```

---

## 🚀 Próximas Funcionalidades

- [ ] Interface visual para criar saques no painel admin
- [ ] Agendamento de saques automáticos
- [ ] Notificações por email quando saque for concluído
- [ ] Relatório de saques em PDF
- [ ] Limite de saque diário configurável
- [ ] Aprovação de saques por administrador

---

## 📚 Documentação Oficial Asaas

- **Transfers API:** https://docs.asaas.com/reference/transferir-para-conta-bancaria
- **Webhooks:** https://docs.asaas.com/reference/webhooks
- **Taxas:** https://www.asaas.com/taxas

---

## ✅ Checklist de Implementação

- [x] Endpoint GET /api/transfers (listar)
- [x] Endpoint POST /api/transfers (criar)
- [x] Endpoint GET /api/transfers/:id (consultar)
- [x] Endpoint DELETE /api/transfers/:id (cancelar)
- [x] Endpoint GET /api/balance (saldo)
- [x] Webhook handler para TRANSFER
- [x] Validações de entrada
- [x] Tabela no banco D1
- [x] Documentação completa
- [ ] Interface no painel admin
- [ ] Testes automatizados
- [ ] Notificações por email

---

## 🎯 Status Final

| Funcionalidade | Status |
|----------------|--------|
| **API de Saques** | ✅ 100% FUNCIONAL |
| **Webhook de Transferências** | ✅ ATIVO |
| **Banco de Dados** | ✅ CONFIGURADO |
| **Documentação** | ✅ COMPLETA |
| **Interface Admin** | ⏳ PENDENTE |

---

**Última Atualização:** 06/03/2026 20:30  
**Autor:** Sistema CORRETORA CORPORATE  
**Versão:** 1.0
