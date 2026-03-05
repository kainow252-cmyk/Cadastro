#!/bin/bash

# Script de teste PIX Automático no Sandbox Asaas
# v6.1.0 - 2026-03-05

set -e

echo "🧪 Teste PIX Automático - Ambiente Sandbox Asaas"
echo "=================================================="
echo ""

# Configurações
API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'
BASE_URL='https://corretoracorporate.pages.dev'

echo "1️⃣ Testando autenticação no Asaas Sandbox..."
echo "   API URL: $API_URL"
echo "   API Key: ${API_KEY:0:30}..."
echo ""

AUTH_TEST=$(curl -s -w "\n%{http_code}" -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/myAccount")

HTTP_CODE=$(echo "$AUTH_TEST" | tail -n1)
RESPONSE=$(echo "$AUTH_TEST" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Autenticação OK!"
  echo "   Conta: $(echo "$RESPONSE" | jq -r '.name // "N/A"')"
  echo "   Email: $(echo "$RESPONSE" | jq -r '.email // "N/A"')"
  echo "   Wallet ID: $(echo "$RESPONSE" | jq -r '.walletId // "N/A"')"
else
  echo "❌ Erro de autenticação (HTTP $HTTP_CODE)"
  echo "   Resposta: $RESPONSE"
  exit 1
fi

echo ""
echo "2️⃣ Verificando chaves PIX cadastradas..."
PIX_KEYS=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/pix/addressKeys")

PIX_COUNT=$(echo "$PIX_KEYS" | jq -r '.totalCount // 0')
echo "   Total de chaves PIX: $PIX_COUNT"

if [ "$PIX_COUNT" -gt 0 ]; then
  echo "   Chaves cadastradas:"
  echo "$PIX_KEYS" | jq -r '.data[] | "   - \(.key) (\(.type))"' 2>/dev/null || true
  echo "✅ Chaves PIX OK!"
else
  echo "⚠️  Nenhuma chave PIX cadastrada!"
  echo "   Acesse: https://sandbox.asaas.com → Configurações → PIX"
fi

echo ""
echo "3️⃣ Criando cliente de teste..."
CUSTOMER_DATA='{
  "name": "Cliente Teste PIX Auto",
  "cpfCnpj": "11144477735",
  "email": "teste.pixauto@sandbox.com",
  "mobilePhone": "11999999999",
  "notificationDisabled": false
}'

CUSTOMER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "access_token: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$CUSTOMER_DATA" \
  "$API_URL/customers")

HTTP_CODE=$(echo "$CUSTOMER_RESPONSE" | tail -n1)
CUSTOMER=$(echo "$CUSTOMER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  CUSTOMER_ID=$(echo "$CUSTOMER" | jq -r '.id')
  echo "✅ Cliente criado com sucesso!"
  echo "   ID: $CUSTOMER_ID"
  echo "   Nome: $(echo "$CUSTOMER" | jq -r '.name')"
else
  echo "⚠️  Cliente já existe ou erro (HTTP $HTTP_CODE)"
  # Tentar buscar cliente existente
  CUSTOMER_ID=$(curl -s -X GET \
    -H "access_token: $API_KEY" \
    "$API_URL/customers?cpfCnpj=11144477735" | jq -r '.data[0].id // "cus_000005735721"')
  echo "   Usando cliente existente: $CUSTOMER_ID"
fi

echo ""
echo "4️⃣ Testando criação de autorização PIX Automático..."

AUTHORIZATION_DATA=$(cat <<EOF
{
  "frequency": "MONTHLY",
  "contractId": "CONTRACT-TEST-$(date +%s)",
  "startDate": "$(date -d '+1 day' +%Y-%m-%d)",
  "finishDate": "$(date -d '+1 year' +%Y-%m-%d)",
  "value": 100.00,
  "description": "Teste PIX Automático - Assinatura Mensal",
  "customerId": "$CUSTOMER_ID",
  "immediateQrCode": {
    "expirationSeconds": 3600,
    "originalValue": 100.00,
    "description": "Primeiro pagamento - Teste PIX Automático"
  }
}
EOF
)

echo "   Payload:"
echo "$AUTHORIZATION_DATA" | jq '.'

AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "access_token: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$AUTHORIZATION_DATA" \
  "$API_URL/pix/automatic/authorizations")

HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -n1)
AUTH_RESULT=$(echo "$AUTH_RESPONSE" | head -n-1)

echo ""
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ SUCESSO! Autorização PIX Automático criada!"
  echo ""
  echo "📋 Detalhes da Autorização:"
  echo "$AUTH_RESULT" | jq '{
    id,
    status,
    frequency,
    value,
    description,
    qrCode: (.immediateQrCode.payload // "N/A"),
    expirationDate: (.immediateQrCode.expirationDate // "N/A")
  }'
  
  AUTH_ID=$(echo "$AUTH_RESULT" | jq -r '.id')
  QR_PAYLOAD=$(echo "$AUTH_RESULT" | jq -r '.immediateQrCode.payload // ""')
  
  echo ""
  echo "🔐 Autorização ID: $AUTH_ID"
  echo ""
  echo "📱 PIX Copia e Cola:"
  echo "$QR_PAYLOAD"
  echo ""
  echo "✅ PIX AUTOMÁTICO FUNCIONANDO NO SANDBOX!"
  echo ""
  echo "📝 Próximos passos:"
  echo "   1. Escaneie o QR Code ou use Pix Copia e Cola"
  echo "   2. Autorize o pagamento no app do banco"
  echo "   3. O sistema agendará cobranças mensais automaticamente"
  echo ""
  echo "🌐 Teste no sistema web:"
  echo "   $BASE_URL/subscription-signup/[SEU-LINK-ID]"
  
else
  echo "❌ ERRO ao criar autorização (HTTP $HTTP_CODE)"
  echo ""
  echo "Resposta completa:"
  echo "$AUTH_RESULT" | jq '.' || echo "$AUTH_RESULT"
  echo ""
  
  ERROR_CODE=$(echo "$AUTH_RESULT" | jq -r '.errors[0].code // "unknown"')
  ERROR_DESC=$(echo "$AUTH_RESULT" | jq -r '.errors[0].description // "N/A"')
  
  echo "❌ Erro: $ERROR_CODE"
  echo "   Descrição: $ERROR_DESC"
  echo ""
  
  if [[ "$ERROR_DESC" == *"chave Pix"* ]]; then
    echo "⚠️  SOLUÇÃO: Cadastre uma chave PIX no Asaas Sandbox"
    echo "   1. Acesse: https://sandbox.asaas.com"
    echo "   2. Menu → Configurações → PIX"
    echo "   3. Cadastrar Nova Chave (recomendado: Chave Aleatória)"
    echo "   4. Execute este script novamente"
  fi
  
  exit 1
fi

echo ""
echo "=================================================="
echo "✅ Teste concluído com sucesso!"
echo "=================================================="
