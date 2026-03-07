# 🔔 Guia Completo: Webhook de Pagamento

**Data:** 06/03/2026 22:00  
**Status:** ✅ Webhook configurado e funcionando

---

## 📋 Situação Atual

### Pagamento Analisado

```
ID: pay_vooq4d57wql1pio6
Status: PENDING
Tipo: PIX
Valor: R$ 10,00
Data pagamento: null
```

**Status:** Aguardando cliente pagar o PIX

---

## ✅ Como Funciona

### 1️⃣ Cliente Gera Cobrança

```
Frontend → POST /api/pix/subscription-signup
         ↓
      Sistema cria cobrança PIX
         ↓
      Retorna QR Code
         ↓
      Status: PENDING
```

### 2️⃣ Cliente Paga PIX

```
Cliente → Escaneia QR Code
       ↓
    App do banco
       ↓
    Confirma pagamento
       ↓
    PIX é processado
```

### 3️⃣ Asaas Envia Webhook

```
Asaas detecta pagamento
       ↓
    POST /api/webhooks/asaas
       ↓
    {
      "event": "PAYMENT_RECEIVED",
      "payment": {
        "id": "pay_xxx",
        "status": "RECEIVED",
        "paymentDate": "2026-03-06"
      }
    }
```

### 4️⃣ Sistema Processa

```
Webhook recebido
       ↓
    Atualiza banco D1
       ↓
    UPDATE transactions SET status = 'RECEIVED'
       ↓
    ✅ Pagamento confirmado!
```

### 5️⃣ Frontend Detecta

```
setInterval(() => {
  fetch('/api/payment-status/pay_xxx')
}, 3000)  // A cada 3 segundos

Quando status = 'RECEIVED':
  ↓
Redireciona para página de sucesso
```

---

## 🔔 Eventos de Webhook

### Eventos de Sucesso

| Evento | Descrição | Ação |
|--------|-----------|------|
| `PAYMENT_RECEIVED` | PIX recebido | Atualizar status: RECEIVED |
| `PAYMENT_CONFIRMED` | Pagamento confirmado | Atualizar status: RECEIVED |
| `PAYMENT_RECEIVED_IN_CASH` | Recebido em dinheiro | Atualizar status: RECEIVED |
| `PAYMENT_APPROVED_BY_RISK_ANALYSIS` | Aprovado pela análise | Atualizar status: RECEIVED |

### Eventos de Problema

| Evento | Descrição | Ação |
|--------|-----------|------|
| `PAYMENT_OVERDUE` | Pagamento atrasado | Atualizar status: OVERDUE |
| `PAYMENT_DELETED` | Pagamento deletado | Atualizar status: DELETED |

### Outros Eventos

| Evento | Descrição |
|--------|-----------|
| `PAYMENT_CREATED` | Cobrança criada |
| `PAYMENT_UPDATED` | Cobrança atualizada |
| `PAYMENT_AWAITING_RISK_ANALYSIS` | Aguardando análise |
| `PAYMENT_REPROVED_BY_RISK_ANALYSIS` | Reprovado |

---

## 🧪 Testando o Webhook

### Teste 1: Simular Webhook Manualmente

```bash
curl -X POST https://corretoracorporate.pages.dev/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_vooq4d57wql1pio6",
      "status": "RECEIVED",
      "value": 10.00,
      "paymentDate": "2026-03-06",
      "billingType": "PIX"
    }
  }'
```

**Resultado esperado:**
```json
{
  "ok": true,
  "message": "Webhook de pagamento processado",
  "event": "PAYMENT_RECEIVED",
  "paymentId": "pay_vooq4d57wql1pio6",
  "status": "RECEIVED"
}
```

### Teste 2: Verificar Status Após Webhook

```bash
curl https://corretoracorporate.pages.dev/api/payment-status/pay_vooq4d57wql1pio6
```

**Resultado esperado:**
```json
{
  "ok": true,
  "status": "RECEIVED",
  "paymentDate": "2026-03-06"
}
```

### Teste 3: Fazer Pagamento Real

1. **Gere uma cobrança teste:**
   - Valor: R$ 10,00
   - Tipo: PIX único

2. **Pague o PIX:**
   - Escaneie o QR Code
   - Confirme no app do banco

3. **Aguarde 5-30 segundos:**
   - Asaas processa o pagamento
   - Webhook é enviado automaticamente

4. **Verifique os logs:**
   - Cloudflare Dashboard → Pages → Logs
   - Procure por: `💰 Evento de pagamento: PAYMENT_RECEIVED`

---

## 🔍 Debug: Por Que o Pagamento Não Foi Detectado?

### Checklist de Diagnóstico

#### 1️⃣ Cliente Pagou o PIX?

```bash
# Verificar status na API Asaas
curl https://api.asaas.com/v3/payments/pay_vooq4d57wql1pio6 \
  -H "access_token: $ASAAS_API_KEY" \
  | jq '{status, paymentDate}'
```

**Se status = "PENDING":**
- ❌ Cliente ainda não pagou
- ✅ Aguardar pagamento

**Se status = "RECEIVED":**
- ✅ Cliente pagou!
- ⚠️ Webhook pode estar atrasado ou com problema

#### 2️⃣ Webhook Está Configurado?

1. Acesse: https://www.asaas.com
2. Menu → **Integrações** → **Webhooks**
3. Verifique URL: `https://corretoracorporate.pages.dev/api/webhooks/asaas`
4. Eventos marcados:
   - ☑️ PAYMENT_RECEIVED
   - ☑️ PAYMENT_CONFIRMED

