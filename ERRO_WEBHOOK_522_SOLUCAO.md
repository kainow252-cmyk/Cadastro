# ⚠️ ERRO 522 WEBHOOK - SOLUÇÃO URGENTE

**Data**: 06/03/2026 - 18:30  
**Erro**: 522 Connection Timed Out  
**URL**: https://cadastro.corretoracorporate.com.br/api/webhooks/asaas  
**Tipo**: Transferência via Webhook

---

## 🔴 PROBLEMA IDENTIFICADO

### Erro 522 - Connection Timed Out

**O que aconteceu:**
1. Você configurou um webhook na Asaas
2. URL configurada: `https://cadastro.corretoracorporate.com.br/api/webhooks/asaas`
3. Asaas tentou chamar o webhook
4. **Domínio NÃO responde** (erro 522)
5. Cloudflare cancelou após timeout

### Causa Raiz
O domínio **cadastro.corretoracorporate.com.br** **NÃO está configurado** ou **NÃO aponta para lugar nenhum**!

---

## ✅ DOMÍNIOS CORRETOS

### Domínios que FUNCIONAM
1. **corretoracorporate.pages.dev** ✅  
   - URL: https://corretoracorporate.pages.dev
   - Status: ATIVO
   - Cloudflare Pages oficial

2. **admin.corretoracorporate.com.br** ✅  
   - URL: https://admin.corretoracorporate.com.br
   - Status: ATIVO (provável)
   - Custom domain configurado

### Domínio que NÃO FUNCIONA
❌ **cadastro.corretoracorporate.com.br**  
   - Status: **NÃO CONFIGURADO**
   - Erro: 522 Connection Timed Out
   - Problema: Não aponta para nenhum servidor

---

## 🔧 SOLUÇÃO URGENTE

### Opção 1: Usar Domínio Cloudflare Pages (RECOMENDADO)

**URL do Webhook:**
```
https://corretoracorporate.pages.dev/api/webhooks/asaas
```

**Como configurar na Asaas:**
1. Acesse: https://www.asaas.com
2. Login → **Integrações** → **Webhooks**
3. **Editar** o webhook existente
4. **Mudar URL** para:
   ```
   https://corretoracorporate.pages.dev/api/webhooks/asaas
   ```
5. **Salvar**
6. **Testar** webhook

### Opção 2: Usar Custom Domain Ativo

**Se admin.corretoracorporate.com.br funciona:**
```
https://admin.corretoracorporate.com.br/api/webhooks/asaas
```

**Como configurar:**
1. Mesmo processo acima
2. Usar URL: `https://admin.corretoracorporate.com.br/api/webhooks/asaas`

### Opção 3: Configurar o Domínio cadastro.* (NÃO RECOMENDADO)

Se REALMENTE precisa do domínio `cadastro.corretoracorporate.com.br`:

**No Cloudflare DNS:**
1. Acesse: https://dash.cloudflare.com
2. Selecione: **corretoracorporate.com.br**
3. **DNS** → **Records**
4. **Adicionar** registro CNAME:
   - Type: `CNAME`
   - Name: `cadastro`
   - Target: `corretoracorporate.pages.dev`
   - Proxy: ✅ Ativado (orange cloud)
5. **Salvar**
6. Aguardar propagação (5-10 minutos)

**No Cloudflare Pages:**
1. Acesse: https://dash.cloudflare.com
2. **Workers & Pages** → **corretoracorporate**
3. **Custom domains** → **Set up a domain**
4. Digite: `cadastro.corretoracorporate.com.br`
5. **Activate domain**

---

## 🧪 TESTAR A SOLUÇÃO

### Teste 1: Verificar URL
```bash
curl -X POST https://corretoracorporate.pages.dev/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_RECEIVED","payment":{"id":"pay_test123"}}'
```

**Esperado**: Status 200 ou 201

### Teste 2: No Painel Asaas
1. Acesse: https://www.asaas.com
2. **Integrações** → **Webhooks**
3. **Testar webhook** (botão de teste)
4. Verificar se recebe status 200

---

## 📊 WEBHOOK NO CÓDIGO

### Endpoint Existe e Está Correto ✅

**Arquivo**: `src/index.tsx`  
**Linha**: 3474

```typescript
app.post('/api/webhooks/asaas', async (c) => {
  // Webhook está implementado
  // Código funcionando
})
```

**Rota pública** (linha 114):
```typescript
path.startsWith('/api/webhooks/')  // ✅ Não requer autenticação
```

---

## ⚠️ IMPACTO DO ERRO

### O Que Está Afetado

**Com erro 522:**
- ❌ Asaas não consegue notificar pagamentos
- ❌ Webhooks de transferência falham
- ❌ Notificações de saque não chegam
- ❌ Logs de erro acumulam

