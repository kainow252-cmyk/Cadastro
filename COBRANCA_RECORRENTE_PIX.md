# Cobrança Recorrente via PIX - Documentação Técnica

## Data: 16/02/2026
## Versão: 3.8
## Sistema: Gerenciador Asaas

---

## 🎯 Introdução

Este documento explica como funciona a **cobrança recorrente via PIX** no sistema Asaas e como o sistema implementa essa funcionalidade.

---

## 📋 Como Funciona

### Cenário Real: Link "cobrança1"

**Dados do Link:**
- **ID**: `jojbl0j4fr7a93b6`
- **Nome**: cobrança1
- **Valor**: R$ 15,00
- **Frequência**: Mensal
- **Método**: PIX
- **Tipo**: RECURRENT (Recorrente)
- **URL**: https://www.asaas.com/c/jojbl0j4fr7a93b6

---

## 🔄 Fluxo de Assinatura PIX

### 1️⃣ Cliente Acessa o Link

Quando o cliente acessa `https://www.asaas.com/c/jojbl0j4fr7a93b6`:

1. Página de checkout do Asaas é exibida
2. Cliente preenche seus dados:
   - Nome completo
   - CPF/CNPJ
   - Email
   - Telefone
   - Endereço

### 2️⃣ Cliente Seleciona Forma de Pagamento

**Opções disponíveis:**
- ✅ **PIX** (pagamento único mensal)
- ✅ **Cartão de Crédito** (débito automático)
- ✅ **Boleto** (cobrança mensal)

### 3️⃣ Assinatura é Criada

Quando cliente escolhe **PIX** e confirma:

```javascript
// API Asaas cria internamente
{
  "customer": "cus_000161797547",  // Cliente cadastrado
  "billingType": "PIX",
  "value": 15.00,
  "cycle": "MONTHLY",              // Ciclo mensal
  "nextDueDate": "2026-03-16"      // Próxima cobrança
}
```

### 4️⃣ Primeira Cobrança PIX

1. **QR Code gerado** imediatamente
2. Cliente **paga via PIX**
3. Pagamento **confirmado em segundos**
4. Status: **RECEIVED** ✅

```javascript
{
  "id": "pay_hpvc24ms1d1peetr",
  "customer": "cus_000161797547",
  "paymentLink": "jojbl0j4fr7a93b6",
  "value": 15.00,
  "status": "RECEIVED",
  "paymentDate": "2026-02-16",
  "dueDate": "2026-03-31"
}
```

### 5️⃣ Cobranças Mensais Automáticas

**A cada mês (dia 16):**

1. Sistema Asaas **cria nova cobrança PIX**
2. Cliente recebe **email/SMS com link de pagamento**
3. Cliente **acessa o link e paga via PIX**
4. Processo se repete até assinatura ser cancelada

---

## 🏗️ Arquitetura da Solução

### Como o Sistema Detecta o Link Recorrente

**API Response do Link:**

```json
{
  "id": "jojbl0j4fr7a93b6",
  "name": "cobrança1",
  "value": 15,
  "chargeType": "RECURRENT",      // ← Indica assinatura
  "billingType": "PIX",
  "subscriptionCycle": "MONTHLY",  // ← Ciclo mensal
  "active": true,
  "url": "https://www.asaas.com/c/jojbl0j4fr7a93b6"
}
```

### Como Buscar Pagamentos do Link

**Endpoint do Sistema:**
```http
GET /api/payment-links/jojbl0j4fr7a93b6/payments
```

**Backend (src/index.tsx):**

```typescript
app.get('/api/payment-links/:id/payments', async (c) => {
  const linkId = c.req.param('id')
  
  // Buscar pagamentos da API Asaas
  const result = await asaasRequest(c, `/payments?paymentLink=${linkId}`)
  
  // FILTRO CRÍTICO: API Asaas tem bug e retorna pagamentos extras
  const allPayments = result.data?.data || []
  const filteredPayments = allPayments.filter((payment: any) => 
    payment.paymentLink === linkId  // ← Garante apenas deste link
  )
  
  return c.json({
    ok: true,
    data: filteredPayments,
    totalCount: filteredPayments.length
  })
})
```

