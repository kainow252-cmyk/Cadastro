# 🏦 Integração DeltaPag - Pagamento Recorrente com Cartão de Crédito

**Data:** 19/02/2026  
**Status:** 🚧 Em Desenvolvimento

---

## 📋 Informações de Acesso

**Ambiente:** Sandbox  
**URL de Autenticação:** https://deltapag-sandbox.bempaggo.io/authentication  
**Documentação:** https://deltapag-tech.readme.io/reference/introducao  
**Usuário:** Kainow252@gmail.com  
**Senha:** e51e30  

---

## 🎯 Objetivo

Implementar **pagamento recorrente com cartão de crédito** usando a API da DeltaPag.

**Requisitos:**
- ✅ Cobrança recorrente mensal
- ✅ Cartão de crédito como forma de pagamento
- ✅ Integração com sistema atual (Asaas + DeltaPag)

---

## 🔐 Autenticação

### Endpoint de Autenticação

```
POST https://deltapag-sandbox.bempaggo.io/authentication
Content-Type: application/json

{
  "email": "Kainow252@gmail.com",
  "password": "e51e30"
}
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Uso do Token

```
Authorization: Bearer {access_token}
```

---

## 📝 Estrutura da API DeltaPag

### Padrão de Resposta 201 Created

Segundo a documentação da DeltaPag:

> **Alguns endpoints POST não retornam o recurso criado no corpo da resposta.**

**Comportamento:**
1. **POST** retorna `201 Created` com corpo vazio
2. Header `Location` contém URL do recurso criado
3. Fazer **GET** na URL do `Location` para obter dados

**Exemplo:**
```
POST /api/v2/invoices
→ 201 Created
→ Location: https://api.exemplo.com/api/v2/invoices/12345

GET https://api.exemplo.com/api/v2/invoices/12345
→ 200 OK
→ { ... dados da cobrança ... }
```

---

## 💳 Endpoint: Criar Cobrança Recorrente (Estimado)

### Requisição

```
POST https://deltapag-sandbox.bempaggo.io/api/v2/subscriptions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "customer": {
    "name": "Gelci José da Silva",
    "email": "gelci.silva252@gmail.com",
    "cpf": "11013430794",
    "phone": "+5511999999999"
  },
  "creditCard": {
    "number": "5555666677778884",
    "holder": "GELCI J SILVA",
    "expirationMonth": "12",
    "expirationYear": "2028",
    "cvv": "123"
  },
  "subscription": {
    "value": 50.00,
    "description": "Mensalidade Premium",
    "frequency": "MONTHLY",
    "startDate": "2026-03-01",
    "billingDay": 1
  },
  "split": {
    "splits": [
      {
        "walletId": "wallet_xyz",
        "percentage": 20
      }
    ]
  }
}
```

### Resposta (201 Created)

```
HTTP/1.1 201 Created
Location: https://deltapag-sandbox.bempaggo.io/api/v2/subscriptions/sub_abc123
```

### Obter Dados da Assinatura

```
GET https://deltapag-sandbox.bempaggo.io/api/v2/subscriptions/sub_abc123
Authorization: Bearer {access_token}

{
  "id": "sub_abc123",
  "status": "ACTIVE",
  "customer": {
    "id": "cus_xyz789",
    "name": "Gelci José da Silva",
    "email": "gelci.silva252@gmail.com"
  },
  "value": 50.00,
  "frequency": "MONTHLY",
  "nextBillingDate": "2026-03-01",
  "creditCard": {
    "lastFourDigits": "8884",
    "brand": "MASTERCARD"
  },
  "createdAt": "2026-02-19T12:00:00Z"
}
```

---

## 🔧 Implementação no Sistema

### 1. Adicionar Variáveis de Ambiente

**`.dev.vars` (desenvolvimento):**
```env
DELTAPAG_API_URL=https://deltapag-sandbox.bempaggo.io
DELTAPAG_EMAIL=Kainow252@gmail.com
DELTAPAG_PASSWORD=e51e30
DELTAPAG_ACCESS_TOKEN=
```

**Cloudflare Secrets (produção):**
```bash
npx wrangler secret put DELTAPAG_API_URL
npx wrangler secret put DELTAPAG_EMAIL
npx wrangler secret put DELTAPAG_PASSWORD
```

### 2. Função de Autenticação

```typescript
// src/services/deltapag.ts

