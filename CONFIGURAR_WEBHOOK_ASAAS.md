# ⚙️ Como Configurar o Webhook do Asaas

## 🎯 Objetivo

Ativar notificações instantâneas (0-1s) quando um pagamento PIX for confirmado, ao invés de esperar 5-10 segundos do polling.

---

## 📋 Pré-requisitos

- ✅ Conta Asaas ativa
- ✅ Sistema já implantado em produção
- ✅ URL do webhook pronta: `https://gerenciador.corretoracorporate.com.br/api/webhooks/asaas`

---

## 🚀 Passo a Passo

### 1. Acessar Configurações de Webhook

**URL:** https://www.asaas.com/config/webhooks

Faça login na sua conta Asaas e acesse o menu de configurações de webhooks.

---

### 2. Adicionar Novo Webhook

Clique no botão **"Adicionar Webhook"** ou **"Novo Webhook"**.

---

### 3. Configurar URL do Webhook

**Campo: URL de Callback**
```
https://gerenciador.corretoracorporate.com.br/api/webhooks/asaas
```

⚠️ **IMPORTANTE:**
- Usar HTTPS (não HTTP)
- Usar domínio em produção (não usar deploy temporário)
- Não adicionar barra `/` no final

---

### 4. Selecionar Eventos

Marque os seguintes eventos:

#### ✅ Eventos de Pagamento:

- [x] **PAYMENT_RECEIVED** - Pagamento recebido
- [x] **PAYMENT_CONFIRMED** - Pagamento confirmado

#### ❌ Eventos Opcionais (não necessários):

- [ ] PAYMENT_CREATED - Pagamento criado
- [ ] PAYMENT_UPDATED - Pagamento atualizado
- [ ] PAYMENT_AWAITING_RISK_ANALYSIS - Aguardando análise
- [ ] PAYMENT_APPROVED_BY_RISK_ANALYSIS - Aprovado pela análise
- [ ] PAYMENT_REPROVED_BY_RISK_ANALYSIS - Reprovado pela análise
- [ ] PAYMENT_OVERDUE - Pagamento vencido
- [ ] PAYMENT_DELETED - Pagamento deletado
- [ ] PAYMENT_RESTORED - Pagamento restaurado
- [ ] PAYMENT_REFUNDED - Pagamento estornado
- [ ] PAYMENT_REFUND_IN_PROGRESS - Estorno em progresso
- [ ] PAYMENT_RECEIVED_IN_CASH_UNDONE - Recebimento desfeito
- [ ] PAYMENT_CHARGEBACK_REQUESTED - Chargeback solicitado
- [ ] PAYMENT_CHARGEBACK_DISPUTE - Disputa de chargeback
- [ ] PAYMENT_AWAITING_CHARGEBACK_REVERSAL - Aguardando reversão
- [ ] PAYMENT_DUNNING_RECEIVED - Cobrança recebida
- [ ] PAYMENT_DUNNING_REQUESTED - Cobrança solicitada
- [ ] PAYMENT_BANK_SLIP_VIEWED - Boleto visualizado
- [ ] PAYMENT_CHECKOUT_VIEWED - Checkout visualizado

**Conclusão:** Marque apenas **PAYMENT_RECEIVED** e **PAYMENT_CONFIRMED**.

---

### 5. Configurar Versão da API

**Campo: Versão da API**
```
v3
```

Selecione a versão **v3** (mais recente).

---

### 6. Ativar Webhook

**Campo: Status**
```
[x] Ativo
```

Certifique-se de marcar como **Ativo**.

---

### 7. Salvar Configuração

Clique em **"Salvar"** ou **"Criar Webhook"**.

---

## ✅ Verificar Configuração

Após salvar, você verá uma tela de resumo:

```
┌────────────────────────────────────────────────────┐
│ Webhook Configurado                                │
├────────────────────────────────────────────────────┤
│ URL: https://gerenciador.corretoracorporate...    │
│ Status: 🟢 Ativo                                   │
│ Versão: v3                                         │
│ Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED      │
│ Criado em: 18/02/2026                             │
└────────────────────────────────────────────────────┘
```

---

## 🧪 Testar Webhook

### Opção 1: Teste Manual no Painel Asaas

1. No painel de webhooks, clique em **"Testar"** ou **"Enviar Teste"**
2. Selecione o evento `PAYMENT_RECEIVED`
3. Clique em **"Enviar"**
4. Verifique se recebeu resposta de sucesso

---

### Opção 2: Teste via cURL

