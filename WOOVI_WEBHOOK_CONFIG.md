# 🔐 CONFIGURAÇÃO DE WEBHOOK - WOOVI/OPENPIX

**Data**: 05/03/2026  
**Sistema**: Corretora Corporate  
**Versão**: v6.1.1  

---

## 📋 INFORMAÇÕES DO WEBHOOK

### Chave Pública (PEM Format)
```
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/+NtIkjzevvqD+I3MMv3bLXDt
pvxBjY4BsRrSdca3rtAwMcRYYvxSnd7jagVLpctMiOxQO8ieUCKLSWHpsMAjO/zZ
WMKbqoG8MNpi/u3fp6zz0mcHCOSqYsPUUG19buW8bis5ZZ2IZgBObWSpTvJ0cnj6
HKBAA82Jln+lGwS1MwIDAQAB
-----END PUBLIC KEY-----
```

### Chave Pública (Base64 Encoded)
```
LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDLytOdElranpldnZxRCtJM01NdjNiTFhEdApwdnhCalk0QnNSclNkY2EzcnRBd01jUllZdnhTbmQ3amFnVkxwY3RNaU94UU84aWVVQ0tMU1dIcHNNQWpPL3paCldNS2Jxb0c4TU5waS91M2ZwNnp6MG1jSENPU3FZc1BVVUcxOWJ1VzhiaXM1WloySVpnQk9iV1NwVHZKMGNuajYKSEtCQUE4MkpsbitsR3dTMU13SURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=
```

---

## 🔒 COMO FUNCIONA A VALIDAÇÃO

### 1️⃣ Woovi Envia Webhook
```http
POST https://seu-dominio.com/api/webhook/woovi
Headers:
  x-webhook-signature: <assinatura_criptografada>
  Content-Type: application/json

Body:
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": { ... }
}
```

### 2️⃣ Seu Backend Valida a Assinatura
```typescript
import crypto from 'crypto';

function validateWebhookSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(payload);
  verify.end();
  
  return verify.verify(publicKey, signature, 'base64');
}
```

### 3️⃣ Se Válido → Processa Evento
```typescript
if (validateWebhookSignature(body, signature, WOOVI_PUBLIC_KEY)) {
  // ✅ Webhook legítimo da Woovi
  processEvent(webhookData);
} else {
  // ❌ Assinatura inválida - possível ataque
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## 📡 EVENTOS DISPONÍVEIS

### Cobranças
| Evento | Descrição | Quando Disparar |
|--------|-----------|-----------------|
| `OPENPIX:CHARGE_CREATED` | Cobrança criada | Quando criar cobrança |
| `OPENPIX:CHARGE_COMPLETED` | Cobrança paga | Cliente pagou PIX |
| `OPENPIX:CHARGE_EXPIRED` | Cobrança expirada | Venceu sem pagamento |

### Assinaturas (PIX Automático)
| Evento | Descrição | Quando Disparar |
|--------|-----------|-----------------|
| `OPENPIX:SUBSCRIPTION_CREATED` | Assinatura criada | Nova assinatura PIX Auto |
| `OPENPIX:SUBSCRIPTION_PAID` | Parcela paga | Cliente pagou mensalidade |
| `OPENPIX:SUBSCRIPTION_CANCELLED` | Assinatura cancelada | Cliente cancelou |

### Transações
| Evento | Descrição | Quando Disparar |
|--------|-----------|-----------------|
| `OPENPIX:TRANSACTION_RECEIVED` | PIX recebido | Qualquer PIX recebido |

---

## 🛠️ IMPLEMENTAÇÃO NO CÓDIGO

### TypeScript/Hono
```typescript
import { Hono } from 'hono';
import crypto from 'crypto';

const app = new Hono();

