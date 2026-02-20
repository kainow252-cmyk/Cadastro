# 🔔 Configurar Webhook do Asaas

**Data:** 20/02/2026 18:30  
**Objetivo:** Monitorar aprovação de sub-contas e confirmação de pagamentos automaticamente

---

## 📋 O Que É Webhook?

Webhook é uma notificação automática que o Asaas envia para o nosso sistema quando algo acontece:

- ✅ **Sub-conta aprovada** → Sistema recebe notificação
- ✅ **Pagamento recebido** → Sistema confirma automaticamente
- ✅ **Split processado** → Sistema valida valores
- ✅ **Conta rejeitada** → Sistema registra no log

**Vantagem:** Não precisa ficar consultando a API do Asaas constantemente!

---

## 🎯 Eventos Monitorados

### 1. Eventos de Sub-Conta
```
ACCOUNT_CREATED         → Conta criada
ACCOUNT_UPDATED         → Dados da conta atualizados
ACCOUNT_STATUS_CHANGED  → Status mudou (APROVADA, REJEITADA, etc.)
```

### 2. Eventos de Pagamento
```
PAYMENT_CREATED   → Cobrança criada
PAYMENT_RECEIVED  → Pagamento recebido (PIX)
PAYMENT_CONFIRMED → Pagamento confirmado
PAYMENT_OVERDUE   → Pagamento vencido
PAYMENT_REFUNDED  → Pagamento estornado
```

### 3. Eventos de Transferência
```
TRANSFER_DONE → Split processado e transferido
```

---

## 🔧 Configuração no Painel Asaas

### Passo 1: Acessar Configurações

1. **Acesse o painel Asaas:**
   - Sandbox: https://sandbox.asaas.com
   - Produção: https://www.asaas.com

2. **Faça login** com a conta principal

3. **Vá em: Configurações → Webhooks**
   ```
   Menu lateral → Configurações → Webhooks
   ```

### Passo 2: Adicionar Webhook

1. **Clique em "Adicionar Webhook"**

2. **Preencha os dados:**

   **URL do Webhook:**
   ```
   https://corretoracorporate.pages.dev/api/webhooks/asaas
   ```
   
   **E-mail para notificação de falhas:**
   ```
   seu-email@exemplo.com
   ```
   
   **Status:** ✅ Ativo

### Passo 3: Selecionar Eventos

**Marque os seguintes eventos:**

#### Sub-Contas:
- ☑️ `ACCOUNT_CREATED` - Conta criada
- ☑️ `ACCOUNT_UPDATED` - Conta atualizada
- ☑️ `ACCOUNT_STATUS_CHANGED` - Status mudou (⭐ IMPORTANTE)

#### Pagamentos:
- ☑️ `PAYMENT_CREATED` - Cobrança criada
- ☑️ `PAYMENT_RECEIVED` - Pagamento recebido (⭐ IMPORTANTE)
- ☑️ `PAYMENT_CONFIRMED` - Pagamento confirmado
- ☑️ `PAYMENT_OVERDUE` - Pagamento vencido
- ☑️ `PAYMENT_REFUNDED` - Estorno

#### Transferências:
- ☑️ `TRANSFER_DONE` - Split processado (⭐ IMPORTANTE)

### Passo 4: Configurar Token (Opcional mas Recomendado)

1. **Gerar um token único** (senha aleatória)
   ```bash
   # Exemplo de token:
   webhook_asaas_2026_abc123xyz789
   ```

2. **Copiar o token**

3. **Configurar no Cloudflare Pages:**
   - Acesse: https://dash.cloudflare.com
   - Vá em: **Pages → corretoracorporate → Settings → Environment variables**
   - Adicione:
     ```
     Nome: ASAAS_WEBHOOK_TOKEN
     Valor: webhook_asaas_2026_abc123xyz789
     ```
   - Clique em **"Save"**

4. **Configurar no Asaas:**
   - Volte para o painel Asaas
   - No campo **"Token de Autenticação"**, cole o mesmo token
   - Salve

### Passo 5: Testar Webhook

1. **Clique em "Testar Webhook"** no painel Asaas

2. **Verificar logs:**
   ```bash
   # Via Cloudflare
   npx wrangler pages deployment tail corretoracorporate
   
   # Ou via API
   curl https://corretoracorporate.pages.dev/api/webhooks
   ```

3. **Resposta esperada:**
   ```json
   {
     "ok": true,
     "message": "Webhook recebido",
     "webhookId": "webhook-1708456789-abc123"
   }
   ```

---

## 🧪 Como Testar

### Teste 1: Criar Nova Sub-Conta

