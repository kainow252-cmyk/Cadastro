# 🔐 Configurar Whitelist de IPs no Asaas

## Problema Atual

Ao tentar criar **payment links em subcontas**, o sistema retorna erro:

```json
{
  "error": "Para utilizar este recurso é necessário ter uma configuração de whitelist de IPs configurada"
}
```

Isso acontece porque a **API Asaas exige whitelist de IPs** para gerenciar chaves de API de subcontas.

---

## 📋 Passo a Passo para Configurar

### 1. Acessar Painel Asaas

1. Acesse: https://www.asaas.com
2. Faça login com sua conta **PRINCIPAL** (não a subconta)
3. Você deve estar logado com a conta que possui a API Key principal

---

### 2. Navegar até Integrações

1. No menu lateral, clique em: **Integrações**
2. Depois clique em: **Chaves de API**

---

### 3. Configurar Gerenciamento de Subcontas

1. Procure a seção: **Gerenciamento de Chaves de API de Subcontas**
2. Clique em: **Habilitar acesso**
3. Aceite os termos se solicitado

---

### 4. Adicionar IPs ao Whitelist

Você precisa adicionar os **IPs do Cloudflare Workers** ao whitelist.

**Opção 1: Liberar todos os IPs (TEMPORÁRIO - APENAS PARA TESTE)**
- Adicionar: `0.0.0.0/0` (permite todos os IPs)
- ⚠️ **NÃO RECOMENDADO para produção**

**Opção 2: IPs do Cloudflare Workers (RECOMENDADO)**

Os IPs do Cloudflare mudam dinamicamente. Existem duas abordagens:

**2A. Usar IP Range do Cloudflare:**

Adicione os principais ranges de IP do Cloudflare (atualizado em 2026):

```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**2B. Verificar IP atual:**

Execute este comando para ver qual IP o Cloudflare está usando agora:

```bash
curl -s https://cadastro.corretoracorporate.com.br/api/check-ip
```

(Se esse endpoint não existir, vou criar)

**2C. Consultar lista oficial:**
- Acesse: https://www.cloudflare.com/ips/
- Baixe a lista completa de IPv4 e IPv6

---

### 5. Salvar Configurações

1. Após adicionar os IPs, clique em **Salvar**
2. Aguarde 1-2 minutos para a configuração propagar
3. Teste criando um payment link para uma subconta

---

## 🧪 Como Testar

Após configurar o whitelist, teste criando um link:

### Via Interface Web:

1. Acesse: https://cadastro.corretoracorporate.com.br
2. Login: `admin` / `admin123`
3. Navegue até: **Links de Pagamento**
4. Clique em: **Gerar Link**
5. **Selecione a subconta**: `Franklin Madson Oliveira Soares`
6. Preencha:
   - Nome: `Teste Subconta PIX`
   - Descrição: `Teste de link na subconta`
   - Método: `PIX`
   - Tipo: `Valor Fixo`
   - Valor: `5.00`
7. Clique em: **Gerar Link**

**Resultado Esperado:**
- ✅ Link criado com sucesso
- ✅ QR Code gerado com chave PIX da subconta: `b0e857ff-e03b-4b16-8492-f0431de088f8`
- ✅ Pagamentos vão direto para a subconta Franklin Madson

**Se der erro:**
- ❌ "Para utilizar este recurso..." → Whitelist ainda não configurado
- ❌ "Subconta não possui chaves API" → Precisa criar chave para a subconta primeiro

---

### Via cURL (Teste Direto):

```bash
# Login
curl -X POST https://cadastro.corretoracorporate.com.br/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Criar link na subconta Franklin
curl -X POST https://cadastro.corretoracorporate.com.br/api/payment-links \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "accountId": "e59d37d7-2f9b-462c-b1c1-c730322c8236",
    "name": "Teste Subconta API",
    "description": "Link criado via API na subconta",
    "billingType": "PIX",
    "chargeType": "DETACHED",
    "value": "5.00"
  }' | jq '.'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "data": {
    "id": "xyz123abc...",
    "name": "Teste Subconta API",
    "url": "https://www.asaas.com/c/xyz123abc...",
    "billingType": "PIX",
    "value": 5.00
  },
  "account": {
    "id": "e59d37d7-2f9b-462c-b1c1-c730322c8236",
    "usedSubaccount": true
  }
}
```

---

## 🔧 Criar Chave API para Subconta

Se a subconta ainda não tiver chave API, você precisa criar:

### Via Painel Asaas:

1. Acesse: https://www.asaas.com
2. **Mude para a subconta**: No canto superior direito, selecione **Franklin Madson Oliveira Soares**
3. Vá em: **Integrações** → **Chaves de API**
4. Clique em: **Nova Chave API**
5. Configure:
   - Nome: `Chave Principal`
   - Ambiente: **Produção**
   - Permissões: Marque todas as necessárias:
     - ✅ Cobranças
     - ✅ Links de Pagamento
     - ✅ Clientes
     - ✅ Assinaturas
6. Clique em: **Gerar Chave**
7. **COPIE A CHAVE** (você só verá uma vez!)

### Via API (se whitelist configurado):

```bash
curl -X POST https://api.asaas.com/v3/accounts/e59d37d7-2f9b-462c-b1c1-c730322c8236/api-keys \
  -H "access_token: $ASAAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chave Principal Subconta",
    "environment": "PRODUCTION"
  }' | jq '.'
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário cria link de pagamento no sistema               │
│    - Seleciona subconta: Franklin Madson                   │
│    - Preenche dados: Nome, Valor, Tipo                     │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Sistema backend (src/index.tsx)                         │
│    - Recebe accountId: e59d37d7-2f9b-462c-b1c1-c730322c8236│
│    - Busca dados da subconta via API Asaas                 │
│    - Obtém walletId: b0e857ff-e03b-4b16-8492-f0431de088f8  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Sistema busca chaves API da subconta                    │
│    GET /accounts/{accountId}/api-keys                       │
│    ⚠️ AQUI QUE PRECISA DO WHITELIST                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Se whitelist OK:                                         │
│    - Obtém API key da subconta                             │
│    - Adiciona header: asaas-account-key: {subAccountKey}   │
│    - POST /paymentLinks (cria link NA SUBCONTA)            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Link criado na subconta:                                │
│    - QR Code PIX usa chave da subconta                     │
│    - Pagamentos caem direto na subconta Franklin           │
│    - Subconta recebe o dinheiro (menos taxas Asaas)        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Alternativas (se não quiser configurar whitelist)