// Chave pública da Woovi
const WOOVI_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/+NtIkjzevvqD+I3MMv3bLXDt
pvxBjY4BsRrSdca3rtAwMcRYYvxSnd7jagVLpctMiOxQO8ieUCKLSWHpsMAjO/zZ
WMKbqoG8MNpi/u3fp6zz0mcHCOSqYsPUUG19buW8bis5ZZ2IZgBObWSpTvJ0cnj6
HKBAA82Jln+lGwS1MwIDAQAB
-----END PUBLIC KEY-----`;

// Endpoint para receber webhooks da Woovi
app.post('/api/webhook/woovi', async (c) => {
  try {
    // 1. Pegar assinatura do header
    const signature = c.req.header('x-webhook-signature');
    if (!signature) {
      return c.json({ error: 'Missing signature' }, 401);
    }

    // 2. Pegar body da requisição
    const body = await c.req.text();
    const webhookData = JSON.parse(body);

    // 3. Validar assinatura
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(body);
    verify.end();

    const isValid = verify.verify(WOOVI_PUBLIC_KEY, signature, 'base64');

    if (!isValid) {
      console.error('❌ Webhook signature invalid');
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // 4. Processar evento
    console.log('✅ Webhook válido:', webhookData.event);

    switch (webhookData.event) {
      case 'OPENPIX:CHARGE_COMPLETED':
        await handleChargeCompleted(webhookData.charge);
        break;

      case 'OPENPIX:SUBSCRIPTION_PAID':
        await handleSubscriptionPaid(webhookData.subscription);
        break;

      case 'OPENPIX:SUBSCRIPTION_CANCELLED':
        await handleSubscriptionCancelled(webhookData.subscription);
        break;

      default:
        console.log('ℹ️ Evento não tratado:', webhookData.event);
    }

    return c.json({ received: true });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
});

// Handlers para eventos específicos
async function handleChargeCompleted(charge: any) {
  console.log('💰 Cobrança paga:', charge.correlationID);
  
  // Atualizar status no banco de dados
  // await db.updateCharge(charge.correlationID, { status: 'PAID' });
  
  // Enviar email de confirmação
  // await sendConfirmationEmail(charge);
}

async function handleSubscriptionPaid(subscription: any) {
  console.log('📅 Assinatura paga:', subscription.correlationID);
  
  // Atualizar parcela paga
  // await db.updateSubscriptionInstallment(subscription);
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('❌ Assinatura cancelada:', subscription.correlationID);
  
  // Marcar assinatura como cancelada
  // await db.cancelSubscription(subscription.correlationID);
}

export default app;
```

---

## 🔐 ARMAZENAR A CHAVE

### Opção 1: Cloudflare Secret (RECOMENDADO)
```bash
# Criar secret no Cloudflare Pages
echo "-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/+NtIkjzevvqD+I3MMv3bLXDt
pvxBjY4BsRrSdca3rtAwMcRYYvxSnd7jagVLpctMiOxQO8ieUCKLSWHpsMAjO/zZ
WMKbqoG8MNpi/u3fp6zz0mcHCOSqYsPUUG19buW8bis5ZZ2IZgBObWSpTvJ0cnj6
HKBAA82Jln+lGwS1MwIDAQAB
-----END PUBLIC KEY-----" | \
npx wrangler pages secret put WOOVI_WEBHOOK_PUBLIC_KEY --project-name corretoracorporate
```

### Opção 2: Variável de Ambiente (.dev.vars)
```bash
# .dev.vars (local development)
WOOVI_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/+NtIkjzevvqD+I3MMv3bLXDt
pvxBjY4BsRrSdca3rtAwMcRYYvxSnd7jagVLpctMiOxQO8ieUCKLSWHpsMAjO/zZ
WMKbqoG8MNpi/u3fp6zz0mcHCOSqYsPUUG19buW8bis5ZZ2IZgBObWSpTvJ0cnj6
HKBAA82Jln+lGwS1MwIDAQAB
-----END PUBLIC KEY-----"
```

