# 🔗 Links de Auto-Cadastro DeltaPag

## 📋 Visão Geral

Sistema completo para **gerar e gerenciar links de auto-cadastro** para assinaturas DeltaPag (cartão de crédito). Clientes podem se cadastrar sozinhos através de um link personalizado.

---

## ✨ Funcionalidades Implementadas

### 1️⃣ **Criar Link de Auto-Cadastro**
- ✅ Definir valor da assinatura
- ✅ Adicionar descrição do plano
- ✅ Escolher recorrência (Mensal, Semanal, Quinzenal, Trimestral, Semestral, Anual)
- ✅ Definir data de validade (em dias)
- ✅ Limite de usos (opcional)
- ✅ Link gerado automaticamente com ID único

### 2️⃣ **Visualizar Links Criados** 🆕
- ✅ Modal completo listando todos os links
- ✅ Copiar link com um clique
- ✅ Status visual (Ativo/Inativo)
- ✅ Estatísticas de cada link:
  - Quantidade de cadastros realizados
  - Data de criação
  - Data de validade
  - Valor e recorrência
- ✅ Botão para desativar link
- ✅ Empty state quando não há links

### 3️⃣ **Gerenciamento**
- ✅ Desativar links manualmente
- ✅ Links expiram automaticamente após data de validade
- ✅ Controle de limite de usos
- ✅ Histórico de cadastros por link

---

## 🎯 Como Usar

### **Criar um Link**

1. Acesse o **Dashboard → Card "Cartão Crédito"**
2. Clique no card roxo **"Criar Link"** (ícone 🔗)
3. Preencha o formulário:
   - **Valor**: R$ 99.90
   - **Descrição**: Plano Premium - Acesso completo
   - **Recorrência**: Mensal
   - **Validade**: 30 dias
   - **Limite de usos**: 100 (opcional)
4. Clique em **"Gerar Link"**
5. Link será criado e exibido para copiar

### **Visualizar Links Criados** 🆕

1. No **Dashboard → Card "Cartão Crédito"**
2. Clique no card azul **"Ver Links"** (ícone 📋)
3. Modal abrirá listando todos os links:

**Informações exibidas:**
```
┌─────────────────────────────────────────────────────────┐
│ Plano Premium - Acesso Completo           [✅ Ativo]    │
│ 💵 R$ 99.90 | 📅 Mensal | ⏰ Válido até 20/03/2026     │
├─────────────────────────────────────────────────────────┤
│ 🔗 Link: https://gerenciador.../deltapag-signup/abc123 │
│                                          [📋 Copiar]    │
├─────────────────────────────────────────────────────────┤
│ 👥 5 cadastros | 📅 Criado em 18/02/2026  [🚫 Desativar]│
└─────────────────────────────────────────────────────────┘
```

4. **Copiar link**: Clique no botão azul "Copiar"
5. **Desativar link**: Clique no botão vermelho "Desativar"

### **Compartilhar Link**

Depois de criar ou copiar o link:

1. **Email**: Envie para clientes via email
2. **WhatsApp**: Compartilhe diretamente
3. **Site**: Adicione botão de cadastro
4. **QR Code**: Gere QR code do link

**Exemplo de URL:**
```
https://gerenciador.corretoracorporate.com.br/deltapag-signup/550e8400-e29b-41d4-a716-446655440000
```

---

## 🎨 Interface do Cliente

Quando o cliente acessa o link, ele vê:

1. **Header bonito** (gradiente roxo/indigo)
2. **Formulário de cadastro**:
   - Nome completo
   - Email
   - CPF
   - Telefone
   - Dados do cartão:
     - Número do cartão
     - Nome no cartão
     - Validade (mês/ano)
     - CVV
3. **Informações do plano** (valor e recorrência)
4. **Botão "Ativar Assinatura"**
5. **Feedback visual** (loading, sucesso, erro)

---

## 🔧 Tecnologias

### **Frontend**
- Modal responsivo (Tailwind CSS)
- Font Awesome icons
- Axios para requisições
- Clipboard API para copiar links
- Animações suaves

### **Backend**
- **GET** `/api/deltapag/links` - Listar links (autenticado)
- **POST** `/api/deltapag/create-link` - Criar link (autenticado)
- **PATCH** `/api/deltapag/links/:id/deactivate` - Desativar link (autenticado)
- **GET** `/deltapag-signup/:linkId` - Página pública de cadastro

