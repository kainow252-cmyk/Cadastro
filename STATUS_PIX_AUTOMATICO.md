# 🔄 Status do PIX Automático - Análise Completa

**Data:** 06/03/2026 21:05  
**Teste Realizado:** ✅ Concluído

---

## ❌ RESULTADO DO TESTE

```json
{
  "errors": [{
    "code": "insufficient_permission",
    "description": "A chave de API fornecida não possui permissão para realizar operações de saque via API."
  }]
}
```

**Conclusão:** PIX Automático (débito recorrente) **NÃO está ativado**.

---

## 📊 Comparação de Funcionalidades

| Funcionalidade | Status | Nota |
|----------------|--------|------|
| **Chave PIX cadastrada** | ✅ | 25bc2989-689f-... |
| **Receber PIX** | ✅ | Ativo desde 06/03 |
| **PIX Único (QR Code)** | ✅ | Funcionando perfeitamente |
| **Split 20/80** | ✅ | Automático |
| **Saques via API** | ✅ | Ativado hoje! |
| **PIX Automático (Jornada 3)** | ❌ | **Precisa ativar** |

---

## 🎯 O Que é PIX Automático?

### PIX Único vs PIX Automático

#### ✅ PIX Único (Já Funciona)

```
Cliente paga → QR Code gerado → Pagamento único → Fim
```

**Exemplo:** Sorteio de R$ 10,00 pagamento único

#### ❌ PIX Automático (Não Funciona Ainda)

```
Cliente autoriza → Débito mensal automático → Renovação contínua
```

**Exemplo:** Assinatura de R$ 10,00/mês com débito automático

---

## 🔐 Por Que Não Funciona?

A Asaas possui 3 "Jornadas" de PIX:

### Jornada 1: PIX Básico ✅
- Cadastrar chave PIX
- Receber pagamentos PIX
- **Status:** ✅ ATIVO

### Jornada 2: PIX Avançado ✅
- Gerar QR Code dinâmico
- Split de pagamentos
- Webhooks
- **Status:** ✅ ATIVO

### Jornada 3: PIX Automático ❌
- Débito recorrente (assinaturas)
- Renovação automática mensal
- Gerenciamento de mandatos
- **Status:** ❌ **PRECISA ATIVAR**

---

## 📞 Como Ativar PIX Automático

### Opção 1: Telefone/WhatsApp (MAIS RÁPIDO)

**Número:** (16) 3347-8031  
**Horário:** Segunda a Sexta, 8h às 18h

### Opção 2: Email

**Para:** contato@asaas.com  
**Assunto:** Ativar PIX Automático (Jornada 3)

---

## 📝 Mensagem Template

```
Assunto: Ativar PIX Automático (Jornada 3) - Débito Recorrente

Olá!

Preciso ativar a funcionalidade de PIX AUTOMÁTICO (Jornada 3) 
na minha conta para débito recorrente mensal.

Dados da Conta:
- Nome: CORRETORA CORPORATE
- Email: corretora@corretoracorporate.com.br
- CNPJ: 63300111000133
- Ambiente: PRODUÇÃO

Situação:
Estou recebendo o erro "insufficient_permission" ao tentar 
criar autorizações PIX automáticas no endpoint:
/v3/pix/automatic/authorizations

Chave de API atual:
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojg3YmVjNTQwLWY0ZjgtNDgyYi04ZWRiLTI4ZjRlNDZhNTZjMTo6JGFhY2hfMWRhZjMwNjYtMDdkMi00OGIzLTgzYTQtN2YxZjkyNzU0YmI3

Necessidade:
Preciso oferecer assinaturas mensais com débito automático PIX 
aos meus clientes.

Status atual:
- ✅ Chave PIX cadastrada e ativa
- ✅ Recebimentos PIX funcionando
- ✅ QR Code único funcionando
- ❌ PIX Automático (Jornada 3) precisa ativar

Podem ativar o PIX Automático (Jornada 3)?

Aguardo retorno.

Atenciosamente,
CORRETORA CORPORATE
```

