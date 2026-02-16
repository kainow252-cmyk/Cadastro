# Comparação: Asaas vs Woovi - PIX Automático (Recorrente)

## 📊 Visão Geral

Ambas as plataformas oferecem **PIX Automático (PIX Recorrente)** para cobranças com débito automático. Veja a comparação completa:

---

## 🏢 Asaas vs Woovi - Tabela Comparativa

| Característica | 🔵 Asaas | 🟢 Woovi (OpenPix) |
|----------------|----------|-------------------|
| **Nome do Recurso** | PIX Automático | PIX Recorrente (PIX_RECURRING) |
| **Disponibilidade** | ⏳ Em rollout (2026) | ✅ Disponível agora |
| **Endpoint** | `/v3/pix/automatic/authorizations` | `/v1/subscriptions` |
| **Tipo de Integração** | API dedicada | API de assinaturas (+ flag) |
| **Ativação** | Precisa habilitar módulo | Já disponível |
| **Permissão API** | `PIX_AUTOMATIC:WRITE` | Permissão padrão |
| **Split de Pagamento** | ✅ Suportado (20/80) | ✅ Suportado |
| **Valor Fixo** | ✅ Sim | ✅ Sim |
| **Valor Variável** | ❓ A confirmar | ✅ Sim (`minimumValue`) |
| **Periodicidade** | MONTHLY, WEEKLY, DAILY | MONTHLY, WEEKLY, DAILY |
| **Jornada** | Automática | 3 opções (PAYMENT_ON_APPROVAL, etc.) |
| **Retentativas** | ❓ A confirmar | ✅ Configurável (3x ou nenhuma) |
| **Webhooks** | ✅ Sim | ✅ Sim (estados detalhados) |
| **Documentação** | docs.asaas.com | developers.woovi.com |
| **Status Atual no Sistema** | ⏳ Aguardando permissão | ➖ Não implementado |

---

## 🔵 Asaas - Detalhes

### Vantagens
✅ **Já implementado** no sistema (v4.7)  
✅ **Split 20/80** configurado automaticamente  
✅ **Interface pronta** (botão, formulário, funções)  
✅ **Banco de dados** estruturado  
✅ **Documentação completa** criada  

### Desvantagens
⏳ **Aguardando liberação** (permissão `PIX_AUTOMATIC:WRITE`)  
⏳ **Rollout gradual** (pode demorar para ativar)  
❓ **Recursos não confirmados** (valor variável, retentativas)  

### Endpoint Asaas
```typescript
POST /v3/pix/automatic/authorizations

Headers:
  access_token: $aact_prod_...

Body:
{
  "customer": "cus_000161811061",
  "billingType": "PIX",
  "value": 50.00,
  "description": "Mensalidade",
  "recurrenceType": "MONTHLY",
  "startDate": "2026-03-17",
  "endDate": null,
  "split": [{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "percentualValue": 20
  }]
}
```

### Status Atual
- ✅ Sistema implementado (backend + frontend)
- ⏳ Aguardando permissão API Key
- ⏳ Teste de criação de autorização

---

## 🟢 Woovi (OpenPix) - Detalhes

### Vantagens
✅ **Disponível agora** (já liberado)  
✅ **Valor variável** suportado  
✅ **Retentativas configuráveis** (3x em 7 dias ou nenhuma)  
✅ **Máquina de estados** detalhada  
✅ **Jornadas múltiplas** (pagamento na aprovação, etc.)  
✅ **Documentação completa** e atualizada  

### Desvantagens
➖ **Não implementado** no sistema atual  
➖ **Precisa de integração nova** (backend + frontend)  
➖ **Tempo de implementação** (~4-6 horas)  
➖ **Migração de dados** (se já tiver clientes Asaas)  

### Endpoint Woovi
```typescript
POST /v1/subscriptions

Headers:
  Authorization: <AppID>

Body:
{
  "name": "Mensalidade Plano Premium",
  "value": 50,
  "customer": {
    "name": "Gelci Jose da Silva",
    "taxID": "13615574788",
    "email": "gelci@example.com",
    "phone": "5511999999999",
    "address": {
      "zipcode": "04556300",
      "street": "Rua Exemplo",
      "number": "123",
      "neighborhood": "Centro",
      "city": "SAO PAULO",
      "state": "SP",
      "complement": ""
    }
  },
  "correlationID": "unique-id-123",
  "comment": "Cobrança recorrente mensal",
  "frequency": "MONTHLY",
  "type": "PIX_RECURRING",
  "pixRecurringOptions": {
    "journey": "PAYMENT_ON_APPROVAL",
    "retryPolicy": "THREE_RETRIES_7_DAYS"
  },
  "dayGenerateCharge": 13,  // Gerar cobrança dia 13
  "dayDue": 3  // Vencimento 3 dias após geração
}
```

