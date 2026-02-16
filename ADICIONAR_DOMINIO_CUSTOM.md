# 🌐 Adicionar Domínio Customizado no Cloudflare Pages

## ✅ CNAME JÁ CONFIGURADO!

Você já configurou o DNS:
```
Tipo: CNAME
Nome: cadastro
Valor: project-839f9256.pages.dev
Proxy: ✅ Ativado
```

---

## 🎯 PRÓXIMO PASSO - Adicionar no Cloudflare Pages

### 1️⃣ Acesse o Projeto:

```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/pages/view/project-839f9256
```

### 2️⃣ Vá para Custom Domains:

1. Clique na aba **"Custom domains"** (no topo)
2. Você verá a lista de domínios atuais

### 3️⃣ Adicione o Domínio:

1. Clique no botão **"Set up a custom domain"**
2. Digite: `cadastro.corretoracorporate.com.br`
3. Clique em **"Continue"**

### 4️⃣ Cloudflare vai Validar:

O Cloudflare vai:
- ✅ Verificar o registro CNAME
- ✅ Validar o domínio
- ✅ Gerar certificado SSL automático
- ✅ Ativar o domínio

### 5️⃣ Resultado Esperado:

Você verá uma mensagem:
```
✅ Domain successfully added!
```

E o domínio aparecerá na lista:
```
cadastro.corretoracorporate.com.br
Status: Active ✅
```

---

## ⏱️ TEMPO DE PROPAGAÇÃO

### Imediato (se domínio já está no Cloudflare):
- DNS já configurado ✅
- SSL gerado em ~2 minutos
- Domínio ativo em ~5 minutos

### Se domínio está em outro lugar:
- Propagação DNS: 2-48 horas
- SSL após propagação
- Aguarde notificação

---

## 🧪 COMO TESTAR

### Após adicionar no Cloudflare Pages:

```bash
# Teste DNS
nslookup cadastro.corretoracorporate.com.br

# Teste HTTPS
curl -I https://cadastro.corretoracorporate.com.br

# Ou abra no navegador
https://cadastro.corretoracorporate.com.br
```

---

## ✅ RESULTADO FINAL

Depois de configurado, você terá **3 URLs**:

1. **Production Deploy:**
   ```
   https://0747b934.project-839f9256.pages.dev
   ```

2. **Project URL:**
   ```
   https://project-839f9256.pages.dev
   ```

3. **Custom Domain (NOVO!):**
   ```
   https://cadastro.corretoracorporate.com.br ⭐
   ```

---

## 🎯 CHECKLIST

- [x] DNS CNAME configurado
- [x] Proxy Cloudflare ativado
- [ ] Domínio adicionado no Cloudflare Pages
- [ ] SSL automático gerado
- [ ] Domínio testado e funcionando

---

## 📞 COMANDOS ÚTEIS

```bash
# Ver domínios configurados
npx wrangler pages project list | grep project-839f9256

# Adicionar domínio via CLI (alternativa)
npx wrangler pages domain add cadastro.corretoracorporate.com.br \
  --project-name project-839f9256

# Listar domínios do projeto
npx wrangler pages project get project-839f9256
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Domain not verified"
**Causa:** DNS não propagado ainda  
**Solução:** Aguarde 10-30 minutos e tente novamente

### Erro: "SSL pending"
**Causa:** Certificado sendo gerado  
**Solução:** Aguarde 2-5 minutos, SSL é automático

### Erro: "Domain already in use"
**Causa:** Domínio já adicionado em outro projeto  
**Solução:** Remova do outro projeto primeiro

---

**Próximo passo:** Vá para Custom domains e adicione o domínio!