### Opção 1: Criar links na Conta Principal

**Prós:**
- ✅ Funciona imediatamente sem whitelist
- ✅ Mais simples de gerenciar

**Contras:**
- ❌ QR Code sempre da conta principal
- ❌ Dinheiro vai para conta principal
- ❌ Você precisa distribuir manualmente para subcontas

**Como usar:**
- Simplesmente **NÃO selecione subconta** ao criar o link
- Deixe o campo de subconta vazio

---

### Opção 2: Criar Cobranças Diretas (sem link)

Em vez de criar **payment link**, criar **cobrança direta** para um customer:

```javascript
// Criar customer na subconta
POST /customers (com header asaas-account-key)

// Criar cobrança PIX para esse customer
POST /payments (com header asaas-account-key)
{
  "customer": "cus_xxx",
  "billingType": "PIX",
  "value": 15.00,
  "dueDate": "2026-03-16"
}
```

**Vantagens:**
- ✅ QR Code da subconta
- ✅ Pagamento direto para subconta
- ✅ Mais controle

**Desvantagens:**
- ❌ Não é um link reutilizável
- ❌ Precisa criar cobrança para cada cliente
- ❌ Mais complexo de implementar

---

## 🎯 Recomendação Final

**PARA PRODUÇÃO:**
1. ✅ Configure whitelist de IPs no Asaas
2. ✅ Adicione ranges de IP do Cloudflare
3. ✅ Crie chaves API para cada subconta que vai usar
4. ✅ Teste criando links de pagamento

**PARA DESENVOLVIMENTO/TESTE:**
1. Pode usar conta principal temporariamente
2. Ou adicionar `0.0.0.0/0` ao whitelist (só para teste!)
3. Lembre de remover depois e usar IPs específicos

---

## 📞 Suporte

**Se precisar de ajuda:**

1. **Erro de whitelist**: Configure IPs conforme este guia
2. **Erro de chave API**: Crie chave para a subconta
3. **Outro erro**: Verifique logs do sistema ou console do navegador

**Documentação Asaas:**
- Chaves API: https://docs.asaas.com/reference/autenticacao
- Subcontas: https://docs.asaas.com/reference/criar-nova-subconta
- Payment Links: https://docs.asaas.com/reference/criar-novo-link-de-pagamento

---

**Sistema**: Gerenciador Asaas  
**Versão**: 3.9  
**Data**: 16/02/2026  
**Deploy**: https://4ac16fdc.project-839f9256.pages.dev
