# Split 20/80 no PIX Automático - Configuração Completa

## ✅ Confirmação: Split 20/80 Está Configurado

O **PIX Automático** aplica o **split 20/80 automaticamente** em **todas as cobranças recorrentes**, igual aos outros tipos de cobrança PIX.

---

## 🔍 Onde Está o Split?

### Código Backend (src/index.tsx - linha 1346-1349)

```typescript
const authData = {
  customer: customerId,
  billingType: 'PIX',
  value: value,
  description: description || 'Mensalidade',
  recurrenceType: 'MONTHLY',
  startDate: startDate,
  endDate: endDate || null,
  split: [{                    // ← SPLIT CONFIGURADO AQUI
    walletId: walletId,        // ← Subconta do corretor
    percentualValue: 20        // ← 20% para subconta
  }]                           // ← 80% vai automaticamente para conta principal
}
```

---

## 💰 Como Funciona o Split no PIX Automático

### Exemplo: Mensalidade R$50,00

#### 1️⃣ **Cliente Autoriza Débito Automático**
```
Cliente: João Silva
CPF: 123.456.789-00
Valor mensal: R$ 50,00
Periodicidade: MENSAL
Início: 17/03/2026
```

#### 2️⃣ **Primeira Cobrança (Imediata)**
```
Data: 17/03/2026
Valor total: R$ 50,00

Split automático:
├─ 20% → Subconta (corretor): R$ 10,00 ✅
└─ 80% → Conta Principal (empresa): R$ 40,00 ✅

Cliente paga: R$ 50,00
Status: PAID
Autorização: ACTIVE
```

#### 3️⃣ **Segunda Cobrança (Automática)**
```
Data: 17/04/2026 (automático - sem QR Code)
Valor total: R$ 50,00

Split automático:
├─ 20% → Subconta (corretor): R$ 10,00 ✅
└─ 80% → Conta Principal (empresa): R$ 40,00 ✅

Débito automático no banco
Status: PAID (sem intervenção do cliente)
```

#### 4️⃣ **Terceira Cobrança (Automática)**
```
Data: 17/05/2026 (automático - sem QR Code)
Valor total: R$ 50,00

Split automático:
├─ 20% → Subconta (corretor): R$ 10,00 ✅
└─ 80% → Conta Principal (empresa): R$ 40,00 ✅

Débito automático no banco
Status: PAID (sem intervenção do cliente)
```

#### ➡️ **Cobranças Seguintes (Mensais)**
```
Todo mês (dia 17):
• Banco debita R$ 50,00 automaticamente
• Split 20/80 aplicado em cada cobrança
• Cliente não precisa agir
• Corretor recebe R$ 10,00/mês
• Empresa recebe R$ 40,00/mês
```

---

## 📊 Comparação de Split nos 3 Tipos

### Exemplo: Mensalidade R$100,00

| Tipo | Split Configurado | Subconta | Conta Principal | Recorrente |
|------|-------------------|----------|-----------------|------------|
| 🟢 **QR Avulso** | ✅ 20/80 | R$ 20,00 | R$ 80,00 | ❌ Não |
| 🟣 **Assinatura PIX** | ✅ 20/80 | R$ 20,00/mês | R$ 80,00/mês | ✅ Manual |
| 🔵 **PIX Automático** | ✅ 20/80 | R$ 20,00/mês | R$ 80,00/mês | ✅ **Automático** |

---

## 🔄 Fluxo do Split no PIX Automático

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENTE AUTORIZA DÉBITO AUTOMÁTICO                   │
│    • Escaneia QR Code de autorização                    │
│    • Autoriza no app do banco                           │
│    • Paga primeira parcela: R$ 100,00                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. ASAAS PROCESSA PAGAMENTO                             │
│    • Recebe R$ 100,00 via PIX                           │
│    • Identifica configuração de split                   │
│    • Aplica split 20/80 automaticamente                 │
└─────────────────────────────────────────────────────────┘
                          ↓
           ┌──────────────┴──────────────┐
           ↓                             ↓
┌──────────────────────┐    ┌──────────────────────┐
│ SUBCONTA (Corretor)  │    │ CONTA PRINCIPAL      │
│ • Recebe R$ 20,00    │    │ • Recebe R$ 80,00    │
│ • 20% do total       │    │ • 80% do total       │
│ • Saldo atualizado   │    │ • Saldo atualizado   │
└──────────────────────┘    └──────────────────────┘
           │                             │
           └──────────────┬──────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. PRÓXIMA COBRANÇA AUTOMÁTICA (MÊS SEGUINTE)           │
