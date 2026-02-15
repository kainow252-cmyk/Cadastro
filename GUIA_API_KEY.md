# 🔑 Guia de Geração de API Keys para Subcontas

## 📋 Visão Geral

O sistema agora permite gerar **API Keys** para subcontas diretamente pela interface do dashboard, facilitando a integração das subcontas com sistemas externos.

## ⚙️ Configuração Necessária (IMPORTANTE!)

### Passo 1: Habilitar o Gerenciamento de API Keys

Antes de usar esta funcionalidade, você **DEVE** habilitar o acesso nas configurações do Asaas:

1. **Acesse a conta principal** no site do Asaas: https://www.asaas.com
2. Vá em **Integrações** → **Chaves de API**
3. Localize a seção **"Gerenciamento de Chaves de API de Subcontas"**
   - Esta seção só aparece se você tiver subcontas criadas
4. Clique em **"Habilitar acesso"**

### ⚠️ Importante sobre a Habilitação

- **Duração**: A habilitação dura **apenas 2 horas**
- **Expiração automática**: Após 2 horas, o acesso é revogado automaticamente
- **Segurança**: É necessário habilitar novamente se precisar após expirar
- **Whitelist IP**: Se você tiver whitelist de IP habilitado, certifique-se que o servidor está na lista

### Por que essa segurança?

Esta é uma operação sensível que permite gerar chaves de acesso para subcontas. Por isso, o Asaas exige habilitação manual temporária para prevenir acessos não autorizados.

---

## 🚀 Como Gerar API Key para uma Subconta

### Opção 1: Pela Interface (Recomendado)

#### **Passo a Passo**

1. **Acesse o Dashboard**
   - URL: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
   - Login: `admin` / `admin123`

2. **Vá para a Seção PIX**
   - Clique no botão **"PIX"** no menu superior

3. **Selecione a Subconta**
   - No dropdown "Subconta", escolha a subconta desejada
   - Exemplo: "Gelci jose da silva - gelci.jose.grouptrig@gmail.com"

4. **Gere a API Key**
   - Clique no botão **azul com ícone de chave** (🔑)
   - Ou clique no link "Gerar API Key" abaixo do dropdown

5. **Confirme a Ação**
   - Uma janela de confirmação aparecerá
   - Leia os avisos importantes
   - Clique em "OK" para continuar

6. **Aguarde o Processamento**
   - O botão mostrará um spinner de loading
   - Aguarde a geração (geralmente 2-3 segundos)

7. **Copie a API Key**
   - ✅ A API Key será exibida em um campo destacado
   - **ATENÇÃO**: Esta é a **ÚNICA VEZ** que ela será exibida!
   - Clique no botão **"Copiar"** (📋) para copiar para área de transferência
   - Guarde em local seguro (gerenciador de senhas, arquivo .env, etc.)

8. **Informações Exibidas**
   - Nome da API Key
   - ID único
   - Data de criação
   - Data de expiração (se houver)
   - Status (Ativa/Inativa)

#### **Visual da Interface**

```
┌─────────────────────────────────────────────────┐
│ Subconta *                                      │
│ ┌──────────────────────────┬─────┬─────┐       │
│ │ Gelci jose da silva      │ 🔑  │ 🔄  │       │
│ └──────────────────────────┴─────┴─────┘       │
│                                                  │
│ 🔑 Gerar API Key                                │
└─────────────────────────────────────────────────┘

Após gerar:

┌─────────────────────────────────────────────────┐
│ 🔑 API Key Gerada                          ✖    │
├─────────────────────────────────────────────────┤
│ API Key:                                        │
│ ┌──────────────────────────────────────┬─────┐ │
│ │ $aact_YTU5YTE0M2Jj...                │ 📋  │ │
│ └──────────────────────────────────────┴─────┘ │
│                                                  │
│ Nome: API Key - Gelci jose da silva            │
│ ID: act_xxxxxxxxxxxxx                           │
│ Criada em: 15/02/2026 às 10:30                 │
│ Status: ✅ Ativa                                │
│                                                  │
│ ⚠️ ATENÇÃO: Esta é a única vez que a API Key  │
│ será exibida. Copie e guarde em local seguro! │
└─────────────────────────────────────────────────┘
```

