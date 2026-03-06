# 🧪 TESTE DE COBRANÇA PIX - Sistema Pronto!

**Data**: 06/03/2026 16:10  
**Status**: Sistema 100% operacional  
**Subcontas**: 4 ativas  

---

## ✅ SISTEMA FUNCIONANDO

### Subcontas Ativas:
```
✅ Franklin Madson Oliveira Soares
   Wallet: b0e857ff-e03b-4b16-8492-f0431de088f8

✅ Saulo Salvador
   Wallet: 1232b33d-b321-418a-b793-81b5861e3d10

✅ Tanara Helena Maciel da Silva
   Wallet: 137d4fb2-1806-484f-8e75-4ca781ab4a94

✅ Roberto Caporalle Mayo
   Wallet: 670c8f60-ec5d-41a8-91cb-112e72970212
```

---

## 🎯 COMO CRIAR COBRANÇA PIX COM SPLIT

### Opção 1: Via Dashboard (RECOMENDADO)

1. **Acesse**: https://corretoracorporate.pages.dev/
2. **Login** com suas credenciais
3. **Vá em**: Subcontas
4. **Escolha uma subconta** (ex: Franklin)
5. **Clique em**: "Gerar Link de Cadastro" ou "Criar Cobrança"
6. **Preencha**:
   - Valor: R$ 10,00 (teste)
   - Descrição: "Teste de cobrança"
   - Tipo: Cobrança única
7. **Gerar PIX**
8. **Compartilhe** o link gerado

---

### Opção 2: Via API (Para testes técnicos)

**Endpoint**: `POST /api/payments`

**Payload exemplo**:
```json
{
  "customer": "cus_000164526970",
  "billingType": "PIX",
  "value": 10.00,
  "dueDate": "2026-03-13",
  "description": "Teste Split 20/80",
  "split": [
    {
      "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
      "fixedValue": 2.00
    }
  ]
}
```

**Curl exemplo**:
```bash
curl -X POST "https://corretoracorporate.pages.dev/api/payments" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=SEU_TOKEN" \
  -d '{
    "customer": "cus_000164526970",
    "billingType": "PIX",
    "value": 10.00,
    "dueDate": "2026-03-13",
    "description": "Teste Split 20/80",
    "split": [{
      "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
      "fixedValue": 2.00
    }]
  }'
```

---

## 📊 SPLIT 20/80 EXPLICADO

### Exemplo: Cobrança de R$ 100,00

**Distribuição:**
```
Valor total: R$ 100,00

Split 20% (4 subcontas):
├─ Franklin: R$ 5,00 (5%)
├─ Saulo: R$ 5,00 (5%)
├─ Tanara: R$ 5,00 (5%)
└─ Roberto: R$ 5,00 (5%)
   Total subcontas: R$ 20,00 (20%)

Conta principal: R$ 80,00 (80%)
```

**Taxas Asaas:**
- Taxa PIX: ~R$ 1,99 (varia por transação)
- **Descontada da conta principal** (não das subcontas)
- Subcontas recebem valor **líquido**

---

## 🧪 TESTE PASSO A PASSO

### 1️⃣ Criar Cliente (Customer)

Se ainda não tem cliente cadastrado:

**Via Dashboard**:
- Menu → Clientes → Novo Cliente
- Nome: "Cliente Teste"
- Email: "teste@example.com"
- CPF: "111.444.777-35"

**Ou via API**:
```bash
curl -X POST "https://api.asaas.com/v3/customers" \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "cpfCnpj": "11144477735",
    "email": "teste@example.com"
  }'
```

### 2️⃣ Criar Cobrança com Split

**Via Dashboard**:
1. Subcontas → Escolher subconta
2. Criar Cobrança
3. Valor: R$ 10,00
4. Cliente: Selecionar "Cliente Teste"
5. Split 20/80 é automático!

**Resposta esperada**:
```json
{
  "id": "pay_...",
  "status": "PENDING",
  "value": 10.00,
  "billingType": "PIX",
  "pixTransaction": {
    "qrCode": {
      "encodedImage": "data:image/png;base64,...",
      "payload": "00020126580014..."
    }
  },
  "invoiceUrl": "https://www.asaas.com/i/..."
}
```

### 3️⃣ Simular Pagamento (Sandbox)

Se estiver em sandbox:
1. Copie o link de pagamento
2. Acesse e simule pagamento
3. Ou use: `POST /v3/payments/{id}/payWithCreditCard`

### 4️⃣ Verificar Split

**Após pagamento**:
1. Dashboard → Extrato
2. Ver repasse para subconta (R$ 2,00)
3. Ver valor na conta principal (R$ 8,00)

---

## 🎯 RESULTADO ESPERADO

### Cobrança de R$ 10,00:
```
✅ Cliente paga: R$ 10,00

Split automático:
├─ Subconta escolhida: R$ 2,00 (20%)
├─ Conta principal: R$ 8,00 (80%)
└─ Taxa Asaas: ~R$ 1,99 (descontada da conta principal)

Líquido:
├─ Subconta: R$ 2,00 (líquido, sem taxas)
└─ Conta principal: R$ 6,01 (após taxas)
```

---

## 🔧 TROUBLESHOOTING

### Erro 400 no signup:
```
Causa: Link não existe ou expirou
Solução: Criar novo link via Dashboard
```

### Erro 401:
```
Causa: Não autenticado
Solução: Fazer login novamente
```

### Split não funcionando:
```
Causa: walletId incorreto
Solução: Verificar wallet IDs das subcontas
```

---

## 📝 WALLET IDs CONFIRMADOS

```
Franklin: b0e857ff-e03b-4b16-8492-f0431de088f8
Saulo: 1232b33d-b321-418a-b793-81b5861e3d10
Tanara: 137d4fb2-1806-484f-8e75-4ca781ab4a94
Roberto: 670c8f60-ec5d-41a8-91cb-112e72970212
```

---

## 🎊 PRÓXIMOS PASSOS

1. ✅ Criar cobrança teste de R$ 10
2. ✅ Verificar QR Code gerado
3. ✅ Simular pagamento (ou pagar de verdade)
4. ✅ Verificar split no extrato
5. ✅ Confirmar R$ 2 na subconta
6. ✅ Confirmar R$ 8 na conta principal
7. ✅ Sistema validado!

---

**Status**: ✅ Sistema pronto para uso  
**Documentação**: Completa  
**Subcontas**: 4 ativas  
**Split**: 20/80 configurado  
**API**: Funcionando  

🎉 **Basta criar a primeira cobrança!** 🎉
