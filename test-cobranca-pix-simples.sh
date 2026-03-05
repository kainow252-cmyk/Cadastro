#!/bin/bash

# Script de teste de cobrança PIX simples no Sandbox Asaas
# Teste básico sem split

set -e

echo "🧪 Teste de Cobrança PIX Simples - Sandbox Asaas"
echo "================================================"
echo ""

# Configurações
API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'

echo "1️⃣ Validando autenticação..."
ACCOUNT_INFO=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/myAccount")

ACCOUNT_NAME=$(echo "$ACCOUNT_INFO" | jq -r '.name')
ACCOUNT_CPF=$(echo "$ACCOUNT_INFO" | jq -r '.cpfCnpj')

echo "   ✅ Conta: $ACCOUNT_NAME"
echo "   📋 CNPJ: $ACCOUNT_CPF"
echo ""

echo "2️⃣ Buscando cliente de teste..."
CUSTOMER_CPF="11144477735"
CUSTOMER_SEARCH=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers?cpfCnpj=$CUSTOMER_CPF")

CUSTOMER_ID=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].id // ""')

if [ -z "$CUSTOMER_ID" ]; then
  echo "   Cliente não encontrado, criando..."
  
  CUSTOMER_DATA='{
    "name": "Cliente Teste PIX",
    "cpfCnpj": "11144477735",
    "email": "teste.pix@sandbox.com",
    "mobilePhone": "11999887766"
  }'
  
  CUSTOMER_RESPONSE=$(curl -s -X POST \
    -H "access_token: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$CUSTOMER_DATA" \
    "$API_URL/customers")
  
  CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.id')
fi

CUSTOMER_NAME=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers/$CUSTOMER_ID" | jq -r '.name')

echo "   ✅ Cliente: $CUSTOMER_NAME (ID: $CUSTOMER_ID)"
echo ""

# Criar 3 cobranças de teste com valores diferentes
VALORES=(50.00 100.00 200.00)
COBRANCAS_CRIADAS=()

for i in "${!VALORES[@]}"; do
  VALOR="${VALORES[$i]}"
  NUM=$((i + 1))
  
  echo "3.$NUM️⃣ Criando Cobrança PIX #$NUM - R$ $VALOR..."
  
  PAYMENT_DATA=$(cat <<EOF
{
  "customer": "$CUSTOMER_ID",
  "billingType": "PIX",
  "value": $VALOR,
  "dueDate": "$(date -d "+$((NUM + 6)) days" +%Y-%m-%d)",
  "description": "Teste PIX #$NUM - R$ $VALOR - Sandbox"
}
EOF
)
  
  PAYMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "access_token: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$PAYMENT_DATA" \
    "$API_URL/payments")
  
  HTTP_CODE=$(echo "$PAYMENT_RESPONSE" | tail -n1)
  PAYMENT=$(echo "$PAYMENT_RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
    PAYMENT_STATUS=$(echo "$PAYMENT" | jq -r '.status')
    INVOICE_URL=$(echo "$PAYMENT" | jq -r '.invoiceUrl')
    
    echo "   ✅ Cobrança criada com sucesso!"
    echo "   ├─ ID: $PAYMENT_ID"
    echo "   ├─ Status: $PAYMENT_STATUS"
    echo "   ├─ Valor: R$ $VALOR"
    echo "   └─ URL: $INVOICE_URL"
    
    # Buscar QR Code
    sleep 1
    QR_RESPONSE=$(curl -s -X GET \
      -H "access_token: $API_KEY" \
      "$API_URL/payments/$PAYMENT_ID/pixQrCode")
    
    QR_PAYLOAD=$(echo "$QR_RESPONSE" | jq -r '.payload // "N/A"')
    
    if [ "$QR_PAYLOAD" != "N/A" ] && [ "$QR_PAYLOAD" != "null" ]; then
      echo "   📱 QR Code: ✅ Gerado"
      echo "   💳 Payload: ${QR_PAYLOAD:0:50}..."
    else
      echo "   ⏳ QR Code: Aguardando geração"
    fi
    
    COBRANCAS_CRIADAS+=("$PAYMENT_ID|$VALOR|$INVOICE_URL")
    echo ""
  else
    echo "   ❌ Erro ao criar cobrança (HTTP $HTTP_CODE)"
    echo "$PAYMENT" | jq '.'
    echo ""
  fi
done

echo "================================================"
echo "📊 Resumo das Cobranças Criadas:"
echo "================================================"
echo ""

for i in "${!COBRANCAS_CRIADAS[@]}"; do
  IFS='|' read -r ID VALOR URL <<< "${COBRANCAS_CRIADAS[$i]}"
  NUM=$((i + 1))
  echo "Cobrança #$NUM:"
  echo "  💰 Valor: R$ $VALOR"
  echo "  🆔 ID: $ID"
  echo "  🔗 URL: $URL"
  echo ""
done

echo "✅ Total de cobranças criadas: ${#COBRANCAS_CRIADAS[@]}"
echo ""
echo "🧪 Para simular pagamento:"
echo "1. Acesse uma das URLs acima"
echo "2. Escaneie o QR Code PIX"
echo "3. Confirme o pagamento no simulador"
echo ""
echo "================================================"
echo "✅ Teste concluído!"
echo "================================================"
