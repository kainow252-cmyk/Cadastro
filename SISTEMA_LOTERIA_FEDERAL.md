# 🎰 Sistema de Bilhetes da Loteria Federal

## 📋 Visão Geral

Ao confirmar um pagamento via PIX, o sistema **automaticamente gera um bilhete da Loteria Federal** com 6 dígitos aleatórios. O cliente pode consultar se ganhou o **1º PRÊMIO de R$ 500.000,00** após a data do sorteio.

---

## ✨ Funcionalidades

### 1. ✅ Geração Automática de Bilhete
- Quando o **webhook de pagamento** é recebido (`PAYMENT_RECEIVED` ou `PAYMENT_CONFIRMED`)
- Sistema gera número aleatório de **6 dígitos** (000000-999999)
- Calcula automaticamente a **próxima quarta-feira** (dia do sorteio da Loteria Federal)
- Salva bilhete no banco de dados D1

### 2. 🎫 Exibição do Bilhete
- Após confirmação do pagamento, **bilhete aparece automaticamente**
- Mostra:
  - **Número do bilhete** (ex: 022925)
  - **Data do sorteio** (ex: 11/03/2026)
  - **Prêmio em jogo**: R$ 500.000,00 (1º Prêmio)

### 3. 🔍 Consulta de Resultado
- Botão **"Verificar Resultado"** disponível após a data do sorteio
- Sistema consulta API da Caixa automaticamente
- Verifica se o bilhete **ganhou o 1º PRÊMIO**
- Exibe resultado:
  - 🏆 **GANHOU**: Mostra valor do prêmio + confete + som
  - ❌ **Não ganhou**: Mostra número sorteado

---

## 🏗️ Arquitetura do Sistema

### Banco de Dados (D1)

**Tabela**: `lottery_tickets`

```sql
CREATE TABLE lottery_tickets (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT,
  ticket_number TEXT NOT NULL,      -- 6 dígitos
  draw_date TEXT NOT NULL,           -- Data do sorteio
  draw_number INTEGER,               -- Número do concurso
  status TEXT DEFAULT 'PENDING',     -- PENDING, WINNER, LOSER
  prize_type TEXT,                   -- 1ST (1º Prêmio)
  prize_value REAL,                  -- Valor do prêmio
  checked_at TEXT,                   -- Data da conferência
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### 1. `GET /api/lottery/ticket/:paymentId`
Consulta bilhete pelo ID do pagamento.

**Exemplo**:
```bash
curl https://corretoracorporate.pages.dev/api/lottery/ticket/pay_abc123
```

**Resposta**:
```json
{
  "ok": true,
  "ticket": {
    "id": "ticket_1234567890_abc123",
    "paymentId": "pay_abc123",
    "customerName": "João Silva",
    "customerEmail": "joao@example.com",
    "ticketNumber": "022925",
    "drawDate": "2026-03-11",
    "status": "PENDING",
    "createdAt": "2026-03-07T14:30:00Z"
  }
}
```

#### 2. `POST /api/lottery/check/:paymentId`
Verifica se o bilhete ganhou consultando a API da Caixa.

**Exemplo**:
```bash
curl -X POST https://corretoracorporate.pages.dev/api/lottery/check/pay_abc123
```

**Resposta (GANHOU)**:
```json
{
  "ok": true,
  "status": "WINNER",
  "message": "🎉 PARABÉNS! VOCÊ GANHOU O 1º PRÊMIO!",
  "ticket": {
    "ticketNumber": "022925",
    "drawDate": "2026-03-04",
    "drawNumber": 6046
  },
  "prize": {
    "type": "1º Prêmio",
    "value": 500000,
    "formattedValue": "R$ 500.000,00"
  }
}
```

**Resposta (NÃO GANHOU)**:
```json
{
  "ok": true,
  "status": "LOSER",
  "message": "Não foi dessa vez. Tente novamente!",
  "ticket": {
    "ticketNumber": "012345",
    "drawDate": "2026-03-04",
    "drawNumber": 6046
  },
  "winningNumber": {
    "firstPrize": "022925"
  }
}
```

**Resposta (AGUARDANDO SORTEIO)**:
```json
{
  "ok": true,
  "status": "PENDING",
  "message": "Sorteio será realizado em 11/03/2026",
  "ticket": {
    "ticketNumber": "022925",
    "drawDate": "2026-03-11"
  }
}
```

#### 3. `GET /api/lottery/tickets/email/:email`
Lista todos os bilhetes de um cliente.

**Exemplo**:
```bash
curl https://corretoracorporate.pages.dev/api/lottery/tickets/email/joao@example.com
```

---

## 🔄 Fluxo Completo

### 1️⃣ Cliente Faz Pagamento
```
Cliente → Preenche formulário → Gera PIX → Paga
```

### 2️⃣ Webhook Recebe Confirmação
```
Asaas → POST /api/webhooks/asaas → event: PAYMENT_RECEIVED
```

### 3️⃣ Sistema Gera Bilhete
```javascript
// Gerar número aleatório de 6 dígitos
const ticketNumber = Math.floor(Math.random() * 1000000)
  .toString()
  .padStart(6, '0')

