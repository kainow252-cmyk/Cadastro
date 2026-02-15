# 🔑 Guia de Uso da API Key com Split 20/80

## 📋 Resumo

Quando você gera uma **API Key para uma subconta**, ela pode criar cobranças de **duas formas diferentes**:

### **Opção 1: Cobrança Normal** (Subconta recebe 100%)
- Usa a **API Key própria** diretamente na API do Asaas
- Subconta recebe **100%** do valor líquido
- Sem split automático

### **Opção 2: Cobrança com Split 20/80** (Subconta recebe 20%)
- Usa o **endpoint proxy especial** do sistema
- Subconta recebe **20%** do valor líquido
- Conta principal recebe **80%** automaticamente

---

## 🎯 Qual Usar Quando?

### Use a **Opção 1** (100% para subconta) quando:
- ✅ A subconta está fazendo negócios próprios
- ✅ Não há comissão para a conta principal
- ✅ A subconta quer controle total

### Use a **Opção 2** (Split 20/80) quando:
- ✅ A conta principal fornece a plataforma/infraestrutura
- ✅ Há acordo de comissão (80% para principal, 20% para subconta)
- ✅ Modelo de marketplace ou afiliação

---

## 🚀 Como Usar Cada Opção

### **Opção 1: API Key Direta (100% Subconta)**

#### Endpoint
```
POST https://api-sandbox.asaas.com/v3/payments
```

#### Headers
```javascript
{
  "Content-Type": "application/json",
  "access_token": "$aact_YTU5YTE0M2Jj...", // API Key da subconta
  "User-Agent": "SeuSistema/1.0"
}
```

#### Exemplo
```javascript
// A subconta usa sua própria API Key
const SUBCONTA_API_KEY = '$aact_YTU5YTE0M2Jj...' // Gerada no sistema

const response = await fetch('https://api-sandbox.asaas.com/v3/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'access_token': SUBCONTA_API_KEY,
    'User-Agent': 'MeuSistema/1.0'
  },
  body: JSON.stringify({
    customer: 'cus_000005628581',
    billingType: 'PIX',
    value: 100.00,
    dueDate: '2026-02-20',
    description: 'Pagamento de serviço'
  })
})

const result = await response.json()
console.log(result)
// Subconta recebe 100% (R$ 98,50 após taxas)
```

---

### **Opção 2: Endpoint Proxy (Split 20/80)**

#### Endpoint Especial
```
POST https://seu-dominio.com/api/proxy/payments
```

#### Headers
```javascript
{
  "Content-Type": "application/json",
  "x-subaccount-api-key": "$aact_YTU5YTE0M2Jj...", // API Key da subconta
  "User-Agent": "SeuSistema/1.0"
}
```

#### Exemplo
```javascript
// A subconta usa o endpoint proxy com sua API Key
const SUBCONTA_API_KEY = '$aact_YTU5YTE0M2Jj...' // Gerada no sistema
const PROXY_URL = 'https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai'

const response = await fetch(`${PROXY_URL}/api/proxy/payments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subaccount-api-key': SUBCONTA_API_KEY, // ← Diferença principal
    'User-Agent': 'MeuSistema/1.0'
  },
  body: JSON.stringify({
    customer: 'cus_000005628581',
    billingType: 'PIX',
    value: 100.00,
    dueDate: '2026-02-20',
    description: 'Pagamento com split'
  })
})

