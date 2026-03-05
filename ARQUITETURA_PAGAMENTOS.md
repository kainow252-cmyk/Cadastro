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
  - **Assinatura Mensal**: ✅ **PIX Automático** (débito recorrente bancário) - **IMPLEMENTADO v6.0**

### 🔄 Fluxo de Assinatura Mensal PIX (PIX Automático v6.0)

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
│    ✅ Se chargeType = 'monthly': cria AUTORIZAÇÃO PIX (v6.0)│
│       → POST /pix/qrCodes/authorization                      │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Asaas processa (PIX Automático)                          │
│    - Gera QR Code de AUTORIZAÇÃO PIX                         │
│    - Retorna payload de autorização                          │
│    - Cliente escaneia QR Code no app do banco               │
│    - Cliente AUTORIZA débito recorrente                      │
│    - Status: PENDING_AUTHORIZATION → AUTHORIZED             │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Próximas cobranças (AUTOMÁTICAS!)                        │
│    - A cada 30 dias: Asaas debita AUTOMATICAMENTE           │
│    - Cliente NÃO precisa fazer nada                         │
│    ✅ DÉBITO AUTOMÁTICO (como cartão de crédito)           │
│    - Split 20/80 aplicado em todos os débitos               │
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

#### `pix_authorizations` (v6.0 - **NOVA**)
```sql
-- Armazena autorizações de PIX Automático
CREATE TABLE pix_authorizations (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  authorization_id TEXT NOT NULL, -- ID Asaas
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_birthdate TEXT,
  value REAL NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MONTHLY', -- MONTHLY, WEEKLY, etc.
  first_due_date TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING_AUTHORIZATION', -- PENDING → AUTHORIZED
  authorization_date TEXT, -- Data da aprovação
  payload TEXT, -- QR Code payload
  expiration_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES subscription_signup_links(id)
);
```

#### `subscription_conversions`
```sql
-- Armazena cobranças únicas criadas via links
CREATE TABLE subscription_conversions (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  customer_id TEXT,
  subscription_id TEXT, -- ID Asaas (para cobrança única)
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  customer_birthdate TEXT,
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

## 🟢 PIX Automático Implementado (v6.0)

### ✅ Sistema Atual

**PIX Automático** está **100% FUNCIONAL** desde v6.0!

| Recurso | PIX Automático (v6.0) | Cobrança Única PIX |
|---------|----------------------|-------------------|
| **Débito** | ✅ Automático (sem ação do cliente) | ❌ Manual (1 pagamento) |
| **API Asaas** | `POST /v3/pix/qrCodes/authorization` | `POST /v3/payments` |
| **Aprovação** | Cliente autoriza 1 vez no banco | Cliente paga QR Code único |
| **Status** | `PENDING_AUTHORIZATION` → `AUTHORIZED` | `PENDING` → `RECEIVED` |
| **Débitos futuros** | Automáticos (todo mês) | Não há |
| **Implementação** | ✅ IMPLEMENTADO (v6.0) | ✅ IMPLEMENTADO |

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

## 🎉 PIX Automático - IMPLEMENTADO v6.0

### ✅ Funcionalidades Implementadas

1. **Rota de signup**: `/subscription-signup/:linkId` ✅
2. **Endpoint backend**: `POST /api/pix/subscription-signup/:linkId` ✅
3. **API Asaas**: `POST /v3/pix/qrCodes/authorization` ✅
4. **Fluxo completo**:
   - Cliente preenche dados ✅
   - Backend cria autorização Asaas ✅
   - Cliente abre QR Code no app do banco ✅
   - Aprova débito recorrente ✅
   - Status: `PENDING_AUTHORIZATION` → `AUTHORIZED` ✅

5. **Tabela**: `pix_authorizations` ✅
   ```sql
   CREATE TABLE pix_authorizations (
     id TEXT PRIMARY KEY,
     customer_id TEXT,
     authorization_id TEXT, -- ID Asaas
     status TEXT, -- PENDING_AUTHORIZATION, AUTHORIZED, CANCELLED
     value REAL,
     frequency TEXT, -- MONTHLY, BIWEEKLY, etc.
     first_due_date TEXT,
     payload TEXT,
     created_at TEXT
   );
   ```

**Vantagens Obtidas**:
- ✅ Conveniência de cartão + taxa baixa de PIX
- ✅ Split 20/80 automático
- ✅ Débitos mensais sem intervenção do cliente
- ✅ UI clara explicando o processo

---

## 📊 Status Atual (v6.0)

✅ **Implementado e Funcional**:
- **Asaas PIX Automático** (débito recorrente via banco) ✅ **NOVO v6.0**
- Asaas PIX Único (cobrança avulsa)
- DeltaPag Cartão (débito automático)
- Split 20/80 para subcontas
- Links de auto-cadastro para ambos sistemas
- Geração de QR Code e Banners
- Tabela `pix_authorizations` com tracking completo
- UI com alertas explicativos sobre débito automático

🎯 **Diferenciais v6.0**:
- Cliente paga 1 vez e autoriza → débitos automáticos todo mês
- Sem necessidade de cartão de crédito
- Taxa de PIX (menor que cartão)
- Experiência similar ao cartão (automática)

---

**Última atualização**: 2026-03-05 | **Versão**: 6.0