│    • Banco debita R$ 100,00 automaticamente             │
│    • Split 20/80 aplicado novamente                     │
│    • R$ 20,00 → subconta                                │
│    • R$ 80,00 → conta principal                         │
│    • Cliente NÃO precisa fazer nada                     │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Detalhes Técnicos do Split

### Configuração no Código

```typescript
// Endpoint: POST /api/pix/automatic-authorization
// Arquivo: src/index.tsx

split: [{
  walletId: walletId,      // UUID da subconta do corretor
  percentualValue: 20      // 20% do valor total
}]

// Asaas calcula automaticamente:
// - Subconta: value * 20% = value * 0.20
// - Conta Principal: value * 80% = value * 0.80
```

### Exemplo de Request para Asaas

```json
POST /v3/pix/automatic/authorizations

{
  "customer": "cus_000161811061",
  "billingType": "PIX",
  "value": 100.00,
  "description": "Mensalidade",
  "recurrenceType": "MONTHLY",
  "startDate": "2026-03-17",
  "split": [{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "percentualValue": 20
  }]
}
```

### Exemplo de Response (após autorização)

```json
{
  "id": "auth_abc123",
  "status": "ACTIVE",
  "value": 100.00,
  "recurrenceType": "MONTHLY",
  "split": [
    {
      "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
      "percentualValue": 20,
      "totalValue": 20.00,
      "status": "ACTIVE"
    }
  ]
}
```

---

## 🎯 Vantagens do Split no PIX Automático

### ✅ Para o Corretor (Subconta)
- Recebe **20% automaticamente** todo mês
- **Sem intervenção manual**
- Saldo atualizado em **tempo real**
- Pode sacar ou transferir a qualquer momento

### ✅ Para a Empresa (Conta Principal)
- Recebe **80% automaticamente** todo mês
- **Fluxo de caixa previsível**
- Redução de **inadimplência**
- Gestão centralizada

### ✅ Para o Cliente
- **Autoriza uma vez só**
- Débito **automático mensal**
- **Não precisa lembrar** de pagar
- Pode cancelar a qualquer momento

---

## 📋 Resumo dos Valores

### Mensalidade R$15,00 (exemplo atual)
```
Total: R$ 15,00
├─ 20% → Subconta: R$ 3,00
└─ 80% → Conta Principal: R$ 12,00
```

### Mensalidade R$25,00
```
Total: R$ 25,00
├─ 20% → Subconta: R$ 5,00
└─ 80% → Conta Principal: R$ 20,00
```

### Mensalidade R$50,00
```
Total: R$ 50,00
├─ 20% → Subconta: R$ 10,00
└─ 80% → Conta Principal: R$ 40,00
```

### Mensalidade R$100,00
```
Total: R$ 100,00
├─ 20% → Subconta: R$ 20,00
└─ 80% → Conta Principal: R$ 80,00
```

---

## 🧪 Como Validar o Split (após liberação Asaas)

### 1. Criar Autorização PIX Automático
```bash
curl -X POST "http://localhost:3000/api/pix/automatic-authorization" \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "value": 100.00,
    "customerName": "João Silva",
    "customerEmail": "joao@example.com",
    "customerCpf": "12345678900"
  }'
```

### 2. Cliente Autoriza e Paga
- Cliente escaneia QR Code
- Autoriza débito automático
- Paga primeira parcela: R$100,00

### 3. Verificar Split no Painel Asaas
```
Acessar: https://app.asaas.com

1. Menu: Cobranças → Ver cobrança
2. Verificar valor total: R$ 100,00
3. Verificar split:
   ├─ Subconta: R$ 20,00 (20%)
   └─ Conta Principal: R$ 80,00 (80%)
4. Status: PAID
```

### 4. Verificar Saldo das Contas
```
Subconta (corretor):
• Saldo anterior: R$ X
• Entrada: R$ 20,00
• Saldo atual: R$ X + 20,00

Conta Principal (empresa):
• Saldo anterior: R$ Y
• Entrada: R$ 80,00
• Saldo atual: R$ Y + 80,00
```

---

## ✅ Confirmação Final

**Split 20/80 está 100% configurado no PIX Automático!** ✨

- ✅ Código implementado (linha 1346-1349)
- ✅ Split aplicado na autorização inicial
- ✅ Split aplicado em **todas as cobranças recorrentes**
- ✅ **Automático** - sem intervenção manual
- ✅ **Garantido** - não pode ser esquecido
- ✅ **Transparente** - visível no painel Asaas

---

**Versão**: 4.7  
**Data**: 16/02/2026  
**Status**: ⏳ Aguardando liberação Asaas  
**Split**: ✅ 20% subconta + 80% conta principal (configurado)

🚀 **Pronto para uso após habilitar permissão PIX_AUTOMATIC:WRITE!**
