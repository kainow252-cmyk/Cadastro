# 📊 Sistema de Relatórios Detalhados - Documentação

## 🎯 Visão Geral

O sistema de relatórios foi aprimorado para incluir **dados completos dos clientes** e **filtros por tipo de cobrança**.

---

## 🔗 Novo Endpoint: `/api/reports/:accountId/detailed`

### **Método:** GET

### **Parâmetros:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `accountId` | Path | ✅ Sim | ID da subconta Asaas |
| `startDate` | Query | ❌ Não | Data inicial (YYYY-MM-DD) |
| `endDate` | Query | ❌ Não | Data final (YYYY-MM-DD) |
| `chargeType` | Query | ❌ Não | Tipo de cobrança (ver valores abaixo) |
| `status` | Query | ❌ Não | Status do pagamento (ver valores abaixo) |

### **Valores para `chargeType`:**
- `all` - Todos os tipos (padrão)
- `single` - Cobrança Única (QR Code Avulso)
- `monthly` - Assinatura Mensal
- `pix_auto` - PIX Automático
- `link_cadastro` - Link Auto-Cadastro

### **Valores para `status`:**
- `all` - Todos os status (padrão)
- `RECEIVED` - Pagamentos recebidos
- `PENDING` - Pendentes
- `OVERDUE` - Vencidos
- `REFUNDED` - Reembolsados

---

## 📤 Exemplo de Resposta:

```json
{
  "ok": true,
  "data": {
    "account": {
      "id": "607b9153-6f9c-47eb-a4d7-301cdc4ff7cd",
      "name": "Roberto Caporalle Mayo",
      "email": "rmayo@bol.com.br",
      "cpfCnpj": "068.530.578-30",
      "walletId": "670c8f60-ec5d-41a8-91cb-112e72970212"
    },
    "period": {
      "startDate": "2026-02-01",
      "endDate": "2026-02-28"
    },
    "filters": {
      "chargeType": "single",
      "status": "RECEIVED"
    },
    "summary": {
      "totalReceived": 238.60,
      "totalPending": 142.80,
      "totalOverdue": 0,
      "totalRefunded": 0,
      "totalTransactions": 37
    },
    "transactions": [
      {
        "id": "pay_123456",
        "value": 10.00,
        "description": "Mensalidade",
        "dueDate": "2026-02-27",
        "status": "RECEIVED",
        "dateCreated": "2026-02-20 15:30:00",
        "billingType": "PIX",
        "paymentDate": "2026-02-20 16:15:00",
        "chargeType": "single",
        "customer": {
          "name": "João da Silva",
          "email": "joao@email.com",
          "cpf": "12345678900",
          "birthdate": "1990-05-15"
        }
      },
      {
        "id": "pay_789012",
        "value": 15.00,
        "description": "Teste Pagamento Único",
        "dueDate": "2026-02-27",
        "status": "RECEIVED",
        "dateCreated": "2026-02-20 17:45:00",
        "billingType": "PIX",
        "paymentDate": "2026-02-20 18:00:00",
        "chargeType": "single",
        "customer": {
          "name": "Maria Santos",
          "email": "maria@email.com",
          "cpf": "98765432100",
          "birthdate": "1985-12-25"
        }
      }
    ]
  }
}
```

---

## 🧪 Exemplos de Uso:

### **1. Buscar todos os pagamentos recebidos:**
```bash
GET /api/reports/607b9153-6f9c-47eb-a4d7-301cdc4ff7cd/detailed?status=RECEIVED
```

### **2. Buscar cobranças únicas (QR Code Avulso) recebidas:**
```bash
GET /api/reports/607b9153-6f9c-47eb-a4d7-301cdc4ff7cd/detailed?chargeType=single&status=RECEIVED
```

### **3. Buscar assinaturas mensais em um período:**
```bash
GET /api/reports/607b9153-6f9c-47eb-a4d7-301cdc4ff7cd/detailed?chargeType=monthly&startDate=2026-02-01&endDate=2026-02-28
```

### **4. Buscar todos os pagamentos do mês atual:**
```bash
GET /api/reports/607b9153-6f9c-47eb-a4d7-301cdc4ff7cd/detailed?startDate=2026-02-01&endDate=2026-02-28
```

---

## 📋 Dados do Cliente Incluídos:

Para cada transação, são retornados os seguintes dados do cliente:

| Campo | Descrição |
|-------|-----------|
| `customer.name` | Nome completo do cliente |
| `customer.email` | Email do cliente |
| `customer.cpf` | CPF (sem formatação) |
| `customer.birthdate` | Data de nascimento (YYYY-MM-DD) |

---

## 🔍 Como Funciona:

1. **Busca no D1:** Sistema busca transações na tabela `transactions`
2. **Join com conversões:** Faz LEFT JOIN com `subscription_conversions` para pegar dados do cliente
3. **Join com links:** Faz LEFT JOIN com `subscription_signup_links` para pegar tipo de cobrança (`charge_type`)
4. **Filtros aplicados:** Aplica filtros de data, tipo e status
5. **Estatísticas calculadas:** Calcula totais por status de pagamento

---

## 🎨 Próxima Etapa: Interface Frontend

Para implementar a interface visual completa, seria necessário:

1. **Filtros no frontend:**
   - Dropdown "Tipo de Cobrança" (Todos, QR Code Avulso, Assinatura Mensal, etc.)
   - Dropdown "Status" (Todos, Recebidos, Pendentes, etc.)

2. **Tabela expandida:**
   - Colunas adicionais: Nome do Cliente, CPF, Data de Nascimento
   - Coluna "Tipo de Cobrança" com badges coloridos

3. **Exportação aprimorada:**
   - PDF e Excel incluindo dados dos clientes
   - Cabeçalho com filtros aplicados

---

## ✅ Status Atual:

- ✅ Backend implementado e funcionando
- ✅ Endpoint `/api/reports/:accountId/detailed` disponível
- ✅ Filtros por tipo de cobrança e status
- ✅ Dados dos clientes incluídos
- ⏳ Interface frontend pendente (pode ser implementada em etapa futura)

---

## 🚀 Como Testar Agora:

Use o cURL ou Postman para testar o endpoint:

```bash
curl "https://corretoracorporate.pages.dev/api/reports/607b9153-6f9c-47eb-a4d7-301cdc4ff7cd/detailed?status=RECEIVED"
```

**Substitua o `accountId` pelo ID da sua subconta!**

---

## 📊 Tipos de Cobrança Suportados:

| Tipo | Valor no `chargeType` | Descrição |
|------|----------------------|-----------|
| QR Code Avulso | `single` | Pagamento único via QR Code |
| Assinatura Mensal | `monthly` | Cobrança recorrente mensal |
| PIX Automático | `pix_auto` | PIX com renovação automática |
| Link Auto-Cadastro | `link_cadastro` | Link gerado para clientes |

---

## 🎯 Benefícios:

✅ **Relatórios mais completos** com dados dos clientes  
✅ **Filtros flexíveis** para análise específica  
✅ **Rastreamento de tipos de cobrança**  
✅ **Dados de nascimento** para campanhas  
✅ **Preparado para exportação** (PDF/Excel)  

---

**Data de criação:** 20/02/2026  
**Versão:** 1.0  
**Status:** ✅ Deploy em produção