### Como Enriquecer Dados do Cliente

**Frontend (payment-links.js):**

```javascript
async function viewLinkPayments(linkId, linkName) {
  // 1. Buscar pagamentos
  const response = await axios.get(`/api/payment-links/${linkId}/payments`);
  const payments = response.data.data || [];
  
  // 2. Para cada pagamento, buscar dados do cliente
  const enrichedPayments = await Promise.all(payments.map(async (payment) => {
    if (payment.customer) {
      const customerResponse = await axios.get(`/api/customers/${payment.customer}`);
      payment.customerName = customerResponse.data.data?.name;
      payment.customerEmail = customerResponse.data.data?.email;
    }
    return payment;
  }));
  
  // 3. Exibir na interface
  window.allPayments = enrichedPayments;
  renderFilteredPayments();
}
```

---

## 📊 Dados Reais do Sistema

### Cliente que Pagou

**Dados obtidos via API:**
```json
{
  "id": "cus_000161797547",
  "name": "GELCI JOSE DA SILVA",
  "email": "gelci.silva252@gmail.com",
  "cpfCnpj": "11013430794",
  "mobilePhone": "27998238741",
  "city": "Vitória",
  "state": "ES"
}
```

### Pagamento Realizado

```json
{
  "id": "pay_hpvc24ms1d1peetr",
  "customer": "cus_000161797547",
  "customerName": "GELCI JOSE DA SILVA",       // ← Adicionado pelo sistema
  "customerEmail": "gelci.silva252@gmail.com",  // ← Adicionado pelo sistema
  "paymentLink": "jojbl0j4fr7a93b6",
  "value": 15.00,
  "netValue": 14.01,                            // Após taxa Asaas (0.99)
  "status": "RECEIVED",
  "billingType": "PIX",
  "dateCreated": "2026-02-16",
  "paymentDate": "2026-02-16",
  "dueDate": "2026-03-31",
  "invoiceUrl": "https://www.asaas.com/i/hpvc24ms1d1peetr"
}
```

---

## 🎨 Interface do Usuário

### Dashboard - Botão "Pagamentos"

```html
<!-- Link cobrança1 -->
<div class="border rounded-lg p-4">
  <h4>cobrança1</h4>
  <p>Tipo: Assinatura/Recorrente</p>
  <p>Pagamento: PIX</p>
  <p>Valor: R$ 15,00</p>
  <button onclick="viewLinkPayments('jojbl0j4fr7a93b6', 'cobrança1')" 
          class="bg-green-600 text-white">
    <i class="fas fa-dollar-sign"></i> Pagamentos
  </button>
</div>
```

### Tela de Pagamentos

**Cards de Resumo:**
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ✅ Recebidos     │  │ ⏳ Pendentes     │  │ ⚠️ Vencidos      │  │ 📊 Total Geral   │
│ 1 pagamento      │  │ 0 pagamentos     │  │ 0 pagamentos     │  │ 1 pagamento      │
│ R$ 15,00         │  │ R$ 0,00          │  │ R$ 0,00          │  │ R$ 15,00 (bruto) │
└──────────────────┘  └──────────────────┘  └──────────────────┘  │ R$ 14,01 (líq.)  │
                                                                   └──────────────────┘
