# 🔧 Correções: Erro Download QR Code + Diagnóstico DeltaPag Payments

**Data:** 20/02/2026 17:15  
**Deploy ID:** https://96240e57.corretoracorporate.pages.dev  
**Production URL:** https://corretoracorporate.pages.dev

---

## 📋 Problemas Identificados

### 1. ❌ Erro JavaScript: Download QR Code
**Erro original:**
```
deltapag-section.js:781 Uncaught TypeError: Cannot read properties of null (reading 'description')
    at downloadQRCode (deltapag-section.js:794)
```

**Causa:**
- Linha 794 tentava acessar `currentQRData.description` sem verificar se `description` existe
- Código original: 
```javascript
const filename = `qrcode-${currentQRData.description.toLowerCase().replace(/\s+/g, '-')}.png`;
```

**Solução aplicada:**
```javascript
// Gerar nome seguro do arquivo
const description = (currentQRData.description || 'qrcode').toLowerCase().replace(/\s+/g, '-');
const filename = `qrcode-${description}.png`;
```

**Resultado:**
- ✅ QR Code pode ser baixado mesmo sem descrição
- ✅ Nome padrão: `qrcode-qrcode.png`
- ✅ Nome com descrição: `qrcode-plano-premium.png`

---

### 2. ⚠️ DeltaPag: Payments não sendo criados

**Sintoma:**
- Clientes são criados com sucesso na API DeltaPag
- Coluna "Última transação" permanece vazia no painel DeltaPag
- Logs mostram: `Falha ao criar cobrança: HTTP 4XX`

**Possíveis causas investigadas:**

#### A) 401 Unauthorized (Token inválido)
```
❌ ERRO 401: Token DELTAPAG_API_KEY inválido ou expirado
💡 Token deve começar com "live_" (produção) ou sem prefixo (sandbox)
💡 Obter novo token em: https://dashboard.deltapag.io/settings/api-keys
```

**Como verificar:**
```bash
# Ver token atual (primeiros 20 caracteres):
curl https://corretoracorporate.pages.dev/api/debug/deltapag-config
```

**Como corrigir:**
1. Acessar https://dashboard.deltapag.io/settings/api-keys
2. Gerar novo token API
3. Adicionar no Cloudflare Pages:
   ```bash
   npx wrangler pages secret put DELTAPAG_API_KEY --project-name corretoracorporate
   # Cole o novo token quando solicitado
   ```

---

#### B) 403 Forbidden (Permissão negada)
```
❌ ERRO 403: Permissão negada - token não tem acesso a /payments
💡 Verificar: Permissões do token no painel DeltaPag
```

**Como verificar permissões do token:**
1. Login: https://dashboard.deltapag.io
2. Settings → API Keys
3. Verificar que o token tem permissão para:
   - ✅ Customers (read/write)
   - ✅ Payments (read/write) ← **CRÍTICO**
   - ✅ Subscriptions (read/write)

**Como corrigir:**
- Editar token existente para adicionar permissões
- OU gerar novo token com todas as permissões

---

#### C) 422 Unprocessable Entity (Dados inválidos)
```
❌ ERRO 422: Dados inválidos no payload
💡 Campos inválidos: { "errors": { "creditCard.number": "Invalid card number" } }
```

**Campos validados no payload:**
```json
{
  "customer": "cus_123abc",          // ID do cliente DeltaPag
  "billingType": "CREDIT_CARD",
  "value": 49.90,
  "dueDate": "2026-02-27",           // Formato YYYY-MM-DD
  "description": "Cobrança de Teste",
  "creditCard": {
    "holderName": "João Silva",
    "number": "5162306219378829",   // Número válido teste
    "expiryMonth": "12",
    "expiryYear": "2028",
    "ccv": "123"
  },
  "creditCardHolderInfo": {
    "name": "João Silva",
    "email": "joao@example.com",
    "cpfCnpj": "12345678901",        // Somente números
    "postalCode": "01310100",        // Somente números
    "addressNumber": "1000",
    "phone": "11999999999",          // Somente números
    "mobilePhone": "11999999999"     // Somente números
  }
}
```