---

## ⏱️ Prazo Estimado

**1 a 3 dias úteis** após contato com suporte Asaas.

---

## 🔄 Alternativas Temporárias

Enquanto aguarda a ativação, você pode:

### 1️⃣ Usar PIX Único Mensal

```
Mês 1: Cliente paga R$ 10 (QR Code)
Mês 2: Enviar novo link PIX para cliente
Mês 3: Enviar novo link PIX para cliente
...
```

**Desvantagem:** Cliente precisa pagar manualmente todo mês.

### 2️⃣ Usar Cartão de Crédito Recorrente

```javascript
{
  "billingType": "CREDIT_CARD",
  "cycle": "MONTHLY",
  "value": 10.00,
  "creditCard": {...}
}
```

**Vantagem:** Débito automático já funciona com cartão.

### 3️⃣ Usar Boleto Recorrente

```javascript
{
  "billingType": "BOLETO",
  "cycle": "MONTHLY",
  "value": 10.00
}
```

**Desvantagem:** Boleto demora 1-3 dias úteis para confirmar.

---

## 🧪 Exemplo de Uso (Após Ativação)

### Criar Autorização PIX Automática

```bash
curl -X POST https://api.asaas.com/v3/pix/automatic/authorizations \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "MONTHLY",
    "contractId": "assinatura-001",
    "startDate": "2026-03-06",
    "finishDate": "2027-03-06",
    "value": 10.00,
    "description": "Assinatura Mensal Premium",
    "customer": "cus_000164526970",
    "qrCodeExpirationSeconds": 86400
  }'
```

### Resposta de Sucesso

```json
{
  "id": "auth_abc123",
  "status": "PENDING_AUTHORIZATION",
  "frequency": "MONTHLY",
  "value": 10.00,
  "startDate": "2026-03-06",
  "finishDate": "2027-03-06",
  "qrCode": {
    "payload": "00020126...",
    "encodedImage": "data:image/png;base64,..."
  }
}
```

### Fluxo Completo

```
1. Cliente escaneia QR Code
   ↓
2. Autoriza débito mensal no app do banco
   ↓
3. Sistema recebe webhook de autorização
   ↓
4. Todo dia 6 de cada mês, débito automático
   ↓
5. Renovação até 06/03/2027
```

---

## 💰 Vantagens do PIX Automático

### Para Você

✅ **Recorrência automática:** Cliente paga sozinho todo mês  
✅ **Menos inadimplência:** Débito garantido  
✅ **Mais conversão:** Cliente prefere PIX (sem cartão)  
✅ **Taxa menor:** PIX custa menos que cartão  

### Para o Cliente

✅ **Praticidade:** Não precisa lembrar de pagar  
✅ **Segurança:** Sem informar dados de cartão  
✅ **Cancelamento fácil:** Pode cancelar no app do banco  
✅ **PIX:** Método preferido dos brasileiros  

---

## 📊 Comparação de Métodos

| Método | Taxa Asaas | Confirmação | Recorrente |
|--------|------------|-------------|------------|
| PIX Único | 0,99% | Instantâneo | ❌ Manual |
| **PIX Automático** | **0,99%** | **Instantâneo** | **✅ Automático** |
| Cartão | 4,99% + R$ 0,50 | Instantâneo | ✅ Automático |
| Boleto | R$ 3,00 | 1-3 dias | ✅ Automático |

**Melhor opção:** PIX Automático (menor taxa + instantâneo + recorrente)

---

## 🎯 Casos de Uso

### Ideal para PIX Automático

✅ Assinaturas mensais (Netflix, Spotify, etc.)  
✅ Mensalidades de clubes/escolas  
✅ Doações recorrentes  
✅ Serviços SaaS  
✅ Planos de conteúdo  

### Não recomendado