**O que continua funcionando:**
- ✅ Criar cobranças via API
- ✅ Split 20/80
- ✅ Dashboard
- ✅ Consultar pagamentos manualmente

---

## 🔐 TIPOS DE WEBHOOK DA ASAAS

### Eventos Importantes

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_RECEIVED` | Pagamento confirmado | Atualizar status, enviar email |
| `PAYMENT_OVERDUE` | Cobrança vencida | Notificar cliente |
| `PAYMENT_REFUNDED` | Estorno realizado | Reverter split |
| `TRANSFER_AUTHORIZED` | Saque autorizado | Registrar transferência |
| `TRANSFER_REJECTED` | Saque rejeitado | Notificar erro |

---

## 📝 CONFIGURAÇÃO COMPLETA DO WEBHOOK

### No Painel Asaas

**1. Acessar Configuração:**
- https://www.asaas.com
- Integrações → Webhooks

**2. Configurar URL:**
```
URL: https://corretoracorporate.pages.dev/api/webhooks/asaas
Método: POST
Content-Type: application/json
```

**3. Eventos para Ativar:**
- ✅ `PAYMENT_RECEIVED` (pagamento confirmado)
- ✅ `PAYMENT_CONFIRMED` (pagamento creditado)
- ✅ `PAYMENT_OVERDUE` (vencido)
- ✅ `PAYMENT_REFUNDED` (estornado)
- ✅ `TRANSFER_AUTHORIZED` (saque autorizado)
- ✅ `TRANSFER_REJECTED` (saque rejeitado)

**4. Configuração de Segurança:**
- ✅ Token de acesso (opcional)
- ✅ IP whitelist (opcional)
- ✅ HTTPS obrigatório ✅

---

## 🧪 EXEMPLO DE PAYLOAD

### Webhook de Pagamento Recebido

```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_xyz123",
    "customer": "cus_abc456",
    "value": 100.00,
    "netValue": 99.01,
    "status": "RECEIVED",
    "billingType": "PIX",
    "dateCreated": "2026-03-06",
    "paymentDate": "2026-03-06",
    "split": [
      {
        "walletId": "1232b33d-b321-418a-b793-81b5861e3d10",
        "totalValue": 19.80,
        "status": "RECEIVED"
      }
    ]
  }
}
```

### Como o Sistema Processa

```typescript
app.post('/api/webhooks/asaas', async (c) => {
  const data = await c.req.json()
  
  if (data.event === 'PAYMENT_RECEIVED') {
    // 1. Atualizar status do pagamento no D1
    await c.env.DB.prepare(`
      UPDATE transactions 
      SET status = 'RECEIVED', paid_at = datetime('now')
      WHERE id = ?
    `).bind(data.payment.id).run()
    
    // 2. Enviar email de confirmação (opcional)
    // 3. Notificar subconta (opcional)
    // 4. Registrar log
    
    return c.json({ received: true })
  }
  
  return c.json({ received: false })
})
```

---

## 🎯 CHECKLIST DE SOLUÇÃO

### Ações Imediatas

- [ ] **Acessar painel Asaas**: https://www.asaas.com
- [ ] **Ir em Integrações** → Webhooks
- [ ] **Editar webhook** existente
- [ ] **Mudar URL** para: `https://corretoracorporate.pages.dev/api/webhooks/asaas`
- [ ] **Salvar** configuração
- [ ] **Testar** webhook no painel
- [ ] **Verificar** se status muda para 200
- [ ] **Conferir logs** de autorização

---

## 📞 SUPORTE ASAAS

### Se Precisar de Ajuda

**Email:**  
📧 **integracoes@asaas.com.br**  
⏰ Seg-Sex, 9h-18h

**Mensagem sugerida:**
```
Assunto: Erro 522 no Webhook de Transferência

Olá!

Recebi email sobre erro 522 no webhook.

Problema: Domínio configurado não existe
URL antiga: https://cadastro.corretoracorporate.com.br/api/webhooks/asaas
URL correta: https://corretoracorporate.pages.dev/api/webhooks/asaas

Posso alterar a URL do webhook ou preciso reconfigurar?

Obrigado!
```

---

## 🎯 RESUMO

### Problema
❌ Webhook configurado com URL inválida  
❌ Domínio `cadastro.corretoracorporate.com.br` não existe  
❌ Asaas recebe erro 522 (timeout)

### Solução
✅ Usar URL correta: `https://corretoracorporate.pages.dev/api/webhooks/asaas`  
✅ Atualizar no painel Asaas  
✅ Testar webhook

### Resultado Esperado
✅ Webhook funcionando  
✅ Notificações chegando  
✅ Sistema atualizado automaticamente  
✅ Sem erros 522

---

**Última atualização**: 06/03/2026 18:30  
**Status**: ⚠️ REQUER AÇÃO IMEDIATA  
**Próxima ação**: Alterar URL do webhook na Asaas
