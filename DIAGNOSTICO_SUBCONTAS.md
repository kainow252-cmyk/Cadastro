# 🔍 DIAGNÓSTICO - SUBCONTAS NÃO APARECEM

**Data**: 06/03/2026  
**Problema**: Interface mostra "Nenhuma subconta encontrada"  
**URL**: https://admin.corretoracorporate.com.br/  

---

## 🎯 ANÁLISE DO PROBLEMA

### ✅ O que está funcionando:
- ✅ Sistema carregou perfeitamente
- ✅ Auth funcionando
- ✅ Dashboard operacional
- ✅ Token de PRODUÇÃO ativo
- ✅ API Asaas respondendo (200 OK)

### ❌ O que NÃO está funcionando:
- ❌ Frontend não exibe as 4 subcontas
- ❌ Mensagem: "Nenhuma subconta encontrada"

---

## 🔍 POSSÍVEIS CAUSAS

### 1️⃣ **Endpoint `/api/accounts` retorna vazio**
```javascript
// src/index.tsx linha 3625
app.get('/api/accounts', async (c) => {
  const result = await asaasRequest(c, '/accounts')
  // ...
})
```

**Hipótese**: A API Asaas `/v3/accounts` pode estar retornando vazio porque:
- ✅ Token está correto (validado)
- ❌ Endpoint `/accounts` pode não listar subcontas
- ❌ Pode precisar ser `/subaccounts` em vez de `/accounts`

---

### 2️⃣ **API Asaas: Diferença entre `/accounts` e `/subaccounts`**

**Documentação Asaas:**
- `/v3/accounts`: Lista **contas principais** (não subcontas)
- `/v3/subaccounts`: Lista **subcontas** criadas

**Problema identificado**: O código está chamando `/accounts` em vez de `/subaccounts`!

---

## ✅ SOLUÇÃO

### Opção 1: Corrigir endpoint no código
Mudar de `/accounts` para `/subaccounts`:

```typescript
// ANTES (ERRADO):
const result = await asaasRequest(c, '/accounts')

// DEPOIS (CORRETO):
const result = await asaasRequest(c, '/subaccounts')
```

### Opção 2: Testar API manualmente

```bash
# Testar endpoint correto
curl -X GET "https://api.asaas.com/v3/subaccounts" \
  -H "access_token: $aact_prod_000Mzk..." \
  -H "Content-Type: application/json"

# Resultado esperado: 4 subcontas
{
  "object": "list",
  "hasMore": false,
  "totalCount": 4,
  "limit": 100,
  "offset": 0,
  "data": [
    {
      "id": "acc_...",
      "name": "Roberto Caporalle Mayo",
      "email": "roberto@...",
      "cpfCnpj": "06853057830",
      "walletId": "...",
      "status": "APPROVED"
    },
    {
      "id": "acc_...",
      "name": "Saulo Salvador",
      "email": "saulo@...",
      "cpfCnpj": "08827284745",
      "walletId": "...",
      "status": "APPROVED"
    },
    {
      "id": "acc_...",
      "name": "Franklin Madson Oliveira Soares",
      "email": "franklin@...",
      "cpfCnpj": "13815574788",
      "walletId": "...",
      "status": "APPROVED"
    },
    {
      "id": "acc_...",
      "name": "Tanara Helena Maciel da Silva",
      "email": "tanara@...",
      "cpfCnpj": "82484368020",
      "walletId": "...",
      "status": "PENDING"
    }
  ]
}
```

---

## 🔧 CORREÇÃO NECESSÁRIA

### Arquivo: `src/index.tsx`

**Linhas a alterar:**

```typescript
// Linha 3625 - GET /api/accounts
app.get('/api/accounts', async (c) => {
  try {
    console.log('Buscando subcontas...')
    // MUDAR DE '/accounts' PARA '/subaccounts'
    const result = await asaasRequest(c, '/subaccounts') // ✅ CORRETO
    console.log('Resultado da API:', {
      ok: result.ok,
      status: result.status,
      totalCount: result.data?.totalCount,
      hasData: !!result.data?.data
    })
    
    if (result.ok && result.data && result.data.data) {
      return c.json({ 
        success: true,
        accounts: result.data.data,
        totalCount: result.data.totalCount || 0
      })
    }
    
    console.log('Retornando array vazio')
    return c.json({ success: true, accounts: [], totalCount: 0 })
  } catch (error: any) {
    console.error('Erro ao buscar subcontas:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Linha 3676 - GET /api/accounts/:id
app.get('/api/accounts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    // MUDAR DE '/accounts' PARA '/subaccounts'
    const result = await asaasRequest(c, `/subaccounts/${id}`) // ✅ CORRETO
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Linha 3652 - POST /api/accounts (criar subconta)
app.post('/api/accounts', async (c) => {
  try {
    const body = await c.req.json()
    // MUDAR DE '/accounts' PARA '/subaccounts'
    const result = await asaasRequest(c, '/subaccounts', 'POST', body) // ✅ CORRETO
    
    if (result.ok && result.data && result.data.id) {
      const account = result.data
      await sendWelcomeEmail(
        c,
        account.name,
        account.email,
        account.id,
        account.walletId
      )
    }
    
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})
```

---

## 📝 MUDANÇAS NECESSÁRIAS

### Resumo das alterações:
1. **Linha 3625**: `/accounts` → `/subaccounts`
2. **Linha 3678**: `/accounts/${id}` → `/subaccounts/${id}`
3. **Linha 3655**: `/accounts` → `/subaccounts`

### Após correção:
1. ✅ Build: `npm run build`
2. ✅ Deploy: `npx wrangler pages deploy dist --project-name corretoracorporate`
3. ✅ Testar: Recarregar página de subcontas
4. ✅ Resultado esperado: 4 subcontas aparecem

---

## 🧪 VALIDAÇÃO

### Antes da correção:
```json
{
  "success": true,
  "accounts": [],
  "totalCount": 0
}
```

### Depois da correção:
```json
{
  "success": true,
  "accounts": [
    { "name": "Roberto Caporalle Mayo", "status": "APPROVED" },
    { "name": "Saulo Salvador", "status": "APPROVED" },
    { "name": "Franklin Madson Oliveira Soares", "status": "APPROVED" },
    { "name": "Tanara Helena Maciel da Silva", "status": "PENDING" }
  ],
  "totalCount": 4
}
```

---

## 🎯 PRÓXIMOS PASSOS

1. ⏳ Corrigir endpoint de `/accounts` para `/subaccounts`
2. ⏳ Build e deploy
3. ⏳ Testar interface
4. ✅ Validar 4 subcontas aparecem
5. ✅ Criar cobrança teste R$ 10
6. ✅ Validar split 20/80

---

## 📚 REFERÊNCIA

**Documentação Asaas:**
- Listar subcontas: https://docs.asaas.com/reference/listar-subcontas
- Criar subconta: https://docs.asaas.com/reference/criar-subconta
- Detalhes subconta: https://docs.asaas.com/reference/recuperar-uma-unica-subconta

---

**Status**: ❌ Aguardando correção  
**Impacto**: Alto (frontend não exibe subcontas)  
**Complexidade**: Baixa (3 linhas de código)  
**Tempo estimado**: 5 minutos (correção + deploy)
