# 🔗 Links Diretos para APIs de Relatórios por Status

## 📋 URLs Prontas para Usar

Copie e cole os links abaixo diretamente no seu sistema externo. **Lembre-se de adicionar o header `X-API-Key`**.

---

## 🟢 Pagamentos Recebidos (RECEIVED)

### Todos os pagamentos recebidos
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/received
```

### Com filtro de data (fevereiro/2026)
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28
```

### Apenas QR Code Avulso recebidos
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/received?chargeType=single
```

### Apenas Assinaturas Mensais recebidas
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/received?chargeType=monthly
```

---

## 🟡 Pagamentos Pendentes (PENDING)

### Todos os pagamentos pendentes
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/pending
```

### Com filtro de data (fevereiro/2026)
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?startDate=2026-02-01&endDate=2026-02-28
```

### Apenas QR Code Avulso pendentes
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?chargeType=single
```

### Apenas Assinaturas Mensais pendentes
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?chargeType=monthly
```

---

## 🔴 Pagamentos Vencidos (OVERDUE)

### Todos os pagamentos vencidos
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue
```

### Com filtro de data (fevereiro/2026)
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?startDate=2026-02-01&endDate=2026-02-28
```

### Apenas QR Code Avulso vencidos
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?chargeType=single
```

### Apenas Assinaturas Mensais vencidas
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?chargeType=monthly
```

---

## ⚪ Pagamentos Reembolsados (REFUNDED)

### Todos os pagamentos reembolsados
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded
```

### Com filtro de data (fevereiro/2026)
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?startDate=2026-02-01&endDate=2026-02-28
```

### Apenas QR Code Avulso reembolsados
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?chargeType=single
```

### Apenas Assinaturas Mensais reembolsadas
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/refunded?chargeType=monthly
```

---

## 🔐 Como Usar os Links

### 1. No Terminal / Shell
```bash
# Exemplo: Buscar pagamentos recebidos
curl -H "X-API-Key: demo-key-123" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/received"
```

### 2. No Postman
1. Abra o Postman
2. Crie uma nova requisição GET
3. Cole a URL desejada
4. Vá em "Headers"
5. Adicione:
   - Key: `X-API-Key`
   - Value: `demo-key-123` (desenvolvimento) ou sua API Key real (produção)
6. Clique em "Send"

### 3. No JavaScript/Node.js
```javascript
const response = await fetch(
  'https://corretoracorporate.pages.dev/api/reports/all-accounts/received',
  {
    headers: {
      'X-API-Key': 'demo-key-123'
    }
  }
)
const data = await response.json()
console.log(data)
```

### 4. No Python
```python
import requests

url = "https://corretoracorporate.pages.dev/api/reports/all-accounts/received"
headers = {
    "X-API-Key": "demo-key-123"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)
```

### 5. No PHP
```php
<?php
$url = "https://corretoracorporate.pages.dev/api/reports/all-accounts/received";
$headers = array(
    "X-API-Key: demo-key-123"
);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data);
?>
```

### 6. No Excel / Power Query
```
1. Dados → Obter Dados → Da Web
2. Cole a URL desejada
3. Clique em "Avançado"
4. Em "Cabeçalhos HTTP", adicione:
   X-API-Key: demo-key-123
5. Clique em "OK"
```

---

## 📊 Filtros Disponíveis

Todos os links acima aceitam os seguintes parâmetros de query:

| Parâmetro | Formato | Exemplo | Descrição |
|-----------|---------|---------|-----------|
| `startDate` | YYYY-MM-DD | `2026-02-01` | Data inicial |
| `endDate` | YYYY-MM-DD | `2026-02-28` | Data final |
| `chargeType` | string | `monthly` | Tipo de cobrança |

### Valores de `chargeType`:
- `all` - Todos os tipos (padrão)
- `single` - QR Code Avulso
- `monthly` - Assinatura Mensal
- `pix_auto` - PIX Automático
- `link_cadastro` - Link Auto-Cadastro

### Exemplos de Combinação:
```
# Recebidos em fevereiro/2026, apenas mensais
https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=2026-02-01&endDate=2026-02-28&chargeType=monthly

# Pendentes desde 01/02/2026, apenas PIX automático
https://corretoracorporate.pages.dev/api/reports/all-accounts/pending?startDate=2026-02-01&chargeType=pix_auto

# Vencidos até 28/02/2026, todos os tipos
https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue?endDate=2026-02-28
```