---

### Opção 2: Pela API (Desenvolvedores)

#### **Endpoint**

```http
POST /api/accounts/{accountId}/api-key
Content-Type: application/json
Authorization: Bearer {seu-jwt-token}

{
  "name": "Minha API Key",
  "expiresAt": "2026-12-31"  // opcional
}
```

#### **Exemplo com cURL**

```bash
# Gerar API Key para subconta
curl -X POST http://localhost:3000/api/accounts/62118294-2d2b-4df7-b4a1-af31fa80e065/api-key \
  -H "Content-Type: application/json" \
  -b "auth_token=seu-jwt-token-aqui" \
  -d '{
    "name": "API Key - Integração Sistema X",
    "expiresAt": "2026-12-31"
  }'
```

#### **Resposta de Sucesso**

```json
{
  "ok": true,
  "data": {
    "id": "act_abc123xyz789",
    "apiKey": "$aact_YTU5YTE0M2Jj4ZDFh5MmExN2Q2NGNhNjBi4ODVhZGQ3Odg1YjM",
    "name": "API Key - Integração Sistema X",
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "active": true,
    "createdAt": "2026-02-15T13:30:45.000Z"
  },
  "warning": "⚠️ IMPORTANTE: Esta é a única vez que a API Key será exibida. Guarde-a em local seguro!"
}
```

#### **Resposta de Erro (Acesso Não Habilitado)**

```json
{
  "error": "Erro ao gerar API Key",
  "details": {
    "errors": [
      {
        "code": "access_denied",
        "description": "Gerenciamento de API Keys não habilitado"
      }
    ]
  },
  "message": "Verifique se o gerenciamento de API Keys está habilitado nas configurações da conta principal (válido por 2 horas)"
}
```

---

## 📊 Gerenciar API Keys Existentes

### Listar API Keys de uma Subconta

```bash
GET /api/accounts/{accountId}/api-keys
```

**Exemplo:**
```bash
curl http://localhost:3000/api/accounts/62118294-2d2b-4df7-b4a1-af31fa80e065/api-keys \
  -H "Content-Type: application/json" \
  -b "auth_token=seu-jwt-token"
```

**Resposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "act_abc123",
      "name": "API Key - Sistema X",
      "active": true,
      "dateCreated": "2026-02-15T10:30:00.000Z",
      "expiresAt": "2026-12-31T23:59:59.000Z"
    },
    {
      "id": "act_def456",
      "name": "API Key - Sistema Y",
      "active": true,
      "dateCreated": "2026-02-10T14:20:00.000Z",
      "expiresAt": null
    }
  ]
}
```

### Excluir API Key

```bash
DELETE /api/accounts/{accountId}/api-keys/{keyId}
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:3000/api/accounts/62118294-2d2b-4df7-b4a1-af31fa80e065/api-keys/act_abc123 \
  -b "auth_token=seu-jwt-token"
