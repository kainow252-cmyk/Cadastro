# ⚙️ Configurações Asaas Ativadas

## ✅ Configurações Habilitadas

### 1. 🔑 Gerenciamento de Chaves de API de Subcontas
**Status:** ✅ Ativado com sucesso  
**Data:** 05/03/2026

**O que permite:**
- Cada subconta pode ter sua própria chave de API
- Isolamento de permissões por subconta
- Maior segurança e controle
- APIs independentes para cada cliente

**Como usar:**
1. Acesse o painel da subconta no Asaas
2. Menu → Integrações → API
3. Gerar chave de API para a subconta
4. Usar a chave específica nas requisições

**Vantagens:**
- ✅ Segurança: Cada subconta só acessa seus dados
- ✅ Rastreabilidade: Identificar requisições por subconta
- ✅ Controle: Revogar chaves individuais sem afetar outras
- ✅ Escalabilidade: Facilita gestão de múltiplos clientes

---

### 2. 📱 PIX
**Status:** ✅ Chave cadastrada  
**Chave PIX:** `071ade92-b57b-441f-bdf6-728fd7dab4ab` (EVP - Aleatória)  
**Ambiente:** Sandbox

**Funcionalidades ativas:**
- ✅ Receber pagamentos PIX
- ✅ Gerar QR Code PIX
- ✅ PIX Recorrente (assinaturas manuais)
- ⏳ PIX Automático (aguardando ativação pelo suporte)

---

### 3. 💳 Split de Pagamentos
**Status:** ✅ Ativo  
**Configuração:** 20% subconta / 80% conta principal

**Como funciona:**
- Pagamentos são divididos automaticamente
- 20% vai para a subconta que gerou o link
- 80% fica na conta principal (administrador)
- Transparência total no sistema

---

## ⏳ Configurações Pendentes

### 🔐 PIX Automático (Débito Automático)
**Status:** ⏳ Aguardando ativação pelo suporte  
**Endpoint:** `/v3/pix/automatic/authorizations`  
**Erro atual:** `insufficient_permission`

**Ação necessária:**
- Contatar suporte Asaas: **(16) 3347-8031**
- Solicitar ativação do endpoint PIX Automático
- Aguardar 1-3 dias úteis

**Quando ativo, permitirá:**
- Cliente autoriza débito automático no banco (1 vez)
- Banco debita automaticamente todo mês
- Redução de cancelamentos
- Melhor experiência do usuário

---

## 🔧 Como Configurar Chave de API para Subconta

### Passo 1: Criar Subconta no Asaas
1. Acesse: https://sandbox.asaas.com (ou produção)
2. Menu → Contas → Subcontas
3. Criar Nova Subconta
4. Preencher dados da subconta

### Passo 2: Gerar Chave de API
1. Acesse o painel da subconta
2. Menu → Integrações → API
3. Clique em "Gerar Nova Chave"
4. Copie a chave (formato: `$aact_...`)

### Passo 3: Configurar no Sistema
1. Acesse o admin: https://admin.corretoracorporate.com.br
2. Dashboard → Gerenciar Subcontas
3. Editar subconta
4. Colar chave de API no campo apropriado
5. Salvar

### Passo 4: Validar
```bash
# Testar chave de API da subconta
curl -X GET \
  -H "access_token: $CHAVE_DA_SUBCONTA" \
  https://sandbox.asaas.com/api/v3/myAccount

# Resultado esperado:
{
  "name": "Nome da Subconta",
  "email": "subconta@exemplo.com",
  "walletId": "..."
}
```

---

## 📊 Arquitetura de Chaves de API

