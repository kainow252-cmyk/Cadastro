# 🔐 Como Ativar Saques via API na Asaas

## ❌ Problema Atual

```json
{
  "code": "insufficient_permission",
  "description": "A chave de API fornecida não possui permissão para realizar operações de saque via API."
}
```

**Data do erro:** 06/03/2026 16:17  
**Endpoint:** `POST /api/v3/transfers`  
**Status:** 403 Forbidden

---

## 📋 Informações da Conta

- **Nome:** CORRETORA CORPORATE
- **Email:** corretora@corretoracorporate.com.br
- **CNPJ:** 63300111000133
- **Ambiente:** PRODUÇÃO
- **Saldo disponível:** R$ 228,02

---

## 📞 Contato Asaas

### 1️⃣ Via WhatsApp/Telefone

**Número:** (16) 3347-8031  
**Horário:** Segunda a Sexta, 8h às 18h

### 2️⃣ Via Email

**Email:** contato@asaas.com  
**Assunto:** Ativar Saques via API (Transfers)

---

## 📝 Mensagem Template

```
Assunto: Ativar Saques via API (Transfers)

Olá!

Preciso ativar a funcionalidade de SAQUES VIA API na minha conta.

Dados da Conta:
- Nome: CORRETORA CORPORATE
- Email: corretora@corretoracorporate.com.br
- CNPJ: 63300111000133
- Ambiente: PRODUÇÃO

Situação:
Estou recebendo o erro "insufficient_permission" ao tentar realizar 
transferências via API no endpoint /v3/transfers.

A chave de API atual é: $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojg3YmVjNTQwLWY0ZjgtNDgyYi04ZWRiLTI4ZjRlNDZhNTZjMTo6JGFhY2hfMWRhZjMwNjYtMDdkMi00OGIzLTgzYTQtN2YxZjkyNzU0YmI3

Necessidade:
Preciso automatizar saques e transferências bancárias via API para 
integração completa com meu sistema.

Podem ativar essa permissão?

Aguardo retorno.

Atenciosamente,
CORRETORA CORPORATE
```

---

## 🔄 Alternativas Temporárias

### 1️⃣ Saque Manual pelo Painel

1. Acesse https://www.asaas.com
2. Faça login com: corretora@corretoracorporate.com.br
3. Menu → **Meu Dinheiro** → **Transferir**
4. Preencha os dados bancários
5. Confirme o saque

### 2️⃣ Configurar Saque Automático

1. Acesse o painel Asaas
2. Menu → **Configurações** → **Transferências Automáticas**
3. Configure:
   - Frequência: Diária/Semanal/Mensal
   - Valor mínimo para transferir
   - Conta bancária destino
4. Salve as configurações

### 3️⃣ Subcontas Fazem Saque Manual

Cada subconta pode acessar seu próprio painel e fazer saques:
- Franklin: soaresfranklin626@gmail.com
- Saulo: saulosalvador323@gmail.com
- Tanara: tanarahelena@hotmail.com
- Roberto: rmayo@bol.com.br

---

## 🎯 Após Ativação da Permissão

### Exemplo de Requisição de Saque

```bash
curl -X POST https://api.asaas.com/v3/transfers \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 100.00,
    "bankAccount": {
      "bank": {
        "code": "341"
      },
      "accountName": "João Silva",
      "ownerName": "João Silva",
      "ownerBirthDate": "1990-01-01",
      "cpfCnpj": "12345678909",
      "agency": "1234",
      "account": "12345",
      "accountDigit": "6"
    }
  }'
```

### Resposta de Sucesso

```json
{
  "object": "transfer",
  "id": "tra_abc123xyz",
  "dateCreated": "2026-03-06",
  "value": 100.00,
  "netValue": 97.00,
  "transferFee": 3.00,
  "status": "PENDING",
  "type": "BANK_ACCOUNT",
  "bankAccount": {
    "bank": {
      "code": "341",
      "name": "Itaú Unibanco S.A."
    },
    "accountName": "João Silva",
    "ownerName": "João Silva",
    "cpfCnpj": "12345678909",
    "agency": "1234",
    "account": "12345",
    "accountDigit": "6"
  }
}
```

---

## 💰 Taxas de Saque (Estimadas)

| Tipo | Taxa |
|------|------|
| PIX | R$ 1,00 - R$ 3,00 |
| TED | R$ 3,00 - R$ 5,00 |
| DOC | R$ 2,00 - R$ 4,00 |

*Valores podem variar, consulte o contrato Asaas.*

---

## ✅ Checklist

- [ ] Ligar para Asaas (16) 3347-8031
- [ ] Ou enviar email para contato@asaas.com
- [ ] Informar dados da conta (CNPJ, email, nome)
- [ ] Solicitar ativação de "Saques via API"
- [ ] Aguardar 1-3 dias úteis para ativação
- [ ] Testar endpoint `/v3/transfers` após confirmação
- [ ] Implementar saques automáticos no sistema
- [ ] Configurar saque automático no painel (opcional)

---

## 📚 Documentação Oficial

- **Transfers API:** https://docs.asaas.com/reference/transferir-para-conta-bancaria
- **Taxas:** https://www.asaas.com/taxas
- **Suporte:** https://ajuda.asaas.com

---

## 📊 Status Atual

| Funcionalidade | Status | Nota |
|----------------|--------|------|
| Saldo via API | ✅ Funciona | R$ 228,02 |
| Criar cobrança PIX | ✅ Funciona | Com split 20/80 |
| QR Code PIX | ✅ Funciona | Instantâneo |
| Split payment | ✅ Funciona | 20% subconta / 80% principal |
| Saque manual | ✅ Funciona | Painel Asaas |
| Saque automático | ✅ Funciona | Configurar no painel |
| **Saque via API** | ❌ **Precisa ativar** | Contatar Asaas |

---

## 🚀 Próximos Passos

1. **Imediato:** Ligar para Asaas e solicitar ativação
2. **Enquanto aguarda:** Usar saque manual ou configurar automático
3. **Após ativação:** Implementar endpoint de saque no sistema
4. **Testar:** Fazer saque teste de R$ 10,00
5. **Produção:** Liberar funcionalidade para subcontas

---

**Última atualização:** 06/03/2026 20:15  
**Status:** Aguardando ativação Asaas  
**Prazo estimado:** 1-3 dias úteis
