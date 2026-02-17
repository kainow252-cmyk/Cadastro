# 🎯 Fluxo de Auto-Cadastro PIX - Assinatura Mensal Automática

## 📋 Visão Geral

Sistema completo de **auto-cadastro** onde o cliente escaneia um QR Code, preenche seus dados, paga a primeira parcela e automaticamente fica com uma **assinatura mensal recorrente com Split 80/20**.

---

## 🔄 Fluxo Completo

### 1️⃣ **Corretor Gera Link de Auto-Cadastro**

**Ação:** No painel de subcontas, o corretor clica no botão **"Link Auto-Cadastro"** (laranja)

**Campos obrigatórios:**
- ✅ Valor mensal (ex: R$ 50,00)
- ✅ Descrição (ex: "Mensalidade")

**Resultado:**
- ✅ Link único gerado (válido por 30 dias)
- ✅ QR Code gerado automaticamente
- ✅ Link pode ser compartilhado por WhatsApp, Email, SMS, etc.

**Endpoint:** `POST /api/pix/subscription-link`

```json
{
  "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
  "accountId": "e59d37d7-2f9b-462c-b1c1-c730322c8236",
  "value": 50.00,
  "description": "Mensalidade"
}
```

**Resposta:**
```json
{
  "ok": true,
  "data": {
    "linkId": "550e8400-e29b-41d4-a716-446655440000",
    "linkUrl": "https://seu-dominio.com/subscription-signup/550e8400-e29b-41d4-a716-446655440000",
    "qrCodeData": "https://seu-dominio.com/subscription-signup/...",
    "value": 50.00,
    "description": "Mensalidade",
    "expiresAt": "2026-03-20T00:00:00.000Z",
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "accountId": "e59d37d7-2f9b-462c-b1c1-c730322c8236"
  }
}
```

---

### 2️⃣ **Cliente Escaneia QR Code**

**Ação:** Cliente escaneia o QR Code gerado pelo corretor

**Resultado:**
- ✅ Abre página pública de auto-cadastro
- ✅ Exibe valor mensal e descrição
- ✅ Formulário para preenchimento de dados

**URL:** `/subscription-signup/:linkId`

**Página Pública:** `public/static/subscription-signup.html`

---

### 3️⃣ **Cliente Preenche Dados**

**Campos obrigatórios:**
- ✅ Nome Completo (ex: "João da Silva")
- ✅ E-mail (ex: "joao@email.com")
- ✅ CPF (apenas números, 11 dígitos)

**Validações:**
- ✅ CPF formatado automaticamente (000.000.000-00)
- ✅ Email válido
- ✅ Nome completo

**Confirmação:**
- ✅ Cliente visualiza valor mensal que será debitado
- ✅ Autoriza débito automático mensal

---

### 4️⃣ **Sistema Cria Assinatura Automaticamente**

**Endpoint:** `POST /api/pix/subscription-signup/:linkId`

**Processo:**
1. ✅ Buscar link no banco de dados
2. ✅ Validar expiração (30 dias)
3. ✅ Buscar ou criar cliente na API Asaas
4. ✅ Criar assinatura mensal com split 80/20
5. ✅ Buscar primeiro pagamento
6. ✅ Gerar QR Code PIX para primeira parcela
7. ✅ Registrar conversão no banco
8. ✅ Incrementar contador de usos do link

**Request:**
```json
{
  "customerName": "João da Silva",
  "customerEmail": "joao@email.com",
  "customerCpf": "12345678900"
}
```

**Response:**
```json
{
  "ok": true,
  "subscription": {
    "id": "sub_123456",
    "status": "ACTIVE",
    "value": 50.00,
    "cycle": "MONTHLY",
    "nextDueDate": "2026-03-17",
    "description": "Mensalidade"
  },
  "firstPayment": {
    "id": "pay_123456",
    "status": "PENDING",
    "dueDate": "2026-03-17",
    "invoiceUrl": "https://...",
    "pix": {
      "payload": "00020126...",
      "qrCodeBase64": "data:image/png;base64,...",
      "expirationDate": "2026-03-17"
    }
  },
  "splitConfig": {
    "subAccount": 20,
    "mainAccount": 80
  }
}
```

---

### 5️⃣ **Cliente Paga Primeira Parcela**

**Ação:** Cliente escaneia QR Code PIX gerado

