# 🧪 Guia de Teste Rápido - Loteria Federal

## 🎯 O que testar?

1. ✅ **Bilhete é gerado automaticamente** após pagamento
2. ✅ **Número tem 6 dígitos**
3. ✅ **Data do sorteio é a próxima quarta-feira**
4. ✅ **Botão de verificação funciona** após sorteio
5. ✅ **Consulta API da Caixa** corretamente

---

## 🚀 Teste Completo (5 minutos)

### Passo 1: Fazer um Pagamento
1. Acesse: https://corretoracorporate.pages.dev
2. Crie um link de pagamento único de **R$ 10,00**
3. Gere o link e acesse
4. Preencha seus dados:
   - Nome: Teste Silva
   - Email: teste@example.com
   - CPF: 123.456.789-00
   - Data de Nascimento: 01/01/1990
5. Clique em **"Confirmar e Gerar PIX"**

### Passo 2: Pagar o PIX
1. Escaneie o QR Code **OU**
2. Copie o "PIX Copia e Cola"
3. Pague no app do banco
4. Aguarde 5-30 segundos

### Passo 3: Ver o Bilhete
Após o pagamento ser confirmado, **automaticamente aparecerá**:

```
┌──────────────────────────────────────────┐
│  🎫 BILHETE DA LOTERIA FEDERAL ⭐        │
│  🎁 VOCÊ CONCORRE A R$ 500.000,00!      │
├──────────────────────────────────────────┤
│  SEU BILHETE:        DATA DO SORTEIO:   │
│  [NÚMERO]            [DATA]             │
└──────────────────────────────────────────┘
```

### Passo 4: Verificar Bilhete no Banco
```bash
# Abra o terminal e execute (opcional)
curl https://corretoracorporate.pages.dev/api/lottery/ticket/pay_ABC123
# Substitua pay_ABC123 pelo ID do pagamento
```

**Resposta esperada**:
```json
{
  "ok": true,
  "ticket": {
    "ticketNumber": "078542",
    "drawDate": "2026-03-12",
    "status": "PENDING"
  }
}
```

### Passo 5: Testar Verificação
```bash
# Tentar verificar resultado (antes do sorteio)
curl -X POST https://corretoracorporate.pages.dev/api/lottery/check/pay_ABC123
```

**Resposta esperada (se ainda não sorteou)**:
```json
{
  "ok": true,
  "status": "PENDING",
  "message": "Sorteio será realizado em 12/03/2026"
}
```

---

## 🎲 Teste do Sorteio Real

### Consultar Último Resultado da Caixa
```bash
curl https://loteriascaixa-api.herokuapp.com/api/federal/latest
```

**Resposta**:
```json
{
  "concurso": 6046,
  "data": "04/03/2026",
  "premiacoes": [
    {
      "premio": 1,
      "numero": "022925",
      "valor_premio": "500.000,00"
    }
  ]
}
```

### Simular um Ganhador (Teste Manual)
Se você quiser **forçar um teste de ganhador**:

1. Pegue o número do 1º prêmio da API (ex: `022925`)
2. Vá no banco D1:
```sql
UPDATE lottery_tickets 
SET ticket_number = '022925', 
    draw_date = '2026-03-04' 
WHERE payment_id = 'pay_ABC123';
```
3. Clique em **"Verificar Resultado"** no frontend
4. Resultado: 🏆 **PARABÉNS! VOCÊ GANHOU R$ 500.000,00!**

---

## ✅ Checklist de Validação

### Frontend
- [ ] Bilhete aparece automaticamente após pagamento
- [ ] Número tem 6 dígitos (ex: 022925)
- [ ] Data do sorteio está correta (próxima quarta)
- [ ] Botão "Verificar Resultado" desabilitado antes do sorteio
- [ ] Botão "Verificar Resultado" habilitado após o sorteio
- [ ] Confete e som aparecem se ganhar
- [ ] Mensagem correta se não ganhar

### Backend
- [ ] Webhook gera bilhete no banco D1
- [ ] API `/api/lottery/ticket/:paymentId` retorna bilhete
- [ ] API `/api/lottery/check/:paymentId` consulta Caixa
- [ ] Status atualizado corretamente (PENDING → WINNER/LOSER)
- [ ] Logs aparecem no console do Cloudflare

