# 🔔 Configurar Webhooks do Asaas

## 📋 O QUE SÃO WEBHOOKS?

Webhooks são notificações automáticas que o Asaas envia para o seu sistema quando eventos importantes acontecem:

- ✅ Pagamento recebido
- ✅ Cobrança vencida
- ✅ Cobrança confirmada
- ✅ Cobrança estornada
- ✅ Subconta criada/aprovada
- ✅ E muito mais...

---

## 🎯 BENEFÍCIOS:

1. **Tempo Real:** Recebe notificações instantâneas
2. **Automação:** Processa pagamentos automaticamente
3. **Confiável:** Sistema de retry automático
4. **Seguro:** Validação de assinatura

---

## 🚀 CONFIGURAÇÃO - PASSO A PASSO

### 1️⃣ URL DO WEBHOOK

Seu endpoint de webhook será:

```
https://cadastro.corretoracorporate.com.br/api/webhooks/asaas
```

Esta URL receberá TODAS as notificações do Asaas.

---

### 2️⃣ CONFIGURAR NO PAINEL ASAAS

#### Acesse o Painel Asaas:

1. Entre em: https://www.asaas.com/
2. Faça login com sua conta
3. Vá para: **Integrações** → **Webhooks**

#### Adicione o Webhook:

1. Clique em **"Novo Webhook"** ou **"Adicionar Webhook"**
2. **URL do Webhook:**
   ```
   https://cadastro.corretoracorporate.com.br/api/webhooks/asaas
   ```
3. **Sincronização:** Marque "Habilitado"
4. **Email de Notificação:** Seu email (opcional)
5. **Versão da API:** v3 (mais recente)

#### Selecione os Eventos:

Marque os eventos que deseja receber:

**Pagamentos (Recomendado):**
- ✅ `PAYMENT_CREATED` - Cobrança criada
- ✅ `PAYMENT_UPDATED` - Cobrança atualizada
- ✅ `PAYMENT_CONFIRMED` - Pagamento confirmado
- ✅ `PAYMENT_RECEIVED` - Pagamento recebido
- ✅ `PAYMENT_OVERDUE` - Cobrança vencida
- ✅ `PAYMENT_DELETED` - Cobrança excluída
- ✅ `PAYMENT_RESTORED` - Cobrança restaurada
- ✅ `PAYMENT_REFUNDED` - Pagamento estornado
- ✅ `PAYMENT_CHARGEBACK_REQUESTED` - Chargeback solicitado
- ✅ `PAYMENT_CHARGEBACK_DISPUTE` - Contestação de chargeback

**Subcontas (Recomendado):**
- ✅ `ACCOUNT_CREATED` - Subconta criada
- ✅ `ACCOUNT_UPDATED` - Subconta atualizada
- ✅ `ACCOUNT_STATUS_CHANGED` - Status da subconta alterado

**Transferências (Opcional):**
- ✅ `TRANSFER_CREATED` - Transferência criada
- ✅ `TRANSFER_PENDING` - Transferência pendente
- ✅ `TRANSFER_DONE` - Transferência concluída
- ✅ `TRANSFER_FAILED` - Transferência falhou

**Assinaturas (Se usar recorrência):**
- ✅ `SUBSCRIPTION_CREATED` - Assinatura criada
- ✅ `SUBSCRIPTION_UPDATED` - Assinatura atualizada
- ✅ `SUBSCRIPTION_DELETED` - Assinatura cancelada

6. Clique em **"Salvar"**

---

### 3️⃣ TESTAR WEBHOOK

O Asaas permite testar o webhook:

1. No painel de Webhooks, localize o webhook criado
2. Clique em **"Testar"** ou **"Enviar Teste"**
3. Escolha um evento (ex: `PAYMENT_RECEIVED`)
4. Clique em **"Enviar"**

**Resultado esperado:**
- ✅ Status: 200 OK
- ✅ Resposta: `{"ok": true, "message": "Webhook recebido"}`

---

## 📊 EVENTOS MAIS IMPORTANTES