async function getDeltaPagToken(env: any): Promise<string> {
  const response = await fetch(`${env.DELTAPAG_API_URL}/authentication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: env.DELTAPAG_EMAIL,
      password: env.DELTAPAG_PASSWORD
    })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao autenticar na DeltaPag');
  }
  
  const data = await response.json();
  return data.access_token;
}
```

### 3. Função de Criar Assinatura

```typescript
async function createDeltaPagSubscription(env: any, data: any) {
  const token = await getDeltaPagToken(env);
  
  const response = await fetch(`${env.DELTAPAG_API_URL}/api/v2/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer: {
        name: data.customerName,
        email: data.customerEmail,
        cpf: data.customerCpf,
        phone: data.customerPhone
      },
      creditCard: {
        number: data.cardNumber,
        holder: data.cardHolder,
        expirationMonth: data.cardExpMonth,
        expirationYear: data.cardExpYear,
        cvv: data.cardCvv
      },
      subscription: {
        value: data.value,
        description: data.description,
        frequency: 'MONTHLY',
        startDate: data.startDate,
        billingDay: data.billingDay
      },
      split: data.split
    })
  });
  
  if (response.status === 201) {
    // Resposta 201: recurso criado, URL no header Location
    const locationUrl = response.headers.get('Location');
    
    // Buscar dados do recurso criado
    const subscriptionData = await fetch(locationUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return await subscriptionData.json();
  } else {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar assinatura');
  }
}
```

### 4. Endpoint no Hono

```typescript
// src/index.tsx

