# 💰 SAQUES VIA API - STATUS E PERMISSÕES

**Data**: 06/03/2026 - 18:15  
**Saldo Atual**: R$ 228,02  
**Endpoint**: `/v3/transfers`

---

## ❌ SAQUE VIA API NÃO ESTÁ HABILITADO

### Erro Retornado
```json
{
  "code": "insufficient_permission",
  "description": "A chave de API fornecida não possui permissão para realizar operações de saque via API."
}
```

### ⚠️ O Que Isso Significa
- O endpoint de transferências **EXISTE**
- A API **FUNCIONA**
- Mas a **PERMISSÃO** não está ativada
- Precisa **solicitar ativação** à Asaas

---

## 📊 SALDO DISPONÍVEL

### Consulta de Saldo (✅ FUNCIONA)
```bash
GET /v3/finance/balance
```

**Resposta:**
```json
{
  "balance": 228.02
}
```

✅ **Saldo atual**: R$ 228,02

---

## 🔐 PERMISSÕES NECESSÁRIAS

### Para Saques via API

**Requer ativação de:**
1. **Saques via API** (Transfer API)
2. **Validação de segurança**
3. **Aprovação da Asaas**
4. **Possível verificação adicional**

### Diferença Entre Permissões

| Permissão | Status | O Que Permite |
|-----------|--------|---------------|
| **Leitura de dados** | ✅ ATIVO | Consultar saldo, contas, pagamentos |
| **Criar cobranças** | ✅ ATIVO | Gerar PIX, boletos, cartão |
| **Criar subcontas** | ✅ ATIVO | Adicionar novas subcontas |
| **Split de pagamentos** | ✅ ATIVO | Dividir valores automaticamente |
| **Saques via API** | ❌ **NÃO ATIVO** | Transferir para bancos externos |
| **PIX Automático** | ❌ **NÃO ATIVO** | Débito mensal automático |

---

## 📞 COMO ATIVAR SAQUES VIA API

### Contato Asaas

**WhatsApp/Telefone:**  
📞 **(16) 3347-8031**  
⏰ Seg-Sex, 8h-18h

**Email:**  
📧 **contato@asaas.com**

### Mensagem Sugerida

```
Assunto: Ativar Saques via API (Transfers)

Olá equipe Asaas!

Preciso ativar a funcionalidade de SAQUES VIA API na minha conta.

DADOS DA CONTA:
- Nome: CORRETORA CORPORATE
- Email: corretora@corretoracorporate.com.br
- CNPJ: 63300111000133
- Ambiente: PRODUÇÃO

ERRO ATUAL:
Ao tentar realizar transferências via endpoint /v3/transfers,
recebo o erro "insufficient_permission".

NECESSIDADE:
Sistema de gestão financeira que precisa automatizar
transferências para contas bancárias externas.

ENDPOINT NECESSÁRIO:
POST /v3/transfers

USO:
- Transferências programáticas para contas bancárias
- Automação de saques
- Gestão financeira automatizada

SEGURANÇA:
- Conta já verificada
- Chave API ativa
- 4 subcontas aprovadas
- Split funcionando

Podem ativar essa funcionalidade?

Obrigado!
```

---

## 🔄 ALTERNATIVAS (Enquanto Aguarda)

### 1. Saque Manual no Painel Asaas

**Como fazer:**
1. Acesse: https://www.asaas.com
2. Login → **Meu Dinheiro** → **Transferir**
3. Preencha:
   - Valor: R$ 10,00 (ou qualquer valor)
   - Banco: Escolha o banco
   - Agência: Digite a agência
   - Conta: Digite a conta
   - CPF: Titular da conta
4. Confirme a transferência
5. Aguarde processamento (mesma hora ou D+1)

### 2. Configurar Saque Automático

**No painel Asaas:**
1. **Meu Dinheiro** → **Configurações**
2. **Saque Automático**
3. Configure:
   - Frequência: Diária, Semanal, Mensal
   - Valor mínimo: Ex: R$ 100,00
   - Conta destino: Sua conta bancária
4. Asaas saca automaticamente quando atingir o valor

### 3. Usar Subcontas com Saque Manual

**Cada subconta pode:**
- Acessar seu próprio painel Asaas
- Ver seu saldo individual
- Fazer saques manuais
- Receber o split 20% diretamente

---

## 💡 COMO FUNCIONA O SAQUE VIA API

### Quando Estiver Ativado

**Endpoint:**
```bash
POST https://api.asaas.com/v3/transfers
Authorization: access_token $ASAAS_API_KEY

{
  "value": 100.00,
  "bankAccount": {
    "bank": {
      "code": "341"  // Código do banco (341 = Itaú)
    },
    "accountName": "João da Silva",
    "ownerName": "João da Silva",
    "ownerBirthDate": "1990-01-01",
    "cpfCnpj": "12345678909",
    "agency": "1234",
    "account": "12345",
    "accountDigit": "6",
    "accountType": "CONTA_CORRENTE"  // ou CONTA_POUPANCA
  }
}
```

**Resposta de Sucesso:**
```json
{
  "id": "tra_xyz123abc",
  "value": 100.00,
  "netValue": 95.00,
  "transferFee": 5.00,
  "status": "PENDING",
  "scheduleDate": "2026-03-07",
  "authorized": true,
  "bankAccount": {
    "bank": {
      "code": "341",
      "name": "Itaú Unibanco S.A."
    },
    "agency": "1234",
    "account": "12345-6"
  }
}
```