---

## 🎯 Casos de Uso Práticos

### 1. Dashboard Externo em Tempo Real
```javascript
// Atualizar dashboard a cada 5 minutos
setInterval(async () => {
  const recebidos = await fetch(
    'https://corretoracorporate.pages.dev/api/reports/all-accounts/received',
    { headers: { 'X-API-Key': 'sua-api-key' } }
  ).then(r => r.json())
  
  document.getElementById('total-recebido').textContent = 
    `R$ ${recebidos.data.summary.totalValue.toFixed(2)}`
}, 5 * 60 * 1000)
```

### 2. Alerta de Pagamentos Vencidos (Email/SMS)
```javascript
// Verificar vencidos a cada hora
setInterval(async () => {
  const vencidos = await fetch(
    'https://corretoracorporate.pages.dev/api/reports/all-accounts/overdue',
    { headers: { 'X-API-Key': 'sua-api-key' } }
  ).then(r => r.json())
  
  if (vencidos.data.summary.totalTransactions > 0) {
    // Enviar alerta por email/SMS
    sendAlert(`${vencidos.data.summary.totalTransactions} pagamentos vencidos!`)
  }
}, 60 * 60 * 1000)
```

### 3. Relatório Diário Automático
```javascript
// Executar todo dia às 23:59
const hoje = new Date().toISOString().split('T')[0]

const relatorio = await fetch(
  `https://corretoracorporate.pages.dev/api/reports/all-accounts/received?startDate=${hoje}&endDate=${hoje}`,
  { headers: { 'X-API-Key': 'sua-api-key' } }
).then(r => r.json())

// Gerar PDF e enviar por email
gerarPDFeEnviar(relatorio)
```

### 4. Integração com Google Sheets
```javascript
// Google Apps Script
function atualizarPlanilha() {
  const url = 'https://corretoracorporate.pages.dev/api/reports/all-accounts/received'
  const options = {
    'method': 'get',
    'headers': {
      'X-API-Key': 'demo-key-123'
    }
  }
  
  const response = UrlFetchApp.fetch(url, options)
  const data = JSON.parse(response.getContentText())
  
  // Escrever dados na planilha
  const sheet = SpreadsheetApp.getActiveSheet()
  sheet.getRange('A1').setValue(`Total Recebido: R$ ${data.data.summary.totalValue}`)
}
```

---

## ⚙️ Configuração de Produção

### 1. Gerar API Key Segura
```bash
# Gerar chave aleatória de 32 caracteres
openssl rand -base64 32
```

### 2. Configurar no Cloudflare Pages
```bash
npx wrangler pages secret put EXTERNAL_API_KEY --project-name corretoracorporate

# Digite a chave gerada quando solicitado
```

### 3. Usar a Chave nos Links
```bash
# Substitua "demo-key-123" pela sua chave real
curl -H "X-API-Key: SUA_CHAVE_SEGURA_AQUI" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/received"
```

---

## 📱 Testar Agora Mesmo

### Link Rápido para Teste:
```
https://corretoracorporate.pages.dev/api/reports/all-accounts/received
```

**Teste no navegador:**
1. Instale a extensão "ModHeader" (Chrome/Firefox)
2. Adicione header: `X-API-Key: demo-key-123`
3. Acesse o link acima
4. Veja o JSON na tela

**Teste no terminal:**
```bash
curl -H "X-API-Key: demo-key-123" \
  "https://corretoracorporate.pages.dev/api/reports/all-accounts/received"
```

---

## 🔗 Links Úteis

- **Documentação Completa**: [API_RELATORIOS_EXTERNOS.md](./API_RELATORIOS_EXTERNOS.md)
- **Repositório GitHub**: https://github.com/kainow252-cmyk/Cadastro
- **App em Produção**: https://corretoracorporate.pages.dev

---

## 📞 Suporte

Se tiver dúvidas sobre como usar os links:

1. Consulte a [documentação completa](./API_RELATORIOS_EXTERNOS.md)
2. Verifique os exemplos de código acima
3. Teste com `curl` no terminal primeiro
4. Use API Key `demo-key-123` para testes

---

**Última atualização:** 21/02/2026  
**Status:** ✅ Todos os links funcionando em produção