1. **Criar sub-conta via dashboard:**
   ```
   https://corretoracorporate.pages.dev
   Login: admin / admin123
   ```

2. **Preencher formulário de cadastro**

3. **Aguardar 5-10 segundos**

4. **Verificar webhooks recebidos:**
   ```bash
   curl https://corretoracorporate.pages.dev/api/webhooks?limit=10
   ```

5. **Você verá:**
   ```json
   {
     "webhooks": [
       {
         "id": "webhook-xxx",
         "event": "ACCOUNT_CREATED",
         "processed": 1,
         "created_at": "2026-02-20 18:30:00"
       }
     ]
   }
   ```

### Teste 2: Aprovar Sub-Conta (Sandbox)

1. **Acesse o painel Asaas Sandbox:**
   ```
   https://sandbox.asaas.com
   ```

2. **Vá em: Subcontas → [Selecione a conta]**

3. **Clique em "Aprovar Conta"** (sandbox)

4. **O sistema receberá:**
   ```
   Event: ACCOUNT_STATUS_CHANGED
   Status: PENDING → APPROVED
   ```

5. **Console mostrará:**
   ```
   🎉 CONTA APROVADA: {
     id: "acc_123",
     name: "Roberto Caporalle Mayo",
     email: "rmayo@bol.com.br",
     status: "APPROVED",
     walletId: "670c8f60..."
   }
   ```

### Teste 3: Criar Cobrança e Pagar

1. **Criar cobrança PIX:**
   ```
   Dashboard → PIX → PIX com Split
   Valor: R$ 10,00
   ```

2. **Pagar via PIX** (sandbox)

3. **Webhooks recebidos:**
   ```
   1. PAYMENT_CREATED  → Cobrança criada
   2. PAYMENT_RECEIVED → Pagamento recebido
   3. TRANSFER_DONE    → Split processado
   ```

---

## 📊 Monitorar Webhooks

### Via Dashboard (Interface Web)

**Endpoint:** `GET /api/webhooks`

**Parâmetros:**
- `limit` - Quantidade (padrão: 50)
- `processed` - Filtrar processados (true/false)

**Exemplo:**
```bash
# Últimos 10 webhooks
curl https://corretoracorporate.pages.dev/api/webhooks?limit=10

# Apenas não processados
curl https://corretoracorporate.pages.dev/api/webhooks?processed=false

# Apenas processados
curl https://corretoracorporate.pages.dev/api/webhooks?processed=true
```

### Via Console Cloudflare

```bash
# Ver logs em tempo real
npx wrangler pages deployment tail corretoracorporate

# Ver logs de webhook específico
npx wrangler pages deployment tail corretoracorporate --format pretty | grep webhook
```

### Via Banco de Dados

```bash
# Conectar ao D1
npx wrangler d1 execute corretoracorporate-db --local

# Ver últimos webhooks
SELECT 
  id, 
  event, 
  processed, 
  created_at,
  error
FROM webhooks 
ORDER BY created_at DESC 
LIMIT 10;

# Ver webhooks de aprovação de conta
SELECT 
  id, 
  event, 
  JSON_EXTRACT(payload, '$.account.name') as account_name,
  JSON_EXTRACT(payload, '$.account.status') as status,
  created_at
FROM webhooks 
WHERE event = 'ACCOUNT_STATUS_CHANGED'
ORDER BY created_at DESC;
```

---

## 🔍 O Que o Sistema Faz Ao Receber Webhook

### Quando Conta É Aprovada (ACCOUNT_STATUS_CHANGED → APPROVED):

```typescript
1. ✅ Detecta mudança de status: PENDING → APPROVED
2. ✅ Atualiza cache de sub-contas no banco D1
3. ✅ Registra log de atividade:
   {
     action: 'ACCOUNT_APPROVED',
     accountId: 'acc_123',
     accountName: 'Roberto Caporalle Mayo',
     accountEmail: 'rmayo@bol.com.br',
     walletId: '670c8f60...',
     approvedAt: '2026-02-20T18:30:00Z'
   }
4. ✅ Console mostra: 🎉 CONTA APROVADA
5. 📧 (Opcional) Envia email de congratulações
```

### Quando Pagamento É Recebido (PAYMENT_RECEIVED):

```typescript
1. ✅ Registra no banco de atividades
2. ✅ Verifica se há split configurado
3. ✅ Confirma valores:
   - Sub-conta deve receber: 20% líquido
   - Conta principal: resto menos taxas
4. 📧 Envia email de confirmação (se configurado)
5. ✅ Console mostra: 📧 Pagamento recebido: pay_123
```

### Quando Split É Processado (TRANSFER_DONE):