### Resposta Woovi
```json
{
  "subscription": {
    "customer": { ... },
    "value": 50,
    "status": "ACTIVE",
    "paymentLinkUrl": "https://woovi.dev/pay/...",
    "pixRecurring": {
      "recurrencyId": "RN54811417...",
      "emv": "00020101021226870014br.gov.bcb.pix...",
      "journey": "PAYMENT_ON_APPROVAL",
      "status": "CREATED"
    },
    "globalID": "UGF5bWVudFN1YnNjcmlwdGlvbjo2..."
  }
}
```

---

## 🔄 Máquina de Estados - Woovi

### 1. Assinatura (Subscription)
- `ACTIVE` - Ativa, criando parcelas
- `COMPLETED` - Concluída (data final atingida)
- `EXPIRED` - Parcela expirada
- `INACTIVE` - Cancelada

### 2. PIX Recorrente (pixRecurring)
- `CREATED` - Criado, aguardando aprovação
- `APPROVED` - Aprovado pelo cliente (cobranças ativas)
- `CANCELED` - Cancelado pela empresa
- `REJECTED` - Autorização removida pelo cliente

### 3. Parcela (Installment)
- `SCHEDULED` - Agendada
- `ACTIVE` - Cobrança criada e aprovada
- `COMPLETED` - Paga
- `EXPIRED` - Vencida sem pagamento
- `CANCELED` - Cancelada

### 4. Cobrança (CobR)
- `CREATED` - Criada (4 dias antes)
- `ACTIVE` - Aceita pelo banco
- `CONCLUDED` - Paga com sucesso
- `FAILED_TRY` - Tentativa falhou
- `REJECTED` - Rejeitada pelo banco
- `CANCELED` - Cancelada

### 5. Retentativa (CobRTry)
- `REQUESTED` - Solicitada
- `SCHEDULED` - Aceita pelo banco
- `PAID` - Paga
- `REJECTED` - Rejeitada (nova tentativa possível)

---

## 🎯 Recomendação

### **Cenário 1: Urgência Alta (Precisa Agora)**
**Recomendação: 🟢 Woovi**

**Motivos:**
- ✅ Já disponível (não depende de aprovação)
- ✅ Valor variável suportado
- ✅ Retentativas automáticas
- ✅ Documentação completa
- ✅ Implementação ~4-6 horas

**Próximos Passos:**
1. Criar conta Woovi: https://woovi.com
2. Obter AppID (API Key)
3. Implementar endpoint `/v1/subscriptions`
4. Testar criação de assinatura
5. Validar fluxo completo

---

### **Cenário 2: Já Usa Asaas (Aguardar)**
**Recomendação: 🔵 Asaas**

**Motivos:**
- ✅ Sistema já implementado (v4.7)
- ✅ Split 20/80 configurado
- ✅ Interface pronta
- ✅ Zero desenvolvimento adicional
- ✅ Mantém unificação (um só gateway)

**Próximos Passos:**
1. Marcar permissão `PIX_AUTOMATIC:WRITE`
2. Aguardar ativação (1-2 dias)
3. Testar criação de autorização
4. Se não funcionar: migrar para Woovi

---

### **Cenário 3: Implementar Ambos (Redundância)**
**Recomendação: 🔵 Asaas + 🟢 Woovi**

**Motivos:**
- ✅ Redundância (se um falhar, usa o outro)
- ✅ Comparação de taxas
- ✅ Melhor negociação futura
- ✅ Teste A/B

**Próximos Passos:**
1. Implementar Woovi agora
2. Manter Asaas como backup
3. Escolher o melhor após testes

---

## 💰 Custos (Estimados)

### Asaas
- **Taxa PIX:** 0,99% (média)
- **Taxa Recorrência:** Incluída
- **Mensalidade:** Plano pago (R$ 29,90+)
- **Split:** Sem custo adicional