### Banco de Dados
```sql
-- Verificar se tabela existe
SELECT name FROM sqlite_master WHERE type='table' AND name='lottery_tickets';

-- Listar todos os bilhetes
SELECT * FROM lottery_tickets ORDER BY created_at DESC LIMIT 10;

-- Contar por status
SELECT status, COUNT(*) as total FROM lottery_tickets GROUP BY status;
```

---

## 🐛 Troubleshooting

### Bilhete não aparece
**Problema**: Após pagamento confirmado, bilhete não carrega

**Solução**:
1. Abra o Console do navegador (F12)
2. Verifique logs:
   ```
   🎫 Carregando bilhete da loteria para pagamento: pay_ABC123
   ✅ Bilhete carregado: {...}
   ```
3. Se aparecer erro 404:
   - Webhook ainda não processou
   - Sistema tentará novamente em 5s
4. Se persistir:
   - Verifique logs do Cloudflare Pages
   - Procure por "🎫 Gerando bilhete da Loteria Federal"

### Botão "Verificar" não habilita
**Problema**: Data do sorteio já passou mas botão está desabilitado

**Solução**:
1. Verifique a data no bilhete
2. Recarregue a página
3. Se persistir, verifique `draw_date` no banco:
   ```sql
   SELECT draw_date FROM lottery_tickets WHERE payment_id = 'pay_ABC123';
   ```

### Erro ao verificar resultado
**Problema**: API retorna erro 500

**Causas possíveis**:
1. API da Caixa fora do ar
   - Teste: `curl https://loteriascaixa-api.herokuapp.com/api/federal/latest`
2. Resultado ainda não disponível
   - Sorteio acontece às quartas-feiras às 19h
   - Resultado geralmente disponível às 20h
3. Formato da resposta mudou
   - Verifique estrutura da API

---

## 📊 Exemplos de Testes

### Teste 1: Bilhete Gerado
```bash
# Após fazer um pagamento
curl https://corretoracorporate.pages.dev/api/lottery/ticket/pay_vooq4d57wql1pio6

# ✅ Sucesso
{
  "ok": true,
  "ticket": {
    "ticketNumber": "078542",
    "drawDate": "2026-03-12",
    "status": "PENDING"
  }
}
```

### Teste 2: Sorteio Pendente
```bash
# Antes da data do sorteio
curl -X POST https://corretoracorporate.pages.dev/api/lottery/check/pay_vooq4d57wql1pio6

# ✅ Sucesso
{
  "ok": true,
  "status": "PENDING",
  "message": "Sorteio será realizado em 12/03/2026"
}
```

### Teste 3: Não Ganhou
```bash
# Após sorteio (número diferente)
curl -X POST https://corretoracorporate.pages.dev/api/lottery/check/pay_vooq4d57wql1pio6

# ✅ Sucesso
{
  "ok": true,
  "status": "LOSER",
  "message": "Não foi dessa vez. Tente novamente!",
  "winningNumber": {
    "firstPrize": "022925"
  }
}
```

### Teste 4: Ganhou (Simulado)
```bash
# Após forçar número igual no banco
curl -X POST https://corretoracorporate.pages.dev/api/lottery/check/pay_vooq4d57wql1pio6

# 🏆 Sucesso
{
  "ok": true,
  "status": "WINNER",
  "message": "🎉 PARABÉNS! VOCÊ GANHOU O 1º PRÊMIO!",
  "prize": {
    "type": "1º Prêmio",
    "value": 500000,
    "formattedValue": "R$ 500.000,00"
  }
}
```

---

## 🔗 Links Úteis

| Recurso | URL |
|---------|-----|
| **Produção** | https://corretoracorporate.pages.dev |
| **Admin** | https://admin.corretoracorporate.com.br |
| **GitHub** | https://github.com/kainow252-cmyk/Cadastro |
| **API Caixa** | https://loteriascaixa-api.herokuapp.com/api/federal/latest |
| **API Docs** | https://loteriascaixa-api.herokuapp.com/swagger-ui/ |
| **Último Deploy** | https://549b7255.corretoracorporate.pages.dev |

---

## 📝 Próximos Passos Após Teste

Se tudo funcionar:
1. ✅ Testar com pagamento real
2. ✅ Verificar logs do Cloudflare
3. ✅ Confirmar webhook está registrando corretamente
4. ✅ Aguardar próxima quarta-feira para teste real
5. ✅ Compartilhar funcionalidade com clientes

---

**Status**: 🟢 **PRONTO PARA TESTES**  
**Última Atualização**: 07/03/2026  
**Commit**: b5e4843