```
┌─────────────────────────────────────────────────────────────┐
│                     Conta Principal                         │
│                                                             │
│  Chave API: $aact_hmlg_000Mzk...                           │
│  Acesso: Todos os dados (conta principal + subcontas)      │
│  Uso: Operações administrativas globais                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Subconta 1    │ │   Subconta 2    │ │   Subconta 3    │
│                 │ │                 │ │                 │
│  API: $aact_... │ │  API: $aact_... │ │  API: $aact_... │
│  Acesso: Só     │ │  Acesso: Só     │ │  Acesso: Só     │
│  seus dados     │ │  seus dados     │ │  seus dados     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Benefícios da Separação:**
- ✅ Segurança: Subconta não vê dados de outras
- ✅ Isolamento: Problemas em uma não afetam outras
- ✅ Escalabilidade: Adicionar subcontas sem risco
- ✅ Compliance: Dados segregados por cliente

---

## 🔒 Boas Práticas de Segurança

### ✅ DO (Fazer)
- ✅ Usar chave específica da subconta para operações dela
- ✅ Armazenar chaves em variáveis de ambiente
- ✅ Rotacionar chaves periodicamente
- ✅ Revogar chaves comprometidas imediatamente
- ✅ Usar HTTPS sempre

### ❌ DON'T (Não Fazer)
- ❌ Expor chaves no código-fonte
- ❌ Compartilhar chaves entre subcontas
- ❌ Usar chave principal para tudo
- ❌ Commitar chaves no Git
- ❌ Logar chaves em logs

---

## 📝 Exemplo de Uso no Código

### Backend (Node.js/Hono)

```typescript
// Usar chave específica da subconta
async function createPaymentForSubaccount(subaccountId: string, data: any) {
  // Buscar chave da subconta no banco
  const subaccount = await db.prepare(
    'SELECT asaas_api_key FROM subaccounts WHERE id = ?'
  ).bind(subaccountId).first();
  
  if (!subaccount?.asaas_api_key) {
    throw new Error('Chave de API não configurada para esta subconta');
  }
  
  // Usar chave específica da subconta
  const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
    method: 'POST',
    headers: {
      'access_token': subaccount.asaas_api_key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
}
```

### Armazenamento Seguro

```sql
-- Tabela de subcontas com chave de API
CREATE TABLE subaccounts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  asaas_subaccount_id TEXT,
  asaas_api_key TEXT,      -- Chave específica da subconta
  asaas_wallet_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

---

## 🧪 Testes de Validação

### Teste 1: Validar Chave da Subconta
```bash
# Substitua $SUBACCOUNT_API_KEY pela chave da subconta
curl -X GET \
  -H "access_token: $SUBACCOUNT_API_KEY" \
  https://sandbox.asaas.com/api/v3/myAccount
```

**Resultado esperado:**
```json
{
  "name": "Nome da Subconta",
  "email": "subconta@exemplo.com",
  "personType": "JURIDICA",
  "walletId": "..."
}
```

### Teste 2: Criar Cobrança com Chave da Subconta
```bash
curl -X POST \
  -H "access_token: $SUBACCOUNT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "cus_000005735721",
    "billingType": "PIX",
    "value": 10.00,
    "dueDate": "2026-03-12"
  }' \
  https://sandbox.asaas.com/api/v3/payments
```

**Resultado esperado:**
```json
{
  "id": "pay_...",
  "status": "PENDING",
  "value": 10.00,
  "billingType": "PIX"
}
```

---

## 📚 Documentação de Referência

- **Asaas - Subcontas:** https://docs.asaas.com/reference/criar-subconta
- **Asaas - API Keys:** https://docs.asaas.com/docs/autenticacao
- **Asaas - Segurança:** https://docs.asaas.com/docs/seguranca

---

## ✅ Checklist de Configuração

### Conta Principal
- [x] ✅ Chave de API gerada
- [x] ✅ Chave PIX cadastrada
- [x] ✅ Configurada no Cloudflare
- [x] ✅ Split de pagamentos ativo
- [x] ✅ Gerenciamento de subcontas ativo

### Subcontas
- [x] ✅ Gerenciamento de chaves ativado
- [ ] ⏳ Gerar chave para cada subconta
- [ ] ⏳ Configurar no sistema
- [ ] ⏳ Testar isolamento de dados

### PIX
- [x] ✅ Chave PIX cadastrada
- [x] ✅ PIX normal funcionando
- [x] ✅ PIX Recorrente funcionando
- [ ] ⏳ PIX Automático (aguardando suporte)

---

**Última atualização:** 05/03/2026  
**Status:** Gerenciamento de chaves de API ativado com sucesso ✅
