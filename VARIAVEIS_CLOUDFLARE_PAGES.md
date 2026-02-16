# 🔧 VARIÁVEIS E BINDINGS - CLOUDFLARE PAGES

## 📋 Configurações para o Dashboard Cloudflare Pages

Acesse: **Cloudflare Dashboard → Workers & Pages → seu-projeto → Settings**

---

## 1️⃣ ENVIRONMENT VARIABLES (Secrets)

### **Aba: Settings → Environment variables**

Adicione estas variáveis na **Production** e **Preview**:

```
┌─────────────────────────────┬────────────────────────────────────────────────┐
│ Variable name               │ Value                                          │
├─────────────────────────────┼────────────────────────────────────────────────┤
│ ASAAS_API_KEY               │ $aact_prod_000Mzk...                          │
│ ASAAS_API_URL               │ https://api.asaas.com/v3                       │
│ ADMIN_USERNAME              │ admin_producao                                 │
│ ADMIN_PASSWORD              │ SuaSenhaForte@2026                            │
│ JWT_SECRET                  │ (gerar: openssl rand -hex 64)                  │
│ MAILERSEND_API_KEY          │ mlsn.ae314393b75a2a0588bcd6d6f4a235f6...      │
│ MAILERSEND_FROM_EMAIL       │ noreply@trial-0r83ql3x7v3lzw1j.mlsender.net   │
│ MAILERSEND_FROM_NAME        │ Gerenciador Asaas                              │
└─────────────────────────────┴────────────────────────────────────────────────┘
```

#### **Como Adicionar:**
1. Clicar em **"Add variable"**
2. Preencher **"Variable name"**
3. Preencher **"Value"**
4. Selecionar **"Production"** e **"Preview"** (ambos)
5. Clicar em **"Save"**
6. Repetir para cada variável

---

## 2️⃣ D1 DATABASE BINDING

### **Aba: Settings → Bindings → D1 database**

⚠️ **PRIMEIRO**: Você precisa criar o banco D1 via terminal:

```bash
npx wrangler d1 create gerenciador-asaas-db
```

**Copie o `database_id` que aparecer!**

### **Depois, adicione no Dashboard:**

```
┌─────────────────────────────┬────────────────────────────────────────────────┐
│ Campo                       │ Valor                                          │
├─────────────────────────────┼────────────────────────────────────────────────┤
│ Variable name               │ DB                                             │
│ D1 database                 │ gerenciador-asaas-db                          │
│ Environment                 │ Production, Preview                            │
└─────────────────────────────┴────────────────────────────────────────────────┘
```

#### **Como Adicionar:**
1. Na aba **"Settings"**
2. Seção **"Bindings"**
3. Subsection **"D1 database"**
4. Clicar em **"Add binding"**
5. Preencher:
   - **Variable name**: `DB`
   - **D1 database**: Selecionar `gerenciador-asaas-db` (dropdown)
   - **Environment**: Marcar **Production** e **Preview**
6. Clicar em **"Save"**

---

## 3️⃣ COMPATIBILIDADE FLAGS

### **Aba: Settings → Functions → Compatibility flags**

```
┌─────────────────────────────┬────────────────────────────────────────────────┐
│ Flag                        │ Value                                          │
├─────────────────────────────┼────────────────────────────────────────────────┤
│ nodejs_compat               │ ✅ Enabled                                     │
└─────────────────────────────┴────────────────────────────────────────────────┘
```

#### **Como Adicionar:**
1. Na aba **"Settings"**
2. Seção **"Functions"**
3. Subsection **"Compatibility flags"**
4. Clicar em **"Add flag"**
5. Selecionar: **"nodejs_compat"**
6. Clicar em **"Save"**

---

## 4️⃣ COMPATIBILITY DATE

### **Aba: Settings → Functions → Compatibility date**

```
┌─────────────────────────────┬────────────────────────────────────────────────┐
│ Compatibility date          │ 2026-02-14                                     │
└─────────────────────────────┴────────────────────────────────────────────────┘
```

#### **Como Configurar:**
1. Na aba **"Settings"**
2. Seção **"Functions"**
3. Subsection **"Compatibility date"**
4. Selecionar: **"2026-02-14"** (ou data atual)
5. Clicar em **"Save"**

---

## 📊 RESUMO COMPLETO DAS CONFIGURAÇÕES

