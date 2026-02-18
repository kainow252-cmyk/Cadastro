# 📧 ESTUDO: Envio de Informações Personalizadas via API Asaas

**Data**: 18/02/2026  
**Projeto**: Gerenciador Asaas - PIX Automático  
**Objetivo**: Avaliar possibilidades de personalização de comunicações com clientes via API

---

## 🎯 Resumo Executivo

### ✅ **POSSÍVEL PERSONALIZAR**
Sim, a API Asaas oferece **múltiplas formas** de enviar informações personalizadas aos clientes:

1. **📄 Campos customizados em cobranças** (description, externalReference)
2. **📧 Controle de notificações** (enable/disable por canal)
3. **✉️ E-mails adicionais** (additionalEmails)
4. **📱 Mensagens via WhatsApp** (em desenvolvimento)
5. **🔔 Templates personalizados** (via dashboard Asaas)

### ⚠️ **LIMITAÇÃO IMPORTANTE**
**Não é possível editar os templates de e-mail/SMS diretamente via API** - apenas via dashboard web do Asaas.

---

## 📋 1. Campos Personalizáveis em Cobranças

### 1.1 Campo `description`
**O que é**: Descrição da cobrança que aparece no e-mail/SMS para o cliente.

```json
// POST /v3/payments
{
  "customer": "cus_123",
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2026-02-28",
  "description": "🎉 Oferta Especial: Primeira mensalidade com 20% OFF!",
  "externalReference": "PIX_AUTO_123"
}
```

**Exemplo de uso no nosso sistema**:
```typescript
// Mensagem personalizada por tipo de link
const descriptions = {
  pix_automatic: `✅ PIX Automático - ${linkData.description}\n💰 Valor: R$ ${linkData.value}\n📅 Pagamento recorrente mensal`,
  subscription: `📋 Assinatura Mensal - ${linkData.description}\n💰 Valor: R$ ${linkData.value}`,
  promotional: `🎁 Promoção Especial - ${linkData.description}\n⏰ Válido até ${expirationDate}`
}
```

### 1.2 Campo `externalReference`
**O que é**: Identificador externo para rastreamento interno (não aparece para o cliente).

```json
{
  "externalReference": "CAMPAIGN_SUMMER_2026_CLIENT_123"
}
```

**Uso recomendado**:
- Rastreamento de campanhas
- Identificação de origem do lead
- Vinculação com sistemas externos

---

## 📧 2. Controle de Notificações por Cliente

### 2.1 Listar Notificações do Cliente

```bash
GET /v3/customers/{customer_id}/notifications
```

**Resposta**:
```json
{
  "object": "list",
  "data": [
    {
      "id": "not_123",
      "event": "PAYMENT_CREATED",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForCustomer": false,
      "scheduleOffset": 0
    },
    {
      "id": "not_124",
      "event": "PAYMENT_DUEDATE_WARNING",
      "enabled": true,
      "emailEnabledForProvider": true,
      "smsEnabledForCustomer": true,
      "scheduleOffset": 3  // 3 dias antes do vencimento
    }
  ]
}
```

### 2.2 Tipos de Eventos Disponíveis

| Evento | Descrição | Quando é enviado |
|--------|-----------|------------------|
| `PAYMENT_CREATED` | Cobrança criada | Imediatamente após criação |
| `PAYMENT_DUEDATE_WARNING` | Aviso de vencimento | X dias antes (scheduleOffset) |
| `PAYMENT_OVERDUE` | Pagamento atrasado | No dia seguinte ao vencimento |
| `PAYMENT_RECEIVED` | Pagamento confirmado | Após confirmação |
| `PAYMENT_UPDATED` | Cobrança atualizada | Após qualquer alteração |
| `SEND_LINHA_DIGITAVEL` | Enviar código de barras | Com boleto (se aplicável) |

### 2.3 Atualizar Notificações Individual

```bash
POST /v3/notifications/{notification_id}
```

```json
{
  "emailEnabledForProvider": true,
  "smsEnabledForCustomer": false,
  "pushEnabledForCustomer": false
}
```

### 2.4 Atualizar Notificações em Lote

```bash
POST /v3/notifications/batch
```

```json
{
  "customer": "cus_123",
  "notifications": [
    {
      "id": "not_123",
      "emailEnabledForProvider": true,
      "smsEnabledForCustomer": false
    },
    {
      "id": "not_124",
      "emailEnabledForProvider": true,
      "smsEnabledForCustomer": true
    }
  ]
}
```