// Criar assinatura com cartão de crédito (DeltaPag)
app.post('/api/deltapag/subscription', async (c) => {
  try {
    const {
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      cardNumber,
      cardHolder,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      value,
      description,
      walletId,
      splitPercentage
    } = await c.req.json();
    
    // Validações
    if (!customerName || !customerEmail || !customerCpf) {
      return c.json({ error: 'Dados do cliente são obrigatórios' }, 400);
    }
    
    if (!cardNumber || !cardHolder || !cardExpMonth || !cardExpYear || !cardCvv) {
      return c.json({ error: 'Dados do cartão são obrigatórios' }, 400);
    }
    
    if (!value || value <= 0) {
      return c.json({ error: 'Valor inválido' }, 400);
    }
    
    // Criar assinatura na DeltaPag
    const subscription = await createDeltaPagSubscription(c.env, {
      customerName,
      customerEmail,
      customerCpf,
      customerPhone,
      cardNumber,
      cardHolder,
      cardExpMonth,
      cardExpYear,
      cardCvv,
      value,
      description,
      startDate: new Date().toISOString().split('T')[0],
      billingDay: 1,
      split: {
        splits: [{
          walletId: walletId,
          percentage: splitPercentage || 20
        }]
      }
    });
    
    // Salvar no D1
    await c.env.DB.prepare(`
      INSERT INTO deltapag_subscriptions (
        id, subscription_id, customer_name, customer_email, customer_cpf,
        card_last_four, card_brand, value, description, frequency, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      subscription.id,
      customerName,
      customerEmail,
      customerCpf,
      subscription.creditCard.lastFourDigits,
      subscription.creditCard.brand,
      value,
      description,
      'MONTHLY',
      subscription.status,
      new Date().toISOString()
    ).run();
    
    return c.json({
      ok: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        value: subscription.value,
        frequency: subscription.frequency,
        nextBillingDate: subscription.nextBillingDate,
        creditCard: {
          lastFour: subscription.creditCard.lastFourDigits,
          brand: subscription.creditCard.brand
        }
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao criar assinatura DeltaPag:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

### 5. Tabela D1

```sql
-- migrations/0007_deltapag_subscriptions.sql

CREATE TABLE IF NOT EXISTS deltapag_subscriptions (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  card_last_four TEXT,
  card_brand TEXT,
  value REAL NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MONTHLY',
  status TEXT DEFAULT 'ACTIVE',
  next_billing_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  canceled_at TEXT
);

CREATE INDEX idx_deltapag_subs_subscription_id ON deltapag_subscriptions(subscription_id);
CREATE INDEX idx_deltapag_subs_customer_email ON deltapag_subscriptions(customer_email);
CREATE INDEX idx_deltapag_subs_status ON deltapag_subscriptions(status);
```

---

## 🎨 Interface do Usuário

### Modal "Pagamento com Cartão"

```html
<!-- Modal DeltaPag Credit Card -->
<div id="deltapag-card-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
            <h3 class="text-2xl font-bold text-white">
                <i class="fas fa-credit-card mr-2"></i>
                Pagamento Recorrente - Cartão de Crédito
            </h3>
            <p class="text-green-100 text-sm mt-2">
                Cobrança automática mensal no cartão
            </p>
        </div>
        
        <!-- Form -->
        <div class="p-6 space-y-4">
            <!-- Dados do Cliente -->
            <div class="space-y-3">
                <h4 class="font-bold text-gray-700">
                    <i class="fas fa-user mr-2"></i>Dados do Cliente
                </h4>
                <input type="text" id="dp-customer-name" placeholder="Nome Completo" class="w-full px-4 py-3 border rounded-lg">
                <input type="email" id="dp-customer-email" placeholder="Email" class="w-full px-4 py-3 border rounded-lg">
                <input type="text" id="dp-customer-cpf" placeholder="CPF" class="w-full px-4 py-3 border rounded-lg">
                <input type="tel" id="dp-customer-phone" placeholder="Telefone" class="w-full px-4 py-3 border rounded-lg">
            </div>
            
            <!-- Dados do Cartão -->
            <div class="space-y-3">
                <h4 class="font-bold text-gray-700">
                    <i class="fas fa-credit-card mr-2"></i>Dados do Cartão
                </h4>
                <input type="text" id="dp-card-number" placeholder="Número do Cartão" maxlength="19" class="w-full px-4 py-3 border rounded-lg">
                <input type="text" id="dp-card-holder" placeholder="Nome no Cartão" class="w-full px-4 py-3 border rounded-lg">
                <div class="grid grid-cols-3 gap-3">
                    <input type="text" id="dp-card-exp-month" placeholder="Mês" maxlength="2" class="px-4 py-3 border rounded-lg">
                    <input type="text" id="dp-card-exp-year" placeholder="Ano" maxlength="4" class="px-4 py-3 border rounded-lg">
                    <input type="text" id="dp-card-cvv" placeholder="CVV" maxlength="4" class="px-4 py-3 border rounded-lg">
                </div>
            </div>
            
            <!-- Dados da Assinatura -->
            <div class="space-y-3">
                <h4 class="font-bold text-gray-700">
                    <i class="fas fa-calendar mr-2"></i>Assinatura
                </h4>
                <input type="number" id="dp-value" placeholder="Valor Mensal (R$)" step="0.01" class="w-full px-4 py-3 border rounded-lg">
                <input type="text" id="dp-description" placeholder="Descrição" class="w-full px-4 py-3 border rounded-lg">
            </div>
            
            <!-- Botão -->
            <button onclick="createDeltaPagSubscription()" 
                class="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-bold text-lg">
                <i class="fas fa-check mr-2"></i>Criar Assinatura
            </button>
        </div>
    </div>
</div>
```

---

## ⚠️ Próximos Passos

### 1. **Explorar Documentação Completa**

Como não consegui acessar a documentação completa da DeltaPag, é necessário:

1. **Fazer login** em https://deltapag-sandbox.bempaggo.io/authentication
2. **Explorar endpoints** disponíveis
3. **Identificar estrutura** exata da API:
   - Endpoint de criação de assinatura
   - Campos obrigatórios
   - Formato de resposta
   - Webhooks disponíveis

### 2. **Testar Autenticação**

```bash
curl -X POST https://deltapag-sandbox.bempaggo.io/authentication \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Kainow252@gmail.com",
    "password": "e51e30"
  }'
```

### 3. **Implementar Código Real**

Após obter a estrutura correta da API:
- Atualizar funções de integração
- Adicionar validações específicas
- Implementar tratamento de erros
- Adicionar webhooks

---

## 📚 Referências

- Documentação DeltaPag: https://deltapag-tech.readme.io/reference/introducao
- Ambiente Sandbox: https://deltapag-sandbox.bempaggo.io
- Padrão 201 Created: Header `Location` contém URL do recurso

---

## ✅ Status

- [ ] Autenticação testada
- [ ] Endpoints mapeados
- [ ] Estrutura de dados definida
- [ ] Código implementado
- [ ] Testes realizados
- [ ] Deploy em produção

**⚠️ Aguardando acesso completo à documentação da DeltaPag para implementação precisa.**