### Taxas de Transferência

| Tipo | Taxa | Prazo |
|------|------|-------|
| **TED** | R$ 3,00 a R$ 5,00 | Mesma hora ou D+1 |
| **PIX** | R$ 1,00 a R$ 3,00 | Instantâneo |
| **DOC** | R$ 2,00 a R$ 4,00 | D+1 |

*Valores aproximados, confirmar com Asaas*

### Limites de Saque

| Tipo de Conta | Limite Diário | Observação |
|---------------|---------------|------------|
| **Pessoa Física** | R$ 10.000,00 | Pode aumentar |
| **Pessoa Jurídica** | R$ 50.000,00 | Pode aumentar |
| **Verificada** | Sem limite | Após verificação |

---

## 📊 FLUXO DE DINHEIRO ATUAL

### Como Funciona Hoje

```
Cliente paga R$ 100,00
         ↓
   Asaas recebe
         ↓
   Split automático:
   ├─ Subconta: R$ 20,00 (20%)
   └─ Principal: R$ 80,00 (80%)
         ↓
   Saldo fica na Asaas
         ↓
   Saque MANUAL no painel
```

### Como Funcionaria com API

```
Cliente paga R$ 100,00
         ↓
   Asaas recebe
         ↓
   Split automático:
   ├─ Subconta: R$ 20,00
   └─ Principal: R$ 80,00
         ↓
   Saldo na Asaas
         ↓
   API dispara saque AUTOMÁTICO
         ↓
   Dinheiro na conta bancária
```

---

## ✅ O QUE JÁ FUNCIONA

### Gestão Financeira Atual

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| **Consultar saldo** | ✅ ATIVO | Via API: `/v3/finance/balance` |
| **Ver transações** | ✅ ATIVO | Histórico completo |
| **Criar cobranças** | ✅ ATIVO | PIX, boleto, cartão |
| **Split automático** | ✅ ATIVO | 20/80 funcionando |
| **4 Subcontas** | ✅ ATIVO | Todas aprovadas |
| **Saque manual** | ✅ ATIVO | Via painel Asaas |
| **Saque via API** | ❌ NÃO ATIVO | Precisa ativar |

---

## 🎯 RECOMENDAÇÕES

### Imediato (Hoje)
1. ✅ Use saques manuais no painel Asaas
2. ✅ Configure saque automático (valor mínimo)
3. ✅ Continue usando split 20/80
4. ✅ Consulte saldo via API

### Curto Prazo (1-2 dias)
1. 📞 Ligar para Asaas: (16) 3347-8031
2. ⏳ Solicitar ativação de Saques via API
3. ⏳ Aguardar aprovação
4. ⏳ Possível verificação adicional

### Após Ativação
1. ✅ Implementar saques automáticos
2. ✅ Programar transferências
3. ✅ Automatizar gestão financeira
4. ✅ Sistema 100% automatizado

---

## 📝 EXEMPLO DE IMPLEMENTAÇÃO

### Após Ativação da API

**Backend (Hono):**
```typescript
// Endpoint para sacar valor
app.post('/api/withdraw', async (c) => {
  const { value, bankAccount } = await c.req.json()
  
  // Verificar saldo
  const balance = await fetch(`${ASAAS_API_URL}/finance/balance`, {
    headers: { 'access_token': ASAAS_API_KEY }
  }).then(r => r.json())
  
  if (balance.balance < value) {
    return c.json({ error: 'Saldo insuficiente' }, 400)
  }
  
  // Criar transferência
  const transfer = await fetch(`${ASAAS_API_URL}/transfers`, {
    method: 'POST',
    headers: {
      'access_token': ASAAS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value,
      bankAccount
    })
  }).then(r => r.json())
  
  return c.json(transfer)
})
```

---

## 📄 DOCUMENTAÇÃO

### Links Úteis
- **API Transfers**: https://docs.asaas.com/reference/criar-transferencia
- **Saldo**: https://docs.asaas.com/reference/saldo
- **Painel Asaas**: https://www.asaas.com

### Arquivos do Projeto
- ✅ `SAQUES_VIA_API_STATUS.md` - Este documento
- ✅ `TESTE_COMPLETO_FUNCIONALIDADES.md` - Testes gerais
- ✅ `PIX_LIBERADO_SUCESSO.md` - PIX funcionando

---

## 🎯 CONCLUSÃO

### Status Atual

**SAQUE VIA API**: ❌ **NÃO HABILITADO**

**Erro:**
```
"insufficient_permission"
```

**Solução:**
- 📞 Contatar Asaas: (16) 3347-8031
- ⏳ Solicitar ativação
- ⏳ Aguardar aprovação

### Enquanto Aguarda

**Use:**
- ✅ Saque manual no painel
- ✅ Saque automático (configurar no painel)
- ✅ Consulta de saldo via API
- ✅ Split 20/80 funcionando

### Após Ativação

**Terá:**
- ✅ Saques via API
- ✅ Transferências programáticas
- ✅ Automação completa
- ✅ Sistema 100% automatizado

---

**Última atualização**: 06/03/2026 18:15  
**Status**: ❌ NÃO HABILITADO  
**Saldo**: R$ 228,02  
**Ação**: Contatar Asaas para ativar