### 🟢 PAYMENT_RECEIVED
**Quando:** Pagamento confirmado e disponível
**Ação:** Liberar produto/serviço, enviar email de confirmação

### 🟡 PAYMENT_CONFIRMED
**Quando:** Pagamento aprovado mas ainda não compensado
**Ação:** Aguardar compensação (1-2 dias úteis)

### 🔴 PAYMENT_OVERDUE
**Quando:** Cobrança venceu
**Ação:** Enviar email de cobrança, suspender serviço

### 🔵 PAYMENT_REFUNDED
**Quando:** Pagamento foi estornado
**Ação:** Cancelar serviço, notificar cliente

---

## 🔒 SEGURANÇA

### Validação de Assinatura (IMPORTANTE!)

O Asaas envia um header `asaas-access-token` com cada webhook para validar a origem.

**Como validar:**

1. Acesse: Integrações → Webhooks → Seu Webhook
2. Copie o **Access Token** (chave única)
3. No código, valide se o header `asaas-access-token` é igual ao token

**Exemplo:**
```javascript
const receivedToken = request.headers['asaas-access-token']
const expectedToken = 'seu-token-do-painel-asaas'

if (receivedToken !== expectedToken) {
  return { error: 'Unauthorized' }
}
```

---

## 📝 ESTRUTURA DO WEBHOOK

### Exemplo de Payload (PAYMENT_RECEIVED):

```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_123456789",
    "customer": "cus_123456789",
    "billingType": "PIX",
    "value": 100.00,
    "netValue": 98.50,
    "originalValue": 100.00,
    "status": "RECEIVED",
    "dueDate": "2026-02-20",
    "paymentDate": "2026-02-16",
    "clientPaymentDate": "2026-02-16",
    "description": "Cobrança referente a...",
    "externalReference": "pedido-123",
    "originalDueDate": "2026-02-20",
    "pixTransaction": "00020126....",
    "confirmedDate": "2026-02-16"
  }
}
```

---

## 🎯 CHECKLIST DE CONFIGURAÇÃO

### No Painel Asaas:
- [ ] Acessar Integrações → Webhooks
- [ ] Adicionar webhook com URL: `https://cadastro.corretoracorporate.com.br/api/webhooks/asaas`
- [ ] Selecionar eventos de pagamento
- [ ] Selecionar eventos de subconta
- [ ] Habilitar sincronização
- [ ] Salvar configuração
- [ ] Copiar Access Token
- [ ] Testar webhook

### No Sistema:
- [ ] Endpoint criado: `/api/webhooks/asaas`
- [ ] Validação de assinatura implementada
- [ ] Log de webhooks recebidos
- [ ] Processamento de eventos
- [ ] Tratamento de erros
- [ ] Retry em caso de falha

---

## 📊 MONITORAMENTO

### Ver Logs de Webhooks:

1. Painel Asaas → Integrações → Webhooks
2. Clique no webhook configurado
3. Veja aba **"Histórico"**

**Informações disponíveis:**
- ✅ Data/hora do envio
- ✅ Evento enviado
- ✅ Status HTTP da resposta
- ✅ Tempo de resposta
- ✅ Payload enviado
- ✅ Resposta recebida

---

## 🆘 TROUBLESHOOTING

### ❌ Webhook retorna erro 500
**Causa:** Erro no processamento do código  
**Solução:** Veja os logs do Cloudflare Pages

### ❌ Webhook retorna erro 401/403
**Causa:** Validação de token falhou  
**Solução:** Verifique se o token está correto

### ❌ Webhook não recebe notificações
**Causa:** URL incorreta ou eventos não selecionados  
**Solução:** Verifique configuração no painel Asaas

### ❌ Webhook demora muito (timeout)
**Causa:** Processamento lento  
**Solução:** Retorne 200 imediatamente, processe async

---

## 🎯 PRÓXIMOS PASSOS

Agora vou criar o código do endpoint de webhook para você!

**Me avise quando estiver pronto para continuar!** 🚀