```typescript
1. ✅ Registra transferência no banco
2. ✅ Confirma que sub-conta recebeu o valor correto
3. ✅ Console mostra: Transferência concluída: tra_123
```

---

## 🚨 Solução de Problemas

### Problema 1: Webhook Não Está Recebendo

**Causas possíveis:**
- ❌ URL incorreta
- ❌ Webhook desativado no Asaas
- ❌ Firewall bloqueando

**Solução:**
1. **Verificar URL:**
   ```
   https://corretoracorporate.pages.dev/api/webhooks/asaas
   ```
   
2. **Testar manualmente:**
   ```bash
   curl -X POST https://corretoracorporate.pages.dev/api/webhooks/asaas \
     -H "Content-Type: application/json" \
     -d '{"event":"TEST","test":true}'
   ```
   
3. **Verificar no painel Asaas:**
   - Menu → Configurações → Webhooks
   - Status deve estar **Ativo** ✅

### Problema 2: Token Inválido (401 Unauthorized)

**Causa:** Token do webhook não confere

**Solução:**
1. **Verificar variável de ambiente:**
   ```bash
   # Cloudflare Pages → Settings → Environment variables
   ASAAS_WEBHOOK_TOKEN = seu_token_aqui
   ```
   
2. **Verificar no Asaas:**
   - Configurações → Webhooks → Editar
   - Campo "Token de Autenticação"
   - Deve ser o **mesmo** token

3. **Caso não use token:**
   - Remova a variável `ASAAS_WEBHOOK_TOKEN` do Cloudflare
   - Deixe em branco no Asaas

### Problema 3: Webhook Processado Mas Nada Acontece

**Causa:** Evento não está sendo tratado

**Solução:**
1. **Ver logs:**
   ```bash
   npx wrangler pages deployment tail corretoracorporate | grep webhook
   ```
   
2. **Verificar banco:**
   ```sql
   SELECT * FROM webhooks WHERE processed = 0 ORDER BY created_at DESC;
   ```
   
3. **Reprocessar webhook:**
   ```bash
   curl -X POST https://corretoracorporate.pages.dev/api/webhooks/reprocess/{id}
   ```

---

## 📊 Dashboard de Webhooks (Futuro)

**Em desenvolvimento:**
- 📊 Visualização gráfica de webhooks
- 🔔 Notificações em tempo real
- 📧 Alertas por email
- 🔄 Reprocessamento manual
- 📈 Estatísticas de eventos

---

## 📚 Referências

**Documentação Asaas:**
- https://docs.asaas.com/reference/webhooks
- https://docs.asaas.com/reference/eventos-de-webhook

**Eventos de Sub-Conta:**
- https://docs.asaas.com/reference/eventos-de-subconta

**Eventos de Pagamento:**
- https://docs.asaas.com/reference/eventos-de-pagamento

---

## ✅ Checklist de Configuração

- [ ] Webhook adicionado no painel Asaas
- [ ] URL configurada: `https://corretoracorporate.pages.dev/api/webhooks/asaas`
- [ ] Eventos selecionados:
  - [ ] ACCOUNT_STATUS_CHANGED
  - [ ] PAYMENT_RECEIVED
  - [ ] TRANSFER_DONE
- [ ] Token gerado e configurado (opcional)
- [ ] Variável `ASAAS_WEBHOOK_TOKEN` configurada no Cloudflare (se usar token)
- [ ] Webhook testado no painel Asaas
- [ ] Logs verificados (`npx wrangler pages deployment tail`)
- [ ] Teste real: criar sub-conta e verificar webhook

---

## 🎯 Próximos Passos

### Para Você:
1. ✅ **Configurar webhook** no painel Asaas
2. ✅ **Adicionar URL:** `https://corretoracorporate.pages.dev/api/webhooks/asaas`
3. ✅ **Selecionar eventos** (ACCOUNT_STATUS_CHANGED, PAYMENT_RECEIVED, TRANSFER_DONE)
4. ✅ **Testar** criando uma sub-conta
5. ✅ **Verificar logs** para confirmar recebimento

### Sistema:
- ✅ Webhook já implementado
- ✅ Handlers atualizados com logs detalhados
- ✅ Detecção de aprovação de conta
- ✅ Registro de atividades
- ✅ Pronto para receber eventos

---

**🔔 WEBHOOK PRONTO PARA USO!**

**URL:** https://corretoracorporate.pages.dev/api/webhooks/asaas  
**Status:** ✅ Implementado e aguardando configuração no Asaas  
**Eventos:** ACCOUNT_STATUS_CHANGED, PAYMENT_RECEIVED, TRANSFER_DONE

**📖 Após configurar, consulte:** `/api/webhooks` para ver eventos recebidos