**Como corrigir:**
- Verificar que todos os campos obrigatórios estão presentes
- CPF/CNPJ deve ter 11 ou 14 dígitos (sem pontuação)
- Número do cartão deve ser válido
- Data de vencimento no futuro

---

## 🧪 Como Testar as Correções

### Teste 1: Download QR Code
1. Limpar cache: `Ctrl+Shift+R` (Chrome) ou `⌘+Shift+R` (Mac)
2. Acessar: https://corretoracorporate.pages.dev
3. Login: `admin` / `admin123`
4. Ir em **Contas → Ver Detalhes**
5. Clicar em **"Gerar Link de Auto-Cadastro"**
6. Preencher:
   - Tipo: Assinatura Mensal
   - Valor: 149.90
   - Descrição: (deixar vazio para testar)
7. Clicar **"Gerar Link e QR Code"**
8. Clicar **"Baixar QR Code"**

**Resultado esperado:**
- ✅ QR Code baixado como `qrcode-qrcode.png`
- ✅ Sem erros no console
- ✅ Botão muda para verde "Baixado!" por 2 segundos

---

### Teste 2: Diagnóstico DeltaPag Payments

**Abrir console do navegador (F12) e executar:**

```javascript
// Teste 1: Verificar configuração do token
fetch('https://corretoracorporate.pages.dev/api/debug/deltapag-config', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Config DeltaPag:', data))

// Teste 2: Ver logs de erros de payments
fetch('https://corretoracorporate.pages.dev/api/deltapag/links', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Links DeltaPag:', data))
```

**OU via terminal com wrangler:**
```bash
# Ver logs em tempo real
npx wrangler pages deployment tail corretoracorporate

# Em outra aba, criar um cliente de teste:
curl -X POST https://corretoracorporate.pages.dev/api/admin/create-evidence-customers \
  -H "Content-Type: application/json" \
  -d '{
    "count": 1,
    "testMode": true
  }'
```

**Procurar nos logs:**
```
🔷 DeltaPag Request: POST https://api-sandbox.deltapag.io/api/v2/payments
📤 Payload: { ... }
📥 DeltaPag Response [401]: { "message": "Unauthorized" }
❌ ERRO 401: Token DELTAPAG_API_KEY inválido ou expirado
```

---

## 📊 Logs Detalhados Adicionados

**Antes (sem diagnóstico):**
```
❌ Falha ao criar cobrança: HTTP 401
```

**Depois (com diagnóstico detalhado):**
```
📤 Enviando cobrança DeltaPag: { customer: "cus_123", value: 49.90, ... }
📥 Status cobrança: 401
📥 Resposta completa: { "message": "Unauthorized", "error": "invalid_token" }
❌ ERRO 401: Token DELTAPAG_API_KEY inválido ou expirado
💡 Verificar: Token deve começar com "live_" (produção) ou sem prefixo (sandbox)
💡 Obter novo token em: https://dashboard.deltapag.io/settings/api-keys
```

---

## 🚀 Próximos Passos Recomendados

### 1. Verificar Token DeltaPag (PRIORITÁRIO)
```bash
# Ver configuração atual
curl https://corretoracorporate.pages.dev/api/debug/deltapag-config

# Se token inválido, atualizar:
npx wrangler pages secret put DELTAPAG_API_KEY --project-name corretoracorporate
```

### 2. Testar Criação de Payment Manual
```bash
# Endpoint direto para criar payment (requer token válido):
curl -X POST https://api-sandbox.deltapag.io/api/v2/payments \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "cus_ID_CLIENTE",
    "billingType": "CREDIT_CARD",
    "value": 49.90,
    "dueDate": "2026-03-01",
    "description": "Teste Cobrança",
    "creditCard": {
      "holderName": "Teste",
      "number": "5162306219378829",
      "expiryMonth": "12",
      "expiryYear": "2028",
      "ccv": "123"
    }
  }'
```

