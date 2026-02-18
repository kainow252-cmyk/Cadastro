# 📅 Explicação: Assinatura Recorrente PIX

## 🎯 Sua Pergunta

> "Este PIX ficou recorrente, ou enviado mensal, pro email do cliente?"

**Resposta:** ✅ **SIM! A assinatura é recorrente e automática.**

---

## 🔄 Como Funciona a Recorrência

### 1. Quando o Cliente se Cadastra

Quando o cliente preenche o formulário de auto-cadastro e confirma, o sistema:

1. **Busca ou cria o cadastro do cliente no Asaas**
   - Nome: Franklin Madson Oliveira Soares
   - E-mail: soaresfranklin626@gmail.com
   - CPF: 13615574788

2. **Cria uma ASSINATURA MENSAL** no Asaas com:
   ```javascript
   {
     customer: customerId,
     billingType: 'PIX',              // Tipo: PIX
     value: 13.00,                     // Valor: R$ 13,00
     nextDueDate: '2026-03-18',        // Próximo vencimento
     cycle: 'MONTHLY',                 // ⭐ MENSAL (recorrente)
     description: 'Mensalidade',
     split: [{
       walletId: 'b0e857ff...',
       percentualValue: 20             // 20% para subconta
     }]
   }
   ```

3. **Asaas gera automaticamente o primeiro pagamento**
   - Data de vencimento: hoje ou amanhã
   - QR Code PIX mostrado na tela
   - Cliente paga e ativa a assinatura

---

## 📧 O que Acontece Todos os Meses

### Automação do Asaas

O Asaas gerencia **automaticamente** a recorrência:

#### 🗓️ Todo dia 18 de cada mês:

1. **Asaas cria novo pagamento automaticamente**
   - Valor: R$ 13,00
   - Tipo: PIX
   - Vencimento: dia 18

2. **Asaas envia E-MAIL para o cliente**
   - Para: soaresfranklin626@gmail.com
   - Assunto: "Cobrança de Assinatura"
   - Conteúdo:
     - Valor: R$ 13,00
     - Descrição: Mensalidade
     - QR Code PIX para pagamento
     - Link para pagar online
     - Código PIX copia e cola

3. **Cliente paga o PIX**
   - Escaneia QR Code do e-mail
   - OU copia código e cola no app do banco
   - Pagamento confirmado

4. **Sistema atualiza automaticamente**
   - Webhook recebe confirmação
   - Status muda para "RECEIVED"
   - Relatório atualizado
   - Split de 20% enviado para subconta

---

## 📊 Linha do Tempo

```
┌─────────────────────────────────────────────────────────────────┐
│ 18/02/2026 - Primeiro Pagamento                                 │
├─────────────────────────────────────────────────────────────────┤
│ Cliente se cadastra                                             │
│ → Paga primeiro PIX de R$ 13,00                                 │
│ → Assinatura ativada                                            │
│ → Status: RECEIVED                                              │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 18/03/2026 - Segundo Pagamento (AUTOMÁTICO)                    │
├─────────────────────────────────────────────────────────────────┤
│ Asaas gera cobrança automaticamente                             │
│ → E-mail enviado para soaresfranklin626@gmail.com              │
│ → QR Code PIX gerado                                            │
│ → Cliente recebe notificação                                    │
│ → Cliente paga R$ 13,00                                         │
│ → Split de 20% (R$ 2,60) para subconta                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 18/04/2026 - Terceiro Pagamento (AUTOMÁTICO)                   │
├─────────────────────────────────────────────────────────────────┤
│ Processo se repete todo mês                                     │
│ → E-mail automático                                             │
│ → QR Code gerado                                                │
│ → Cliente paga                                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                     E assim por diante...
                     Todo dia 18 de cada mês
```

---

## 📧 Exemplo de E-mail que o Cliente Recebe

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
De: Asaas <notificacoes@asaas.com>
Para: soaresfranklin626@gmail.com
Assunto: 💳 Cobrança de Assinatura - R$ 13,00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Olá, Franklin Madson Oliveira Soares!

Sua cobrança mensal está disponível:

┌──────────────────────────────────────┐
│ 📅 Vencimento: 18/03/2026            │
│ 💰 Valor: R$ 13,00                   │
│ 📝 Descrição: Mensalidade            │
└──────────────────────────────────────┘

🔲 QR Code PIX
[Imagem do QR Code]

📋 Código PIX Copia e Cola:
00020126580014br.gov.bcb.pix...

🔗 Ou pague online:
https://www.asaas.com/c/xyz123

──────────────────────────────────────
⚠️ Este é um pagamento recorrente mensal.
Você receberá esta cobrança todo mês.

Para cancelar, acesse sua conta ou entre em contato.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💰 Divisão da Receita (Split)

A cada pagamento recebido:

```
┌────────────────────────────────────────────────────┐
│ Valor total: R$ 13,00                              │
├────────────────────────────────────────────────────┤
│ 80% (R$ 10,40) → Conta principal (sua)             │
│ 20% (R$ 2,60)  → Subconta (b0e857ff...)           │
└────────────────────────────────────────────────────┘
```

**Subconta:** Franklin Madson Oliveira Soares  
**Wallet ID:** b0e857ff-e03b-4b16-8492-f0431de088f8