### Opção 3: Código (Para Testes)
```typescript
// src/config/woovi.ts
export const WOOVI_CONFIG = {
  publicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC/+NtIkjzevvqD+I3MMv3bLXDt
pvxBjY4BsRrSdca3rtAwMcRYYvxSnd7jagVLpctMiOxQO8ieUCKLSWHpsMAjO/zZ
WMKbqoG8MNpi/u3fp6zz0mcHCOSqYsPUUG19buW8bis5ZZ2IZgBObWSpTvJ0cnj6
HKBAA82Jln+lGwS1MwIDAQAB
-----END PUBLIC KEY-----`
};
```

---

## 🧪 TESTAR WEBHOOK LOCALMENTE

### 1. Usar ngrok para expor localhost
```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# URL gerada: https://abc123.ngrok.io
```

### 2. Configurar webhook na Woovi
- Menu `API/Plugins` → `Novo Webhook`
- URL: `https://abc123.ngrok.io/api/webhook/woovi`
- Eventos: Selecionar `OPENPIX:CHARGE_COMPLETED`

### 3. Criar cobrança teste
```bash
curl -X POST https://api.woovi.com/api/v1/charge \
  -H 'Authorization: SEU_APPID' \
  -d '{
    "correlationID": "test-webhook-001",
    "value": 100,
    "customer": {
      "name": "Teste Webhook",
      "taxID": {"taxID": "12345678909", "type": "BR:CPF"}
    }
  }'
```

### 4. Pagar cobrança no sandbox

### 5. Ver logs do webhook
```bash
# Terminal com servidor rodando
pm2 logs --nostream

# Deve aparecer:
# ✅ Webhook válido: OPENPIX:CHARGE_COMPLETED
# 💰 Cobrança paga: test-webhook-001
```

---

## 📊 EXEMPLO DE PAYLOAD WEBHOOK

### Cobrança Paga
```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "correlationID": "unique-charge-id",
    "value": 10000,
    "status": "COMPLETED",
    "customer": {
      "name": "Cliente Teste",
      "taxID": {
        "taxID": "12345678909",
        "type": "BR:CPF"
      }
    },
    "paidAt": "2026-03-05T18:30:00.000Z",
    "transactionID": "E12345678202603051830abcd1234"
  }
}
```

### Assinatura Paga
```json
{
  "event": "OPENPIX:SUBSCRIPTION_PAID",
  "subscription": {
    "correlationID": "unique-subscription-id",
    "value": 10000,
    "installmentNumber": 2,
    "status": "PAID",
    "paidAt": "2026-04-05T12:00:00.000Z",
    "cobr": {
      "identifierId": "01K3942Y0DFEK73H541ZADVK0P",
      "status": "ACTIVE"
    }
  }
}
```

---

## 🔍 LOGS E MONITORAMENTO

### Ver Webhooks Recebidos na Woovi
1. Acesse painel Woovi
2. Menu `API/Plugins` → `Webhooks`
3. Clique no webhook configurado
4. Ver histórico de envios

### Informações Disponíveis
- ✅ Timestamp do envio
- ✅ Status HTTP da resposta
- ✅ Tempo de resposta
- ✅ Payload enviado
- ✅ Resposta recebida
- ✅ Tentativas de reenvio

---

## ⚠️ SEGURANÇA - CHECKLIST

- [ ] ✅ **Sempre validar assinatura** do webhook
- [ ] ✅ **Usar HTTPS** no endpoint (não HTTP)
- [ ] ✅ **Validar estrutura** do payload
- [ ] ✅ **Idempotência** (processar mesmo evento 2x não deve causar problema)
- [ ] ✅ **Rate limiting** no endpoint
- [ ] ✅ **Timeout** curto (responder rápido)
- [ ] ✅ **Processar assíncrono** (não travar webhook)
- [ ] ✅ **Logs detalhados** de todos os eventos

---

## 📚 DOCUMENTAÇÃO OFICIAL

- **Webhooks**: https://developers.woovi.com/docs/webhook/platform/webhook-platform-api
- **Eventos**: https://developers.woovi.com/docs/webhook/webhook-events
- **Segurança**: https://developers.woovi.com/docs/security/webhook-signature

---

**Desenvolvido por**: Corretora Corporate System  
**Data**: 05/03/2026 18:30  
**Versão**: v6.1.1  
**Status**: ✅ Configuração Completa
