# 🔧 CORRIGIR ERRO 500 - Gerar Link de Cadastro

## ❌ PROBLEMA IDENTIFICADO:

```
Erro ao gerar link de cadastro: Request failed with status code 500
```

---

## 🔍 CAUSA RAIZ:

A tabela `signup_links` **NÃO EXISTE** no banco D1!

O código tenta inserir dados em uma tabela que não foi criada no schema inicial.

---

## ✅ SOLUÇÃO - Adicionar Tabela no D1

### 1️⃣ Acesse o Console D1:

```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/workers/d1/databases/728ee55c-d607-4846-969e-741a4fd0afb2/console
```

### 2️⃣ Copie o SQL Completo:

Copie TODO o SQL abaixo (Ctrl+A, Ctrl+C):

```sql
-- Tabela de links de cadastro
CREATE TABLE IF NOT EXISTS signup_links (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  url TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  notes TEXT,
  active INTEGER DEFAULT 1,
  qr_code TEXT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_signup_links_account ON signup_links(account_id);
CREATE INDEX IF NOT EXISTS idx_signup_links_expires ON signup_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_signup_links_active ON signup_links(active);
CREATE INDEX IF NOT EXISTS idx_signup_links_created ON signup_links(created_at);

-- Verificar se a tabela foi criada
SELECT name FROM sqlite_master WHERE type='table' AND name='signup_links';
```

### 3️⃣ Cole no Console D1:

1. Cole o SQL no campo grande de consulta
2. Clique no botão **"Executar"** (azul, canto direito)
3. Aguarde ~2 segundos

### 4️⃣ Resultado Esperado:

```
✅ Query executed successfully

Resultado da última query (SELECT):
name
signup_links
```

---

## 🧪 TESTAR APÓS EXECUTAR:

### 1️⃣ Volte para o Sistema:

```
https://cadastro.corretoracorporate.com.br
```

### 2️⃣ Faça Login:

```
Username: admin
Password: admin123
```

### 3️⃣ Gerar Link de Cadastro:

1. Clique no botão **"Gerar Link"** (verde)
2. Preencha os campos:
   - **Subconta:** Selecione uma subconta
   - **Dias de Expiração:** 7 (padrão)
   - **Máximo de Usos:** Deixe vazio para ilimitado
   - **Notas:** Opcional
3. Clique em **"Gerar Link"**

### 4️⃣ Resultado Esperado:

✅ Link gerado com sucesso!
✅ URL aparece para copiar
✅ QR Code gerado
✅ Link aparece na lista

---

## 📊 ESTRUTURA DA TABELA

A tabela `signup_links` armazena:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT | ID único do link |
| `account_id` | TEXT | ID da subconta Asaas |
| `url` | TEXT | URL completa do link |
| `expires_at` | DATETIME | Data de expiração |
| `created_at` | DATETIME | Data de criação |
| `created_by` | TEXT | Usuário que criou |
| `max_uses` | INTEGER | Máximo de usos (NULL = ilimitado) |
| `uses_count` | INTEGER | Contador de usos |
| `notes` | TEXT | Notas/observações |
| `active` | INTEGER | Status (1=ativo, 0=inativo) |
| `qr_code` | TEXT | Base64 do QR Code |

---

## 🔍 VERIFICAR SE A TABELA FOI CRIADA:

No Console D1, execute:

```sql
-- Ver todas as tabelas
SELECT name FROM sqlite_master WHERE type='table';
```

Deve mostrar:
- admin_users
- sessions
- activity_logs
- cached_accounts
- **signup_links** ← NOVA!

---

## 📝 CHECKLIST:

- [ ] Acessar Console D1
- [ ] Copiar SQL completo
- [ ] Colar no campo de consulta
- [ ] Clicar em "Executar"
- [ ] Ver mensagem de sucesso
- [ ] Verificar tabela criada (SELECT)
- [ ] Voltar ao sistema
- [ ] Fazer login
- [ ] Testar gerar link
- [ ] Confirmar que funciona

---

## 🎯 SOLUÇÃO RÁPIDA (2 minutos):

1. **Console D1:** https://dash.cloudflare.com/.../databases/728ee55c-d607-4846-969e-741a4fd0afb2/console
2. **Copie todo o SQL** do arquivo `ADICIONAR_TABELA_SIGNUP_LINKS.sql`
3. **Cole e execute** no Console
4. **Aguarde** mensagem de sucesso
5. **Teste** gerar link novamente

---

## 🆘 SE AINDA DER ERRO:

Execute este comando para ver o erro exato:

```sql
-- No Console D1
SELECT * FROM signup_links LIMIT 1;
```

Se der erro "no such table", a tabela não foi criada ainda.

---

**Me avise quando executar o SQL no Console D1!** 🚀
