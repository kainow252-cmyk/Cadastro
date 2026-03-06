# 🔐 ATUALIZAR TOKEN PRODUÇÃO ASAAS

**Data**: 06/03/2026  
**Ação**: Substituir credenciais SANDBOX por PRODUÇÃO  

---

## ⚠️ PROBLEMA IDENTIFICADO

O sistema está configurado com **credenciais de SANDBOX**, mas precisa usar **credenciais de PRODUÇÃO**.

---

## 📋 SECRETS CLOUDFLARE ATUAIS

```
✅ Configurados no Cloudflare Pages:
- ASAAS_API_KEY (⚠️ SANDBOX - PRECISA TROCAR)
- ASAAS_API_KEY_SANDBOX (backup)
- ASAAS_API_URL (produção: https://api.asaas.com/v3)
- ADMIN_USERNAME
- ADMIN_PASSWORD
- JWT_SECRET
- MAILERSEND_API_KEY
- MAILERSEND_FROM_EMAIL
- MAILERSEND_FROM_NAME
- DELTAPAG_API_KEY
- DELTAPAG_API_URL
- WOOVI_API_KEY
- WOOVI_APPID
- WOOVI_WEBHOOK_SECRET
```

---

## 🎯 AÇÃO NECESSÁRIA

### 1️⃣ Obter Token de Produção Asaas

**Painel Asaas Produção:**
1. Login: https://www.asaas.com
2. Menu: **Meu Dinheiro** → **Integrações** → **API**
3. Copiar **Token de Produção**
4. Formato: `$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoXzc5YzA2OWU0LTlkZTEtNDVkYS05YjM5LTA0MjYzNTk3YzQzMQ==`

---

### 2️⃣ Atualizar Secret no Cloudflare

**Opção A: Via Wrangler CLI (RECOMENDADO)**

```bash
# Atualizar token de produção
cd /home/user/webapp
npx wrangler pages secret put ASAAS_API_KEY --project-name corretoracorporate

# Quando solicitar, colar o token de PRODUÇÃO obtido no passo 1
```

**Opção B: Via Dashboard Cloudflare**

1. Acessar: https://dash.cloudflare.com/pages/corretoracorporate
2. **Settings** → **Environment variables**
3. Encontrar **ASAAS_API_KEY**
4. Clicar em **Edit**
5. Colar o **token de PRODUÇÃO**
6. Salvar

---

### 3️⃣ Novo Deploy (Automático)

Após atualizar o secret, o Cloudflare automaticamente redesploya o projeto com as novas credenciais.

**Ou forçar novo deploy:**

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name corretoracorporate --branch main
```

---

## 🧪 VALIDAÇÃO

### Testar Token de Produção

```bash
# Testar se o token está correto
curl -X GET "https://api.asaas.com/v3/customers?limit=1" \
  -H "access_token: SEU_TOKEN_PRODUCAO_AQUI" \
  -H "Content-Type: application/json"

# Resposta esperada: lista de clientes (status 200)
# Se erro 401: token inválido
# Se erro 403: token sem permissão
```

---

## ✅ CHECKLIST DE ATUALIZAÇÃO

```
[⏳] Obter token de PRODUÇÃO no painel Asaas
[⏳] Copiar token (formato $aact_...)
[⏳] Atualizar ASAAS_API_KEY no Cloudflare
[⏳] Aguardar novo deploy automático (ou forçar)
[⏳] Testar API com curl
[⏳] Criar cobrança teste de R$ 10
[⏳] Verificar se split 20/80 funciona
[⏳] Validar repasses nas 4 subcontas
```

---

## 📊 VARIÁVEIS DE AMBIENTE CORRETAS

### Produção (corretoracorporate.pages.dev)

```bash
# Asaas Produção
ASAAS_API_KEY=$aact_... (TOKEN DE PRODUÇÃO)
ASAAS_API_URL=https://api.asaas.com/v3

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=(seu_password)

# JWT
JWT_SECRET=(seu_secret)

# Email (MailerSend)
MAILERSEND_API_KEY=(seu_key)
MAILERSEND_FROM_EMAIL=corretora@corretoracorporate.com.br
MAILERSEND_FROM_NAME=Corretora Corporate

# DeltaPag
DELTAPAG_API_KEY=(seu_key)
DELTAPAG_API_URL=https://api.deltapag.io/v1
```

---

## 🔄 DIFERENÇA SANDBOX VS PRODUÇÃO

| Item | Sandbox | Produção |
|------|---------|----------|
| **URL API** | https://sandbox.asaas.com/api/v3 | https://api.asaas.com/v3 |
| **Token** | $aact_YTU... (sandbox) | $aact_YTU... (produção) |
| **Cobranças** | Simuladas | Reais |
| **PIX** | Teste | Real |
| **Repasses** | Simulados | Reais |
| **Saldo** | Virtual | Real (R$ 228,02) |

---

## 🎯 PRÓXIMOS PASSOS

### Após Atualizar Token:

1. **Criar cobrança teste** (R$ 10)
2. **Verificar split**:
   - 4 subcontas recebem R$ 0,50 cada (total R$ 2,00 = 20%)
   - Conta principal recebe R$ 8,00 (80%)
3. **Simular pagamento** com PIX real
4. **Verificar repasses** no painel Asaas
5. **Confirmar saldos** das 4 contas

---

## 📞 SUPORTE

Se precisar de ajuda para obter o token de produção:

- **Telefone**: (16) 3347-8031 (WhatsApp também)
- **Email**: [email protected]
- **Painel**: https://www.asaas.com

---

## 🔗 LINKS ÚTEIS

```
Sistema: https://corretoracorporate.pages.dev
Cloudflare Dashboard: https://dash.cloudflare.com/pages/corretoracorporate
Asaas Produção: https://www.asaas.com
Asaas Subcontas: https://www.asaas.com/childAccount/list
Asaas Integrações: https://www.asaas.com/myAccount/integrations
Documentação Asaas: https://docs.asaas.com
```

---

## ⚡ COMANDO RÁPIDO

**Para atualizar o token agora:**

```bash
cd /home/user/webapp
npx wrangler pages secret put ASAAS_API_KEY --project-name corretoracorporate
# Colar token de PRODUÇÃO quando solicitado
```

---

**Status**: ⏳ Aguardando token de PRODUÇÃO  
**Ambiente atual**: SANDBOX (precisa atualizar)  
**Próxima ação**: Obter token de produção e atualizar no Cloudflare