### **ENVIRONMENT VARIABLES (8 variáveis)**

| Nome | Exemplo | Obrigatório | Ambiente |
|------|---------|-------------|----------|
| `ASAAS_API_KEY` | `$aact_prod_000...` | ✅ Sim | Production + Preview |
| `ASAAS_API_URL` | `https://api.asaas.com/v3` | ✅ Sim | Production + Preview |
| `ADMIN_USERNAME` | `admin_producao` | ✅ Sim | Production + Preview |
| `ADMIN_PASSWORD` | `SenhaForte@123` | ✅ Sim | Production + Preview |
| `JWT_SECRET` | `64caracteres...` | ✅ Sim | Production + Preview |
| `MAILERSEND_API_KEY` | `mlsn.ae314...` | ✅ Sim | Production + Preview |
| `MAILERSEND_FROM_EMAIL` | `noreply@trial...` | ✅ Sim | Production + Preview |
| `MAILERSEND_FROM_NAME` | `Gerenciador Asaas` | ✅ Sim | Production + Preview |

### **D1 DATABASE BINDING (1 binding)**

| Nome da Variável | Database | Ambiente |
|------------------|----------|----------|
| `DB` | `gerenciador-asaas-db` | Production + Preview |

### **COMPATIBILITY FLAGS (1 flag)**

| Flag | Status |
|------|--------|
| `nodejs_compat` | ✅ Enabled |

### **COMPATIBILITY DATE**

| Data | Formato |
|------|---------|
| `2026-02-14` | YYYY-MM-DD |

---

## 🔐 GERAR SECRETS SEGUROS

### **JWT_SECRET**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**OU**

```bash
openssl rand -hex 64
```

**Exemplo de saída:**
```
a7f3d9e8c2b1a4f6e9d7c3b5a8f2e1d4c9b7a6f3e2d1c8b5a4f7e9d2c6b3a1f8e4
```

### **ADMIN_PASSWORD**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**OU criar senha forte manualmente:**
```
Exemplo: Admin@Asaas2026!SecurePassword
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

Marque conforme for configurando:

### **No Terminal (Antes de configurar no Dashboard)**
- [ ] Adicionar permissões D1 ao token API
- [ ] Criar banco D1: `npx wrangler d1 create gerenciador-asaas-db`
- [ ] Copiar `database_id` gerado
- [ ] Criar migrations (se quiser): `migrations/0001_initial_schema.sql`
- [ ] Aplicar migrations remote: `npx wrangler d1 migrations apply gerenciador-asaas-db --remote`

### **No Dashboard Cloudflare Pages**

#### **Environment Variables**
- [ ] ASAAS_API_KEY (Production)
- [ ] ASAAS_API_KEY (Preview)
- [ ] ASAAS_API_URL (Production)
- [ ] ASAAS_API_URL (Preview)
- [ ] ADMIN_USERNAME (Production)
- [ ] ADMIN_USERNAME (Preview)
- [ ] ADMIN_PASSWORD (Production)
- [ ] ADMIN_PASSWORD (Preview)
- [ ] JWT_SECRET (Production)
- [ ] JWT_SECRET (Preview)
- [ ] MAILERSEND_API_KEY (Production)
- [ ] MAILERSEND_API_KEY (Preview)
- [ ] MAILERSEND_FROM_EMAIL (Production)
- [ ] MAILERSEND_FROM_EMAIL (Preview)
- [ ] MAILERSEND_FROM_NAME (Production)
- [ ] MAILERSEND_FROM_NAME (Preview)

#### **D1 Database Binding**
- [ ] Adicionar binding "DB" → gerenciador-asaas-db (Production)
- [ ] Adicionar binding "DB" → gerenciador-asaas-db (Preview)

#### **Compatibility**
- [ ] Compatibility flag: nodejs_compat
- [ ] Compatibility date: 2026-02-14

---

## 🚨 IMPORTANTE: ORDEM DE EXECUÇÃO

### **PASSO 1: Criar D1 no Terminal**
```bash
# Só funciona DEPOIS de adicionar permissões D1 ao token
npx wrangler d1 create gerenciador-asaas-db
```

**Copie o output:**
```
✅ Successfully created DB 'gerenciador-asaas-db'!

