# 🔄 Fluxo Completo: Cadastro + Cliente + PIX Automático

## 🎯 Objetivo

Quando um usuário se cadastra pela página pública (`/cadastro/:linkId`), o sistema automaticamente:
1. **Cria a subconta** no Asaas
2. **Cadastra o cliente** (customer) no Asaas
3. **Gera cobrança PIX** de R$ 50,00 (taxa de cadastro)
4. **Aplica split 20/80** automaticamente
5. **Exibe QR Code** para pagamento imediato

## 📋 Fluxo Detalhado

### Passo 1: Usuário Acessa Link de Cadastro

**URL**: `https://seu-dominio.com/cadastro/:linkId`

**Exemplo**:
```
https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai/cadastro/62118294-2d2b-4df7-b4a1-af31fa80e065-1771102043405-8dh2tnxbu
```

### Passo 2: Usuário Preenche Formulário

**Campos Obrigatórios:**
- Nome completo
- Email
- CPF
- Data de nascimento
- Celular
- CEP
- Endereço
- Número
- Bairro
- Renda/Faturamento mensal

**Campos Opcionais:**
- Telefone fixo
- Complemento
- Tipo de empresa

### Passo 3: Sistema Processa Cadastro

#### 3.1. Criação da Subconta
```javascript
POST /accounts (Asaas API)
Body: {
  name, email, cpfCnpj, birthDate, 
  mobilePhone, phone, postalCode, 
  address, addressNumber, province,
  incomeValue, companyType
}

Resposta: {
  id: "account-id",
  walletId: "wallet-id",
  apiKey: "api-key",
  name, email...
}
```

#### 3.2. Criação do Cliente (Customer)
```javascript
POST /customers (Asaas API)
Body: {
  name: "Nome do usuário",
  email: "email@usuario.com",
  cpfCnpj: "12345678901",
  mobilePhone: "11999887766",
  phone: "1133000000",
  postalCode: "01310100",
  address: "Av. Paulista",
  addressNumber: "1000",
  province: "Bela Vista"
}

Resposta: {
  id: "customer-id",
  name, email, cpfCnpj...
}
```

#### 3.3. Geração da Cobrança PIX
```javascript
POST /payments (Asaas API)
Body: {
  customer: "customer-id",
  billingType: "PIX",
  value: 50.00,
  dueDate: "2026-02-22", // 7 dias de prazo
  description: "Taxa de cadastro e ativação da conta",
  split: [{
    walletId: "wallet-id-da-subconta",
    percentualValue: 20.00  // 20% para subconta
  }]
  // 80% fica automaticamente com a conta principal
}

Resposta: {
  id: "payment-id",
  value: 50.00,
  netValue: 48.50,  // Após taxa do Asaas
  status: "PENDING",
  dueDate: "2026-02-22",
  pixQrCodeId: "qrcode-id",
  pixQrCodePayload: "00020126580014br.gov.bcb.pix...",
  invoiceUrl: "https://sandbox.asaas.com/i/..."
}
```

### Passo 4: Exibição do Resultado

#### 4.1. Tela de Sucesso
```
┌─────────────────────────────────────────────┐
│ ✅ Cadastro Concluído!                      │
│ Sua conta foi criada com sucesso           │
├─────────────────────────────────────────────┤
│ Dados da Conta:                             │
│ • Nome: João Silva                          │
│ • Email: joao@email.com                     │
│ • ID da Conta: 62118294-2d2b...             │
│ • Wallet ID: cb64c741-2c86...               │
├─────────────────────────────────────────────┤
│ 📧 Verifique seu email para definir senha   │
├─────────────────────────────────────────────┤
│ 💳 Pague a Taxa de Cadastro (R$ 50,00)      │
│                                             │
│        [QR Code PIX - 256x256]              │
│                                             │
│ • Valor: R$ 50,00                           │
│ • Split: R$ 10,00 (20%) → Sua conta         │
│          R$ 40,00 (80%) → Conta Principal   │
│ • Vencimento: 22/02/2026                    │
│                                             │
│ PIX Copia e Cola:                           │
│ [000201265...] [📋 Copiar]                  │
│                                             │
│ ℹ️ Após pagamento, sua conta será ativada   │
└─────────────────────────────────────────────┘
```

### Passo 5: Usuário Paga o PIX

**Opções de Pagamento:**

1. **Escanear QR Code**
   - Abrir app do banco
   - Escanear o QR Code exibido
   - Confirmar pagamento

2. **PIX Copia e Cola**
   - Clicar no botão "Copiar"
   - Abrir app do banco
   - Colar código PIX
   - Confirmar pagamento

### Passo 6: Split Automático

**Após o pagamento ser confirmado:**

```
Valor pago: R$ 50,00
Taxa Asaas: R$ 1,50 (3%)
Valor líquido: R$ 48,50

Split calculado sobre valor líquido:
• 20% (R$ 9,70) → Subconta (walletId da pessoa cadastrada)
• 80% (R$ 38,80) → Conta Principal (emissor da cobrança)
```

