# 🧪 Como Criar Transações de Teste DeltaPag

## 📋 Visão Geral

Este documento explica como popular o banco de dados com 9 transações de teste usando cartões das operadoras **Cielo** e **Rede**.

---

## 🌐 Método 1: Página HTML Interativa (RECOMENDADO)

### Passo a Passo

1. **Faça login no sistema**
   - Acesse: https://gerenciador.corretoracorporate.com.br
   - Usuário: `admin`
   - Senha: `admin123`

2. **Acesse a página de seed**
   - URL: https://gerenciador.corretoracorporate.com.br/seed-test.html
   - Ou adicione `/seed-test.html` após fazer login

3. **Clique no botão**
   - "Criar 9 Transações de Teste"
   - Aguarde processamento (5-10 segundos)

4. **Verifique o resultado**
   - Mensagem de sucesso com lista de assinaturas criadas
   - Clique em "Ver no Sistema" para ir ao dashboard

5. **Visualize no sistema**
   - Dashboard → Card roxo "Cartão Crédito"
   - Veja as 9 assinaturas na tabela

---

## 🔧 Método 2: API Direct (Via cURL)

### Requisitos
- Estar autenticado (ter cookie `auth_token`)
- Fazer login primeiro em: https://gerenciador.corretoracorporate.com.br

### Comando cURL

```bash
curl -X POST https://gerenciador.corretoracorporate.com.br/api/admin/seed-deltapag \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=SEU_TOKEN_AQUI" \
  | jq .
```

### Resposta Esperada

```json
{
  "ok": true,
  "message": "Transações de teste DeltaPag criadas com sucesso",
  "count": 9,
  "subscriptions": [
    {
      "customer": "João da Silva",
      "value": 99.9,
      "status": "ACTIVE",
      "card_brand": "Mastercard",
      "card_last4": "2340"
    },
    ...
  ]
}
```

---

## 💳 Cartões de Teste Incluídos

### Cielo

#### ✅ Aprovadas (3 cartões)
| Número | Bandeira | Validade | CVV | Final | Status |
|--------|----------|----------|-----|-------|--------|
| 5428258051342340 | Mastercard | 01/2028 | 123 | 2340 | ✓ Aprovada |
| 5308547387340761 | Mastercard | 01/2028 | 123 | 0761 | ✓ Aprovada |
| 5328575787984264 | Mastercard | 01/2028 | 123 | 8264 | ✓ Aprovada |

#### ❌ Não Autorizada (1 cartão)
| Número | Bandeira | Validade | CVV | Final | Status |
|--------|----------|----------|-----|-------|--------|
| 5359439935515532 | Mastercard | 01/2028 | 123 | 5532 | ✗ Não Autorizada |

#### ⊗ Bloqueada (1 cartão)
| Número | Bandeira | Validade | CVV | Final | Status |
|--------|----------|----------|-----|-------|--------|
| 5226524696667415 | Mastercard | 01/2028 | 123 | 7415 | ⊗ Cartão Bloqueado |

---

### Rede

#### ✅ Todas Aprovadas (4 cartões)
| Número | Bandeira | Validade | CVV | Final | Status |
|--------|----------|----------|-----|-------|--------|
| 5448280000000007 | Mastercard | 01/2028 | 123 | 0007 | ✓ Aprovada |
| 4235647728025682 | Visa | 01/2028 | 123 | 5682 | ✓ Aprovada |
| 6062825624254001 | Hipercard | 01/2028 | 123 | 4001 | ✓ Aprovada |
| 4389351648020055 | Elo | 01/2028 | 123 | 0055 | ✓ Aprovada |

---

## 📊 Assinaturas Criadas

### Detalhes das 9 Assinaturas