```

**Tabela de Pagamentos:**
```
┌────────────────────────────┬──────────┬──────────┬────────────┬─────────────┬──────────────┬─────────┐
│ Cliente                    │ Status   │ Valor    │ Valor Líq. │ Criado em   │ Vencimento   │ Ações   │
├────────────────────────────┼──────────┼──────────┼────────────┼─────────────┼──────────────┼─────────┤
│ GELCI JOSE DA SILVA        │ Recebido │ R$ 15,00 │ R$ 14,01   │ 16/02/2026  │ 31/03/2026   │ 📄 Ver  │
│ gelci.silva252@gmail.com   │          │          │            │             │              │         │
│ ID: pay_hpvc24ms1d1peetr   │          │          │            │             │              │         │
└────────────────────────────┴──────────┴──────────┴────────────┴─────────────┴──────────────┴─────────┘
```

---

## 🔧 Filtros e Relatórios

### Filtros Disponíveis

1. **Busca por Texto**: Nome do cliente, email, ID do pagamento
2. **Status**: Pendente, Recebido, Confirmado, Vencido, Reembolsado
3. **Data Início/Fim**: Período específico
4. **Mês/Ano**: Filtro rápido por mês

### Exportação

**Excel (XLSX):**
```javascript
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(window.filteredPayments.map(p => ({
  'Cliente': p.customerName || p.customer,
  'Email': p.customerEmail || '',
  'ID Pagamento': p.id,
  'Status': getStatusLabel(p.status),
  'Valor': p.value,
  'Valor Líquido': p.netValue || p.value,
  'Data Criação': formatDate(p.dateCreated),
  'Data Vencimento': formatDate(p.dueDate)
})));

XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagamentos');
XLSX.writeFile(workbook, `pagamentos_cobrança1_2026-02-16.xlsx`);
```

**PDF:**
```javascript
const doc = new jsPDF();
doc.setFontSize(16);
doc.text('Relatório de Pagamentos', 14, 20);
doc.text(`Link: cobrança1`, 14, 30);

doc.autoTable({
  head: [['Cliente', 'Status', 'Valor', 'Data']],
  body: window.filteredPayments.map(p => [
    p.customerName || p.customer,
    getStatusLabel(p.status),
    formatCurrency(p.value),
    formatShortDate(p.dateCreated)
  ])
});

doc.save(`pagamentos_cobrança1_2026-02-16.pdf`);
```

---

## ✅ Status Atual

### Funcionalidades Implementadas

- ✅ Criação de links recorrentes via PIX
- ✅ Listagem de pagamentos por link
- ✅ Filtro correto (apenas pagamentos do link específico)
- ✅ Busca enriquecida de dados do cliente (nome + email)
- ✅ Interface com cards de resumo
- ✅ Tabela detalhada com informações completas
- ✅ Filtros avançados (busca, status, datas, mês/ano)
- ✅ Exportação para Excel e PDF
- ✅ Contadores precisos
- ✅ Valores brutos e líquidos

### Próximas Melhorias Sugeridas

1. **Notificações**: Avisar quando nova cobrança mensal é gerada
2. **Histórico**: Timeline de todos os pagamentos da assinatura
3. **Cancelamento**: Botão para cancelar assinatura direto no sistema
4. **Analytics**: Gráficos de evolução mensal
5. **Webhooks**: Receber eventos em tempo real do Asaas

---

## 🚀 Deploy Atual

- **URL Produção**: https://cadastro.corretoracorporate.com.br
- **URL Deploy**: https://bfa5c2a2.project-839f9256.pages.dev
- **Build Size**: 191.16 kB
- **Versão Backend**: v3.8
- **Versão Frontend**: payment-links.js v3.8, payment-filters.js v1.2

---

## 📚 Referências

- **Documentação Asaas - Payment Links**: https://docs.asaas.com/reference/criar-novo-link-de-pagamento
- **Documentação Asaas - Assinaturas**: https://docs.asaas.com/reference/criar-nova-assinatura
- **Documentação Asaas - Cobranças**: https://docs.asaas.com/reference/criar-nova-cobranca

---

## 🎉 Conclusão

O sistema **suporta totalmente cobrança recorrente via PIX** através de links de pagamento!

**Mecanismo:**
1. Cliente acessa link recorrente PIX
2. Preenche dados e confirma primeira cobrança
3. Asaas cria assinatura mensal automática
4. A cada mês, nova cobrança PIX é gerada
5. Cliente recebe notificação e paga via PIX
6. Sistema exibe todos os pagamentos com dados enriquecidos

**Limitação conhecida:**
- Cliente precisa pagar **manualmente** cada mês via PIX
- Não existe débito automático no PIX (limitação do protocolo)
- Alternativa: usar **Cartão de Crédito** para cobrança automática

---

**Desenvolvido por**: AI Assistant  
**Data**: 16/02/2026  
**Versão**: 3.8