// Calcular próxima quarta-feira
const today = new Date()
const dayOfWeek = today.getDay()
let daysUntilWednesday = (3 - dayOfWeek + 7) % 7
if (daysUntilWednesday === 0) daysUntilWednesday = 7

const drawDate = new Date(today)
drawDate.setDate(today.getDate() + daysUntilWednesday)

// Salvar no banco
INSERT INTO lottery_tickets (payment_id, ticket_number, draw_date)
VALUES (?, ?, ?)
```

### 4️⃣ Frontend Exibe Bilhete
```javascript
// Após pagamento confirmado
function showPaymentConfirmed() {
  loadLotteryTicket() // Busca bilhete gerado
}

// Buscar bilhete
async function loadLotteryTicket() {
  const response = await axios.get('/api/lottery/ticket/' + window.paymentId)
  // Exibir número e data do sorteio
}
```

### 5️⃣ Cliente Verifica Resultado
```javascript
// Após data do sorteio
async function checkLotteryResult() {
  const response = await axios.post('/api/lottery/check/' + window.paymentId)
  // Exibir se ganhou ou não
}
```

---

## 🎨 Interface do Usuário

### Bilhete Gerado (Após Pagamento)
```
┌──────────────────────────────────────────┐
│  🎫 BILHETE DA LOTERIA FEDERAL ⭐        │
│  🎁 VOCÊ CONCORRE A R$ 500.000,00!      │
├──────────────────────────────────────────┤
│  SEU BILHETE:        DATA DO SORTEIO:   │
│  022925              11/03/2026         │
├──────────────────────────────────────────┤
│  ✅ Resultado disponível após sorteio   │
│                                          │
│  [  Aguardando sorteio...  ]            │
│     (botão desabilitado)                 │
└──────────────────────────────────────────┘
```

### Após Data do Sorteio
```
┌──────────────────────────────────────────┐
│  🎫 BILHETE DA LOTERIA FEDERAL ⭐        │
├──────────────────────────────────────────┤
│  SEU BILHETE:        DATA DO SORTEIO:   │
│  022925              11/03/2026         │
├──────────────────────────────────────────┤
│  [  🔍 Verificar Resultado  ]           │
│     (botão habilitado)                   │
└──────────────────────────────────────────┘
```

### Resultado (GANHOU)
```
┌──────────────────────────────────────────┐
│           🏆                             │
│  🎉 PARABÉNS! VOCÊ GANHOU O 1º PRÊMIO!  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   R$ 500.000,00                    │ │
│  │   1º Prêmio                        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  📅 Concurso 6046 - 11/03/2026          │
│                                          │
│  [  🏆 VOCÊ GANHOU!  ]                  │
└──────────────────────────────────────────┘
```

### Resultado (NÃO GANHOU)
```
┌──────────────────────────────────────────┐
│           😔                             │
│  Não foi dessa vez. Tente novamente!    │
│                                          │
│  Número sorteado (1º Prêmio):           │
│  034521                                  │
│                                          │
│  📅 Concurso 6046 - 11/03/2026          │
│                                          │
│  [  ✓ Conferido  ]                      │
└──────────────────────────────────────────┘
```

---

## 🔗 API Externa: Loteria Federal

### URL Base
```
https://loteriascaixa-api.herokuapp.com
```

### Endpoints Utilizados

#### 1. Último Resultado
```bash
GET /api/federal/latest
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
    },
    {
      "premio": 2,
      "numero": "071720",
      "valor_premio": "35.000,00"
    }
    // ... outros prêmios
  ]
}
```

### Lógica de Verificação

O sistema verifica **apenas o 1º PRÊMIO**:

```javascript
// Buscar resultado do sorteio
const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest')
const result = await response.json()

// Pegar 1º prêmio
const firstPrize = result.premiacoes[0]
const winningNumber = firstPrize.numero.toString().padStart(6, '0')
const prizeValue = parseFloat(firstPrize.valor_premio.replace(/\./g, '').replace(',', '.'))