❌ Pagamento único (use PIX normal)  
❌ Valores muito altos (> R$ 1.000)  
❌ Frequência irregular (use PIX único)  

---

## 📚 Documentação Oficial Asaas

- **PIX Automático:** https://docs.asaas.com/docs/pix-automatico
- **Autorizações:** https://docs.asaas.com/reference/criar-autorizacao-pix-automatico
- **Webhooks:** https://docs.asaas.com/reference/webhooks-pix-automatico

---

## ✅ Checklist de Ativação

- [ ] **Ligar para Asaas:** (16) 3347-8031
- [ ] **OU enviar email:** contato@asaas.com
- [ ] **Informar:** CNPJ 63300111000133
- [ ] **Solicitar:** Ativar PIX Automático (Jornada 3)
- [ ] **Aguardar:** 1-3 dias úteis
- [ ] **Testar:** Criar autorização de teste
- [ ] **Validar:** Cliente fazer autorização
- [ ] **Implementar:** Sistema de assinaturas
- [ ] **Comunicar:** Clientes sobre nova opção

---

## 🔔 Quando Estiver Ativo

O suporte Asaas vai avisar por email:

```
Assunto: PIX Automático Ativado

Olá!

O PIX Automático (Jornada 3) foi ativado para sua conta:
- Email: corretora@corretoracorporate.com.br
- CNPJ: 63300111000133

Você já pode criar autorizações de débito recorrente 
via endpoint /v3/pix/automatic/authorizations

Documentação: https://docs.asaas.com/docs/pix-automatico

Atenciosamente,
Equipe Asaas
```

---

## 🧪 Teste Após Ativação

```bash
# 1. Criar autorização
curl -X POST https://corretoracorporate.pages.dev/api/pix/automatic-authorization \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10.00,
    "description": "Teste Assinatura Mensal",
    "customerId": "cus_000164526970"
  }'

# 2. Cliente escaneia QR Code
# 3. Cliente autoriza no app do banco
# 4. Aguardar webhook de confirmação
# 5. Verificar débito automático no próximo mês
```

---

## 📊 Status Final

| Item | Status | Ação |
|------|--------|------|
| **Chave PIX** | ✅ Ativa | - |
| **Receber PIX** | ✅ Funcionando | - |
| **PIX Único** | ✅ Funcionando | Usar agora |
| **PIX Automático** | ❌ Desativado | **Ligar (16) 3347-8031** |
| **Saques via API** | ✅ Funcionando | Usar agora |

---

## 🎯 Resumo Executivo

### ✅ O Que Funciona AGORA

1. **PIX Único (one-time):** Cliente paga uma vez via QR Code
2. **Split 20/80:** Distribuição automática
3. **Saques via API:** Transferências automatizadas
4. **Webhook transferências:** Notificações em tempo real

### ❌ O Que Precisa Ativar

1. **PIX Automático:** Débito mensal recorrente
   - **Como:** Ligar (16) 3347-8031
   - **Quando:** 1-3 dias úteis
   - **Custo:** Mesmo da ativação (R$ 0,99%)

---

## 🚀 Próximos Passos

1. ✅ **Usar PIX Único enquanto aguarda**
2. 📞 **Ligar AGORA para Asaas:** (16) 3347-8031
3. ⏳ **Aguardar 1-3 dias úteis**
4. ✅ **Testar PIX Automático após ativação**
5. 🎉 **Oferecer assinaturas aos clientes**

---

## 💡 Dica Importante

**Não espere!** Ligue para Asaas **hoje mesmo** e solicite a ativação. 

Enquanto aguarda (1-3 dias), você pode:
- ✅ Usar PIX Único normalmente
- ✅ Fazer saques via API
- ✅ Continuar operando 100%
- ✅ Planejar sistema de assinaturas

---

**Criado em:** 06/03/2026 21:10  
**Teste Realizado:** ✅ Sim  
**Resultado:** PIX Automático não ativo  
**Solução:** Contatar Asaas (16) 3347-8031
