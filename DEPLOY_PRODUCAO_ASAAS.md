# 🚀 DEPLOY PRODUÇÃO - ASAAS COM 4 SUBCONTAS

**Data**: 05/03/2026 22:30  
**Ambiente**: PRODUÇÃO  
**Status**: PRONTO PARA DEPLOY  

---

## 📋 SUBCONTAS PRODUÇÃO (4 ATIVAS)

### ✅ Aprovadas (3)
```
1. Roberto Caporalle Mayo
   CPF: 068.530.578-30
   Status: ✅ Aprovado
   Data cadastro: 20/02/2026

2. Saulo Salvador
   CPF: 088.272.847-45
   Status: ✅ Aprovado
   Data cadastro: 16/02/2026

3. Franklin Madson Oliveira Soares
   CPF: 138.155.747-88
   Status: ✅ Aprovado
   Data cadastro: 16/02/2026
```

### ⏳ Pendente (1)
```
4. Tanara Helena Maciel da Silva
   CPF: 824.843.680-20
   Status: ⏳ Pendente
   Data cadastro: 18/02/2026
   Ação: Aguardar aprovação ou criar nova subconta
```

---

## 💰 CONTA PRINCIPAL

```
Saldo atual: R$ 228,02
Email: corretora@corretoracorporate.com.br
Ambiente: PRODUÇÃO (https://www.asaas.com)
API URL: https://api.asaas.com/v3
```

---

## 🎯 CONFIGURAÇÃO SPLIT 20/80

### Subconta (20%)
```
Receberá 20% de cada cobrança
Distribuído entre as 4 subcontas conforme regra de negócio
```

### Conta Principal (80%)
```
Receberá 80% de cada cobrança
Conta: corretora@corretoracorporate.com.br
```

---

## 🔧 CONFIGURAÇÃO PRODUÇÃO

### 1️⃣ Variáveis de Ambiente (.env.production)

**CRIAR ARQUIVO**: `/home/user/webapp/.env.production`

```bash
# Asaas Produção
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_ACCESS_TOKEN=seu_token_producao_aqui

# Subcontas Produção (Wallet IDs)
# IMPORTANTE: Obter os Wallet IDs das 4 subcontas
WALLET_ID_ROBERTO=obter_no_painel_asaas
WALLET_ID_SAULO=obter_no_painel_asaas
WALLET_ID_FRANKLIN=obter_no_painel_asaas
WALLET_ID_TANARA=obter_no_painel_asaas

# Subcontas IDs
SUBACCOUNT_ID_ROBERTO=obter_no_painel_asaas
SUBACCOUNT_ID_SAULO=obter_no_painel_asaas
SUBACCOUNT_ID_FRANKLIN=obter_no_painel_asaas
SUBACCOUNT_ID_TANARA=obter_no_painel_asaas

# Ambiente
NODE_ENV=production
```

---

## 📝 OBTER WALLET IDs E SUBACCOUNT IDs

### Passo a Passo no Painel Asaas

1. **Login**: https://www.asaas.com
2. **Menu**: Parceiros → Subcontas
3. **Clicar em cada subconta** e copiar:
   - **Wallet ID** (ex: 553fbb67-5370-4ea2-9f04-c5bece015bc7)
   - **Subaccount ID** (ex: 9858baf5-c856-4aa3-8b9e-b0be826c283a)

### Ou via API:

```bash
curl -X GET "https://api.asaas.com/v3/subaccounts" \
  -H "access_token: SEU_TOKEN_PRODUCAO" \
  -H "Content-Type: application/json"
```

---

## 🔐 TOKEN DE PRODUÇÃO

### Como Obter:

1. Login: https://www.asaas.com
2. Menu: Meu Dinheiro → Integrações → API
3. Copiar **Token de Produção**
4. ⚠️ **NUNCA** commitar o token no Git
5. Usar em `.env.production` (já está no `.gitignore`)

---

## 📂 ESTRUTURA DE ARQUIVOS

```
webapp/
├── src/
│   ├── index.tsx              # Hono app principal
│   └── config/
│       └── asaas.ts           # Client Asaas (já pronto)
├── .env.production            # Variáveis produção (CRIAR)
├── .env                       # Variáveis sandbox (existente)
├── wrangler.jsonc             # Config Cloudflare
├── package.json
└── README.md
```

---

## 🚀 DEPLOY PARA CLOUDFLARE PAGES

### Pré-requisitos

1. ✅ Código pronto
2. ✅ 4 subcontas criadas
3. ⏳ Token de produção obtido
4. ⏳ Wallet IDs copiados
5. ⏳ `.env.production` criado

### Comandos de Deploy

```bash
# 1. Verificar se está tudo OK
cd /home/user/webapp
npm run build

# 2. Configurar secrets no Cloudflare Pages
# (Fazer isso ANTES do deploy)
npx wrangler pages secret put ASAAS_API_URL --project-name corretoracorporate
npx wrangler pages secret put ASAAS_ACCESS_TOKEN --project-name corretoracorporate
npx wrangler pages secret put WALLET_ID_ROBERTO --project-name corretoracorporate
npx wrangler pages secret put WALLET_ID_SAULO --project-name corretoracorporate
npx wrangler pages secret put WALLET_ID_FRANKLIN --project-name corretoracorporate
npx wrangler pages secret put WALLET_ID_TANARA --project-name corretoracorporate

# 3. Deploy
npx wrangler pages deploy dist --project-name corretoracorporate --branch main
```

