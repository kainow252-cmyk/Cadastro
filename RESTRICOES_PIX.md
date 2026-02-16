# Restrições de PIX Recorrente - Sistema de Links de Pagamento

## Data: 16/02/2026
## Versão: 2.9.1
## Commit: 73b3958

---

## 📋 Resumo

O sistema agora implementa corretamente as **limitações do PIX** para cobranças recorrentes/assinaturas.

### ✅ Comportamento Correto

1. **PIX = Apenas Valor Fixo**
   - Quando usuário seleciona "PIX" como método de pagamento
   - A opção "Assinatura/Recorrente" fica **DESABILITADA**
   - Texto da opção muda para: "Assinatura/Recorrente (não disponível para PIX)"
   - Sistema força automaticamente "Valor Fixo"

2. **Cartão e Boleto = Valor Fixo OU Recorrente**
   - "Cartão de Crédito" suporta ambos tipos
   - "Boleto" suporta ambos tipos
   - "Todas (PIX + Cartão + Boleto)" suporta ambos tipos

---

## 🔧 Implementação Técnica

### Arquivo: `public/static/app.js`

```javascript
// Função para verificar se pode usar recorrente
const updateRecurrentAvailability = () => {
    if (billingTypeSelect && chargeTypeSelect) {
        const billingType = billingTypeSelect.value;
        const recurrentOption = chargeTypeSelect.querySelector('option[value="RECURRENT"]');
        
        // PIX não suporta recorrente - apenas Cartão e Boleto
        if (billingType === 'PIX') {
            if (recurrentOption) {
                recurrentOption.disabled = true;
                recurrentOption.textContent = 'Assinatura/Recorrente (não disponível para PIX)';
            }
            // Se estava selecionado recorrente, muda para valor fixo
            if (chargeTypeSelect.value === 'RECURRENT') {
                chargeTypeSelect.value = 'DETACHED';
                chargeTypeSelect.dispatchEvent(new Event('change'));
            }
        } else {
            // Outras formas de pagamento permitem recorrente
            if (recurrentOption) {
                recurrentOption.disabled = false;
                recurrentOption.textContent = 'Assinatura/Recorrente';
            }
        }
    }
};

// Event listener para mudança no tipo de cobrança
if (billingTypeSelect) {
    billingTypeSelect.addEventListener('change', updateRecurrentAvailability);
}
```

---

## 🎯 Fluxo de Uso

### Cenário 1: Usuário seleciona PIX primeiro
1. Usuário abre "Links de Pagamento"
2. Seleciona uma subconta
3. Seleciona "PIX" em "Tipo de Cobrança"
4. 🔒 Campo "Tipo de Valor" mostra apenas "Valor Fixo" disponível
5. "Assinatura/Recorrente" aparece desabilitado com texto explicativo

### Cenário 2: Usuário tinha Recorrente e troca para PIX
1. Usuário está criando link recorrente
2. Troca "Tipo de Cobrança" para "PIX"
3. ⚡ Sistema automaticamente muda "Tipo de Valor" para "Valor Fixo"
4. Interface atualiza para mostrar campos de valor fixo

### Cenário 3: Usuário seleciona Cartão ou Boleto
1. Usuário seleciona "Cartão de Crédito" ou "Boleto"
2. ✅ Ambas opções ficam disponíveis:
   - Valor Fixo
   - Assinatura/Recorrente
3. Usuário pode escolher livremente

---

## 📊 Matriz de Compatibilidade

| Método de Pagamento | Valor Fixo | Recorrente |
|---------------------|------------|------------|
| **PIX** | ✅ Sim | ❌ Não |
| **Cartão de Crédito** | ✅ Sim | ✅ Sim |
| **Boleto** | ✅ Sim | ✅ Sim |
| **Todas (Mix)** | ✅ Sim | ✅ Sim |

---

## 🚨 Limitações do PIX (Asaas API)

### Por que PIX não suporta recorrente?

1. **Protocolo PIX**: Pix foi desenhado para pagamentos instantâneos únicos
2. **Banco Central**: Não há mecanismo oficial de débito recorrente via PIX
3. **Asaas API**: A API do Asaas reflete essas limitações do protocolo
4. **Alternativas**:
   - Use **Cartão** para assinaturas automáticas
   - Use **Boleto** para cobranças mensais
   - Crie múltiplos links PIX de valor fixo (um por mês)

---

## ✅ Testes Realizados

### Teste 1: Selecionar PIX
- ✅ Opção recorrente desabilitada
- ✅ Texto atualizado com explicação
- ✅ Campo valor fixo obrigatório

### Teste 2: PIX → Cartão
- ✅ Opção recorrente habilitada
- ✅ Texto volta ao normal
- ✅ Usuário pode escolher ambos tipos

### Teste 3: Recorrente → PIX
- ✅ Sistema força mudança para valor fixo
- ✅ Interface atualiza automaticamente
- ✅ Sem erros no console

---

## 📚 Documentação API Asaas

### Referências Oficiais

1. **Cobranças PIX**: https://docs.asaas.com/reference/criar-nova-cobranca
2. **Assinaturas**: https://docs.asaas.com/reference/criar-nova-assinatura
3. **Tipos de Billing**: https://docs.asaas.com/reference/tipos-de-billing

### Billing Types Suportados

```typescript
// PIX
{
  billingType: "PIX",
  chargeType: "DETACHED"  // Apenas valor fixo
}

// Cartão - Assinatura
{
  billingType: "CREDIT_CARD",
  chargeType: "RECURRENT",  // Recorrente permitido
  cycle: "MONTHLY"
}

// Boleto - Assinatura
{
  billingType: "BOLETO",
  chargeType: "RECURRENT",  // Recorrente permitido
  cycle: "MONTHLY"
}
```

---

## 🎉 Status Final

- ✅ Implementação concluída
- ✅ Testes aprovados
- ✅ Documentação atualizada
- ✅ Pronto para produção
- ✅ Commit 73b3958

---

## 📞 Suporte

- **Sistema**: Gerenciador Asaas
- **Desenvolvedor**: AI Assistant
- **Data**: 16/02/2026
- **Versão**: 2.9.1

