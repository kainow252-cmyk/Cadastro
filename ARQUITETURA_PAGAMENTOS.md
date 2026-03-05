# Arquitetura de Pagamentos - Corretora Corporate

## 📊 Visão Geral

O sistema possui **dois fluxos de pagamento distintos**:

1. **Asaas** (Conta Principal) - Apenas PIX
2. **DeltaPag** (Sem subcontas) - Apenas Cartão de Crédito

---

## 🔵 1. Asaas - PIX Automático (Conta Principal)

### 📍 Características
- **Sistema**: Asaas API (conta principal do admin)
- **Método**: PIX (QR Code Copia e Cola)
- **Tipos**:
  - **Cobrança Única**: Pagamento avulso (1 vez)
  - **Assinatura Mensal**: Recorrência automática PIX

### 🔄 Fluxo de Assinatura Mensal PIX

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin cria Link de Auto-Cadastro                         │
│    Menu → Links Auto-Cadastro → Gerar Link                  │
│    Opções: "Cobrança Única" ou "Assinatura Mensal"         │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Cliente abre o link (QR Code ou URL)                     │
│    URL: /subscription-signup/{linkId}                        │
│    Formulário: Nome, Email, CPF, Data de Nascimento         │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend (POST /api/pix/subscription-signup/:linkId)      │
│    ✅ Valida link (ativo, não expirado)                     │
│    ✅ Busca ou cria customer no Asaas (CPF único)           │
│    ✅ Se chargeType = 'single': cria payment PIX (1 vez)    │
│    ✅ Se chargeType = 'monthly': cria subscription PIX      │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Asaas processa                                            │
│    - Gera QR Code PIX (primeira cobrança)                    │
│    - Retorna payload e Base64 do QR Code                     │
│    - Cliente paga o primeiro PIX                             │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Próximas cobranças (apenas se 'monthly')                 │
│    - A cada 30 dias: Asaas gera novo QR Code PIX            │
│    - Cliente paga manualmente (QR Code via email/notif)     │
│    ⚠️ NÃO É DÉBITO AUTOMÁTICO (requer ação do cliente)     │
└─────────────────────────────────────────────────────────────┘
```

### ⚙️ Endpoints Envolvidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/pix/subscription-link` | Cria link de cadastro (admin) |
| GET | `/subscription-signup/:linkId` | Página HTML de cadastro (cliente) |
| GET | `/api/pix/subscription-signup/:linkId` | Carrega dados do link (validação) |
| POST | `/api/pix/subscription-signup/:linkId` | Processa cadastro e cria payment/subscription |

### 💾 Tabelas do Banco de Dados

#### `subscription_signup_links`
```sql
CREATE TABLE subscription_signup_links (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT,
  expires_at TEXT NOT NULL,
  charge_type TEXT DEFAULT 'monthly', -- 'single' ou 'monthly'
  active INTEGER DEFAULT 1
);
```

#### `subscription_conversions` (futura)
```sql
-- Armazena assinaturas criadas via links
CREATE TABLE subscription_conversions (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  customer_id TEXT,
  subscription_id TEXT, -- ID Asaas
  status TEXT,
  created_at TEXT
);
```

---

## 🟠 2. DeltaPag - Cartão de Crédito (Sem Subcontas)

### 📍 Características
- **Sistema**: DeltaPag API (gateway de pagamento separado)
- **Método**: Cartão de Crédito (Visa, Master, Elo, etc.)
- **Recorrência**: Débito automático mensal (verdadeiro PIX Automático não está disponível)

### 🔄 Fluxo de Assinatura Cartão DeltaPag

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin cria Link de Auto-Cadastro DeltaPag                │
│    Menu → Links DeltaPag → Gerar Link                       │
│    Campos: Valor Mensal, Descrição, Recorrência, Validade   │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Cliente abre o link                                       │
│    URL: /deltapag-signup/{linkId}                            │
│    Formulário: Dados pessoais + Dados do Cartão             │
│    (Número, Titular, Validade, CVV)                          │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend (POST /api/public/deltapag-signup/:linkId)       │
│    ✅ Valida link                                            │
│    ✅ Cria customer no DeltaPag                              │
│    ✅ Tokeniza cartão (PCI Compliant)                        │
│    ✅ Cria assinatura recorrente (CREDIT_CARD)              │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DeltaPag processa                                         │
│    - Primeira cobrança: imediata (valida cartão)             │
│    - Próximas cobranças: automáticas (dia X de cada mês)    │
│    ✅ DÉBITO AUTOMÁTICO (sem ação do cliente)               │
└─────────────────────────────────────────────────────────────┘
```

### ⚙️ Endpoints Envolvidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/deltapag/links` | Cria link DeltaPag (admin) |
| GET | `/deltapag-signup/:linkId` | Página HTML de cadastro cartão |
| POST | `/api/public/deltapag-signup/:linkId` | Processa cadastro e cria subscription |