---

## ⚠️ ATENÇÃO: SUBCONTA PENDENTE

**Tanara Helena Maciel da Silva** está com status **Pendente**.

### Opções:

1. **Aguardar aprovação** (pode demorar)
2. **Criar nova subconta** para substituir
3. **Usar apenas 3 subcontas** e distribuir split entre elas

### Recomendação:
Usar as **3 subcontas aprovadas** para o deploy inicial.

---

## 🧪 TESTES EM PRODUÇÃO

### Após Deploy:

1. **Criar cobrança teste** (valor pequeno, ex: R$ 10)
2. **Verificar split 20/80**:
   - Subconta recebe: R$ 2,00
   - Conta principal recebe: R$ 8,00
3. **Simular pagamento** com PIX teste
4. **Verificar repasses** no painel Asaas
5. **Validar saldos** das 4 contas

---

## 📊 ESTRUTURA DO CÓDIGO SPLIT

### Exemplo de Cobrança com Split (4 subcontas)

```typescript
// src/index.tsx
import { AsaasClient } from './config/asaas'

// Produção
const client = new AsaasClient(
  env.ASAAS_ACCESS_TOKEN,
  'https://api.asaas.com/v3'
)

// Criar cobrança com split 20/80 (distribuído entre 4 subcontas)
const valorTotal = 100.00
const percentualSubconta = 0.20 // 20%
const valorSubconta = valorTotal * percentualSubconta / 4 // R$ 5 cada

const cobranca = await client.createPayment({
  customer: 'cus_000000000000',
  billingType: 'PIX',
  value: valorTotal,
  dueDate: '2026-03-10',
  splits: [
    {
      walletId: env.WALLET_ID_ROBERTO,
      fixedValue: valorSubconta // R$ 5
    },
    {
      walletId: env.WALLET_ID_SAULO,
      fixedValue: valorSubconta // R$ 5
    },
    {
      walletId: env.WALLET_ID_FRANKLIN,
      fixedValue: valorSubconta // R$ 5
    },
    {
      walletId: env.WALLET_ID_TANARA,
      fixedValue: valorSubconta // R$ 5
    }
  ]
  // Conta principal recebe automaticamente: R$ 80 (80%)
})
```

---

## ✅ CHECKLIST DE DEPLOY

```
[⏳] Obter token de produção Asaas
[⏳] Obter Wallet IDs das 4 subcontas
[⏳] Obter Subaccount IDs das 4 subcontas
[⏳] Criar arquivo .env.production
[⏳] Verificar subconta Tanara (pendente)
[⏳] Configurar secrets no Cloudflare Pages
[⏳] Build do projeto (npm run build)
[⏳] Deploy para Cloudflare Pages
[⏳] Criar cobrança teste
[⏳] Simular pagamento
[⏳] Validar split 20/80
[⏳] Verificar saldos das 4 contas
[⏳] Confirmar repasses automáticos
```

---

## 📞 PRÓXIMAS AÇÕES

### 1️⃣ VOCÊ (Agora)
```
1. Obter token de produção Asaas
2. Copiar Wallet IDs das 4 subcontas
3. Copiar Subaccount IDs das 4 subcontas
4. Me enviar os dados
```

### 2️⃣ EU (Após receber dados)
```
1. Criar .env.production
2. Configurar secrets Cloudflare
3. Build do projeto
4. Deploy produção
5. Criar cobrança teste
```

### 3️⃣ VALIDAÇÃO (Juntos)
```
1. Testar cobrança
2. Simular pagamento
3. Verificar split
4. Confirmar funcionamento
```

---

## 🎯 RESULTADO ESPERADO

```
✅ Sistema funcionando em produção
✅ Split 20/80 ativo
✅ 4 subcontas recebendo repasses
✅ Conta principal recebendo 80%
✅ Cobranças PIX criadas corretamente
✅ QR Codes gerados
✅ Pagamentos processados
✅ Repasses automáticos OK
```

---

## 📊 DADOS NECESSÁRIOS

**Por favor, me envie:**

```
1. Token de Produção Asaas: $aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoX... (exemplo)

2. Wallet IDs:
   - Roberto: ?
   - Saulo: ?
   - Franklin: ?
   - Tanara: ?

3. Subaccount IDs:
   - Roberto: ?
   - Saulo: ?
   - Franklin: ?
   - Tanara: ?
```

---

## 🔗 LINKS IMPORTANTES

```
Painel Produção: https://www.asaas.com
API Produção: https://api.asaas.com/v3
Subcontas: https://www.asaas.com/childAccount/list
Integrações: https://www.asaas.com/myAccount/integrations
Docs: https://docs.asaas.com
```

---

**Status**: ⏳ Aguardando dados de produção  
**Progresso**: 90%  
**Próxima ação**: Enviar token + Wallet IDs + Subaccount IDs
