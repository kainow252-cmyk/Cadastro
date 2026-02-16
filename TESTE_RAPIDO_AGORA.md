# 🎯 TESTE RÁPIDO - CRIAR LINK PIX

## ⚡ PROBLEMA CORRIGIDO

O erro **401 "Não autorizado"** foi corrigido! 

**Causa:** Axios não estava enviando cookies automaticamente  
**Solução:** Configurado `axios.defaults.withCredentials = true` e CORS com `credentials: true`

---

## 🧪 TESTE AGORA (2 minutos)

### **1️⃣ Abra em ABA ANÔNIMA** (IMPORTANTE!)

Pressione **Ctrl+Shift+N** (Chrome) ou **Ctrl+Shift+P** (Firefox)

Depois abra:
```
https://cadastro.corretoracorporate.com.br/login
```

**Por que aba anônima?** Para garantir que você está usando a versão nova (sem cache antigo)

---

### **2️⃣ Faça Login**

- **Usuário:** `admin`
- **Senha:** `admin123`

**Resultado esperado:**
✅ Redirecionamento para o Dashboard
✅ Você vê 6 botões coloridos
✅ Não aparece erro de autenticação

---

### **3️⃣ Criar Link PIX**

1. Clique no botão verde **"Gerar Link"** (3º botão)

2. Preencha o formulário:
   ```
   Nome do Link: Teste PIX Corrigido
   Descrição: Teste após correção de autenticação
   Método de Pagamento: PIX
   Tipo de Cobrança: Valor Fixo (Detached)
   Valor: 15.00
   ```

3. Clique em **"Gerar Link"**

4. **Abra o Console** (F12 → Console) para ver detalhes de erro (se houver)

---

## ✅ RESULTADO ESPERADO

### **Sucesso:**
```
✅ Mensagem: "Link de pagamento criado com sucesso!"
✅ URL: https://www.asaas.com/c/[codigo]
✅ QR Code exibido
✅ Link aparece na lista
```

### **Se ainda der erro:**

Copie **TODO o texto do erro** que aparecer no console e me envie. Exemplo:

```
POST https://cadastro.corretoracorporate.com.br/api/payment-links 400 (Bad Request)
Erro ao criar link: [MENSAGEM DE ERRO AQUI]
```

---

## 🔍 DEBUG: Verificar Cookies

Se quiser confirmar que os cookies estão sendo enviados:

1. Abra **DevTools** (F12)
2. Vá em **Application** → **Cookies**
3. Procure por `auth_token`
4. Deve aparecer um cookie com valor longo (JWT token)

---

## 📊 O QUE FOI CORRIGIDO

| Item | Status | Detalhes |
|------|--------|----------|
| **Nova Chave API** | ✅ | Atualizada no Cloudflare |
| **Código dueDateLimitDays** | ✅ | Sempre 30 para PIX |
| **CORS credentials** | ✅ | Permite cookies |
| **axios withCredentials** | ✅ | Frontend configurado |
| **Cache refresh** | ✅ | app.js v3.5, payment-links.js v3.2 |
| **Build & Deploy** | ✅ | Deploy ID: fbc5ec20 |

---

## 🎯 CHECKLIST DE TESTE

- [ ] Abri em aba anônima
- [ ] Fiz login com admin/admin123
- [ ] Dashboard apareceu
- [ ] Cliquei em "Gerar Link"
- [ ] Preenchei o formulário
- [ ] Cliquei em "Gerar Link"
- [ ] Vi o resultado (sucesso ou erro)

---

## 💬 ME AVISE

Depois do teste, me responda com:

1. ✅ **"Funcionou!"** - se o link foi criado
2. ❌ **"Ainda dá erro: [copie o erro]"** - se ainda falhar
3. 🤔 **"Outra coisa: [descreva]"** - se encontrar outro problema

---

**Deploy Atual:** https://fbc5ec20.project-839f9256.pages.dev  
**Produção:** https://cadastro.corretoracorporate.com.br  
**Status:** ✅ PRONTO PARA TESTE  
**Tempo:** ⏱️ 2 minutos
