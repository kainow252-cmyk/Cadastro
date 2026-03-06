# 🔐 COMO OBTER TOKEN DE PRODUÇÃO ASAAS

**Data**: 06/03/2026  
**Objetivo**: Pegar novo token de produção no painel Asaas  

---

## 🎯 PASSO A PASSO VISUAL

### 1️⃣ **Acessar Painel Asaas Produção**

```
🔗 URL: https://www.asaas.com
📧 Login: corretora@corretoracorporate.com.br
🔑 Senha: [sua senha]
```

---

### 2️⃣ **Navegar até Integrações**

**Caminho no menu:**
```
Meu Dinheiro → Integrações → API
```

**Ou acesso direto:**
```
🔗 https://www.asaas.com/myAccount/integrations
```

---

### 3️⃣ **Visualizar/Copiar Token**

Na página de **Integrações → API**, você verá:

```
┌───────────────────────────────────────────────────────┐
│  Token de Acesso (API Key)                            │
│  ─────────────────────────────────────────────────    │
│                                                        │
│  $aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZm...   │
│                                                        │
│  [👁️ Mostrar]  [📋 Copiar]  [🔄 Gerar Novo]          │
│                                                        │
└───────────────────────────────────────────────────────┘
```

**Ações:**
- ✅ Clique em **"📋 Copiar"** para copiar o token
- ⚠️ **NÃO** clique em "🔄 Gerar Novo" (isso invalida o token antigo)

---

### 4️⃣ **Formato do Token**

**Token de Produção tem este formato:**
```
$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoXzc5YzA2OWU0LTlkZTEtNDVkYS05YjM5LTA0MjYzNTk3YzQzMQ==
```

**Características:**
- ✅ Começa com `$aact_`
- ✅ Seguido por uma string Base64 longa
- ✅ Sem espaços
- ✅ Termina com `==` ou `=` (geralmente)

---

### 5️⃣ **Diferença Sandbox vs Produção**

| Característica | Sandbox | Produção |
|----------------|---------|----------|
| **Prefixo** | `$aact_hmlg_` | `$aact_` |
| **URL** | https://sandbox.asaas.com | https://www.asaas.com |
| **Transações** | Simuladas | Reais |
| **Dinheiro** | Fictício | Real |

**Exemplo Sandbox:**
```
$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5
```

**Exemplo Produção:**
```
$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoXzc5YzA2OWU0LTlkZTEtNDVkYS05YjM5LTA0MjYzNTk3YzQzMQ==
```

---

### 6️⃣ **Me Enviar o Token**

**Depois de copiar, me envie assim:**

```
Token de produção:
$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoXzc5YzA2OWU0LTlkZTEtNDVkYS05YjM5LTA0MjYzNTk3YzQzMQ==
```

---

## 🛡️ SEGURANÇA

### ✅ Boas Práticas
- ✅ **Nunca** compartilhe o token publicamente
- ✅ **Só me envie** em mensagem privada nesta conversa
- ✅ O token será armazenado **somente no Cloudflare** (criptografado)
- ✅ **Não será commitado** no Git

### ⚠️ O que NÃO fazer
- ❌ Não poste em fóruns públicos
- ❌ Não envie por email não criptografado
- ❌ Não salve em arquivos de texto simples
- ❌ Não commite no Git

---

## 🧪 VALIDAR TOKEN (Opcional)

Antes de me enviar, você pode testar se o token está correto:

```bash
# Substitua SEU_TOKEN_AQUI pelo token copiado
curl -X GET "https://api.asaas.com/v3/customers?limit=1" \
  -H "access_token: SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resultado esperado (200 OK):**
```json
{
  "object": "list",
  "hasMore": false,
  "totalCount": 5,
  "limit": 1,
  "offset": 0,
  "data": [
    {
      "id": "cus_000005735721",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  ]
}
```

**Se retornar erro 401:**
```json
{
  "errors": [
    {
      "code": "invalid_token",
      "description": "Token inválido"
    }
  ]
}
```
➡️ Token incorreto ou expirado. Verifique se copiou corretamente.

---

## 📞 SUPORTE ASAAS

Se tiver dificuldade para acessar o token:

- **Telefone/WhatsApp**: (16) 3347-8031
- **Email**: [email protected]
- **Horário**: Segunda a sexta, 8h às 18h

---

## ⏭️ PRÓXIMOS PASSOS

Após me enviar o token:

1. ⏱️ Atualizo no Cloudflare (~30s)
2. 🚀 Deploy automático (~30s)
3. 🧪 Teste de cobrança R$ 10
4. ✅ Validação split 20/80
5. 💰 Confirmo repasses nas 4 subcontas

**Tempo total estimado**: ~5 minutos

---

## 🎯 RESUMO RÁPIDO

1. ✅ Acesse: https://www.asaas.com/myAccount/integrations
2. ✅ Copie o token (começa com `$aact_`)
3. ✅ Me envie aqui na conversa
4. ✅ Aguarde ~5 minutos para conclusão

**Pronto! É só isso! 🚀**