---

## 🔧 Configurações Importantes

### 1. Notificações Habilitadas

No código, configuramos:
```javascript
{
  notificationDisabled: false  // E-mails ATIVADOS
}
```

Isso garante que o cliente **receba e-mails automaticamente** todo mês.

---

### 2. Ciclo Mensal

```javascript
{
  cycle: 'MONTHLY'  // Recorrência mensal
}
```

Opções disponíveis:
- `WEEKLY` - Semanal
- `BIWEEKLY` - Quinzenal
- `MONTHLY` - **Mensal** ⭐ (configurado)
- `QUARTERLY` - Trimestral
- `SEMIANNUALLY` - Semestral
- `YEARLY` - Anual

---

### 3. Data de Vencimento

```javascript
{
  nextDueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]
}
```

Primeiro pagamento: **1 dia após o cadastro**  
Pagamentos seguintes: **mesmo dia de cada mês**

---

## 📊 Como Acompanhar os Pagamentos

### 1. No Painel Admin

1. Login: https://gerenciador.corretoracorporate.com.br
2. Ir em "Subcontas"
3. Clicar em "📊 Relatório" da subconta Franklin
4. Ver todos os pagamentos:
   - 18/02/2026 - R$ 13,00 - Recebido ✅
   - 18/03/2026 - R$ 13,00 - Aguardando...
   - 18/04/2026 - R$ 13,00 - Aguardando...

---

### 2. No Asaas (Painel Oficial)

1. Login: https://www.asaas.com
2. Menu "Assinaturas"
3. Buscar: soaresfranklin626@gmail.com
4. Ver detalhes:
   - Status: Ativa ✅
   - Valor: R$ 13,00
   - Ciclo: Mensal
   - Próxima cobrança: 18/03/2026
   - Histórico de pagamentos

---

## ❓ Perguntas Frequentes

### 1. O cliente precisa pagar manualmente todo mês?

**Sim**, o PIX não é débito automático. O processo é:
1. Asaas envia e-mail com QR Code
2. Cliente abre o e-mail
3. Cliente escaneia QR ou copia código
4. Cliente paga no banco dele

---

### 2. E se o cliente não pagar?

O Asaas marca a cobrança como:
- **PENDING** (até vencimento)
- **OVERDUE** (após vencimento)

Você pode:
- Enviar lembrete por e-mail
- Cancelar a assinatura
- Tentar outro meio de pagamento

---

### 3. Como cancelar a assinatura?

**Pelo painel Asaas:**
1. Menu "Assinaturas"
2. Buscar cliente
3. Clicar "Cancelar assinatura"

**Ou via API:**
```bash
DELETE https://api.asaas.com/v3/subscriptions/{subscriptionId}
```

---

### 4. O cliente receberá comprovante após pagar?

✅ **Sim!** Automaticamente:
1. E-mail de confirmação do Asaas
2. Comprovante do banco
3. Nota fiscal (se configurado)

---

### 5. Posso mudar o valor da mensalidade?

**Sim**, no painel Asaas:
1. Buscar assinatura
2. Editar valor
3. Novo valor vale a partir do próximo mês

**Ou via API:**
```bash
PUT https://api.asaas.com/v3/subscriptions/{subscriptionId}
{
  "value": 15.00
}
```

---

## 🎯 Resumo Executivo

### ✅ O que está configurado:

1. **Assinatura recorrente MENSAL** ✅
2. **E-mails automáticos para o cliente** ✅
3. **QR Code gerado a cada mês** ✅
4. **Split de 20% para subconta** ✅
5. **Notificações habilitadas** ✅

### 🔄 Fluxo automático:

1. **Todo dia 18** → Asaas gera cobrança
2. **E-mail enviado** → Cliente recebe QR Code
3. **Cliente paga** → PIX confirmado
4. **Webhook notifica** → Sistema atualiza (0-1s)
5. **Split processado** → 20% para subconta

### 💰 Receita mensal esperada:

- **Valor por cliente:** R$ 13,00
- **Sua parte (80%):** R$ 10,40
- **Subconta (20%):** R$ 2,60

Se tiver 100 clientes ativos:
- **Receita total:** R$ 1.300,00/mês
- **Sua parte:** R$ 1.040,00/mês
- **Subcontas:** R$ 260,00/mês

---

## 📞 Suporte

Se o cliente não receber o e-mail:

1. **Verificar spam/lixo eletrônico**
2. **Confirmar e-mail correto no Asaas**
3. **Adicionar notificacoes@asaas.com aos contatos**
4. **Reenviar cobrança pelo painel**

---

## 🚀 Conclusão

✅ **Sim, a assinatura é recorrente e automática!**

- ✅ Cliente receberá e-mail **todo mês**
- ✅ QR Code PIX gerado **automaticamente**
- ✅ Split de 20% processado **automaticamente**
- ✅ Sistema atualizado **automaticamente** (webhook)

**Você não precisa fazer nada manualmente!** 🎉

O Asaas cuida de:
- Gerar cobranças mensais
- Enviar e-mails
- Processar pagamentos
- Dividir valores (split)
- Enviar confirmações

Tudo **100% automático**! 🚀