### 💾 Tabelas do Banco de Dados

#### `deltapag_signup_links`
```sql
CREATE TABLE deltapag_signup_links (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  value REAL NOT NULL,
  recurrence_type TEXT DEFAULT 'MONTHLY',
  valid_until TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### `deltapag_subscriptions`
```sql
CREATE TABLE deltapag_subscriptions (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  customer_id TEXT,
  subscription_id TEXT, -- ID DeltaPag/Asaas
  card_last4 TEXT,
  card_brand TEXT,
  status TEXT,
  created_at TEXT
);
```

---

## 🔴 Importante: PIX Automático vs Assinatura PIX Mensal

### ⚠️ Confusão Comum

**PIX Automático** (recurso Asaas) ≠ **Assinatura Mensal PIX** (sistema atual)

| Recurso | PIX Automático (Asaas API) | Assinatura Mensal PIX (Sistema Atual) |
|---------|----------------------------|---------------------------------------|
| **Débito** | ✅ Automático (sem ação do cliente) | ❌ Manual (cliente paga QR Code todo mês) |
| **API Asaas** | `POST /v3/pix/qrCodes/authorization` | `POST /v3/subscriptions` (billingType: PIX) |
| **Aprovação** | Cliente aprova 1 vez no banco | Cliente paga QR Code mensal |
| **Status** | `AUTHORIZED` → débitos automáticos | `ACTIVE` → QR Codes mensais |
| **Implementação** | 🔴 NÃO IMPLEMENTADO | ✅ IMPLEMENTADO (v5.7) |

### 📚 Referência da API Asaas

**PIX Automático (não implementado)**:
- Documentação: https://docs.asaas.com/reference/criar-uma-autorizacao-pix-automatico
- Endpoint: `POST /v3/pix/qrCodes/authorization`
- Funcionamento: Cliente autoriza débito recorrente no app do banco
- Após autorização: Asaas debita automaticamente (como cartão)

**Assinatura PIX (implementado)**:
- Endpoint: `POST /v3/subscriptions`
- Payload: `{ billingType: 'PIX', cycle: 'MONTHLY', ... }`
- Funcionamento: Gera novo QR Code PIX a cada mês
- Cliente precisa pagar manualmente

---

## 🎯 Resumo Comparativo

| Aspecto | Asaas PIX Mensal | DeltaPag Cartão |
|---------|------------------|-----------------|
| **Gateway** | Asaas (conta principal) | DeltaPag / Asaas |
| **Método** | PIX (QR Code) | Cartão de Crédito |
| **Automação** | ❌ Manual (paga QR Code) | ✅ Débito automático |
| **Segurança** | CPF único | Tokenização PCI |
| **Uso ideal** | Clientes que preferem PIX | Assinaturas convenientes |
| **Split** | 20% subconta / 80% admin | Configurável |
| **Endpoints** | `/subscription-signup/` | `/deltapag-signup/` |

---

## 🚀 Próximos Passos (Opcional)

### Implementar PIX Automático (Débito Recorrente)

Se quiser implementar o **verdadeiro PIX Automático** do Asaas:

1. **Criar nova rota**: `/asaas-pix-auto-signup/:linkId`
2. **Endpoint backend**: `POST /api/pix/authorization`
3. **API Asaas**: `POST /v3/pix/qrCodes/authorization`
4. **Fluxo**:
   - Cliente preenche dados
   - Backend cria autorização Asaas
   - Cliente abre QR Code no app do banco
   - Aprova débito recorrente
   - Status: `AUTHORIZED` → débitos automáticos

5. **Tabela**: `asaas_pix_authorizations`
   ```sql
   CREATE TABLE asaas_pix_authorizations (
     id TEXT PRIMARY KEY,
     customer_id TEXT,
     authorization_id TEXT, -- ID Asaas
     status TEXT, -- PENDING, AUTHORIZED, CANCELLED
     value REAL,
     frequency TEXT, -- MONTHLY, BIWEEKLY, etc.
     created_at TEXT
   );
   ```

**Vantagem**: Conveniência de cartão + taxa baixa de PIX

---

## 📊 Status Atual (v5.7)

✅ **Implementado e Funcional**:
- Asaas PIX Mensal (QR Code manual recorrente)
- DeltaPag Cartão (débito automático)
- Split 20/80 para subcontas
- Links de auto-cadastro para ambos sistemas
- Geração de QR Code e Banners

❌ **Não Implementado**:
- PIX Automático (débito recorrente via banco)
- Assinatura PIX com autorização bancária

---

**Última atualização**: 2026-03-05 | **Versão**: 5.7