---

## 📨 3. E-mails Adicionais

### 3.1 Enviar cópias para múltiplos e-mails

```json
// POST /v3/payments
{
  "customer": "cus_123",
  "value": 50.00,
  "dueDate": "2026-02-28",
  "additionalEmails": "financeiro@cliente.com.br,gerente@cliente.com.br"
}
```

**Casos de uso**:
- Enviar cópia para setor financeiro do cliente
- Notificar gestor + cliente
- Backup de notificações

---

## 📱 4. WhatsApp Business (Em Desenvolvimento)

### 4.1 Status Atual
- ✅ **Disponível**: Notificações automáticas via WhatsApp (ativar no dashboard)
- ⚠️ **Em desenvolvimento**: API para mensagens personalizadas
- 📞 **Contato**: 0800 009 0037 (suporte 24h)

### 4.2 Integrações Alternativas
- **Pluga**: https://pluga.co/ferramentas/asaas/integracao/whatsapp-business/
- **GreenAPI**: https://albato.com/br/connect/asaas-with-greenapi

---

## 🎨 5. Templates Personalizados (Dashboard Web)

### 5.1 Como Funciona
1. Acessar dashboard Asaas → Configurações → Templates
2. Editar templates de e-mail/SMS
3. Usar variáveis dinâmicas

### 5.2 Variáveis Disponíveis

```
{{nome_cliente}}          - Nome do cliente
{{valor_cobranca}}        - Valor formatado (R$ 50,00)
{{data_vencimento}}       - Data de vencimento
{{descricao_cobranca}}    - Campo description da API
{{link_pagamento}}        - URL do PIX/boleto
{{codigo_barras}}         - Código de barras (boleto)
{{seu_nome}}              - Nome da sua empresa
```

### 5.3 Exemplo de Template Personalizado

```html
Olá {{nome_cliente}},

🎉 Sua autorização PIX Automático está quase pronta!

📋 Detalhes:
• Descrição: {{descricao_cobranca}}
• Valor: {{valor_cobranca}}
• Vencimento: {{data_vencimento}}

✅ Para finalizar:
1. Abra o app do seu banco
2. Escaneie o QR Code Pix
3. Confirme o pagamento

💡 Após a confirmação, seus pagamentos mensais serão automáticos!

Atenciosamente,
{{seu_nome}}
```

**⚠️ Limitação**: Templates só podem ser editados via dashboard, **não via API**.

---

## 💡 6. Casos de Uso Práticos para o Nosso Sistema

### 6.1 Mensagem Personalizada por Tipo de Link

```typescript
// Backend: /api/pix/automatic-signup/:linkId
const customDescriptions = {
  // Link normal
  regular: `📋 Mensalidade Corretora Corporate\n💰 Valor: R$ ${linkData.value}\n✅ Débito automático via PIX`,
  
  // Promoção especial
  promotional: `🎁 OFERTA EXCLUSIVA - Primeira mensalidade com ${linkData.discount}% OFF!\n💰 De R$ ${linkData.originalValue} por R$ ${linkData.value}\n⏰ Válido até ${linkData.expiresAt}`,
  
  // Upgrade de plano
  upgrade: `⭐ Upgrade de Plano Aprovado!\n💰 Novo valor: R$ ${linkData.value}\n✨ Benefícios extras incluídos`,
  
  // Reativação
  reactivation: `🔄 Bem-vindo de volta!\n💰 Valor: R$ ${linkData.value}\n🎉 Primeira mensalidade com desconto de boas-vindas`
}

// Adicionar à cobrança
const paymentData = {
  description: customDescriptions[linkData.campaign_type] || customDescriptions.regular,
  externalReference: `${linkData.campaign_type}_${linkId}_${Date.now()}`
}
```

### 6.2 Configuração de Notificações por Perfil