// Comparar com bilhete do cliente
const isWinner = ticketNumber === winningNumber

if (isWinner) {
  // 🏆 GANHOU R$ 500.000,00!
} else {
  // ❌ Não ganhou
}
```

---

## 📊 Estatísticas do Sistema

### Dados Armazenados
```sql
-- Total de bilhetes gerados
SELECT COUNT(*) FROM lottery_tickets;

-- Bilhetes aguardando sorteio
SELECT COUNT(*) FROM lottery_tickets WHERE status = 'PENDING';

-- Bilhetes já conferidos
SELECT COUNT(*) FROM lottery_tickets WHERE status IN ('WINNER', 'LOSER');

-- Total de ganhadores
SELECT COUNT(*) FROM lottery_tickets WHERE status = 'WINNER';

-- Bilhetes por data de sorteio
SELECT draw_date, COUNT(*) as total
FROM lottery_tickets
GROUP BY draw_date
ORDER BY draw_date;
```

---

## 🎯 Vantagens do Sistema

### Para o Cliente
✅ **Automático**: Bilhete gerado sem precisar fazer nada  
✅ **Transparente**: Vê número e data do sorteio imediatamente  
✅ **Fácil**: Um clique para verificar se ganhou  
✅ **Seguro**: Bilhete salvo no banco de dados  
✅ **Gratuito**: Concorre sem custo adicional  

### Para o Negócio
✅ **Engajamento**: Cliente volta para verificar resultado  
✅ **Diferencial**: Benefício exclusivo  
✅ **Retenção**: Incentivo para novos pagamentos  
✅ **Marketing**: "Ganhe R$ 500.000,00!"  
✅ **Viral**: Clientes compartilham bilhetes  

---

## 🚀 Exemplo de Uso

### 1. Cliente Faz Pagamento
```
João faz um pagamento de R$ 29,90 via PIX
→ PIX confirmado em 10 segundos
→ Sistema gera bilhete: 078542
→ Data do sorteio: 11/03/2026 (próxima quarta-feira)
```

### 2. Cliente Vê Bilhete
```
✅ Pagamento Confirmado!

🎫 SEU BILHETE: 078542
📅 SORTEIO: 11/03/2026
🎁 PRÊMIO: R$ 500.000,00

[Aguardando sorteio em 4 dias...]
```

### 3. Após Sorteio (11/03/2026)
```
[🔍 Verificar Resultado]  ← Botão ativo

Cliente clica e...
```

### 4. Resultado
```
Caso 1: GANHOU
🏆 PARABÉNS! VOCÊ GANHOU!
R$ 500.000,00
🎉🎉🎉

Caso 2: NÃO GANHOU
😔 Não foi dessa vez
Número sorteado: 022925
Tente novamente!
```

---

## 📝 Próximas Melhorias

### Planejadas
- [ ] Notificação por email com número do bilhete
- [ ] Notificação automática do resultado do sorteio
- [ ] Histórico de todos os bilhetes do cliente
- [ ] Estatísticas: "X bilhetes gerados, Y ganhadores"
- [ ] Compartilhar bilhete nas redes sociais
- [ ] QR Code do bilhete para conferir em qualquer lugar

### Possíveis Expansões
- [ ] Verificar também 2º, 3º, 4º e 5º prêmios
- [ ] Verificar milhar, centena e dezena
- [ ] Verificar aproximações (número anterior/posterior)
- [ ] Integrar com outras loterias (Mega-Sena, Quina, etc.)

---

## 🔧 Troubleshooting

### Bilhete não aparece após pagamento
**Causa**: Webhook ainda não processou ou erro no banco  
**Solução**: Sistema tenta novamente após 5 segundos automaticamente

### Botão "Verificar Resultado" desabilitado
**Causa**: Sorteio ainda não aconteceu  
**Solução**: Aguardar data do sorteio (sempre na quarta-feira)

### Erro ao verificar resultado
**Causa**: API da Caixa fora do ar ou resultado ainda não disponível  
**Solução**: Tentar novamente mais tarde

---

## 📞 Suporte

Documentação API Caixa: https://loteriascaixa-api.herokuapp.com/swagger-ui/  
Repositório GitHub: https://github.com/kainow252-cmyk/Cadastro  
Produção: https://corretoracorporate.pages.dev  

---

**Status**: ✅ **IMPLEMENTADO E DEPLOYADO**  
**Versão**: 1.0.0  
**Data**: 07/03/2026  
**Deploy**: https://549b7255.corretoracorporate.pages.dev