**Observação**: O split é feito automaticamente pelo Asaas após confirmação do pagamento.

## 📊 Diagrama do Fluxo

```
┌─────────────────┐
│  Usuário acessa │
│  link público   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preenche       │
│  formulário     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Sistema processa (3 etapas):    │
│  1. Cria subconta                │
│  2. Cria cliente (customer)      │
│  3. Gera cobrança PIX (R$ 50)    │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Exibe resultado│
│  + QR Code PIX  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Usuário paga   │
│  via PIX        │
└────────┬────────┘
         │
         ▼
┌────────────────────────────┐
│  Asaas confirma pagamento  │
│  e faz split automático:   │
│  • 20% → Subconta          │
│  • 80% → Conta Principal   │
└────────────────────────────┘
```

## 💰 Cálculo do Split

### Exemplo 1: Taxa de R$ 50,00

```
Valor bruto: R$ 50,00
Taxa Asaas (3%): R$ 1,50
Valor líquido: R$ 48,50

Split (sobre líquido):
├─ Subconta (20%): R$ 9,70
└─ Conta Principal (80%): R$ 38,80
```

### Exemplo 2: Se fosse R$ 100,00

```
Valor bruto: R$ 100,00
Taxa Asaas (3%): R$ 3,00
Valor líquido: R$ 97,00

Split (sobre líquido):
├─ Subconta (20%): R$ 19,40
└─ Conta Principal (80%): R$ 77,60
```

## 🔧 Configurações

### Valor da Taxa de Cadastro

**Atual**: R$ 50,00

Para alterar, edite o arquivo `src/index.tsx`:

```typescript
// Linha aproximada: 389
const paymentData = {
  customer: customerId,
  billingType: 'PIX',
  value: 50.00, // ← ALTERAR AQUI
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0],
  description: 'Taxa de cadastro e ativação da conta',
  split: [{
    walletId: account.walletId,
    percentualValue: 20.00
  }]
}
```

### Prazo de Vencimento

**Atual**: 7 dias após cadastro

```typescript
// 7 dias = 7 * 24 * 60 * 60 * 1000
dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
```

**Exemplos de outros prazos:**
- 1 dia: `1 * 24 * 60 * 60 * 1000`
- 15 dias: `15 * 24 * 60 * 60 * 1000`
- 30 dias: `30 * 24 * 60 * 60 * 1000`

### Percentual do Split

**Atual**: 20% subconta, 80% conta principal

Para alterar:
```typescript
split: [{
  walletId: account.walletId,
  percentualValue: 20.00  // ← ALTERAR AQUI (10.00, 30.00, etc)
}]
```

## 🧪 Testar o Fluxo

### 1. Gerar Link de Cadastro

```bash
# Via Dashboard
1. Login no dashboard
2. Menu → Nova Conta (ou use subconta existente)
3. Menu → Links
4. Preencher ID da subconta
5. Escolher prazo de expiração
6. Gerar Link
```

### 2. Acessar Link Público

```
https://seu-dominio.com/cadastro/:linkId
```

### 3. Preencher Dados de Teste

```
Nome: João Silva Teste
Email: joao.teste@example.com
CPF: 123.456.789-01
Data Nasc: 01/01/1990
Celular: (11) 99988-7766
CEP: 01310-100
Endereço: Av. Paulista
Número: 1000
Bairro: Bela Vista
Renda: R$ 2.000 a R$ 5.000
```

### 4. Verificar Resultado

Após submeter o formulário, você deverá ver:
- ✅ Mensagem de sucesso
- 📧 Aviso sobre email
- 🎫 Dados da conta criada
- 💳 QR Code PIX (R$ 50,00)
- 📋 Código PIX Copia e Cola
- ℹ️ Informações do split 20/80

## ⚠️ Problemas Conhecidos

### Erro: "Customer inválido"
**Causa**: Cliente já existe com mesmo CPF  
**Solução**: Sistema tenta criar automaticamente, mas se CPF já existe, usar ID do cliente existente

### QR Code não aparece
**Causa**: Falha ao gerar cobrança PIX  
**Solução**: Verificar logs com `pm2 logs asaas-manager`

### Split não aplicado
**Causa**: `walletId` inválido ou vazio  
**Solução**: Garantir que a subconta tem `walletId` válido

## 📈 Próximos Passos

- [ ] Webhook para notificar pagamento confirmado
- [ ] Email automático com QR Code após cadastro
- [ ] Dashboard de acompanhamento de pagamentos
- [ ] Reenvio de cobrança caso usuário perca o QR Code
- [ ] Relatório de cadastros pendentes de pagamento
- [ ] Integração com WhatsApp para enviar QR Code

## 📞 Links Úteis

- **Dashboard**: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
- **Documentação Asaas**: https://docs.asaas.com
- **API de Pagamentos**: https://docs.asaas.com/reference/payments
- **API de Split**: https://docs.asaas.com/docs/split-de-pagamento

---

**Última atualização**: 15/02/2026  
**Versão**: 1.0.0
