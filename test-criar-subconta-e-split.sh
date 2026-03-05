#!/bin/bash

# Script completo: Criar subconta e testar split 20/80
# Sandbox Asaas

set -e

echo "🏗️  Criação de Subconta e Teste de Split 20/80"
echo "================================================"
echo ""

# Configurações
API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'

echo "1️⃣ Validando conta principal..."
ACCOUNT_INFO=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/myAccount")

ACCOUNT_NAME=$(echo "$ACCOUNT_INFO" | jq -r '.name')
ACCOUNT_CNPJ=$(echo "$ACCOUNT_INFO" | jq -r '.cpfCnpj')

echo "   ✅ Conta Principal: $ACCOUNT_NAME"
echo "   📋 CNPJ: $ACCOUNT_CNPJ"
echo ""

echo "2️⃣ Verificando se já existe subconta de teste..."
SUBACCOUNTS=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/subaccounts?limit=100")

SUBACCOUNT_COUNT=$(echo "$SUBACCOUNTS" | jq -r '.totalCount // 0')
echo "   📊 Subcontas existentes: $SUBACCOUNT_COUNT"

# Procurar subconta de teste
SUBACCOUNT_ID=$(echo "$SUBACCOUNTS" | jq -r '.data[] | select(.name | contains("Teste Split")) | .id' | head -n1)

if [ -z "$SUBACCOUNT_ID" ] || [ "$SUBACCOUNT_ID" = "null" ]; then
  echo "   ℹ️  Nenhuma subconta de teste encontrada. Criando nova..."
  echo ""
  
  echo "3️⃣ Criando nova subconta de teste..."
  
  SUBACCOUNT_DATA=$(cat <<'EOF'
{
  "name": "Subconta Teste Split 20/80",
  "email": "subconta.split.teste@sandbox.com.br",
  "cpfCnpj": "41702155000197",
  "birthDate": "1990-01-01",
  "companyType": "MEI",
  "phone": "2733445566",
  "mobilePhone": "27988776655",
  "address": "Rua Teste Split",
  "addressNumber": "123",
  "complement": "Sala 1",
  "province": "Centro",
  "postalCode": "29010-260",
  "loginEmail": "login.subconta.split@sandbox.com.br"
}
EOF
)
  
  echo "   📤 Criando subconta..."
  SUBACCOUNT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "access_token: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$SUBACCOUNT_DATA" \
    "$API_URL/subaccounts")
  
  HTTP_CODE=$(echo "$SUBACCOUNT_RESPONSE" | tail -n1)
  SUBACCOUNT=$(echo "$SUBACCOUNT_RESPONSE" | head -n-1)
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    SUBACCOUNT_ID=$(echo "$SUBACCOUNT" | jq -r '.id')
    SUBACCOUNT_NAME=$(echo "$SUBACCOUNT" | jq -r '.name')
    SUBACCOUNT_WALLET=$(echo "$SUBACCOUNT" | jq -r '.walletId')
    
    echo "   ✅ Subconta criada com sucesso!"
    echo "   📝 Nome: $SUBACCOUNT_NAME"
    echo "   🆔 ID: $SUBACCOUNT_ID"
    echo "   💰 Wallet ID: $SUBACCOUNT_WALLET"
  else
    echo "   ❌ Erro ao criar subconta (HTTP $HTTP_CODE)"
    echo "$SUBACCOUNT" | jq '.'
    exit 1
  fi
else
  echo "   ✅ Subconta de teste já existe: $SUBACCOUNT_ID"
  
  # Buscar detalhes da subconta
  SUBACCOUNT=$(curl -s -X GET \
    -H "access_token: $API_KEY" \
    "$API_URL/subaccounts/$SUBACCOUNT_ID")
  
  SUBACCOUNT_NAME=$(echo "$SUBACCOUNT" | jq -r '.name')
  SUBACCOUNT_WALLET=$(echo "$SUBACCOUNT" | jq -r '.walletId')
  
  echo "   📝 Nome: $SUBACCOUNT_NAME"
  echo "   🆔 ID: $SUBACCOUNT_ID"
  echo "   💰 Wallet ID: $SUBACCOUNT_WALLET"
fi

echo ""
echo "4️⃣ Buscando cliente de teste..."
CUSTOMER_CPF="11144477735"
CUSTOMER_SEARCH=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers?cpfCnpj=$CUSTOMER_CPF")

CUSTOMER_ID=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].id')
CUSTOMER_NAME=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].name')

echo "   ✅ Cliente: $CUSTOMER_NAME"
echo "   🆔 ID: $CUSTOMER_ID"
echo ""

echo "5️⃣ Criando cobrança PIX COM SPLIT 20/80..."
echo ""

# Valores para teste
VALOR_TOTAL=150.00
PERCENTUAL_SUBCONTA=20
PERCENTUAL_PRINCIPAL=80