**Resultado:**
- ✅ Pagamento de R$ 50,00 (primeira parcela)
- ✅ **Split aplicado:**
  - 💰 R$ 10,00 (20%) → Subconta (Corretor)
  - 💰 R$ 40,00 (80%) → Conta Principal (Empresa)

**QR Code:**
- ✅ Exibido na tela de sucesso
- ✅ PIX Copia e Cola disponível
- ✅ Botão para copiar payload

---

### 6️⃣ **Assinatura Mensal Ativa**

**Resultado final:**
- ✅ Assinatura criada com status `ACTIVE`
- ✅ Próxima cobrança: 1 mês após o pagamento
- ✅ **Todos os meses:**
  - 📅 Novo PIX gerado automaticamente
  - 💰 Split 80/20 aplicado automaticamente
  - 📧 Cliente recebe email com o PIX do mês
  - 🔄 Débito recorrente sem necessidade de novo cadastro

---

## 🗄️ Banco de Dados

### Tabela: `subscription_signup_links`

```sql
CREATE TABLE subscription_signup_links (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  value REAL NOT NULL,
  description TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL
);
```

### Tabela: `subscription_conversions`

```sql
CREATE TABLE subscription_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  FOREIGN KEY (link_id) REFERENCES subscription_signup_links(id)
);
```

---

## 🎨 Interface do Usuário

### Painel do Corretor

**Novo botão:** "Link Auto-Cadastro" (laranja/vermelho)

**Funcionalidades:**
1. ✅ Gerar link de auto-cadastro
2. ✅ Visualizar QR Code gerado
3. ✅ Copiar link para compartilhar
4. ✅ Baixar QR Code como imagem
5. ✅ Ver data de expiração (30 dias)

### Página Pública do Cliente

**URL:** `/subscription-signup/:linkId`

**Elementos:**
1. ✅ Header com valor mensal destacado
2. ✅ Formulário de cadastro (nome, email, CPF)
3. ✅ Informações sobre pagamento automático
4. ✅ Botão "Confirmar e Gerar PIX"
5. ✅ Tela de sucesso com QR Code PIX
6. ✅ Instruções passo a passo
7. ✅ Detalhes do split (80/20)

---

## 💰 Split Automático 80/20

### Configuração

**Toda cobrança mensal aplica:**
- 🟦 **20%** → Subconta (Corretor/Afiliado)
- 🟩 **80%** → Conta Principal (Empresa)

### Exemplo: Mensalidade R$ 50,00

| Parcela | Valor Total | Subconta (20%) | Conta Principal (80%) |
|---------|-------------|----------------|----------------------|
| 1ª      | R$ 50,00    | R$ 10,00      | R$ 40,00            |
| 2ª      | R$ 50,00    | R$ 10,00      | R$ 40,00            |
| 3ª      | R$ 50,00    | R$ 10,00      | R$ 40,00            |
| ...     | ...         | ...           | ...                 |

**Total em 12 meses:**
- 💰 Subconta recebe: **R$ 120,00**
- 💰 Conta Principal recebe: **R$ 480,00**

---

## 🚀 Como Usar

### Passo 1: Login no Painel
```
URL: https://seu-dominio.com
User: admin
Pass: admin123
```

### Passo 2: Acessar Subcontas
- Clicar em "Subcontas" no menu

### Passo 3: Gerar Link
1. Encontrar a subconta desejada
2. Clicar no botão **"Link Auto-Cadastro"** (laranja)
3. Preencher:
   - Valor mensal (ex: R$ 50,00)
   - Descrição (ex: "Mensalidade")
4. Clicar em **"Gerar Link e QR Code"**

### Passo 4: Compartilhar
- Copiar link gerado
- OU baixar QR Code
- Compartilhar com cliente via:
  - WhatsApp
  - Email
  - SMS
  - Redes sociais
  - Portal do cliente

### Passo 5: Cliente se Cadastra
1. Cliente escaneia QR Code
2. Preenche nome, email e CPF
3. Confirma e gera PIX
4. Paga primeira parcela
5. **Pronto!** Assinatura ativa

---

## 📊 Relatórios e Acompanhamento

### Conversões

Consultar conversões de um link específico:

```sql
SELECT * FROM subscription_conversions 
WHERE link_id = 'link-id-aqui'
ORDER BY converted_at DESC;
```

