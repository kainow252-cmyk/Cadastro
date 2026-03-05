#!/bin/bash

# Script para testar criação de link PIX no Sandbox
# Usage: ./test-sandbox-link.sh <sua-chave-api-sandbox>

API_KEY="${1}"

if [ -z "$API_KEY" ]; then
  echo "❌ Erro: Forneça a chave API do sandbox"
  echo "Usage: ./test-sandbox-link.sh \$aact_..."
  exit 1
fi

echo "🧪 Teste de Link PIX Automático - Sandbox Asaas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Criar customer de teste
echo "1️⃣ Criando customer de teste..."
CUSTOMER_RESPONSE=$(curl -s -X POST \
  "https://api-sandbox.asaas.com/v3/customers" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  -H "access_token: $API_KEY" \
  -d '{
    "name": "Cliente Teste PIX Auto",
    "cpfCnpj": "11144477735",
    "email": "cliente.teste@pixauto.com"
  }')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.id')

if [ "$CUSTOMER_ID" == "null" ]; then
  echo "❌ Erro ao criar customer:"
  echo $CUSTOMER_RESPONSE | jq '.'
  exit 1
fi

echo "✅ Customer criado: $CUSTOMER_ID"
echo ""

# 2. Criar autorização PIX Automático
echo "2️⃣ Criando autorização PIX Automático..."
AUTH_RESPONSE=$(curl -s -X POST \
  "https://api-sandbox.asaas.com/v3/pix/automatic/authorizations" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  -H "access_token: $API_KEY" \
  -d "{
    \"frequency\": \"MONTHLY\",
    \"contractId\": \"CONTRACT-TEST-$(date +%s)\",
    \"startDate\": \"$(date +%Y-%m-%d)\",
    \"finishDate\": \"$(date -d '+1 year' +%Y-%m-%d)\",
    \"value\": 10,
    \"description\": \"Teste PIX Automático\",
    \"customerId\": \"$CUSTOMER_ID\",
    \"immediateQrCode\": {
      \"expirationSeconds\": 3600,
      \"originalValue\": 10,
      \"description\": \"Primeiro pagamento teste\"
    }
  }")

echo ""
echo "📥 Resposta da API:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo $AUTH_RESPONSE | jq '.'
echo ""

# Verificar se teve sucesso
if echo "$AUTH_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  AUTH_ID=$(echo $AUTH_RESPONSE | jq -r '.id')
  QR_CODE=$(echo $AUTH_RESPONSE | jq -r '.immediateQrCode.payload // .qrCode.payload // "N/A"')
  
  echo "✅ SUCESSO!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Authorization ID: $AUTH_ID"
  echo ""
  echo "QR Code Payload:"
  echo "$QR_CODE"
  echo ""
  echo "🎯 PIX Automático está funcionando no Sandbox!"
else
  echo "❌ ERRO ao criar autorização"
  echo ""
  echo "Possíveis causas:"
  echo "- Chave PIX não cadastrada no sandbox"
  echo "- Permissão negada para API PIX Automático"
  echo "- Conta sandbox não habilitada para PIX"
fi
