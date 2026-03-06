# 🔍 DEBUG - LOGS DE SUBCONTAS

**Data**: 06/03/2026 14:38  
**Deploy**: https://b5734488.corretoracorporate.pages.dev  
**Status**: Aguardando logs do navegador  

---

## 🎯 AÇÕES NECESSÁRIAS

### 1️⃣ Recarregar a Página
```
URL: https://admin.corretoracorporate.com.br/
Ação: Ctrl + Shift + R (ou Cmd + Shift + R no Mac)
```

### 2️⃣ Abrir Console do Navegador
```
Tecla: F12 (ou Ctrl+Shift+I / Cmd+Option+I no Mac)
Aba: Console
```

### 3️⃣ Navegar até Subcontas
```
Menu: Subcontas
```

---

## 📊 LOGS ESPERADOS NO CONSOLE

Você deverá ver logs como:

```javascript
🔍 Buscando subcontas...
📌 Endpoint: /subaccounts
📌 API URL: https://api.asaas.com/v3

📊 Resultado da API: {
  ok: true,
  status: 200,
  totalCount: 4,
  hasData: true,
  dataKeys: ['object', 'hasMore', 'totalCount', 'limit', 'offset', 'data'],
  fullResponse: '{"object":"list","hasMore":false,"totalCount":4...'
}

✅ Retornando 4 subcontas
```

**OU (se vazio):**

```javascript
🔍 Buscando subcontas...
📌 Endpoint: /subaccounts
📌 API URL: https://api.asaas.com/v3

📊 Resultado da API: {
  ok: true,
  status: 200,
  totalCount: 0,
  hasData: true,
  dataKeys: ['object', 'hasMore', 'totalCount', 'limit', 'offset', 'data'],
  fullResponse: '{"object":"list","hasMore":false,"totalCount":0,"data":[]}'
}

⚠️ Retornando array vazio - data: {object: 'list', totalCount: 0, data: []}
```

---

## 🔍 O QUE ESTAMOS INVESTIGANDO

### Hipótese 1: API retorna vazio
- ✅ Token correto
- ✅ Endpoint correto (`/subaccounts`)
- ❓ Mas API Asaas retorna `totalCount: 0`

**Motivo possível:** Subcontas criadas pelo painel web não aparecem na API.

### Hipótese 2: Token não tem permissão
- ❓ Token pode não ter acesso a `/subaccounts`
- ❓ Pode precisar de permissão específica

### Hipótese 3: Endpoint incorreto
- ❓ Documentação pode estar desatualizada
- ❓ Pode ser outro endpoint (ex: `/accounts` com filtro)

---

## 📝 PRÓXIMOS PASSOS (BASEADO NOS LOGS)

### Se `totalCount: 0`:
```bash
# Opção 1: Criar subcontas via API em vez de painel
POST /v3/subaccounts
{
  "name": "Roberto Caporalle Mayo",
  "email": "roberto@...",
  "cpfCnpj": "06853057830",
  ...
}

# Opção 2: Verificar se é endpoint diferente
GET /v3/accounts?filter=subaccount
```

### Se `totalCount: 4`:
✅ Problema está no frontend, não no backend!

---

## 🆘 SE TUDO FALHAR

### Alternativa: Cadastrar Manualmente no Banco D1

```sql
-- Inserir as 4 subcontas manualmente no D1
INSERT INTO subaccounts (id, name, email, cpf_cnpj, wallet_id, status) VALUES
('acc_roberto', 'Roberto Caporalle Mayo', 'roberto@...', '06853057830', 'wallet_id', 'APPROVED'),
('acc_saulo', 'Saulo Salvador', 'saulo@...', '08827284745', 'wallet_id', 'APPROVED'),
('acc_franklin', 'Franklin Madson Oliveira Soares', 'franklin@...', '13815574788', 'wallet_id', 'APPROVED'),
('acc_tanara', 'Tanara Helena Maciel da Silva', 'tanara@...', '82484368020', 'wallet_id', 'PENDING');
```

**Mas precisamos dos Wallet IDs do painel Asaas!**

---

## 📸 ME ENVIE OS LOGS

Por favor, me envie:
1. Screenshot do Console (F12)
2. Copiar e colar os logs aqui
3. Especialmente a linha `📊 Resultado da API`

---

**Status**: ⏳ Aguardando logs do console do navegador  
**Deploy**: https://b5734488.corretoracorporate.pages.dev  
**Próxima ação**: Recarregar página e enviar logs do console