```bash
curl -X POST https://gerenciador.corretoracorporate.com.br/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_12345",
      "value": 10.00,
      "status": "RECEIVED",
      "paymentDate": "2026-02-18",
      "customer": "cus_000000000000"
    }
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "message": "Webhook processado",
  "paymentId": "pay_test_12345"
}
```

---

### Opção 3: Teste Real (Pagamento de Verdade)

1. Gere um link de auto-cadastro no painel admin
2. Acesse o link em aba anônima
3. Preencha os dados e gere o PIX
4. Pague o PIX (pode ser valor mínimo R$ 1,00)
5. Aguarde 1-3 segundos
6. Verifique se a tela mudou para "Pagamento Confirmado!" com som e confetti

---

## 📊 Monitorar Webhooks

### Ver Logs no Cloudflare

```bash
npx wrangler pages deployment tail --project-name corretoracorporate
```

Busque por:
```
Webhook recebido: {...}
Pagamento pay_xxx confirmado via webhook
```

---

### Ver Histórico no Asaas

1. Acesse: https://www.asaas.com/config/webhooks
2. Clique no webhook configurado
3. Veja aba **"Histórico"** ou **"Logs"**
4. Verifique:
   - Quantos webhooks foram enviados
   - Quais tiveram sucesso (status 200)
   - Quais falharam (status 4xx/5xx)

---

## 🔧 Troubleshooting

### Problema: Webhook não está sendo recebido

**Soluções:**

1. **Verificar URL:**
   - Certifique-se de usar HTTPS
   - Não adicionar `/` no final
   - Usar domínio correto

2. **Verificar status:**
   - Webhook deve estar **Ativo**
   - Eventos corretos selecionados

3. **Verificar firewall:**
   - Cloudflare não está bloqueando
   - Sem rate limiting ativo

4. **Testar manualmente:**
   ```bash
   curl -X POST https://gerenciador.corretoracorporate.com.br/api/webhooks/asaas \
     -H "Content-Type: application/json" \
     -d '{"event":"PAYMENT_RECEIVED","payment":{"id":"test"}}'
   ```

---

### Problema: Webhook retorna erro 401 (Não autorizado)

**Solução:**

O endpoint `/api/webhooks/asaas` é **público** e não requer autenticação. Se está recebendo 401, verifique:

1. Rota está na lista de rotas públicas:
   ```typescript
   if (path.startsWith('/api/webhooks/')) {
     return next()
   }
   ```

2. Faça novo deploy:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name corretoracorporate
   ```

---

### Problema: Pagamento confirmado mas webhook não atualizou

**Soluções:**

1. **Verificar logs do Cloudflare:**
   ```bash
   npx wrangler pages deployment tail
   ```

2. **Verificar banco D1:**
   ```bash
   npx wrangler d1 execute corretoracorporate-db --local \
     --command="SELECT * FROM transactions WHERE id='pay_xxx'"
   ```

3. **Forçar sincronização manual:**
   ```bash
   curl -X POST https://gerenciador.corretoracorporate.com.br/api/admin/sync-transactions \
     -H "Cookie: auth_token=SEU_TOKEN"
   ```

---

## 📈 Métricas de Sucesso

Após configurar o webhook, você deve ver:

| Métrica | Antes (Polling) | Depois (Webhook) |
|---------|-----------------|------------------|
| Tempo de confirmação | 5-10 segundos | 0-1 segundo |
| Requisições ao Asaas | ~12 por minuto | 0 (webhook push) |
| Experiência do usuário | ⭐⭐⭐ Regular | ⭐⭐⭐⭐⭐ Excelente |

---

## ✅ Checklist Final

Antes de concluir, verifique:

- [ ] URL do webhook configurada corretamente
- [ ] Eventos `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED` selecionados
- [ ] Webhook marcado como **Ativo**
- [ ] Teste manual realizado com sucesso
- [ ] Teste real com pagamento confirmou funcionamento
- [ ] Logs do Cloudflare mostram webhooks sendo recebidos
- [ ] Som e animações funcionando ao confirmar pagamento

---

## 🎯 Resultado Final

Com o webhook configurado, você terá:

✅ Confirmação **instantânea** (0-1s)  
✅ Som de sucesso automático  
✅ Animação de confetti  
✅ Experiência visual impactante  
✅ Cliente feliz 🎉  

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique a documentação completa em `MELHORIAS_UX_IMPLEMENTADAS.md`
2. Revise o resumo em `RESUMO_MELHORIAS_FINAL.md`
3. Teste o endpoint manualmente com cURL
4. Verifique os logs do Cloudflare Pages

---

**Desenvolvido com ❤️ para proporcionar a melhor experiência ao cliente!**
