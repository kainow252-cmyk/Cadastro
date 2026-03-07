# 🧪 Guia de Teste - Correção do Bug de Cobrança Única

## 📋 O que foi corrigido?

Antes da correção, **todas as cobranças** (únicas ou mensais) exibiam a mensagem de "Assinatura Ativada!" após o pagamento.

Agora, o sistema diferencia corretamente:
- **Cobrança Única** → "Pagamento Confirmado!" 
- **Assinatura Mensal** → "Assinatura Ativada!"

---

## 🎯 Como Testar

### Teste 1: Cobrança Única (R$ 10)

#### 1. Gerar Link de Pagamento
Acesse o painel admin e crie um link com:
- **Valor**: R$ 10,00
- **Tipo**: **Cobrança Única** (`charge_type = 'single'`)
- **Descrição**: "Teste Pagamento Único"

#### 2. Fazer Pagamento
1. Abra o link no navegador
2. Preencha os dados do cliente:
   - Nome: João Silva
   - Email: joao@example.com
   - CPF: 123.456.789-00
   - Data de Nascimento: 01/01/1990
3. Clique em "Confirmar e Gerar PIX"
4. **Abra o Console do Navegador (F12)** para ver os logs:
   ```
   📝 Tipo de cobrança recebido do backend: single
   💾 Tipo de cobrança salvo em window.chargeType: single
   ```

#### 3. Pagar o PIX
- Escaneie o QR Code com o app do banco **OU**
- Copie o "PIX Copia e Cola" e cole no seu app bancário
- Confirme o pagamento

#### 4. Aguardar Confirmação (5-30 segundos)
O sistema verifica o status a cada 5 segundos e exibe:

#### 5. ✅ Verificar Mensagem Correta
Após o pagamento, deve aparecer:

```
🎉 Pagamento Confirmado!
✅ Seu pagamento foi processado com sucesso

🎁 Obrigado pela sua compra!

O que acontece agora?

1. Pagamento Confirmado
   Seu pagamento foi confirmado e processado

2. Compra Concluída
   Sua compra foi registrada com sucesso

3. Recibo Enviado
   Você receberá o comprovante por email
```

**❌ NÃO deve aparecer**:
- "Assinatura Ativada"
- "Assinatura Ativa"
- "Cobranças Automáticas"
- "Todo mês você receberá um novo PIX"

---

### Teste 2: Assinatura Mensal (R$ 10/mês)

#### 1. Gerar Link de Assinatura
Acesse o painel admin e crie um link com:
- **Valor**: R$ 10,00
- **Tipo**: **Assinatura Mensal** (`charge_type = 'monthly'`)
- **Descrição**: "Teste Assinatura Mensal"

#### 2. Fazer Pagamento
1. Abra o link no navegador
2. Preencha os dados do cliente
3. Clique em "Confirmar e Gerar PIX"
4. **Verifique o Console**:
   ```
   📝 Tipo de cobrança recebido do backend: monthly
   💾 Tipo de cobrança salvo em window.chargeType: monthly
   ```

#### 3. Pagar o PIX
- Pague o primeiro PIX da assinatura

#### 4. ✅ Verificar Mensagem Correta
Após o pagamento, deve aparecer:

```
🎉 Agendamento Confirmado!
✅ Sua assinatura foi ativada com sucesso

⭐ Bem-vindo à sua assinatura! ⭐

O que acontece agora?

1. Pagamento Processado
   Seu pagamento foi confirmado e registrado

2. Assinatura Ativa
   Sua assinatura mensal está ativa a partir de agora

3. Cobranças Automáticas
   Todo mês você receberá um novo PIX por email
```

---

## 🔍 Logs de Debug no Console

### Ao Gerar o PIX
```javascript
📝 Tipo de cobrança recebido do backend: single  // ou monthly
💾 Tipo de cobrança salvo em window.chargeType: single
```

### Ao Confirmar o Pagamento
```javascript
🔍 showPaymentConfirmed - chargeType: single  // ou monthly
```

### Resposta do Backend
```json
{
  "ok": true,
  "chargeType": "single",  // ← Campo crucial
  "firstPayment": {
    "id": "pay_abc123",
    "status": "RECEIVED",
    "pix": {
      "payload": "00020126...",
      "qrCodeBase64": "data:image/png;base64,..."
    }
  }
}
```

---

## 📊 Tabela de Verificação

| Item | Cobrança Única | Assinatura Mensal |
|------|----------------|-------------------|
| **chargeType no backend** | `'single'` | `'monthly'` |
| **window.chargeType** | `'single'` | `'monthly'` |
| **Título principal** | "Pagamento Confirmado!" | "Agendamento Confirmado!" |
| **Subtítulo** | "✅ Seu pagamento foi processado com sucesso" | "✅ Sua assinatura foi ativada com sucesso" |
| **Boas-vindas** | "🎁 Obrigado pela sua compra!" | "⭐ Bem-vindo à sua assinatura! ⭐" |
| **Passo 1** | "Pagamento Confirmado" | "Pagamento Processado" |
| **Passo 2** | "Compra Concluída" | "Assinatura Ativa" |
| **Passo 3** | "Recibo Enviado" | "Cobranças Automáticas" |
| **Descrição Passo 3** | "Você receberá o comprovante por email" | "Todo mês você receberá um novo PIX por email" |

---

## 🐛 Se Aparecer o Bug

### Sintomas
- Cobrança única mostrando "Assinatura Ativada!"
- `window.chargeType` está `'monthly'` mas deveria ser `'single'`
- Console mostra `chargeType: monthly` quando deveria ser `single`

### Checklist de Debug
1. ✅ Verificar resposta do backend no Network (F12 → Network):
   ```json
   { "chargeType": "single" }
   ```
2. ✅ Verificar `window.chargeType` no console:
   ```javascript
   window.chargeType  // deve ser 'single'
   ```
3. ✅ Verificar tabela do banco de dados:
   ```sql
   SELECT charge_type FROM subscription_signup_links WHERE id = 'abc123'
   ```
4. ✅ Verificar código no `src/index.tsx`:
   - Linha 8984: `window.chargeType = response.data.chargeType || 'single'`
   - Linha 9032: `const chargeType = window.chargeType || 'single'`

---

## 🚀 URLs de Teste

### Produção
- **Frontend**: https://corretoracorporate.pages.dev
- **Admin**: https://admin.corretoracorporate.com.br

### Último Deploy
- **URL**: https://5080ba57.corretoracorporate.pages.dev
- **Build**: `dist/_worker.js  649.13 kB`
- **Commit**: `468ef31`

---

## 📞 Suporte

Se encontrar qualquer problema durante os testes:
1. Anote o **ID do pagamento** (ex: `pay_abc123`)
2. Tire um **screenshot** da mensagem errada
3. Copie os **logs do console** (F12 → Console)
4. Anote a **URL do link** usado
5. Relate o problema com essas informações

---

## ✅ Checklist Final

- [ ] Teste 1: Cobrança única mostra mensagem correta
- [ ] Teste 2: Assinatura mensal mostra mensagem correta
- [ ] Logs do console aparecem corretamente
- [ ] Backend retorna `chargeType` correto
- [ ] `window.chargeType` salva valor correto
- [ ] Não há confusão entre os dois tipos
- [ ] Deploy em produção OK
- [ ] Documentação criada

**Status**: 🟢 **PRONTO PARA TESTES** 🧪
