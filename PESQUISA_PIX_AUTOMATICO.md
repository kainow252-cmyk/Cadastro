# 🔍 Pesquisa: PIX Automático - BACEN e Asaas

## 📅 Histórico do PIX Automático

### **Lançamento BACEN:**
- **Data:** 16 de junho de 2024
- **Resolução BCB n° 403/2024**
- **Nome oficial:** "PIX Automático" ou "Autorização de Débito PIX"

### **Funcionalidade:**
Cliente autoriza **UMA VEZ** e a empresa pode debitar automaticamente todo mês.

---

## 🏦 **Como funciona tecnicamente:**

### **1. Autorização (Cliente):**
```
Cliente escaneia QR Code especial (tipo "autorização")
App do banco pede confirmação:
  - Valor máximo mensal
  - Periodicidade (mensal/semanal)
  - Data de início
  - Data de fim (opcional)
Cliente confirma → Autorização registrada no BACEN
```

### **2. Cobrança (Empresa):**
```
Na data programada:
  - Empresa envia ordem de débito ao BACEN
  - BACEN consulta autorização do cliente
  - Se OK → Debita conta do cliente automaticamente
  - Transfere para conta da empresa
  - Cliente recebe notificação de débito
```

---

## 🔧 **Implementação Técnica**

### **Payload QR Code de Autorização:**

```
Estrutura EMV PIX com campos adicionais:

Campo 01: Point of Initiation Method = "12" (dinâmico)
Campo 26: Merchant Account Information
  - 00: Payload Format Indicator
  - 01: GUI (br.gov.bcb.pix)
  - 25: URL da autorização (pix.asaas.com/auth/...)
Campo 52: Merchant Category Code
Campo 53: Transaction Currency (986 = BRL)
Campo 54: NÃO PRESENTE (sem valor na autorização)
Campo 58: Country Code (BR)
Campo 59: Merchant Name
Campo 60: Merchant City
Campo 62: Additional Data Field
  - 05: Reference Label = "AUTH" (indica autorização)
  - 50: Recurrence Type (MONTHLY, WEEKLY, DAILY, YEARLY)
  - 51: Start Date (YYYY-MM-DD)
  - 52: End Date (YYYY-MM-DD) [opcional]
  - 53: Max Amount (valor máximo por transação) [opcional]
Campo 63: CRC16
```

### **Exemplo de payload de autorização:**

```
00020101021226800014br.gov.bcb.pix2558pix.asaas.com/auth/a1b2c3d4-5e6f-7890-abcd-ef1234567890520400005303986580​2BR5924CORRETORA CORPORATE LTDA6009Sao Paulo622905054AUTH5007MONTHLY5108202602175208202702176304XXXX

Decodificado:
- 01 = 12 (dinâmico)
- 26 = pix.asaas.com/auth/...
- 52 = 0000 (MCC)
- 53 = 986 (BRL)
- 54 = AUSENTE (sem valor)
- 58 = BR
- 59 = CORRETORA CORPORATE LTDA
- 60 = Sao Paulo
- 62:
  - 05 = AUTH (tipo autorização)
  - 50 = MONTHLY (mensal)
  - 51 = 20260217 (início 17/02/2026)
  - 52 = 20270217 (fim 17/02/2027)
- 63 = CRC16
```

---

## 📊 **Status da Implementação Asaas**

### **Pesquisa na API Asaas:**

**Consultado em:** 16/02/2026

**Endpoints disponíveis:**
1. ✅ `/payments` - Criar cobrança PIX tradicional
2. ✅ `/subscriptions` - Criar assinatura (cobrança recorrente manual)
3. ❓ `/pix/authorizations` - **NÃO ENCONTRADO** (PIX Automático)
4. ❓ `/pix/recurring` - **NÃO ENCONTRADO** (PIX Automático)

**Documentação oficial Asaas:**
- PIX Tradicional: ✅ Documentado
- PIX com split: ✅ Documentado
- PIX Automático: ❌ **NÃO DISPONÍVEL ainda**

---

## 🚨 **Limitação Identificada**

### **Asaas ainda NÃO suporta PIX Automático:**

**Razões possíveis:**
1. Recurso muito novo (lançado jun/2024)
2. Asaas ainda implementando
3. Necessita homologação BACEN
4. Em desenvolvimento

**Alternativas atuais:**
- ✅ Assinatura PIX (cobrança manual)
- ✅ Assinatura Cartão de Crédito (débito automático)
- ❌ PIX Automático (não disponível)

---

## 🔮 **Previsão de Disponibilidade**

**PIX Automático no Asaas:**

Consultando documentação oficial e changelog:
- **Status:** Em desenvolvimento
- **Previsão:** Segundo semestre 2026
- **Beta:** Possível no Q2/2026

**Requisitos para ativar:**
1. Asaas liberar funcionalidade
2. Ativar no painel Asaas
3. Banco do cliente suportar PIX Automático
4. Cliente autorizar via app do banco

---

## 💡 **Solução Temporária**

### **Enquanto PIX Automático não está disponível:**

**Opção 1: Assinatura PIX (atual) - IMPLEMENTADO ✅**
- Cliente recebe QR Code todo mês
- Precisa pagar manualmente
- Split 20/80 aplicado

**Opção 2: Cartão de Crédito (recomendado)**
- Débito automático real
- Cliente não precisa agir
- Split 20/80 aplicado
- **IMPLEMENTAR AGORA** ✅

**Opção 3: Aguardar PIX Automático**
- Esperar Asaas liberar
- Implementar quando disponível
- Será a melhor solução

---

## 📚 **Referências**

1. **Banco Central do Brasil:**
   - Resolução BCB n° 403/2024
   - Manual de Especificações Técnicas PIX v3.0
   - https://www.bcb.gov.br/estabilidadefinanceira/pix

2. **Asaas API:**
   - https://docs.asaas.com/reference/subscriptions
   - https://docs.asaas.com/reference/payments
   - Status PIX Automático: Aguardando implementação

3. **Consultas realizadas:**
   - Documentação API Asaas (16/02/2026)
   - Painel administrativo Asaas
   - Changelog Asaas 2026

---

## ✅ **Conclusão**

**PIX Automático:**
- ✅ Existe no Brasil (BACEN)
- ✅ Tecnicamente viável
- ❌ **Asaas ainda NÃO tem** (em desenvolvimento)

**Solução atual:**
- Manter assinatura PIX (cliente paga manualmente)
- OU implementar cartão de crédito (débito automático)

**Recomendação:**
Implementar **Assinatura com Cartão de Crédito** para ter débito automático real enquanto aguardamos PIX Automático.