const result = await response.json()
console.log(result)
// Subconta recebe 20% (R$ 19,70)
// Conta principal recebe 80% (R$ 78,80)
```

#### Resposta do Proxy
```json
{
  "ok": true,
  "data": {
    "id": "pay_abc123xyz",
    "customer": "cus_000005628581",
    "value": 100.00,
    "netValue": 98.50,
    "status": "PENDING",
    "billingType": "PIX",
    "dueDate": "2026-02-20",
    "pixQrCode": {
      "qrCodeId": "qr_xyz789",
      "payload": "00020126580014br.gov.bcb.pix...",
      "expirationDate": "2026-02-15T23:59:59"
    },
    "split": [
      {
        "walletId": "cb64c741-2c86-4466-ad31-7ba58cd698c0",
        "percentualValue": 20.00
      }
    ],
    "splitInfo": {
      "subaccount": {
        "walletId": "cb64c741-2c86-4466-ad31-7ba58cd698c0",
        "percentage": 20,
        "estimatedAmount": 19.70
      },
      "mainAccount": {
        "percentage": 80,
        "estimatedAmount": 78.80
      }
    }
  },
  "message": "✅ Cobrança criada com split 20/80 aplicado automaticamente"
}
```

---

## 💰 Comparação de Valores

### Exemplo: Cobrança de R$ 100,00

| Item | Opção 1 (100%) | Opção 2 (Split 20/80) |
|------|----------------|----------------------|
| **Valor cobrado** | R$ 100,00 | R$ 100,00 |
| **Taxa Asaas** | R$ 1,50 | R$ 1,50 |
| **Valor líquido** | R$ 98,50 | R$ 98,50 |
| **Subconta recebe** | R$ 98,50 (100%) | R$ 19,70 (20%) |
| **Conta principal recebe** | R$ 0,00 | R$ 78,80 (80%) |

---

## 🔄 Fluxo Técnico do Proxy

### O que acontece nos bastidores:

```
1. Subconta envia requisição com sua API Key
   ↓
2. Proxy valida a API Key da subconta
   ↓
3. Proxy busca o Wallet ID da subconta
   ↓
4. Proxy cria a cobrança usando API Key da CONTA PRINCIPAL
   ↓
5. Proxy adiciona split automático: 20% para subconta
   ↓
6. Asaas processa a cobrança com split
   ↓
7. Proxy retorna resultado para subconta
   ↓
8. Cliente paga via PIX
   ↓
9. Asaas divide automaticamente:
   - 20% → Carteira da subconta
   - 80% → Carteira da conta principal
```

---

## 🛡️ Segurança

### Vantagens do Endpoint Proxy

✅ **API Key da conta principal nunca é exposta**
- Subconta só conhece sua própria API Key
- Proxy guarda a API Key principal em segredo

✅ **Subconta não pode criar cobranças sem split**
- Quando usa o proxy, split é obrigatório
- Impossível burlar o sistema

✅ **Rastreabilidade**
- Todas as cobranças ficam registradas
- Fácil identificar origem (qual subconta criou)

✅ **Controle centralizado**
- Conta principal pode desativar o proxy
- Pode alterar percentuais se necessário

---

## 📱 Exemplos Práticos

### **Exemplo 1: E-commerce com Afiliados**

```javascript
// Afiliado cria cobrança para cliente dele
// Afiliado recebe 20%, loja recebe 80%

const AFILIADO_API_KEY = '$aact_...' // API Key do afiliado

async function criarVendaAfiliado(cliente, valor) {
  const response = await fetch('https://sua-loja.com/api/proxy/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-subaccount-api-key': AFILIADO_API_KEY
    },
    body: JSON.stringify({
      customer: cliente.cpf,
      customerName: cliente.nome,
      customerEmail: cliente.email,
      billingType: 'PIX',
      value: valor,
      description: `Venda via afiliado - ${cliente.nome}`
    })
  })
  
  const result = await response.json()
  
  // Afiliado recebe 20% automaticamente
  // Loja recebe 80% automaticamente
  
  return result
}
```

### **Exemplo 2: SaaS Multi-tenant**

```javascript
// Cliente white label cria cobrança para usuário final
// Cliente recebe 20%, plataforma recebe 80%

const CLIENTE_API_KEY = '$aact_...' // API Key do cliente

async function cobrarUsuarioFinal(usuario, plano) {
  const response = await fetch('https://plataforma-saas.com/api/proxy/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-subaccount-api-key': CLIENTE_API_KEY
    },
    body: JSON.stringify({
      customer: usuario.cpf,
      billingType: 'PIX',
      value: plano.valor,
      description: `Assinatura ${plano.nome} - ${usuario.nome}`
    })
  })
  
  const result = await response.json()
  
  // Cliente white label recebe 20%
  // Plataforma SaaS recebe 80%
  
  return result
}
```

### **Exemplo 3: Marketplace de Serviços**

```javascript
// Prestador de serviço cria cobrança
// Prestador recebe 20%, marketplace recebe 80%

