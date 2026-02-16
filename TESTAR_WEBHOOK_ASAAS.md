# 🧪 Como Testar o Webhook do Asaas

## ✅ WEBHOOK CONFIGURADO!

Você já configurou o webhook:
- **URL:** https://cadastro.corretoracorporate.com.br/api/webhook
- **Status:** Ativo ✅
- **E-mail:** corretoracorporate.com.br

Agora vamos testá-lo!

---

## 🎯 OPÇÃO 1: Criar Cobrança PIX de Teste

### No seu sistema:

1. **Acesse:** https://cadastro.corretoracorporate.com.br
2. **Faça login:** admin / admin123
3. **Clique em "Gerar Link"** (botão verde)
4. **Preencha:**
   - **Subconta:** Selecione uma subconta
   - **Método de Cobrança:** PIX
   - **Nome do Link:** Teste Webhook
   - **Valor:** R$ 10,00
   - **Descrição:** Teste de webhook
5. **Clique em "Gerar Link"**
6. **Copie o link** gerado

### O que acontecerá:

✅ **PAYMENT_CREATED** → Webhook enviado imediatamente!
- Asaas cria a cobrança
- Envia webhook: `PAYMENT_CREATED`
- Seu sistema recebe e processa

### Verificar se funcionou:

**Via SQL no Console D1:**
```sql
SELECT id, event, processed, created_at 
FROM webhooks 
ORDER BY created_at DESC 
LIMIT 5;
```

**Via API:**
```
GET https://cadastro.corretoracorporate.com.br/api/webhooks?limit=5
```

---

## 🎯 OPÇÃO 2: Fazer Pagamento de Teste

### Passo a Passo:

1. **Crie uma cobrança** (como na Opção 1)
2. **Copie o QR Code PIX**
3. **Abra seu app bancário**
4. **Escaneie o QR Code**
5. **Faça o pagamento** (R$ 10,00)

### O que acontecerá:

✅ **PAYMENT_CONFIRMED** → Logo após o pagamento
✅ **PAYMENT_RECEIVED** → Após compensação (1-2 dias)

### Eventos que você receberá:

1. `PAYMENT_CREATED` - Cobrança criada
2. `PAYMENT_CONFIRMED` - Pagamento aprovado
3. `PAYMENT_RECEIVED` - Dinheiro disponível

---

## 🎯 OPÇÃO 3: Usar Webhook Tester Online

### Simular webhook manualmente:

1. **Acesse:** https://webhook.site/ ou https://requestbin.com/
2. **Copie a URL temporária**
3. **Configure no Asaas** (temporariamente)
4. **Faça o teste**
5. **Veja o payload** recebido
6. **Volte a URL original**

---

## 🎯 OPÇÃO 4: Testar via cURL (Manual)

Execute este comando para simular um webhook:

```bash
curl -X POST https://cadastro.corretoracorporate.com.br/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: seu-token-aqui" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_123456",
      "customer": "cus_test_123",
      "billingType": "PIX",
      "value": 100.00,
      "netValue": 98.50,
      "status": "RECEIVED",
      "dueDate": "2026-02-20",
      "paymentDate": "2026-02-16",
      "description": "Pagamento de teste",
      "confirmedDate": "2026-02-16"
    }
  }'
```

**Resultado esperado:**
```json
{
  "ok": true,
  "message": "Webhook recebido",
  "webhookId": "webhook-xxx"
}
```

---

## 📊 VERIFICAR WEBHOOKS RECEBIDOS

### No Console D1:

```sql
-- Ver últimos webhooks
SELECT 
  id,
  event,
  processed,
  created_at,
  error
FROM webhooks 
ORDER BY created_at DESC 
LIMIT 10;
```

### Ver detalhes de um webhook:

```sql
SELECT * FROM webhooks WHERE id = 'webhook-xxx';
```

### Ver payload completo:

```sql
SELECT 
  id,
  event,
  json_extract(payload, '$.payment.id') as payment_id,
  json_extract(payload, '$.payment.value') as value,
  json_extract(payload, '$.payment.status') as status,
  created_at
FROM webhooks 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔍 MONITORAR EM TEMPO REAL

### Ver logs de atividades:

```sql
SELECT 
  action,
  details,
  created_at
FROM activity_logs 
WHERE action IN ('PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'PAYMENT_REFUNDED')
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ CHECKLIST DE TESTE

- [ ] Criar cobrança PIX no sistema
- [ ] Copiar link/QR Code gerado
- [ ] Verificar se webhook PAYMENT_CREATED foi recebido
- [ ] (Opcional) Fazer pagamento de teste
- [ ] (Opcional) Verificar webhook PAYMENT_CONFIRMED
- [ ] (Opcional) Verificar webhook PAYMENT_RECEIVED
- [ ] Ver webhooks recebidos no D1
- [ ] Ver logs de atividades
- [ ] Confirmar que processed = 1

---

## 🎯 RESULTADO ESPERADO

Após criar uma cobrança:

**Tabela webhooks:**
```
id                          | event            | processed | created_at
webhook-1739294671234-abc  | PAYMENT_CREATED  | 1         | 2026-02-16 12:00:00
```

**Tabela activity_logs:**
```
action           | details                           | created_at
PAYMENT_RECEIVED | {"paymentId":"pay_xxx","value":10}| 2026-02-16 12:00:01
```

---

## 🆘 SE NÃO RECEBER WEBHOOKS

### Verifique:

1. **URL correta?**
   ```
   https://cadastro.corretoracorporate.com.br/api/webhooks/asaas
   ```

2. **Webhook ativo no Asaas?**
   - Integrações → Webhooks
   - Status: Ativo ✅

3. **Eventos selecionados?**
   - PAYMENT_CREATED ✅
   - PAYMENT_RECEIVED ✅

4. **Firewall/Proxy?**
   - Cloudflare permite POST requests
   - SSL ativo

5. **Veja histórico no Asaas:**
   - Webhooks → Seu webhook → Histórico
   - Veja status HTTP das tentativas

---

## 📞 COMANDOS ÚTEIS

```bash
# Ver últimos webhooks recebidos
curl https://cadastro.corretoracorporate.com.br/api/webhooks?limit=5

# Reprocessar webhook
curl -X POST https://cadastro.corretoracorporate.com.br/api/webhooks/WEBHOOK_ID/reprocess

# Ver logs de atividades
# (executar no Console D1)
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

---

**Recomendação:** Comece com a **Opção 1** - criar uma cobrança de teste no seu sistema!

**Me avise quando criar a cobrança e vou te ajudar a verificar se o webhook foi recebido!** 🚀
