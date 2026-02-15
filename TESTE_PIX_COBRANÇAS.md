# 📊 Teste de Cobranças PIX com Split 20/80

## 🎯 Objetivo
Criar cobranças PIX de teste para cada subconta com split automático:
- **20% → Subconta**
- **80% → Conta Principal**

## 👥 Subcontas Disponíveis

### 1️⃣ Subconta: Gelci jose da silva
- **ID**: `62118294-2d2b-4df7-b4a1-af31fa80e065`
- **Email**: gelci.jose.grouptrig@gmail.com
- **CPF**: 11013430794
- **Wallet ID**: `cb64c741-2c86-4466-ad31-7ba58cd698c0`

### 2️⃣ Subconta: RUTHYELI GOMES COSTA SILVA
- **ID**: `9704ad46-369a-449e-a4c6-6a732dd4f3f4`
- **Email**: gelci.silva252@gmail.com
- **Wallet ID**: `f1da7be9-a5fc-4295-82e0-a90ae3d99248`

## 📝 Cobranças de Teste Sugeridas

### Cobrança #1: Subconta Gelci
```
Valor: R$ 250,00
Split:
  → Subconta (20%): R$ 50,00
  → Conta Principal (80%): R$ 200,00

Dados do Pagador:
  Nome: João Silva Teste 1
  Email: joao.teste1@example.com
  CPF: 123.456.789-01
  Telefone: (11) 98765-4321

Descrição: Teste PIX - Split 20/80 - Subconta Gelci
Vencimento: 20/02/2026
```

### Cobrança #2: Subconta RUTHYELI
```
Valor: R$ 500,00
Split:
  → Subconta (20%): R$ 100,00
  → Conta Principal (80%): R$ 400,00

Dados do Pagador:
  Nome: Maria Santos Teste 2
  Email: maria.teste2@example.com
  CPF: 987.654.321-00
  Telefone: (11) 91234-5678

Descrição: Teste PIX - Split 20/80 - Subconta RUTHYELI
Vencimento: 20/02/2026
```

### Cobrança #3: Subconta Gelci (2ª cobrança)
```
Valor: R$ 150,00
Split:
  → Subconta (20%): R$ 30,00
  → Conta Principal (80%): R$ 120,00

Dados do Pagador:
  Nome: Pedro Costa Teste 3
  Email: pedro.teste3@example.com
  CPF: 111.222.333-44
  Telefone: (11) 99988-7766

Descrição: Teste PIX - Split 20/80 - Subconta Gelci #2
Vencimento: 21/02/2026
```

## 🌐 Como Criar via Dashboard

### Passo a Passo:

1. **Acesse o Dashboard**
   ```
   https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
   ```

2. **Faça Login**
   - Usuário: `admin`
   - Senha: `admin123`

3. **Navegue para PIX**
   - Clique no menu **PIX**

4. **Selecione a Subconta**
   - No dropdown, escolha a subconta desejada

5. **Preencha os Dados do Pagador**
   - Nome completo
   - Email
   - CPF/CNPJ (sem pontuação)
   - Telefone (opcional)

6. **Preencha os Dados da Cobrança**
   - Valor em reais
   - Descrição
   - Data de vencimento

7. **Gere o PIX**
   - Clique em **Gerar PIX**
   - Aguarde o QR Code ser gerado
   - Copie o código PIX Copia e Cola

## ⚠️ Problema Identificado: Customer Inválido

### Erro Atual
```json
{
  "error": "Erro ao criar cobrança",
  "details": {
    "errors": [{
      "code": "invalid_customer",
      "description": "Customer inválido ou não informado."
    }]
  }
}
```

### Causa
O Asaas exige que o cliente (customer) exista previamente ou que o CPF/CNPJ seja válido.

### Soluções Possíveis

#### Opção 1: Criar Cliente Primeiro (Recomendado)
1. No painel do Asaas, vá em **Clientes**
2. Cadastre os clientes de teste com CPFs válidos
3. Use os IDs dos clientes nas cobranças

#### Opção 2: Usar CPFs Reais (Apenas Sandbox)
Para ambiente sandbox, use CPFs de teste válidos:
- `12345678909`
- `98765432100`
- `11122233344`

#### Opção 3: Ajustar o Código Backend
Modificar o endpoint para criar o cliente automaticamente antes da cobrança.

## 💡 Alternativa: Testar Manualmente

### Via Dashboard Web:
1. Acesse a seção **PIX**
2. Selecione a subconta
3. Use CPFs válidos (ou cadastre clientes primeiro)
4. Gere a cobrança
5. Verifique o split na resposta da API

### Verificar Split Configurado:
Após criar a cobrança, verifique no response:
```json
{
  "ok": true,
  "data": {
    "id": "pay_xxxxx",
    "value": 250.00,
    "split": [{
      "walletId": "cb64c741-2c86-4466-ad31-7ba58cd698c0",
      "percentualValue": 20.00
    }]
  }
}
```

## 📊 Resumo Esperado

Após criar as 3 cobranças de teste:

| Cobrança | Subconta | Valor Total | 20% Subconta | 80% Principal |
|----------|----------|-------------|--------------|---------------|
| #1 | Gelci | R$ 250,00 | R$ 50,00 | R$ 200,00 |
| #2 | RUTHYELI | R$ 500,00 | R$ 100,00 | R$ 400,00 |
| #3 | Gelci | R$ 150,00 | R$ 30,00 | R$ 120,00 |
| **TOTAL** | - | **R$ 900,00** | **R$ 180,00** | **R$ 720,00** |

## 🔍 Como Verificar

### No Dashboard:
1. Menu → **PIX**
2. Role até **Cobranças Recentes**
3. Verifique as 3 cobranças listadas
4. Clique em **Atualizar** se necessário

### Via API:
```bash
curl -X GET "http://localhost:3000/api/payments" \
  -H "Cookie: auth_token=SEU_TOKEN"
```

## 📞 Próximos Passos

1. **Cadastrar Clientes de Teste** no painel do Asaas
2. **Criar Cobranças** via dashboard usando clientes válidos
3. **Verificar Split** nas respostas da API
4. **Testar Pagamento** (opcional, em sandbox)
5. **Validar Repasses** (verificar se os 20% chegam na subconta)

## 🛠️ Melhorias Futuras

- [ ] Criar endpoint para cadastrar cliente automaticamente
- [ ] Validar CPF antes de criar cobrança
- [ ] Gerar CPFs de teste válidos automaticamente
- [ ] Adicionar opção de criar cliente + cobrança em uma chamada
- [ ] Implementar cache de clientes criados

---

**Última atualização**: 15/02/2026  
**Versão**: 1.0.0