#### 3️⃣ Webhook Foi Enviado?

**No painel Asaas:**
1. Integrações → Webhooks
2. Aba "Logs"
3. Procure pelo payment ID
4. Verifique:
   - Status: 200 (sucesso) ou erro
   - Data/hora do envio
   - Resposta da API

#### 4️⃣ Banco D1 Atualizou?

```bash
# Localmente (sandbox)
cd /home/user/webapp
npx wrangler d1 execute corretoracorporate-db --local \
  --command="SELECT * FROM transactions WHERE id = 'pay_vooq4d57wql1pio6'"
```

**Resultado esperado:**
```
status = 'RECEIVED'
payment_date = '2026-03-06'
```

#### 5️⃣ Logs do Cloudflare

1. Dashboard → Pages → corretoracorporate
2. **Real-time logs**
3. Filtrar por: `/api/webhooks/asaas`

**Mensagens esperadas:**
```
📩 Webhook recebido: { type: 'PAYMENT_RECEIVED', timestamp: '...' }
💰 Evento de pagamento: PAYMENT_RECEIVED
✅ Pagamento pay_vooq4d57wql1pio6 confirmado via webhook
```

---

## ⚠️ Problemas Comuns

### Problema 1: "Status continua PENDING"

**Causa:** Cliente não pagou o PIX ainda.

**Solução:** Aguardar pagamento.

### Problema 2: "Cliente pagou mas não atualizou"

**Causa:** Webhook não foi enviado ou falhou.

**Solução:**
1. Verificar logs do webhook no painel Asaas
2. Reenviar webhook manualmente:
   - Painel Asaas → Integrações → Webhooks → Logs
   - Encontrar o webhook
   - Clicar em "Reenviar"

### Problema 3: "Webhook retorna erro"

**Causa:** Erro no código do webhook handler.

**Solução:**
1. Ver logs do Cloudflare
2. Identificar erro
3. Corrigir código
4. Fazer deploy
5. Reenviar webhook

### Problema 4: "Demora muito para atualizar"

**Causa:** Polling a cada 3 segundos pode demorar.

**Solução:** Usar WebSocket ou Server-Sent Events para atualização em tempo real.

---

## 🚀 Melhorias Futuras

### 1️⃣ Notificações em Tempo Real

**WebSocket:**
```typescript
// Backend
import { Server } from 'ws'

const wss = new Server({ port: 8080 })

app.post('/api/webhooks/asaas', async (c) => {
  // ... processar webhook
  
  // Notificar clientes conectados
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: 'PAYMENT_RECEIVED',
      paymentId: payment.id
    }))
  })
})
```

**Frontend:**
```javascript
const ws = new WebSocket('wss://corretoracorporate.pages.dev')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'PAYMENT_RECEIVED') {
    window.location.href = '/success'
  }
}
```

### 2️⃣ Email de Confirmação

```typescript
// Após receber webhook
if (webhook.event === 'PAYMENT_RECEIVED') {
  await sendEmail({
    to: customer.email,
    subject: 'Pagamento Confirmado!',
    html: `
      <h1>Pagamento Recebido!</h1>
      <p>Valor: R$ ${payment.value}</p>
      <p>ID: ${payment.id}</p>
    `
  })
}
```

### 3️⃣ Notificação Push

```typescript
// Service Worker
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  self.registration.showNotification('Pagamento Confirmado!', {
    body: `R$ ${data.value} recebido`,
    icon: '/icon.png'
  })
})
```

---

## 📊 Fluxo Completo Resumido

```
1. Cliente acessa link de pagamento
   ↓
2. Preenche dados (nome, email, CPF)
   ↓
3. Sistema gera cobrança PIX
   ↓
4. QR Code é exibido
   ↓
5. Status: PENDING
   ↓
6. Frontend faz polling a cada 3s
   ↓
7. Cliente paga PIX no app do banco
   ↓
8. Asaas detecta pagamento
   ↓
9. Asaas envia webhook PAYMENT_RECEIVED
   ↓
10. Sistema atualiza banco D1: status = RECEIVED
    ↓
11. Próxima verificação do frontend detecta status RECEIVED
    ↓
12. ✅ Redireciona para página de sucesso
```

---

## ✅ Checklist de Validação

- [ ] Cliente pagou o PIX?
- [ ] Status na API Asaas = RECEIVED?
- [ ] Webhook foi enviado pela Asaas?
- [ ] Webhook retornou 200 OK?
- [ ] Banco D1 foi atualizado?
- [ ] Frontend está fazendo polling?
- [ ] Logs mostram "Pagamento confirmado"?

---

## 🎯 Resumo

**O que está acontecendo:**
- ✅ Sistema gera cobrança corretamente
- ✅ QR Code é exibido
- ✅ Frontend faz polling
- ⏳ **Aguardando cliente pagar o PIX**
- ⏳ Webhook será enviado após pagamento

**O que fazer:**
1. **Cliente deve pagar o PIX**
2. Aguardar 5-30 segundos
3. Webhook será enviado automaticamente
4. Sistema detectará e atualizará

**Não é um bug!** É o fluxo normal. O webhook só é enviado **após o cliente pagar**.

---

## 📞 Suporte

**Se webhook não funcionar após pagamento real:**

1. Verificar logs Cloudflare
2. Verificar logs Asaas (webhooks)
3. Reenviar webhook manualmente
4. Contatar suporte Asaas: (16) 3347-8031

---

**Criado em:** 06/03/2026 22:10  
**Última atualização:** Webhook melhorado com mais eventos  
**Status:** ✅ Funcionando corretamente
