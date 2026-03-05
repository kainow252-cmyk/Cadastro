#!/bin/bash

# Script de teste de Split 20/80 com subcontas existentes
# Usa walletIds visíveis na screenshot do sistema

set -e

echo "💰 Teste de Split 20/80 com Subcontas Existentes"
echo "=================================================="
echo ""

# Configurações
API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'

# WalletIds CORRETOS das subcontas (obtidos do painel Asaas)
WALLET_IDS=(
  "553fbb67-5370-4ea2-9f04-c5bece015bc7"  # Subconta 1 - Gelci jose da silva
  "f1da7be9-a5fc-4295-82e0-a90ae3d99248"  # Subconta 2 - RUTHYELI GOMES COSTA SILVA
  "cb64c741-2c86-4466-ad31-7ba58cd698c0"  # Subconta 3 - Gelci jose da silva (2)
)

echo "1️⃣ Validando conta principal..."
ACCOUNT_INFO=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/myAccount")

ACCOUNT_NAME=$(echo "$ACCOUNT_INFO" | jq -r '.name')
echo "   ✅ Conta: $ACCOUNT_NAME"
echo ""

echo "2️⃣ Buscando cliente de teste..."
CUSTOMER_CPF="11144477735"
CUSTOMER_SEARCH=$(curl -s -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/customers?cpfCnpj=$CUSTOMER_CPF")

CUSTOMER_ID=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].id')
CUSTOMER_NAME=$(echo "$CUSTOMER_SEARCH" | jq -r '.data[0].name')

echo "   ✅ Cliente: $CUSTOMER_NAME (ID: $CUSTOMER_ID)"
echo ""

# Testar split com cada subconta
COBRANCAS_CRIADAS=0
VALORES=(80.00 120.00 150.00)

for i in "${!WALLET_IDS[@]}"; do
  WALLET_ID="${WALLET_IDS[$i]}"
  VALOR="${VALORES[$i]}"
  NUM=$((i + 1))
  
  echo "3.$NUM️⃣ Criando Cobrança PIX com Split 20/80 - Subconta #$NUM"
  echo ""
  
  # Calcular valores
  PERCENTUAL_SUBCONTA=20
  VALOR_SUBCONTA=$(awk "BEGIN {printf \"%.2f\", $VALOR * 0.20}")
  VALOR_PRINCIPAL=$(awk "BEGIN {printf \"%.2f\", $VALOR * 0.80}")
  
  echo "   💰 Configuração:"
  echo "   ├─ Valor Total: R$ $VALOR"
  echo "   ├─ Subconta (20%): R$ $VALOR_SUBCONTA"
  echo "   ├─ Principal (80%): R$ $VALOR_PRINCIPAL"
  echo "   └─ Wallet ID: $WALLET_ID"
  echo ""
  
  PAYMENT_DATA=$(cat <<EOF
{
  "customer": "$CUSTOMER_ID",
  "billingType": "PIX",
  "value": $VALOR,
  "dueDate": "$(date -d "+$((NUM + 6)) days" +%Y-%m-%d)",
  "description": "Teste Split 20/80 - Subconta #$NUM - R$ $VALOR",
  "externalReference": "SPLIT_TEST_SUB${NUM}_$(date +%s)",
  "split": [
    {
      "walletId": "$WALLET_ID",
      "percentualValue": $PERCENTUAL_SUBCONTA
    }
  ]
}
EOF
)
  
  echo "   📤 Enviando cobrança..."
  
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
    echo ""
    
    # Verificar split
    SPLIT_WALLET=$(echo "$PAYMENT" | jq -r '.split[0].walletId // "N/A"')
    SPLIT_PERCENTUAL=$(echo "$PAYMENT" | jq -r '.split[0].percentualValue // "N/A"')
    SPLIT_STATUS=$(echo "$PAYMENT" | jq -r '.split[0].status // "N/A"')
    
    if [ "$SPLIT_WALLET" != "N/A" ] && [ "$SPLIT_WALLET" != "null" ]; then
      echo "   📊 Split Confirmado:"
      echo "   ├─ Wallet: $SPLIT_WALLET"
      echo "   ├─ Percentual: $SPLIT_PERCENTUAL%"
      echo "   ├─ Status: $SPLIT_STATUS"
      echo "   └─ Valor Subconta: R$ $VALOR_SUBCONTA"
      
      COBRANCAS_CRIADAS=$((COBRANCAS_CRIADAS + 1))
    else
      echo "   ⚠️  Split não encontrado na resposta"
      echo "   Resposta completa:"
      echo "$PAYMENT" | jq '.split'
    fi
    
    # Buscar QR Code
    sleep 1
    QR_RESPONSE=$(curl -s -X GET \
      -H "access_token: $API_KEY" \
      "$API_URL/payments/$PAYMENT_ID/pixQrCode")
    
    QR_PAYLOAD=$(echo "$QR_RESPONSE" | jq -r '.payload // "N/A"')
    
    if [ "$QR_PAYLOAD" != "N/A" ] && [ "$QR_PAYLOAD" != "null" ]; then
      echo "   📱 QR Code: ✅ Gerado"
    else
      echo "   ⏳ QR Code: Aguardando geração"
    fi
    
    echo ""
    echo "   🔗 URL de Pagamento:"
    echo "   $INVOICE_URL"
    echo ""
    
  else
    echo "   ❌ Erro ao criar cobrança (HTTP $HTTP_CODE)"
    echo ""
    echo "   Resposta:"
    echo "$PAYMENT" | jq '.'
    echo ""
  fi
  
  echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
done

echo "=================================================="
echo "📊 RESUMO DO TESTE DE SPLIT"
echo "=================================================="
echo ""
echo "✅ Cobranças com split criadas: $COBRANCAS_CRIADAS"
echo ""

if [ $COBRANCAS_CRIADAS -gt 0 ]; then
  echo "💡 Como Validar o Split:"
  echo ""
  echo "1. Simular Pagamento:"
  echo "   • Acesse as URLs geradas acima"
  echo "   • Simule o pagamento no sandbox"
  echo ""
  echo "2. Verificar Divisão:"
  echo "   • Acesse: https://sandbox.asaas.com"
  echo "   • Verifique saldo da conta principal (80%)"
  echo "   • Acesse subcontas e verifique saldo (20%)"
  echo ""
  echo "3. Confirmar Split:"
  echo "   • Dashboard → Transferências"
  echo "   • Verificar repasses para subcontas"
  echo "   • Validar percentuais corretos"
  echo ""
fi

echo "=================================================="
echo "✅ Teste concluído!"
echo "=================================================="
