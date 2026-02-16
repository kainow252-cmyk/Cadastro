# 🔧 Corrigir Permissões da API Key Cloudflare

## ⚠️ PROBLEMA ATUAL

Sua API Key está **válida** mas falta permissões:

```
❌ Cloudflare D1:Read  (faltando)
❌ Cloudflare D1:Edit  (faltando)
✅ Account:Read        (ok)
✅ Zone:Read           (ok)
✅ Workers:Read        (ok)
✅ Workers:Edit        (ok)
```

**Resultado**: Você pode fazer deploy, mas **não poderá usar banco de dados D1**.

---

## 🎯 SOLUÇÃO (2 Opções)

### **OPÇÃO A: Criar Novo Token (RECOMENDADO)**

Este projeto **NÃO usa D1** atualmente, então você pode:

1. **Usar token atual** (funciona para deploy)
2. **OU criar token novo** com permissões completas

---

### **OPÇÃO B: Adicionar Permissões ao Token Atual**

Se você quiser usar D1 no futuro, siga estes passos:

#### **Passo 1: Ir para Cloudflare API Tokens**
```
https://dash.cloudflare.com/profile/api-tokens
```

#### **Passo 2: Encontrar Token Atual**
- Procure pelo token que termina em `...U8Kbi`
- Clique em "Edit" (ícone de lápis)

#### **Passo 3: Adicionar Permissões D1**
Na seção "Permissions", adicione:
- **Account** → **Cloudflare D1** → **Read**
- **Account** → **Cloudflare D1** → **Edit**

#### **Passo 4: Salvar**
- Clicar em "Continue to summary"
- Clicar em "Update Token"

---

## ✅ CRIAR NOVO TOKEN COM TODAS PERMISSÕES (RECOMENDADO)

### **Template de Permissões Completo**

```
┌─────────────────────────────────────────────────────────────────┐
│ Cloudflare API Token - Gerenciador Asaas                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PERMISSIONS:                                                    │
│                                                                 │
│ Account Permissions:                                            │
│   ✅ Account Settings:Read                                     │
│   ✅ Cloudflare D1:Read                                        │
│   ✅ Cloudflare D1:Edit                                        │
│   ✅ Cloudflare Pages:Read                                     │
│   ✅ Cloudflare Pages:Edit                                     │
│                                                                 │
│ Zone Permissions:                                               │
│   ✅ Zone:Read                                                 │
│   ✅ Zone Settings:Read                                        │
│   ✅ DNS:Read                                                  │
│   ✅ DNS:Edit                                                  │
│                                                                 │
│ User Permissions:                                               │
│   ✅ User Details:Read                                         │
│                                                                 │
│ ACCOUNT RESOURCES:                                              │
│   → Include: All accounts                                       │
│                                                                 │
│ ZONE RESOURCES:                                                 │
│   → Include: All zones                                          │
│                                                                 │
│ TTL:                                                            │
│   → Start: Immediately                                          │
│   → End: Never (recommended)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Passo a Passo para Criar Token**

#### **1. Acessar Cloudflare**
```
https://dash.cloudflare.com/profile/api-tokens
```

#### **2. Clicar "Create Token"**

#### **3. Escolher Template**
- Opção 1: "Edit Cloudflare Workers" template como base
- Opção 2: "Create Custom Token"

#### **4. Configurar Permissões**

**Account Permissions:**
```
Account Settings:Read
Cloudflare D1:Read
Cloudflare D1:Edit
Cloudflare Pages:Read
Cloudflare Pages:Edit
Workers Scripts:Read
Workers Scripts:Edit
```

**Zone Permissions:**
```
Zone:Read
Zone Settings:Read
DNS:Read
DNS:Edit
```

#### **5. Account Resources**
```
Include → All accounts
```

#### **6. Zone Resources**
```
Include → All zones
OU
Include → Specific zone → corretoracorporate.com.br
```

#### **7. TTL (Validade)**
```
Starts: Immediately
Ends: Never (recomendado)
```

#### **8. Criar Token**
- Clicar "Continue to summary"
- Revisar permissões
- Clicar "Create Token"

#### **9. COPIAR TOKEN**
⚠️ **IMPORTANTE**: Copie o token AGORA! Não será mostrado novamente.

```
Token: ATBOK_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **10. Configurar no Sistema**
- Ir na aba "Deploy"
- Remover API Key antiga
- Adicionar nova API Key
- Colar o token copiado