const PRESTADOR_API_KEY = '$aact_...' // API Key do prestador

async function cobrarServico(cliente, servico) {
  const response = await fetch('https://marketplace.com/api/proxy/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-subaccount-api-key': PRESTADOR_API_KEY
    },
    body: JSON.stringify({
      customer: cliente.id,
      billingType: 'PIX',
      value: servico.preco,
      description: `${servico.nome} - Prestador: ${prestador.nome}`
    })
  })
  
  const result = await response.json()
  
  // Prestador recebe 20% pelo serviço
  // Marketplace recebe 80% pela plataforma
  
  return result
}
```

---

## ⚙️ Configuração para Produção

### 1. Variáveis de Ambiente

```bash
# .env (Conta Principal)
ASAAS_API_KEY=$aact_principal_key_aqui
ASAAS_API_URL=https://api.asaas.com/v3
```

### 2. Deploy do Proxy

```bash
# Deploy para Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name seu-projeto
```

### 3. URL do Proxy

```
https://seu-projeto.pages.dev/api/proxy/payments
```

### 4. Compartilhar com Subcontas

Forneça para cada subconta:
- ✅ Sua API Key (gerada no sistema)
- ✅ URL do proxy: `https://seu-projeto.pages.dev/api/proxy/payments`
- ✅ Documentação de como usar

---

## 🐛 Solução de Problemas

### Erro: "API Key da subconta não fornecida"

**Causa**: Header `x-subaccount-api-key` não enviado

**Solução**:
```javascript
headers: {
  'x-subaccount-api-key': 'SUA_API_KEY_AQUI' // ← Adicionar este header
}
```

### Erro: "API Key da subconta inválida ou expirada"

**Causa**: API Key incorreta, expirada ou revogada

**Solução**:
1. Verifique se copiou a API Key corretamente
2. Gere uma nova API Key no sistema
3. Verifique data de expiração

### Erro: "Subconta não possui Wallet ID"

**Causa**: Conta não é uma subconta (é a conta principal)

**Solução**:
- O endpoint proxy só funciona para subcontas
- Conta principal deve usar endpoint normal

### Split não aplicado

**Causa**: Usando endpoint errado (API Asaas direta)

**Solução**:
- Use o endpoint proxy: `/api/proxy/payments`
- Não use: `https://api.asaas.com/v3/payments`

---

## 📊 Monitoramento

### Ver Cobranças com Split

```bash
# Listar todas as cobranças
curl https://seu-dominio.com/api/payments \
  -H "Cookie: auth_token=seu-jwt"

# Ver detalhes de uma cobrança
curl https://seu-dominio.com/api/payments/pay_abc123 \
  -H "Cookie: auth_token=seu-jwt"
```

### Relatório de Split por Subconta

```sql
-- No futuro, pode implementar no banco D1
SELECT 
  account_id,
  SUM(value * 0.20) as total_received_20_percent,
  COUNT(*) as total_charges
FROM payments_with_split
GROUP BY account_id
```

---

## 🎓 Resumo

| Característica | API Direta | Endpoint Proxy |
|---------------|------------|----------------|
| **URL** | api.asaas.com | seu-sistema.com/api/proxy/payments |
| **Header** | `access_token` | `x-subaccount-api-key` |
| **Subconta recebe** | 100% | 20% |
| **Conta principal recebe** | 0% | 80% |
| **Split automático** | ❌ Não | ✅ Sim |
| **Quando usar** | Negócios próprios | Comissões/Marketplace |

---

## 📞 Suporte

### Documentação Adicional
- [GUIA_API_KEY.md](./GUIA_API_KEY.md) - Como gerar API Keys
- [README.md](./README.md) - Visão geral do sistema
- [Docs Asaas](https://docs.asaas.com) - Documentação oficial

### Contato
- Suporte técnico da plataforma
- Suporte Asaas: suporte@asaas.com

---

**✅ Agora você sabe usar a API Key das duas formas: 100% para subconta OU split 20/80!**
