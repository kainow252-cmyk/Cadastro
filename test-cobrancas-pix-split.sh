#!/bin/bash

# Script de teste de cobranças PIX com Split no Sandbox Asaas
# Testa PIX normal e valida divisão 20/80

set -e

echo "🧪 Teste de Cobranças PIX com Split - Sandbox Asaas"
echo "=================================================="
echo ""

# Configurações
API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'

echo "1️⃣ Obtendo informações da conta principal..."
ACCOUNT_INFO=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/myAccount")

ACCOUNT_NAME=$(echo "$ACCOUNT_INFO" | jq -r '.name')
ACCOUNT_WALLET=$(echo "$ACCOUNT_INFO" | jq -r '.walletId // "N/A"')

echo "   ✅ Conta: $ACCOUNT_NAME"
echo "   📋 Wallet ID: $ACCOUNT_WALLET"
echo ""

echo "2️⃣ Buscando ou criando cliente de teste..."
CUSTOMER_CPF="11144477735"
CUSTOMER_SEARCH=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers?cpfCnpj=$CUSTOMER_CPF")

CUSTOMER_ID=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].id // ""')

if [ -z "$CUSTOMER_ID" ]; then
  echo "   ℹ️  Cliente não encontrado, criando novo..."
  
  CUSTOMER_DATA='{
    "name": "Cliente Teste PIX Split",
    "cpfCnpj": "11144477735",
    "email": "teste.split.pix@sandbox.com",
    "mobilePhone": "11999887766",
    "notificationDisabled": false
  }'
  
  CUSTOMER_RESPONSE=$(curl -s -X POST \
    -H "access_token: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$CUSTOMER_DATA" \
    "$API_URL/customers")
  
  CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.id')
  echo "   ✅ Cliente criado: $CUSTOMER_ID"
else
  echo "   ✅ Cliente encontrado: $CUSTOMER_ID"
fi

CUSTOMER_NAME=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers/$CUSTOMER_ID" | jq -r '.name')

echo "   👤 Nome: $CUSTOMER_NAME"
echo ""

echo "3️⃣ Listando subcontas disponíveis..."
SUBACCOUNTS=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/subaccounts")

SUBACCOUNT_COUNT=$(echo "$SUBACCOUNTS" | jq -r '.totalCount // 0')
echo "   📊 Total de subcontas: $SUBACCOUNT_COUNT"

if [ "$SUBACCOUNT_COUNT" -gt 0 ]; then
  echo "   📋 Subcontas encontradas:"
  echo "$SUBACCOUNTS" | jq -r '.data[] | "   - \(.name) (ID: \(.id))"'
  
  # Pegar primeira subconta para teste
  SUBACCOUNT_ID=$(echo "$SUBACCOUNTS" | jq -r '.data[0].id')
  SUBACCOUNT_NAME=$(echo "$SUBACCOUNTS" | jq -r '.data[0].name')
  SUBACCOUNT_WALLET=$(echo "$SUBACCOUNTS" | jq -r '.data[0].walletId // "N/A"')
  
  echo ""
  echo "   ✅ Usando subconta para teste de split:"
  echo "   📝 Nome: $SUBACCOUNT_NAME"
  echo "   🆔 ID: $SUBACCOUNT_ID"
  echo "   💰 Wallet: $SUBACCOUNT_WALLET"
