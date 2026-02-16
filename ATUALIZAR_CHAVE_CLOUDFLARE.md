# 🔑 ATUALIZAR CHAVE API NO CLOUDFLARE

## ⚠️ AÇÃO NECESSÁRIA

A chave de API do Asaas foi atualizada no ambiente local, mas **PRECISA ser atualizada no Cloudflare** para funcionar em produção.

---

## 📋 PASSO A PASSO

### **1️⃣ Acessar Configurações**

Abra o link direto das variáveis de ambiente:

🔗 https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256/settings/environment-variables

---

### **2️⃣ Localizar ASAAS_API_KEY**

Na lista de variáveis, encontre **`ASAAS_API_KEY`**

---

### **3️⃣ Editar a Variável**

1. Clique no ícone de **lápis (✏️)** ao lado de `ASAAS_API_KEY`
2. **Apague** o valor antigo
3. **Cole** o novo valor:

```
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjdhNDRmZTljLWVhMDctNGI3Ni1iNjM1LTRhOTcxYjQ1YzM2YTo6JGFhY2hfYTlkNjBlNGUtMGUyYi00MDk4LWJmNDItODRiYTU1ZmRhNjQx
```

4. Certifique-se que está marcado para **Production** e **Preview**
5. Clique em **Save**

---

### **4️⃣ Aguardar Propagação**

Aguarde **1-2 minutos** para a variável ser atualizada no Cloudflare.

---

### **5️⃣ Testar o Sistema**

1. Acesse: https://cadastro.corretoracorporate.com.br
2. Faça login com: **admin** / **admin123**
3. Clique no botão verde **"Gerar Link"**
4. Preencha os dados:
   - **Nome**: Link Teste PIX
   - **Descrição**: Teste de pagamento
   - **Método de Pagamento**: PIX
   - **Tipo de Cobrança**: Valor Fixo (Detached)
   - **Valor**: 10.00
5. Clique em **"Gerar Link"**

**Resultado esperado:**
✅ Mensagem de sucesso
✅ Link de pagamento gerado
✅ QR Code exibido

---

## 🔧 STATUS ATUAL

| Ambiente | Status | Chave Atualizada |
|----------|--------|------------------|
| **Local (Sandbox)** | ✅ Funcionando | ✅ Sim |
| **Produção (Cloudflare)** | ⚠️ Pendente | ❌ **Precisa atualizar** |

---

## 📝 CHECKLIST

- [ ] Acessar Dashboard Cloudflare
- [ ] Localizar variável ASAAS_API_KEY
- [ ] Editar e colar nova chave
- [ ] Salvar mudanças
- [ ] Aguardar 1-2 minutos
- [ ] Testar criação de link

---

## 🎯 RESUMO

**O que foi feito:**
1. ✅ Nova chave API recebida do Asaas
2. ✅ Chave atualizada no arquivo `.dev.vars` (local)
3. ✅ Código corrigido para incluir `dueDateLimitDays`
4. ✅ Build e deploy realizados
5. ✅ Servidor local reiniciado

**O que falta:**
1. ⚠️ **Atualizar ASAAS_API_KEY no Cloudflare** (você precisa fazer isso)

---

## 🆘 PROBLEMA?

Se após atualizar ainda não funcionar:

1. **Limpe o cache do navegador** (Ctrl+Shift+Del)
2. **Aguarde mais 2-3 minutos** (propagação pode levar tempo)
3. **Verifique se salvou corretamente** no Cloudflare
4. **Tente em uma aba anônima** (Ctrl+Shift+N)

---

**Última atualização:** 2026-02-16
**Deploy ID:** 55a021f3
**Projeto:** project-839f9256