| # | Cliente | Email | CPF | Valor | Recorrência | Status | Bandeira | Final |
|---|---------|-------|-----|-------|-------------|--------|----------|-------|
| 1 | João da Silva | joao.silva@email.com | 123.456.789-00 | R$ 99,90 | MONTHLY | ACTIVE | Mastercard | 2340 |
| 2 | Maria Santos | maria.santos@email.com | 234.567.890-11 | R$ 149,90 | MONTHLY | ACTIVE | Mastercard | 0761 |
| 3 | Pedro Oliveira | pedro.oliveira@email.com | 345.678.901-22 | R$ 79,90 | MONTHLY | ACTIVE | Mastercard | 8264 |
| 4 | Ana Costa | ana.costa@email.com | 456.789.012-33 | R$ 199,90 | MONTHLY | CANCELLED | Mastercard | 5532 |
| 5 | Carlos Ferreira | carlos.ferreira@email.com | 567.890.123-44 | R$ 299,90 | YEARLY | CANCELLED | Mastercard | 7415 |
| 6 | Juliana Lima | juliana.lima@email.com | 678.901.234-55 | R$ 49,90 | MONTHLY | ACTIVE | Mastercard | 0007 |
| 7 | Roberto Alves | roberto.alves@email.com | 789.012.345-66 | R$ 129,90 | MONTHLY | ACTIVE | Visa | 5682 |
| 8 | Fernanda Rocha | fernanda.rocha@email.com | 890.123.456-77 | R$ 89,90 | MONTHLY | ACTIVE | Hipercard | 4001 |
| 9 | Lucas Martins | lucas.martins@email.com | 901.234.567-88 | R$ 169,90 | MONTHLY | ACTIVE | Elo | 0055 |

---

## 📈 Estatísticas

- **Total de Assinaturas**: 9
- **Assinaturas Ativas**: 7 (77.8%)
- **Assinaturas Canceladas**: 2 (22.2%)
- **Valor Total (Ativas)**: R$ 749,30/mês
- **Valor Total (Canceladas)**: R$ 299,90/ano + R$ 199,90/mês
- **Bandeiras**:
  - Mastercard: 6 assinaturas
  - Visa: 1 assinatura
  - Hipercard: 1 assinatura
  - Elo: 1 assinatura

---

## 🎨 Planos Incluídos

| Plano | Valor | Recorrência | Qtd |
|-------|-------|-------------|-----|
| Starter | R$ 49,90 | Mensal | 1 |
| Básico | R$ 79,90 | Mensal | 1 |
| Plus | R$ 89,90 | Mensal | 1 |
| Premium | R$ 99,90 | Mensal | 1 |
| Pro | R$ 129,90 | Mensal | 1 |
| Business | R$ 149,90 | Mensal | 1 |
| Advanced | R$ 169,90 | Mensal | 1 |
| Enterprise | R$ 199,90 | Mensal | 1 (Cancelado) |
| Ultimate | R$ 299,90 | Anual | 1 (Cancelado) |

---

## 🔍 Verificação

### 1. Via Dashboard
1. Login no sistema
2. Clicar no card roxo "Cartão Crédito"
3. Ver tabela com 9 assinaturas
4. Verificar cards de estatísticas:
   - Total de Assinaturas: 9
   - Assinaturas Ativas: 7
   - Receita Mensal: R$ 749,30
   - Canceladas: 2

### 2. Via API
```bash
curl https://gerenciador.corretoracorporate.com.br/api/admin/deltapag/subscriptions \
  -H "Cookie: auth_token=SEU_TOKEN" \
  | jq '.subscriptions | length'
```

Deve retornar: `9`

---

## ⚠️ Notas Importantes

1. **Autenticação Necessária**
   - O endpoint requer login (cookie `auth_token`)
   - Use a página HTML após login para facilitar

2. **Duplicação de Dados**
   - Executar múltiplas vezes criará assinaturas duplicadas
   - IDs são únicos por timestamp

3. **Cartões Não Autorizados/Bloqueados**
   - Simulados com status `CANCELLED`
   - Útil para testar filtros e relatórios

4. **Próximo Vencimento**
   - Calculado automaticamente: data atual + 30 dias
   - Todas as assinaturas têm próxima cobrança futura

---

## 🚀 Deploy Atual

- **URL Principal**: https://gerenciador.corretoracorporate.com.br
- **Página de Seed**: https://gerenciador.corretoracorporate.com.br/seed-test.html
- **Deploy Preview**: https://6f9a6c82.corretoracorporate.pages.dev

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique se está logado no sistema
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Tente em aba anônima (Ctrl+Shift+N)
4. Aguarde 1-2 minutos após deploy (propagação Cloudflare)

---

**Última atualização**: 19/02/2026  
**Versão**: 1.0.0