else
  echo "   ⚠️  Nenhuma subconta encontrada!"
  echo "   ℹ️  Criando uma subconta de teste..."
  
  SUBACCOUNT_DATA='{
    "name": "Subconta Teste Split",
    "email": "subconta.teste.split@sandbox.com",
    "cpfCnpj": "41702155000197",
    "companyType": "MEI",
    "phone": "11988776655",
    "mobilePhone": "11988776655",
    "address": "Rua Teste",
    "addressNumber": "123",
    "province": "Centro",
    "postalCode": "01310-100"
  }'
  
  SUBACCOUNT_RESPONSE=$(curl -s -X POST \
    -H "access_token: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$SUBACCOUNT_DATA" \
    "$API_URL/subaccounts")
  
  SUBACCOUNT_ID=$(echo "$SUBACCOUNT_RESPONSE" | jq -r '.id')
  SUBACCOUNT_NAME=$(echo "$SUBACCOUNT_RESPONSE" | jq -r '.name')
  SUBACCOUNT_WALLET=$(echo "$SUBACCOUNT_RESPONSE" | jq -r '.walletId // "N/A"')
  
  if [ "$SUBACCOUNT_ID" != "null" ] && [ -n "$SUBACCOUNT_ID" ]; then
    echo "   ✅ Subconta criada com sucesso!"
    echo "   📝 Nome: $SUBACCOUNT_NAME"
    echo "   🆔 ID: $SUBACCOUNT_ID"
    echo "   💰 Wallet: $SUBACCOUNT_WALLET"
  else
    echo "   ❌ Erro ao criar subconta:"
    echo "$SUBACCOUNT_RESPONSE" | jq '.'
    exit 1
  fi
fi

echo ""
echo "4️⃣ Criando cobrança PIX COM SPLIT (20% subconta / 80% principal)..."
echo ""

# Calcular split 20/80
VALOR_TOTAL=100.00
VALOR_SUBCONTA=$(echo "scale=2; $VALOR_TOTAL * 0.20" | bc)
VALOR_PRINCIPAL=$(echo "scale=2; $VALOR_TOTAL * 0.80" | bc)

echo "   💰 Valor total: R$ $VALOR_TOTAL"
echo "   📊 Split configurado:"
echo "      └─ 20% Subconta ($SUBACCOUNT_NAME): R$ $VALOR_SUBCONTA"
echo "      └─ 80% Principal ($ACCOUNT_NAME): R$ $VALOR_PRINCIPAL"
echo ""

PAYMENT_DATA=$(cat <<EOF
{
  "customer": "$CUSTOMER_ID",
  "billingType": "PIX",
  "value": $VALOR_TOTAL,
  "dueDate": "$(date -d '+7 days' +%Y-%m-%d)",
  "description": "Teste PIX com Split 20/80 - Sandbox",
  "split": [
    {
      "walletId": "$SUBACCOUNT_WALLET",
      "fixedValue": $VALOR_SUBCONTA,
      "percentualValue": null,
      "totalFixedValue": null
    }
  ]
}
EOF
)

echo "   📤 Payload da cobrança:"
echo "$PAYMENT_DATA" | jq '.'
echo ""

PAYMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "access_token: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYMENT_DATA" \
  "$API_URL/payments")