### Woovi
- **Taxa PIX:** 1% (média)
- **Taxa Recorrência:** Incluída
- **Mensalidade:** Variável (consultar)
- **Split:** Disponível (verificar custos)

**Observação:** Taxas podem variar conforme volume e negociação.

---

## 🔧 Implementação Woovi - Estimativa

### Tempo Total: ~4-6 horas

#### Backend (2-3 horas)
- ✅ Criar conta Woovi e obter AppID
- ✅ Adicionar variáveis ambiente (`WOOVI_APP_ID`)
- ✅ Criar endpoint `POST /api/woovi/pix-recurring`
- ✅ Implementar split (se suportado)
- ✅ Integrar webhooks
- ✅ Testar API

#### Frontend (1-2 horas)
- ✅ Adicionar botão "PIX Recorrente Woovi"
- ✅ Criar formulário (mesmo do Asaas)
- ✅ Exibir QR Code da resposta
- ✅ Mostrar status da assinatura

#### Testes (1 hora)
- ✅ Criar assinatura teste
- ✅ Escanear QR Code
- ✅ Autorizar no banco
- ✅ Validar primeira cobrança
- ✅ Confirmar split (se aplicável)

---

## 📋 Checklist de Decisão

### Perguntas Chave:
- [ ] Precisa do recurso **urgente** (próximos dias)?
- [ ] Já tem conta **Asaas ativa**?
- [ ] Já tem clientes usando **Asaas**?
- [ ] Tem flexibilidade para **aguardar** 1-2 semanas?
- [ ] Precisa de **valor variável**?
- [ ] Precisa de **retentativas automáticas**?
- [ ] Quer **redundância** (dois gateways)?

### Decisão:
```
SE (urgente + sem conta Asaas) → Woovi
SE (já usa Asaas + pode aguardar) → Asaas
SE (quer redundância) → Ambos
SE (valor variável obrigatório) → Woovi
```

---

## 🚀 Plano de Ação Recomendado

### **Curto Prazo (Hoje - 1 Semana)**
1. ✅ **Tentar ativar Asaas** (marcar permissão)
2. ⏳ **Aguardar 24-48h** (rollout Asaas)
3. ✅ **Testar criação** de autorização

### **Médio Prazo (1-2 Semanas)**
4. **Se Asaas não funcionar:**
   - ➡️ Implementar Woovi (4-6 horas)
   - ➡️ Testar fluxo completo
   - ➡️ Validar split
   - ➡️ Deploy produção

5. **Se Asaas funcionar:**
   - ✅ Usar Asaas como principal
   - ⏳ Considerar Woovi como backup futuro

---

## 📞 Suporte

### Asaas
- **Painel:** https://app.asaas.com
- **Docs:** https://docs.asaas.com/docs/pix-automatico
- **Email:** suporte@asaas.com
- **Tel:** (11) 4950-1234

### Woovi
- **Painel:** https://woovi.com
- **Docs:** https://developers.woovi.com/docs/pix-automatic
- **Suporte:** Via painel (chat)
- **Comunidade:** Discord/Telegram

---

## 📝 Resumo Executivo

| Aspecto | Asaas | Woovi |
|---------|-------|-------|
| **Implementação** | ✅ Pronta | ⏳ 4-6h |
| **Disponibilidade** | ⏳ Aguardando | ✅ Agora |
| **Valor Variável** | ❓ | ✅ |
| **Retentativas** | ❓ | ✅ |
| **Split 20/80** | ✅ | ✅ |
| **Custo** | ~0,99% | ~1% |
| **Recomendação** | Se já usa | Se urgente |

---

**Versão:** 4.7  
**Data:** 16/02/2026  
**Status Asaas:** ⏳ Aguardando permissão  
**Status Woovi:** ➖ Não implementado

## 💡 Conclusão

**Para você, que já tem Asaas implementado:**

1. **Tente primeiro:** Marcar permissão `PIX_AUTOMATIC:WRITE` no Asaas
2. **Aguarde:** 24-48h para ver se funciona
3. **Se não funcionar:** Implemente Woovi como alternativa
4. **Redundância:** Considere manter ambos após testes

**Deseja que eu implemente a integração com Woovi agora?** 🚀