```

**Resposta:**
```json
{
  "ok": true,
  "message": "API Key excluída com sucesso"
}
```

---

## 🔐 Boas Práticas de Segurança

### ✅ Recomendações

1. **Nunca compartilhe API Keys publicamente**
   - Não commite em repositórios Git
   - Não envie por email ou chat não criptografado
   - Use variáveis de ambiente (.env)

2. **Use nomes descritivos**
   - Exemplo: "API Key - Produção - Sistema de Vendas"
   - Ajuda a identificar e gerenciar depois

3. **Configure data de expiração**
   - Para ambientes de teste: 30-90 dias
   - Para produção: 1 ano com rotação programada

4. **Rotacione periodicamente**
   - Gere novas API Keys a cada 6-12 meses
   - Exclua as antigas após migração

5. **Monitore uso**
   - Verifique logs de acesso
   - Identifique acessos suspeitos

6. **Armazene com segurança**
   - Use gerenciadores de senha (1Password, LastPass)
   - Ou sistemas de secrets (AWS Secrets Manager, HashiCorp Vault)

### ❌ O que NÃO fazer

- ❌ Compartilhar a mesma API Key entre múltiplos sistemas
- ❌ Deixar API Keys sem expiração indefinidamente
- ❌ Armazenar em arquivos de texto simples
- ❌ Enviar por WhatsApp, Telegram, SMS
- ❌ Incluir em código-fonte versionado

---

## 🐛 Solução de Problemas

### Erro: "Acesso negado" ou "Unauthorized"

**Causa**: Gerenciamento de API Keys não habilitado ou expirado

**Solução**:
1. Acesse o Asaas web
2. Vá em Integrações → Chaves de API
3. Habilite "Gerenciamento de Chaves de API de Subcontas"
4. Tente novamente (dentro de 2 horas)

### Erro: "Subconta não encontrada"

**Causa**: ID da subconta inválido

**Solução**:
1. Verifique se o ID está correto
2. Liste todas as subcontas: `GET /api/accounts`
3. Use o ID retornado pela API

### API Key não funciona

**Possíveis causas**:
1. **Expirada**: Verifique a data de expiração
2. **Revogada**: Alguém excluiu a API Key
3. **Ambiente errado**: Usando chave de sandbox em produção ou vice-versa
4. **Permissões**: A API Key pode não ter todas as permissões necessárias

**Solução**: Gere uma nova API Key

### Não consigo copiar a API Key

**Solução**:
1. Clique no campo da API Key
2. Use Ctrl+A (selecionar tudo) e Ctrl+C (copiar)
3. Ou clique com botão direito → Copiar
4. Se não funcionar, anote manualmente (cuidado com erros!)

---

## 📚 Exemplos de Uso

### Exemplo 1: Integração com Sistema Externo

```javascript
// Depois de gerar a API Key, use-a em seu sistema:

const ASAAS_API_KEY = '$aact_YTU5YTE0M2Jj...' // API Key da subconta
const ASAAS_API_URL = 'https://api-sandbox.asaas.com/v3'

async function criarCobranca(dadosCliente, valor) {
  const response = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
      'User-Agent': 'MeuSistema/1.0'
    },
    body: JSON.stringify({
      customer: dadosCliente.cpf,
      billingType: 'PIX',
      value: valor,
      dueDate: new Date().toISOString().split('T')[0]
    })
  })
  
  return await response.json()
}
```

### Exemplo 2: Armazenar em .env

```bash
# .env
ASAAS_API_KEY_SUBCONTA_GELCI=$aact_YTU5YTE0M2Jj...
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

```javascript
// app.js
require('dotenv').config()

const apiKey = process.env.ASAAS_API_KEY_SUBCONTA_GELCI
const apiUrl = process.env.ASAAS_API_URL

// Use as variáveis...
```

---

## 📞 Suporte

### Documentação Oficial Asaas
- [Gerenciamento de API Keys](https://docs.asaas.com/docs/gerenciamento-de-chaves-de-api-de-subcontas)
- [Autenticação](https://docs.asaas.com/docs/authentication)

### Perguntas Frequentes

**P: Quantas API Keys posso criar por subconta?**  
R: Até 10 API Keys por conta Asaas (incluindo subcontas)

**P: Posso recuperar uma API Key perdida?**  
R: Não. Se perdeu a API Key, gere uma nova e exclua a antiga.

**P: A API Key da subconta funciona em produção?**  
R: Sim, mas gere uma nova em produção (não use a do sandbox)

**P: Como saber se minha API Key está ativa?**  
R: Use o endpoint `GET /api/accounts/{id}/api-keys` e verifique o campo `active`

---

## 🎯 Casos de Uso

### 1. **Marketplace Multi-vendedor**
- Cada vendedor tem uma subconta
- Cada subconta tem sua API Key
- Vendedor integra com seu próprio sistema
- Recebe 80% automaticamente via split

### 2. **SaaS com White Label**
- Cada cliente white label é uma subconta
- Cliente gera cobranças em nome próprio
- Usa API Key da própria subconta
- Você (plataforma) recebe 20% via split

### 3. **Sistema de Afiliados**
- Afiliados são subcontas
- Cada um tem API Key própria
- Geram cobranças para seus clientes
- Recebem 80% via split

---

**✅ Pronto! Agora você pode gerar API Keys para suas subcontas e integrá-las com qualquer sistema.**

**⚠️ LEMBRE-SE**: Sempre habilite o gerenciamento nas configurações do Asaas antes de usar!