HTTP_CODE=$(echo "$PAYMENT_RESPONSE" | tail -n1)
PAYMENT=$(echo "$PAYMENT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Cobrança PIX criada com sucesso!"
  echo ""
  
  PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
  PAYMENT_STATUS=$(echo "$PAYMENT" | jq -r '.status')
  PAYMENT_VALUE=$(echo "$PAYMENT" | jq -r '.value')
  PAYMENT_DUE=$(echo "$PAYMENT" | jq -r '.dueDate')
  INVOICE_URL=$(echo "$PAYMENT" | jq -r '.invoiceUrl')
  
  echo "   📋 Detalhes da Cobrança:"
  echo "   ├─ ID: $PAYMENT_ID"
  echo "   ├─ Status: $PAYMENT_STATUS"
  echo "   ├─ Valor: R$ $PAYMENT_VALUE"
  echo "   ├─ Vencimento: $PAYMENT_DUE"
  echo "   └─ URL: $INVOICE_URL"
  echo ""
  
  # Buscar QR Code
  echo "5️⃣ Gerando QR Code PIX..."
  QR_RESPONSE=$(curl -s -X GET \
    -H "access_token: $API_KEY" \
    "$API_URL/payments/$PAYMENT_ID/pixQrCode")
  
  QR_SUCCESS=$(echo "$QR_RESPONSE" | jq -r '.success // true')
  
  if [ "$QR_SUCCESS" = "true" ]; then
    QR_PAYLOAD=$(echo "$QR_RESPONSE" | jq -r '.payload')
    QR_EXPIRATION=$(echo "$QR_RESPONSE" | jq -r '.expirationDate // "N/A"')
    
    echo "   ✅ QR Code gerado com sucesso!"
    echo ""
    echo "   📱 PIX Copia e Cola:"
    echo "   $QR_PAYLOAD"
    echo ""
    echo "   ⏰ Validade: $QR_EXPIRATION"
    echo ""
  else
    echo "   ⚠️  QR Code ainda não disponível (pode levar alguns segundos)"
  fi
  
  # Verificar split aplicado
  echo "6️⃣ Verificando split aplicado na cobrança..."
  
  SPLIT_INFO=$(echo "$PAYMENT" | jq -r '.split[]?')
  
  if [ -n "$SPLIT_INFO" ]; then
    echo "   ✅ Split configurado corretamente:"
    echo ""
    echo "$PAYMENT" | jq '.split[] | {
      walletId,
      fixedValue,
      status,
      refusalReason
    }'
    echo ""
    
    SPLIT_WALLET=$(echo "$PAYMENT" | jq -r '.split[0].walletId')
    SPLIT_VALUE=$(echo "$PAYMENT" | jq -r '.split[0].fixedValue')
    SPLIT_STATUS=$(echo "$PAYMENT" | jq -r '.split[0].status')
    
    echo "   📊 Resumo do Split:"
    echo "   ├─ Wallet Subconta: $SPLIT_WALLET"
    echo "   ├─ Valor Subconta: R$ $SPLIT_VALUE (20%)"
    echo "   ├─ Valor Principal: R$ $(echo "$VALOR_TOTAL - $SPLIT_VALUE" | bc) (80%)"
    echo "   └─ Status: $SPLIT_STATUS"
  else
    echo "   ⚠️  Split não encontrado na resposta"
    echo "   Resposta completa:"
    echo "$PAYMENT" | jq '.'
  fi
  
  echo ""
  echo "7️⃣ Resumo Final:"
  echo "=================================================="
  echo ""
  echo "✅ Cobrança PIX criada: $PAYMENT_ID"
  echo "💰 Valor total: R$ $VALOR_TOTAL"
  echo "📊 Split 20/80: ✅ Configurado"
  echo "   ├─ Subconta: R$ $VALOR_SUBCONTA (20%)"
  echo "   └─ Principal: R$ $VALOR_PRINCIPAL (80%)"
  echo "📱 QR Code: ✅ Gerado"
  echo "🔗 URL: $INVOICE_URL"
  echo ""
  echo "🧪 Para simular pagamento (sandbox):"
  echo "   1. Acesse: $INVOICE_URL"
  echo "   2. Escaneie o QR Code"
  echo "   3. Confirme o pagamento no simulador"
  echo ""
  echo "✅ Após pagamento, o valor será dividido:"
  echo "   • Subconta receberá: R$ $VALOR_SUBCONTA"
  echo "   • Conta principal receberá: R$ $VALOR_PRINCIPAL"
  echo ""
  
else
  echo "   ❌ Erro ao criar cobrança (HTTP $HTTP_CODE)"
  echo ""
  echo "   Resposta completa:"
  echo "$PAYMENT" | jq '.'
  echo ""
  
  ERROR_CODE=$(echo "$PAYMENT" | jq -r '.errors[0].code // "unknown"')
  ERROR_DESC=$(echo "$PAYMENT" | jq -r '.errors[0].description // "N/A"')
  
  echo "   ❌ Erro: $ERROR_CODE"
  echo "   Descrição: $ERROR_DESC"
  echo ""
  
  exit 1
fi

echo "=================================================="
echo "✅ Teste concluído com sucesso!"
echo "=================================================="