```typescript
// Perfis de notificação
const notificationProfiles = {
  // Cliente premium: todas as notificações
  premium: {
    PAYMENT_CREATED: { email: true, sms: true },
    PAYMENT_DUEDATE_WARNING: { email: true, sms: true, scheduleOffset: 5 },
    PAYMENT_RECEIVED: { email: true, sms: true },
    PAYMENT_OVERDUE: { email: true, sms: true }
  },
  
  // Cliente básico: apenas essenciais
  basic: {
    PAYMENT_CREATED: { email: true, sms: false },
    PAYMENT_DUEDATE_WARNING: { email: true, sms: false, scheduleOffset: 3 },
    PAYMENT_RECEIVED: { email: false, sms: false },
    PAYMENT_OVERDUE: { email: true, sms: true }
  },
  
  // Cliente sem notificações (exceto pagamento recebido)
  minimal: {
    PAYMENT_CREATED: { email: false, sms: false },
    PAYMENT_DUEDATE_WARNING: { email: false, sms: false },
    PAYMENT_RECEIVED: { email: true, sms: false },
    PAYMENT_OVERDUE: { email: true, sms: false }
  }
}

// Aplicar perfil
async function setNotificationProfile(customerId: string, profile: string) {
  const settings = notificationProfiles[profile]
  const notifications = await getCustomerNotifications(customerId)
  
  const updates = notifications.data.map(n => ({
    id: n.id,
    emailEnabledForProvider: settings[n.event]?.email || false,
    smsEnabledForCustomer: settings[n.event]?.sms || false,
    scheduleOffset: settings[n.event]?.scheduleOffset || n.scheduleOffset
  }))
  
  await updateNotificationsBatch(customerId, updates)
}
```

### 6.3 E-mails Adicionais para Empresas

```typescript
// Formulário de cadastro com opção de múltiplos e-mails
interface SignupFormData {
  customerName: string
  customerEmail: string
  customerCpf: string
  // NOVO: campo adicional
  notificationEmails?: string[]  // ['financeiro@empresa.com', 'gestor@empresa.com']
}

// Ao criar cobrança
const paymentData = {
  customer: customerId,
  value: linkData.value,
  dueDate: calculateDueDate(),
  description: customDescription,
  // Incluir e-mails extras
  additionalEmails: formData.notificationEmails?.join(',')
}
```

---

## 📊 7. Comparação: Métodos Disponíveis

| Método | Personalização | Complexidade | Requer Dashboard | Custo Extra |
|--------|----------------|--------------|------------------|-------------|
| **Campo `description`** | ⭐⭐⭐⭐⭐ Alta | 🟢 Baixa | ❌ Não | ❌ Não |
| **Controle de notificações** | ⭐⭐⭐⭐ Alta | 🟡 Média | ❌ Não | ❌ Não |
| **E-mails adicionais** | ⭐⭐⭐ Média | 🟢 Baixa | ❌ Não | ❌ Não |
| **Templates customizados** | ⭐⭐⭐⭐⭐ Alta | 🟡 Média | ✅ Sim | ❌ Não |
| **WhatsApp integrado** | ⭐⭐⭐ Média | 🟢 Baixa | ✅ Sim | ⚠️ Possível |
| **WhatsApp via API externa** | ⭐⭐⭐⭐⭐ Alta | 🔴 Alta | ❌ Não | ✅ Sim |

---

## 🎯 8. Recomendações de Implementação

### 8.1 Fase 1 - Rápido e Fácil (Implementar JÁ)

#### A) Campo `description` Dinâmico
```typescript
// ✅ Implementar em: POST /api/pix/automatic-signup/:linkId
const description = `
✅ PIX Automático - ${linkData.description}
💰 Valor mensal: R$ ${linkData.value.toFixed(2)}
📅 Débito automático todo dia ${calculateBillingDay()}
🏦 Taxa: 1,99% (split 80/20)

Dúvidas? suporte@corretoracorporate.com.br
`.trim()
```

**Benefícios**:
- Zero custo
- Implementação imediata
- Total controle via código

#### B) E-mails Adicionais (Opcional)
```typescript
// Adicionar campo no formulário de cadastro
<input 
  type="email" 
  name="additionalEmail" 
  placeholder="E-mail adicional para notificações (opcional)"
/>
```

**Casos de uso**:
- Cliente quer receber cópia no e-mail pessoal + trabalho
- Empresas que precisam notificar setor financeiro

---

### 8.2 Fase 2 - Médio Prazo (1-2 semanas)

#### A) Perfis de Notificação
```typescript
// Adicionar no formulário de cadastro
<select name="notificationProfile">
  <option value="premium">Todas as notificações (recomendado)</option>
  <option value="basic">Apenas essenciais</option>
  <option value="minimal">Mínimo possível</option>
</select>

// Backend: aplicar perfil após criar cliente
await setNotificationProfile(customerId, formData.notificationProfile)
```