### 3. Monitorar Logs em Tempo Real
```bash
npx wrangler pages deployment tail corretoracorporate --format pretty
```

### 4. Aplicar Migrations D1 em Produção (se necessário)
```bash
# Se a coluna charge_type não existe em produção:
npx wrangler d1 migrations apply corretoracorporate-db
```

---

## 📦 Arquivos Modificados

### 1. `public/static/deltapag-section.js`
**Linha 794:** Correção do download de QR Code
```diff
- const filename = `qrcode-${currentQRData.description.toLowerCase().replace(/\s+/g, '-')}.png`;
+ const description = (currentQRData.description || 'qrcode').toLowerCase().replace(/\s+/g, '-');
+ const filename = `qrcode-${description}.png`;
```

### 2. `src/index.tsx`
**Linhas 1889-1910:** Logs detalhados de erros DeltaPag
```typescript
// Diagnóstico detalhado de erros
if (paymentResult.status === 401) {
  console.error('❌ ERRO 401: Token DELTAPAG_API_KEY inválido ou expirado')
  console.error('💡 Verificar: Token deve começar com "live_" (produção) ou sem prefixo (sandbox)')
  console.error('💡 Obter novo token em: https://dashboard.deltapag.io/settings/api-keys')
} else if (paymentResult.status === 403) {
  console.error('❌ ERRO 403: Permissão negada - token não tem acesso a /payments')
  console.error('💡 Verificar: Permissões do token no painel DeltaPag')
} else if (paymentResult.status === 422) {
  console.error('❌ ERRO 422: Dados inválidos no payload')
  console.error('💡 Campos inválidos:', JSON.stringify(paymentResult.data?.errors || paymentResult.data, null, 2))
}
```

---

## ✅ Checklist de Correções

- [x] Corrigir erro JavaScript download QR Code
- [x] Adicionar logs detalhados 401/403/422 DeltaPag
- [x] Adicionar instruções de diagnóstico
- [x] Commit e push para GitHub
- [x] Build e deploy para Cloudflare Pages
- [x] Criar documentação completa
- [ ] **PENDENTE:** Verificar token DeltaPag válido
- [ ] **PENDENTE:** Testar criação de payment com token atualizado
- [ ] **PENDENTE:** Confirmar "Última transação" aparece no painel

---

## 📊 Deploy Status

**Build:**
- ✅ Vite: 2.90s
- ✅ Bundle: 511.31 KB
- ✅ Módulos: 675

**Deploy:**
- ✅ Upload: 1 arquivo novo (13 já existentes)
- ✅ Compilação: sucesso
- ✅ URL produção: https://corretoracorporate.pages.dev
- ✅ Deploy ID: https://96240e57.corretoracorporate.pages.dev

**Commit:**
- ✅ Hash: `aa9d359`
- ✅ Mensagem: "fix: Corrigir erro download QR Code e melhorar logs DeltaPag payments"
- ✅ Push: GitHub `main` branch

---

## 🔗 Links Úteis

- **Dashboard DeltaPag (Sandbox):** https://dashboard-sandbox.deltapag.io
- **Dashboard DeltaPag (Produção):** https://dashboard.deltapag.io
- **Documentação API DeltaPag:** https://docs.deltapag.io
- **Painel Cloudflare Pages:** https://dash.cloudflare.com/pages/corretoracorporate
- **Repositório GitHub:** https://github.com/kainow252-cmyk/Cadastro
- **Console do navegador:** Pressione F12 → Aba "Console"

---

**Próxima ação recomendada:**
1. Verificar token DeltaPag (comando acima)
2. Se token inválido → gerar novo token e atualizar secret
3. Testar criação de payment novamente
4. Enviar print ou copiar logs do console para análise detalhada

---

**Status:** ⚠️ Correções aplicadas, aguardando validação do token DeltaPag para resolver problema de payments.