[[d1_databases]]
binding = "DB"
database_name = "gerenciador-asaas-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  ← COPIE ESTE ID
```

### **PASSO 2: Atualizar wrangler.jsonc (Local)**
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gerenciador-asaas-db",
      "database_id": "COLE-O-ID-AQUI"
    }
  ]
}
```

### **PASSO 3: Criar Migrations (Opcional)**
```bash
mkdir -p migrations
# Criar arquivo 0001_initial_schema.sql
```

### **PASSO 4: Aplicar Migrations Remote**
```bash
npx wrangler d1 migrations apply gerenciador-asaas-db --remote
```

### **PASSO 5: Configurar no Dashboard**
- Adicionar todas environment variables
- Adicionar D1 binding
- Configurar compatibility

### **PASSO 6: Deploy**
```bash
npm run build
npx wrangler pages deploy dist --project-name gerenciador-asaas
```

---

## 🎯 VARIÁVEIS POR CATEGORIA

### **📡 API ASAAS**
```
ASAAS_API_KEY=your_production_key
ASAAS_API_URL=https://api.asaas.com/v3
```

### **🔐 AUTENTICAÇÃO**
```
ADMIN_USERNAME=admin_producao
ADMIN_PASSWORD=SenhaForte@2026
JWT_SECRET=a7f3d9e8c2b1a4f6e9d7c3b5a8f2e1d4...
```

### **📧 EMAIL (MAILERSEND)**
```
MAILERSEND_API_KEY=mlsn.ae314393b75a2a0588bcd6d6f4a235f6...
MAILERSEND_FROM_EMAIL=noreply@trial-0r83ql3x7v3lzw1j.mlsender.net
MAILERSEND_FROM_NAME=Gerenciador Asaas
```

### **🗄️ DATABASE**
```
DB (binding) → gerenciador-asaas-db
```

---

## 📸 SCREENSHOTS DO DASHBOARD

### **1. Environment Variables**
```
Settings → Environment variables → Add variable

┌─────────────────────────────────────────────────────┐
│ Add environment variable                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Variable name:  [ASAAS_API_KEY              ]      │
│                                                     │
│ Value:          [*************************** ]      │
│                                                     │
│ Environment:    ☑ Production   ☑ Preview           │
│                                                     │
│                [Cancel]            [Save]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **2. D1 Database Binding**
```
Settings → Bindings → D1 database → Add binding

┌─────────────────────────────────────────────────────┐
│ Add D1 database binding                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Variable name:  [DB                          ]      │
│                                                     │
│ D1 database:    [gerenciador-asaas-db ▼]           │
│                                                     │
│ Environment:    ☑ Production   ☑ Preview           │
│                                                     │
│                [Cancel]            [Save]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 VERIFICAR CONFIGURAÇÕES

### **Via Dashboard**
1. Ir em: Workers & Pages → seu-projeto
2. Aba: **Settings**
3. Verificar:
   - Environment variables (8 variáveis)
   - Bindings → D1 database (1 binding)
   - Functions → Compatibility flags (nodejs_compat)
   - Functions → Compatibility date (2026-02-14)

### **Via CLI**
```bash
# Verificar variáveis (não mostra valores)
npx wrangler pages secret list --project-name gerenciador-asaas

# Verificar D1
npx wrangler d1 list

# Verificar info do projeto
npx wrangler pages project list
```

---

## ❓ TROUBLESHOOTING

### **Problema 1: "Database not found"**
**Causa**: D1 não criado ou binding errado

**Solução**:
```bash
# Verificar se D1 existe
npx wrangler d1 list

# Se não existir, criar
npx wrangler d1 create gerenciador-asaas-db

# Verificar binding no dashboard
```

### **Problema 2: "Environment variable not defined"**
**Causa**: Variável não configurada ou ambiente errado

**Solução**:
1. Verificar se variável existe em Production E Preview
2. Nome da variável está EXATAMENTE igual no código
3. Fazer novo deploy após adicionar variável

### **Problema 3: "nodejs_compat not enabled"**
**Causa**: Flag de compatibilidade não configurada

**Solução**:
1. Settings → Functions → Compatibility flags
2. Adicionar: `nodejs_compat`
3. Fazer novo deploy

---

**Status**: ✅ Guia completo de variáveis criado!  
**Localização**: `/home/user/webapp/VARIAVEIS_CLOUDFLARE_PAGES.md`  
**Data**: 16/02/2026