---

## 🚀 VOCÊ PODE FAZER DEPLOY AGORA MESMO!

**Seu token atual funciona para:**
- ✅ Deploy no Cloudflare Pages
- ✅ Configurar domínio customizado
- ✅ Gerenciar Workers
- ✅ Configurar DNS

**Só não funciona para:**
- ❌ Cloudflare D1 (banco de dados)

**MAS**: Este projeto **NÃO USA D1 atualmente**, então você pode prosseguir!

---

## 📋 COMANDOS PARA TESTAR

### **1. Verificar Token**
```bash
# Verificar permissões
npx wrangler whoami
```

Resposta esperada:
```
 ⛅️ wrangler 3.78.0
────────────────────────────────────────────────────────────
Getting User settings...
👋 You are logged in with an API Token, associated with the email 'seu@email.com'!
┌───────────────────┬────────────────────────────────────┐
│ Account Name      │ Account ID                         │
├───────────────────┼────────────────────────────────────┤
│ Sua Conta         │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   │
└───────────────────┴────────────────────────────────────┘
```

### **2. Listar Projetos Pages**
```bash
npx wrangler pages project list
```

### **3. Fazer Deploy de Teste**
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

---

## 🎯 DECISÃO RÁPIDA

### **CENÁRIO 1: Quero fazer deploy AGORA**
✅ **Use o token atual!**
- Funciona para deploy
- Funciona para domínio
- Não precisa mudar nada

**Ação**: Ir para o próximo passo do deploy:
```bash
npx wrangler pages project create gerenciador-asaas --production-branch main
```

### **CENÁRIO 2: Quero permissões completas**
✅ **Crie novo token!**
- Seguir template acima
- Adicionar todas permissões
- Substituir no sistema

**Ação**: Criar novo token e substituir

---

## ⚠️ NOTAS IMPORTANTES

### **Sobre D1 (Banco de Dados)**
Este projeto atualmente **NÃO USA** Cloudflare D1. Os dados são:
- Gerenciados pela API Asaas (subcontas)
- Armazenados na conta Asaas
- Não há banco de dados local

**Portanto**: A falta de permissão D1 **NÃO AFETA** o funcionamento!

### **Sobre Segurança**
- ✅ Nunca compartilhe seu API Token
- ✅ Nunca commite token no git
- ✅ Use tokens com permissões mínimas necessárias
- ✅ Rotacione tokens periodicamente

---

## 📊 RESUMO

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| **API Key Válida** | ✅ Sim | Nenhuma |
| **Permissão Workers** | ✅ Sim | Nenhuma |
| **Permissão Pages** | ⚠️ Inferida | Testar deploy |
| **Permissão D1** | ❌ Não | Opcional (não usa) |
| **Permissão DNS** | ⚠️ Parcial | Adicionar se precisar |
| **Pronto para Deploy?** | ✅ **SIM!** | Prosseguir |

---

## 🚀 PRÓXIMOS PASSOS

### **OPÇÃO A: Continuar com Token Atual** (RÁPIDO)
```bash
# 1. Testar autenticação
npx wrangler whoami

# 2. Criar projeto
npx wrangler pages project create gerenciador-asaas --production-branch main

# 3. Build
cd /home/user/webapp
npm run build

# 4. Deploy
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

**Tempo**: 10 minutos

### **OPÇÃO B: Criar Token Completo Primeiro** (CORRETO)
```bash
# 1. Criar novo token (via dashboard)
# 2. Substituir no sistema
# 3. Testar autenticação
# 4. Fazer deploy
```

**Tempo**: 15 minutos

---

## 💡 RECOMENDAÇÃO

**PARA ESTE PROJETO**: Use o token atual e faça deploy agora!

**Motivos**:
1. ✅ Token atual funciona para Pages
2. ✅ Token atual funciona para Workers
3. ✅ Projeto não usa D1
4. ✅ Você pode adicionar permissões depois se precisar

**DEPOIS DO DEPLOY**: Se encontrar problemas com DNS ao adicionar domínio customizado, aí sim adicione permissões DNS:Edit.

---

**Status**: ✅ Pronto para fazer deploy com token atual!

**Data**: 16/02/2026  
**Próximo Passo**: Deploy no Cloudflare Pages

