# 🔑 Como Gerar Nova Chave de API com Permissão de Saque

**Data:** 06/03/2026 21:15  
**Situação:** Permissão marcada, mas chave antiga não tem autorização

---

## ⚠️ IMPORTANTE

**Você marcou "Sim" para saque, mas está usando uma chave antiga!**

A chave de API atual foi gerada **ANTES** de marcar a permissão de saque.

**Solução:** Gerar uma **NOVA chave de API** com a permissão já ativa.

---

## 📋 Passo a Passo

### 1️⃣ Acessar Integrações

1. Acesse: https://www.asaas.com
2. Faça login: corretora@corretoracorporate.com.br
3. Menu lateral → **Integrações**
4. Clique em **Chaves de API**

### 2️⃣ Excluir Chave Antiga (Opcional)

Se quiser, pode excluir a chave atual que não tem permissão de saque:

```
Nome: token
Data de expiração: opcional
Data de criação: 06/03/2026
Criado por: corretora@corretoracorporate.com.br
```

**Botão:** "Excluir" (vermelho)

**Atenção:** Só exclua após gerar a nova!

### 3️⃣ Gerar Nova Chave

1. Clique no botão **"Criar Chave de API"**
2. Preencha:
   - **Nome:** `producao-com-saque`
   - **Data de expiração:** (opcional - deixe em branco para sem expiração)
   - **Hora de expiração:** (opcional)
   
3. ⚠️ **IMPORTANTE:** Marque **"Sim"** em:
   ```
   Habilitar essa chave executar operações de saque via API
   (Pix, Ted, Pagec, Consult. e Recuper. de dados)
   ```

4. Clique em **"Salvar"** (verde)

### 4️⃣ Copiar Nova Chave

A Asaas mostrará a chave **UMA ÚNICA VEZ**:

```
Chave de API gerada com sucesso!

Copie agora a sua chave de API e a armazene em local seguro.
Por questões de segurança, não é possível recuperá-la.

$aact_prod_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ COPIE AGORA!** Você não conseguirá ver novamente!

---

## 🔄 Atualizar no Cloudflare

### Usar Wrangler (Recomendado)

```bash
cd /home/user/webapp

# Atualizar secret no Cloudflare Pages
npx wrangler pages secret put ASAAS_API_KEY --project-name corretoracorporate
# Cole a nova chave quando solicitado
```

### Via Dashboard Cloudflare (Alternativa)

1. Acesse: https://dash.cloudflare.com
2. Workers & Pages → **corretoracorporate**
3. Settings → **Variables and Secrets**
4. Encontre **ASAAS_API_KEY**
5. Clique em **"Edit"**
6. Cole a nova chave
7. Clique em **"Save"**

---

## ✅ Testar Nova Chave

### Teste 1: Verificar Conta

```bash
curl -X GET https://api.asaas.com/v3/myAccount \
  -H "access_token: SUA_NOVA_CHAVE"
```

**Resultado esperado:**
```json
{
  "name": "CORRETORA CORPORATE",
  "email": "corretora@corretoracorporate.com.br"
}
```

### Teste 2: Listar Subcontas

```bash
curl -X GET https://api.asaas.com/v3/accounts \
  -H "access_token: SUA_NOVA_CHAVE"
```

**Resultado esperado:**
```json
{
  "totalCount": 4,
  "data": [...]
}
```

### Teste 3: Criar Saque (PRINCIPAL)

```bash
curl -X POST https://api.asaas.com/v3/transfers \
  -H "access_token: SUA_NOVA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10.00,
    "bankAccount": {
      "bank": { "code": "323" },
      "ownerName": "CORRETORA CORPORATE LTDA",
      "cpfCnpj": "63300111000133",
      "pixAddressKey": "9b217cf8-29b8-4943-b2e7-00294f26724f"
    }
  }'