### Links Ativos

Listar links ativos:

```sql
SELECT 
  id,
  value,
  description,
  uses_count,
  expires_at,
  created_at
FROM subscription_signup_links 
WHERE active = 1 
  AND expires_at > datetime('now')
ORDER BY created_at DESC;
```

---

## 🔒 Segurança

### Validações

1. ✅ Link expira em 30 dias
2. ✅ Link pode ser desativado manualmente
3. ✅ CPF validado (11 dígitos numéricos)
4. ✅ Email validado
5. ✅ Limite opcional de usos por link
6. ✅ Registro de todas as conversões

### Endpoint Público

- ✅ `/subscription-signup/:linkId` é público
- ✅ Não requer autenticação
- ✅ Validação de expiração do link
- ✅ Validação de dados do cliente

---

## 🎯 Vantagens do Sistema

### Para o Corretor
1. ✅ **Automação total** - Cliente se cadastra sozinho
2. ✅ **Redução de trabalho manual** - Sem necessidade de coletar dados
3. ✅ **Compartilhamento fácil** - Um QR Code para tudo
4. ✅ **Rastreamento** - Saber quantos clientes usaram o link
5. ✅ **Receita recorrente** - 20% de cada mensalidade automaticamente

### Para o Cliente
1. ✅ **Processo simples** - 3 campos apenas
2. ✅ **Pagamento rápido** - PIX gerado na hora
3. ✅ **Controle total** - Pode cancelar a qualquer momento
4. ✅ **Praticidade** - Não precisa pagar todo mês manualmente
5. ✅ **Notificações** - Recebe email com PIX do mês

### Para a Empresa
1. ✅ **Redução de inadimplência** - Pagamento automático
2. ✅ **Fluxo de caixa previsível** - Receita recorrente
3. ✅ **Escalabilidade** - Infinitos links podem ser criados
4. ✅ **Split automático** - 80% garantidos
5. ✅ **Sem integração externa** - Tudo no Asaas

---

## 🐛 Tratamento de Erros

### Link Inválido ou Expirado
```json
{
  "error": "Link não encontrado ou expirado"
}
```

### Dados Incompletos
```json
{
  "error": "Nome, email e CPF são obrigatórios"
}
```

### Erro ao Criar Cliente
```json
{
  "error": "Erro ao criar cadastro",
  "details": { /* detalhes da API Asaas */ }
}
```

### Erro ao Criar Assinatura
```json
{
  "error": "Erro ao criar assinatura",
  "details": { /* detalhes da API Asaas */ }
}
```

---

## 📱 Exemplo de Compartilhamento

### WhatsApp
```
Olá! 👋

Para ativar sua assinatura mensal de R$ 50,00, basta seguir estes passos:

1️⃣ Clique no link: https://seu-dominio.com/subscription-signup/550e8400...
2️⃣ Preencha seus dados (nome, email, CPF)
3️⃣ Pague a primeira parcela via PIX

✅ Pronto! Sua assinatura mensal será ativada automaticamente
📅 Todo mês você receberá um PIX por email
💰 Valor fixo: R$ 50,00/mês

Qualquer dúvida, estou à disposição!
```

### Email
```html
<h2>Ative sua Assinatura Mensal</h2>
<p>Valor: <strong>R$ 50,00/mês</strong></p>

<p>Para ativar, basta:</p>
<ol>
  <li>Clicar no link ou escanear o QR Code abaixo</li>
  <li>Preencher seus dados</li>
  <li>Pagar a primeira parcela</li>
</ol>

<a href="https://seu-dominio.com/subscription-signup/550e8400...">
  Clique aqui para se cadastrar
</a>

<img src="qrcode.png" alt="QR Code" />
```

---

## 🎉 Resultado Final

✅ **Sistema 100% funcional**
- Cliente se cadastra sozinho
- Assinatura mensal criada automaticamente
- Split 80/20 aplicado em todas as mensalidades
- QR Code gerado automaticamente
- Link compartilhável por qualquer canal

🚀 **Pronto para produção!**

---

## 📄 Versão

**Versão:** 5.0  
**Data:** 17/02/2026  
**Status:** ✅ Implementado e testado  
**Tecnologias:** Hono + TypeScript + Cloudflare D1 + Asaas API