**Benefícios**:
- Reduz reclamações de "muito spam"
- Melhora experiência do usuário
- Diferencial competitivo

---

### 8.3 Fase 3 - Longo Prazo (1-2 meses)

#### A) Templates Personalizados (Dashboard Asaas)
**Ações**:
1. Acessar dashboard Asaas
2. Configurar → Templates
3. Editar templates de e-mail/SMS
4. Adicionar identidade visual da Corretora Corporate

**Exemplo de template profissional**:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #0066cc; color: white; padding: 20px; }
    .content { padding: 20px; }
    .cta { background: #00cc66; color: white; padding: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏦 Corretora Corporate</h1>
  </div>
  <div class="content">
    <p>Olá {{nome_cliente}},</p>
    <p>{{descricao_cobranca}}</p>
    <p><strong>Valor:</strong> {{valor_cobranca}}</p>
    <p><strong>Vencimento:</strong> {{data_vencimento}}</p>
  </div>
  <div class="cta">
    <a href="{{link_pagamento}}">PAGAR AGORA</a>
  </div>
</body>
</html>
```

#### B) WhatsApp via Integrações
**Opções**:
1. **Pluga** (mais simples): https://pluga.co/ferramentas/asaas/integracao/whatsapp-business/
2. **GreenAPI** (mais flexível): https://albato.com/br/connect/asaas-with-greenapi
3. **API própria** (máximo controle): Webhook Asaas → Backend → WhatsApp Business API

---

## 💰 9. Análise de Custo x Benefício

### 9.1 Opção 1: Apenas Campo `description` (RECOMENDADO PARA INÍCIO)

**Custo**: R$ 0  
**Tempo de implementação**: 30 minutos  
**ROI**: ⭐⭐⭐⭐⭐

**Prós**:
- ✅ Zero investimento
- ✅ Implementação imediata
- ✅ Total controle
- ✅ Mensagens diferentes por tipo de link

**Contras**:
- ⚠️ Limitado a texto simples
- ⚠️ Sem formatação HTML

---

### 9.2 Opção 2: Campo `description` + Perfis de Notificação

**Custo**: R$ 0  
**Tempo de implementação**: 2-3 horas  
**ROI**: ⭐⭐⭐⭐⭐

**Prós**:
- ✅ Tudo da Opção 1
- ✅ Reduz spam para clientes
- ✅ Diferencial competitivo
- ✅ Melhora satisfação do cliente

**Contras**:
- ⚠️ Requer mais código
- ⚠️ Mais campos no formulário

---

### 9.3 Opção 3: Tudo + Templates Customizados

**Custo**: R$ 0 (mas requer acesso ao dashboard)  
**Tempo de implementação**: 1 dia  
**ROI**: ⭐⭐⭐⭐

**Prós**:
- ✅ Tudo das Opções 1 e 2
- ✅ Visual profissional
- ✅ Identidade visual da marca
- ✅ E-mails HTML formatados

**Contras**:
- ⚠️ Não editável via API
- ⚠️ Requer acesso ao dashboard
- ⚠️ Alterações manuais

---

### 9.4 Opção 4: Tudo + WhatsApp

**Custo**: R$ 150-500/mês (dependendo do volume)  
**Tempo de implementação**: 1-2 semanas  
**ROI**: ⭐⭐⭐

**Prós**:
- ✅ Canal preferido dos brasileiros
- ✅ Taxa de abertura ~90%
- ✅ Respostas em tempo real

**Contras**:
- ⚠️ Custo mensal significativo
- ⚠️ Integração complexa
- ⚠️ Manutenção contínua

---

## 🎯 10. Decisão Recomendada

### ✅ **Implementar AGORA** (Fase 1)

1. **Campo `description` dinâmico**
   - Tempo: 30 min
   - Custo: R$ 0
   - ROI: Imediato

2. **E-mails adicionais (opcional)**
   - Tempo: 15 min
   - Custo: R$ 0
   - ROI: Útil para empresas

**Código pronto** (implementar em `/api/pix/automatic-signup/:linkId`):

```typescript
// Gerar descrição personalizada
const description = `
✅ PIX Automático - ${linkData.description}
💰 Valor mensal: R$ ${linkData.value.toFixed(2)}
📅 Débito automático recorrente
🏦 Taxa Asaas: 1,99%
📧 Dúvidas: suporte@corretoracorporate.com.br
`.trim()

// Adicionar à cobrança PIX
const authorizationData = {
  customer: customer.id,
  value: linkData.value,
  billingType: 'PIX',
  description: description,  // ← Descrição personalizada
  externalReference: `PIX_AUTO_${linkId}_${Date.now()}`,
  // Se cliente informou e-mail adicional:
  additionalEmails: formData.additionalEmail || undefined
}
```

---

### 🔜 **Avaliar em 2-4 semanas** (Fase 2)

1. **Perfis de notificação**
   - Se houver reclamações de "muito e-mail"
   - Se houver demanda por controle de notificações

2. **Templates customizados**
   - Se houver budget para design
   - Se identidade visual for prioritária

---

### ⏰ **Avaliar em 2-3 meses** (Fase 3)

1. **WhatsApp Business**
   - Se base de clientes > 500
   - Se taxa de abertura de e-mail < 40%
   - Se orçamento permitir R$ 150-500/mês

---

## 📚 11. Documentação de Referência

### Documentação Oficial Asaas
- **Visão geral de notificações**: https://docs.asaas.com/docs/notificacoes
- **Alterar notificações de cliente**: https://docs.asaas.com/docs/alterando-notificacoes-de-um-cliente
- **Atualizar notificações em lote**: https://docs.asaas.com/reference/atualizar-notificacoes-existentes-em-lote
- **Criar cobrança**: https://docs.asaas.com/reference/create-new-charge
- **Templates**: https://docs.asaas.com/docs/templates

### Vídeos Tutoriais
- **Como criar notificações na API**: https://www.youtube.com/watch?v=CqPOOPX1Sfk
- **Templates e variáveis**: https://www.youtube.com/watch?v=VkfRLfhSC5s

### Integrações WhatsApp
- **Pluga**: https://pluga.co/ferramentas/asaas/integracao/whatsapp-business/
- **GreenAPI**: https://albato.com/br/connect/asaas-with-greenapi

---

## ✅ Conclusão e Próximos Passos

### 📊 Resumo

| Aspecto | Conclusão |
|---------|-----------|
| **É possível personalizar?** | ✅ **SIM**, múltiplas formas |
| **Custo inicial** | 💰 **R$ 0** (campo description) |
| **Tempo de implementação** | ⏱️ **30 minutos** |
| **ROI** | ⭐⭐⭐⭐⭐ **Excelente** |
| **Complexidade** | 🟢 **Baixa** |

---

### 🎯 Recomendação Final

**IMPLEMENTAR AGORA**:
1. ✅ Campo `description` dinâmico
2. ✅ E-mails adicionais (opcional)

**AVALIAR DEPOIS**:
3. 🔜 Perfis de notificação (2-4 semanas)
4. 🔜 Templates customizados (1-2 meses)
5. ⏰ WhatsApp Business (2-3 meses, se necessário)

---

### 🤝 Decisão em Conjunto

**Pergunta para você**:

> Deseja que eu implemente **AGORA** (30 min):
> 
> 1. ✅ Campo `description` personalizado
> 2. ✅ E-mail adicional (opcional)
> 
> Ou prefere primeiro revisar o estudo e decidir juntos qual caminho seguir?

---

**📄 Documento criado**: 18/02/2026  
**📁 Localização**: `/home/user/webapp/ESTUDO_INFORMACOES_PERSONALIZADAS_ASAAS.md`  
**✍️ Autor**: Gerenciador Asaas - AI Assistant  
**🔄 Última atualização**: 18/02/2026 23:45

---

## 🔗 Links Úteis

- **Dashboard Asaas**: https://www.asaas.com/
- **Documentação API**: https://docs.asaas.com/
- **Suporte 24h**: 0800 009 0037
- **E-mail Suporte**: [email protected]
- **Nosso Sistema**: https://gerenciador.corretoracorporate.com.br

---

## 📝 Notas Adicionais

- Todas as recomendações são baseadas na documentação oficial Asaas (fev/2026)
- Custos estimados podem variar conforme plano e volume
- Templates HTML requerem conhecimento básico de HTML/CSS
- WhatsApp Business API requer processo de aprovação do Facebook/Meta
- Este estudo é um guia de decisão, não um contrato ou garantia

---

**Fim do documento** 🎉