```

**Resultado esperado (SUCESSO):**
```json
{
  "id": "tra_abc123xyz",
  "value": 10.00,
  "netValue": 10.00,
  "transferFee": 0.00,
  "status": "PENDING",
  "operationType": "PIX",
  "dateCreated": "2026-03-06",
  "canBeCancelled": true
}
```

**Se ainda der erro:**
```json
{
  "errors": [{
    "code": "insufficient_permission",
    "description": "..."
  }]
}
```

**Ação:** A permissão não foi marcada corretamente. Volte e marque "Sim" novamente.

---

## 🔐 Segurança

### ⚠️ Chave Antiga vs Nova

| Chave | Permissão Saque | Usar? |
|-------|-----------------|-------|
| Antiga | ❌ Não | ❌ Parar de usar |
| **Nova** | **✅ Sim** | **✅ Usar agora** |

### 🗑️ Excluir Chave Antiga

**Após confirmar que a nova funciona:**

1. Acesse Asaas → Integrações → Chaves de API
2. Encontre a chave antiga (sem permissão de saque)
3. Clique em **"Excluir"** (botão vermelho)
4. Confirme a exclusão

**Motivo:** Segurança - chaves não usadas devem ser removidas.

---

## 📋 Checklist Completo

### No Painel Asaas

- [ ] Acessar Integrações → Chaves de API
- [ ] Clicar em "Criar Chave de API"
- [ ] Preencher nome: `producao-com-saque`
- [ ] ⚠️ **MARCAR "SIM"** em operações de saque
- [ ] Clicar em "Salvar"
- [ ] Copiar chave (você verá UMA VEZ só)
- [ ] Salvar chave em local seguro

### No Cloudflare

- [ ] Atualizar secret ASAAS_API_KEY
- [ ] Aguardar 30 segundos (propagação)
- [ ] Fazer novo deploy (opcional)

### Testes

- [ ] Teste 1: GET /myAccount (verificar conta)
- [ ] Teste 2: GET /accounts (listar subcontas)
- [ ] Teste 3: POST /transfers (SAQUE - principal!)
- [ ] Teste 4: Via sistema (POST /api/transfers)

### Limpeza

- [ ] Excluir chave antiga do Asaas
- [ ] Documentar nova chave em local seguro
- [ ] Atualizar documentação do projeto

---

## 🚨 Troubleshooting

### Erro: "insufficient_permission"

**Causa:** Permissão não marcada ou chave antiga.

**Solução:**
1. Gerar NOVA chave
2. Marcar "Sim" em operações de saque
3. Copiar chave completa
4. Atualizar no Cloudflare

### Erro: "invalid_action"

**Causa:** Saldo insuficiente.

**Solução:** Verificar saldo disponível.

### Erro: "invalid_pix_key"

**Causa:** Chave PIX inválida.

**Solução:** Conferir chave PIX no cadastro.

---

## 📊 Status Atual

| Item | Status |
|------|--------|
| Permissão marcada no Asaas | ✅ Sim |
| Chave atual tem permissão | ❌ Não (é antiga) |
| Precisa gerar nova chave | ⚠️ **SIM - AGORA!** |

---

## 🎯 Ação Imediata

### 🔴 FAÇA AGORA:

1. **Gere nova chave com permissão de saque**
2. **Copie a chave completa**
3. **Atualize no Cloudflare:**

```bash
cd /home/user/webapp
npx wrangler pages secret put ASAAS_API_KEY --project-name corretoracorporate
# Cole a nova chave
```

4. **Teste o saque:**

```bash
curl -X POST https://corretoracorporate.pages.dev/api/transfers \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10.00,
    "bankAccount": {
      "bank": { "code": "323" },
      "ownerName": "CORRETORA CORPORATE LTDA",
      "cpfCnpj": "63300111000133",
      "pixAddressKey": "9b217cf8-29b8-4943-b2e7-00294f26724f"
    }
  }'
```

---

## 💡 Por Que Precisa Gerar Nova Chave?

### Como Funciona

A Asaas gera chaves de API com permissões **no momento da criação**.

```
Chave criada ANTES de marcar permissão
  ↓
❌ Chave NÃO tem permissão de saque
  ↓
Você marca permissão depois
  ↓
❌ Chave antiga continua sem permissão
  ↓
✅ Precisa GERAR NOVA chave
```

### Solução

```
Marcar permissão de saque: "Sim"
  ↓
Gerar NOVA chave de API
  ↓
✅ Nova chave JÁ vem com permissão
  ↓
Usar nova chave no sistema
  ↓
✅ Saques funcionam!
```

---

## 📞 Suporte

**Se tiver dúvidas:**
- Asaas: (16) 3347-8031
- Email: contato@asaas.com

---

**Criado em:** 06/03/2026 21:20  
**Prioridade:** 🔴 URGENTE  
**Próximo passo:** Gerar nova chave com permissão