### **Banco de Dados** (Cloudflare D1)
Tabela `deltapag_signup_links`:
```sql
CREATE TABLE deltapag_signup_links (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  description TEXT NOT NULL,
  recurrence_type TEXT DEFAULT 'MONTHLY',
  valid_until DATE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 999,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 📊 Estatísticas e Monitoramento

### **Por Link**
- ✅ Total de cadastros realizados
- ✅ Data de criação
- ✅ Data de expiração
- ✅ Status (ativo/inativo)

### **Dashboard Geral**
- ✅ Total de assinaturas DeltaPag
- ✅ Assinaturas ativas
- ✅ Receita mensal recorrente
- ✅ Taxa de conversão

---

## 🔐 Segurança

- ✅ **Autenticação obrigatória** para criar/listar/desativar links
- ✅ **Validação de validade** (links expirados não funcionam)
- ✅ **Limite de usos** (previne abuso)
- ✅ **UUID único** (impossível adivinhar)
- ✅ **HTTPS obrigatório** (Cloudflare Pages)

---

## 🚀 Exemplos de Uso

### **Caso 1: Promoção Limitada**
```javascript
{
  value: 49.90,
  description: "Promoção de Lançamento - 50% OFF",
  recurrenceType: "MONTHLY",
  validDays: 7,
  maxUses: 50
}
```
→ Link válido por 7 dias, máximo 50 cadastros

### **Caso 2: Plano Corporativo**
```javascript
{
  value: 299.90,
  description: "Plano Empresarial - Ilimitado",
  recurrenceType: "YEARLY",
  validDays: 90,
  maxUses: 999
}
```
→ Link válido por 90 dias, sem limite prático

### **Caso 3: Trial Mensal**
```javascript
{
  value: 9.90,
  description: "Trial 30 dias - Acesso Básico",
  recurrenceType: "MONTHLY",
  validDays: 30,
  maxUses: 100
}
```
→ Link válido por 30 dias, máximo 100 trials

---

## 🐛 Tratamento de Erros

### **Link Não Encontrado**
```html
<h1>Link não encontrado ou expirado</h1>
```

### **Link Expirado**
```html
<h1>Este link expirou</h1>
<p>Entre em contato com o suporte para obter um novo link.</p>
```

### **Limite de Usos Atingido**
```json
{ "error": "Este link atingiu o limite de usos" }
```

### **Erro ao Criar Assinatura**
- Cartão inválido
- Erro na API DeltaPag
- CPF duplicado

---

## 📱 Responsividade

- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x812)
- ✅ Modal adaptável

---

## 🎯 Próximos Passos

### **Melhorias Planejadas**
- [ ] QR Code automático para cada link
- [ ] Analytics detalhado (taxa de conversão, origem)
- [ ] Email de boas-vindas automático
- [ ] Templates de email customizáveis
- [ ] Webhooks para notificações
- [ ] Teste A/B de landing pages

---

## 📊 Métricas de Sucesso

**Objetivos:**
- ⚡ **Conversão**: 30% dos visitantes completam cadastro
- 📈 **Escalabilidade**: Suportar 1000+ links simultâneos
- 🚀 **Performance**: Página carrega em < 2s
- ✅ **Confiabilidade**: 99.9% uptime

---

## 🌐 URLs Importantes

- **Produção**: https://gerenciador.corretoracorporate.com.br
- **Dashboard**: Dashboard → Cartão Crédito → Ver Links
- **Preview**: https://b5b3fff0.corretoracorporate.pages.dev
- **Exemplo de link**: /deltapag-signup/[uuid]

---

## 📞 Suporte

**Como testar:**
1. Limpe o cache do navegador
2. Faça login (admin / admin123)
3. Acesse Dashboard → Cartão Crédito
4. Clique em "Criar Link"
5. Preencha e gere o link
6. Clique em "Ver Links" para visualizar
7. Copie o link e teste em aba anônima

**Problemas comuns:**
- Cache antigo: Ctrl+Shift+R (hard reload)
- Modal não abre: Verifique console (F12)
- Links não aparecem: Aguarde 2 min (propagação Cloudflare)

---

## ✅ Status Final

🎉 **Sistema 100% funcional!**

- ✅ Criar links (testado)
- ✅ Visualizar links (testado)
- ✅ Copiar links (testado)
- ✅ Desativar links (testado)
- ✅ Página pública de cadastro (testado)
- ✅ Validação de expiração (testado)
- ✅ Contagem de usos (testado)

**Deploy atual:** https://b5b3fff0.corretoracorporate.pages.dev

**Última atualização:** 19/02/2026
**Versão JS:** deltapag-section.js v3.1