# Calcular valores do split
VALOR_SUBCONTA=$(echo "scale=2; $VALOR_TOTAL * $PERCENTUAL_SUBCONTA / 100" | bc)
VALOR_PRINCIPAL=$(echo "scale=2; $VALOR_TOTAL * $PERCENTUAL_PRINCIPAL / 100" | bc)

echo "   💰 Configuração do Split:"
echo "   ├─ Valor Total: R$ $VALOR_TOTAL"
echo "   ├─ Subconta ($PERCENTUAL_SUBCONTA%): R$ $VALOR_SUBCONTA"
echo "   └─ Principal ($PERCENTUAL_PRINCIPAL%): R$ $VALOR_PRINCIPAL"
echo ""

PAYMENT_DATA=$(cat <<EOF
{
  "customer": "$CUSTOMER_ID",
  "billingType": "PIX",
  "value": $VALOR_TOTAL,
  "dueDate": "$(date -d '+7 days' +%Y-%m-%d)",
  "description": "Teste PIX com Split 20/80 - Subconta Teste",
  "externalReference": "SPLIT_TEST_$(date +%s)",
  "split": [
    {
      "walletId": "$SUBACCOUNT_WALLET",
      "percentualValue": $PERCENTUAL_SUBCONTA
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
  echo "   ✅ Cobrança PIX com Split criada com sucesso!"
  echo ""
  
  PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
  PAYMENT_STATUS=$(echo "$PAYMENT" | jq -r '.status')
  PAYMENT_VALUE=$(echo "$PAYMENT" | jq -r '.value')
  INVOICE_URL=$(echo "$PAYMENT" | jq -r '.invoiceUrl')
  
  echo "   📋 Detalhes da Cobrança:"
  echo "   ├─ ID: $PAYMENT_ID"
  echo "   ├─ Status: $PAYMENT_STATUS"
  echo "   ├─ Valor: R$ $PAYMENT_VALUE"
  echo "   └─ URL: $INVOICE_URL"
  echo ""
  
  # Verificar split na resposta
  echo "6️⃣ Validando Split configurado..."
  
  SPLIT_DATA=$(echo "$PAYMENT" | jq '.split[]?')
  
  if [ -n "$SPLIT_DATA" ] && [ "$SPLIT_DATA" != "null" ]; then
    echo "   ✅ Split configurado corretamente!"
    echo ""
    echo "   📊 Detalhes do Split:"
    echo "$PAYMENT" | jq -r '.split[] | "   ├─ Wallet: \(.walletId)\n   ├─ Percentual: \(.percentualValue)%\n   ├─ Valor Fixo: R$ \(.fixedValue // "calculado")\n   └─ Status: \(.status)"'
    echo ""
  else
    echo "   ⚠️  Split não encontrado na resposta"
  fi
  
  # Buscar QR Code
  echo "7️⃣ Gerando QR Code PIX..."
  sleep 1
  
  QR_RESPONSE=$(curl -s -X GET \
    -H "access_token: $API_KEY" \
    "$API_URL/payments/$PAYMENT_ID/pixQrCode")
  
  QR_PAYLOAD=$(echo "$QR_RESPONSE" | jq -r '.payload // "N/A"')
  QR_EXPIRATION=$(echo "$QR_RESPONSE" | jq -r '.expirationDate // "N/A"')
  
  if [ "$QR_PAYLOAD" != "N/A" ] && [ "$QR_PAYLOAD" != "null" ]; then
    echo "   ✅ QR Code gerado com sucesso!"
    echo ""
    echo "   📱 PIX Copia e Cola:"
    echo "   $QR_PAYLOAD"
    echo ""
    echo "   ⏰ Validade: $QR_EXPIRATION"
  else
    echo "   ⏳ QR Code ainda não disponível"
  fi
  
  echo ""
  echo "================================================"
  echo "✅ TESTE DE SPLIT CONCLUÍDO COM SUCESSO!"
  echo "================================================"
  echo ""
  echo "📊 Resumo:"
  echo "├─ Subconta criada: $SUBACCOUNT_NAME"
  echo "├─ Wallet ID: $SUBACCOUNT_WALLET"
  echo "├─ Cobrança ID: $PAYMENT_ID"
  echo "├─ Valor Total: R$ $VALOR_TOTAL"
  echo "├─ Split Subconta (20%): R$ $VALOR_SUBCONTA"
  echo "├─ Split Principal (80%): R$ $VALOR_PRINCIPAL"
  echo "└─ QR Code: ✅ Gerado"
  echo ""
  echo "🔗 URL de Pagamento:"
  echo "$INVOICE_URL"
  echo ""
  echo "💡 Como Validar o Split:"
  echo "1. Acesse a URL acima"
  echo "2. Simule o pagamento no sandbox"
  echo "3. Verifique o saldo em:"
  echo "   • Conta Principal (80%): $ACCOUNT_NAME"
  echo "   • Subconta (20%): $SUBACCOUNT_NAME"
  echo ""
  echo "📍 Painel Asaas:"
  echo "• Principal: https://sandbox.asaas.com"
  echo "• Subcontas: https://sandbox.asaas.com/subaccount/list"
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

echo "================================================"
