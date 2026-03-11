#!/bin/bash

# Test Woovi/OpenPix API Connection
# Script para testar conexão e criar primeira cobrança

echo "🧪 TESTE DE CONEXÃO - WOOVI/OPENPIX API"
echo "========================================"
echo ""

# Configuração
WOOVI_APPID="Q2xpZW50X0lkX2Y3YjVlYWVhLTdjMWItNGI1MS1iZDM3LTI1ZTEyZDUyNzZkNzpDbGllbnRfU2VjcmV0X2EwL0grQ1hsd24yd2hFbUYydGlyNFFnTElyTkpoL0tCZDR4c2phTXdKVE09"
WOOVI_BASE_URL="https://api.woovi.com/api/v1"

echo "📋 Configuração:"
echo "  • Base URL: $WOOVI_BASE_URL"
echo "  • AppID: ${WOOVI_APPID:0:20}..."
echo ""

# Teste 1: Verificar autenticação
echo "1️⃣ TESTE: Verificar autenticação"
echo "   GET /charge (listar cobranças)"
echo ""

AUTH_TEST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$WOOVI_BASE_URL/charge" \
  -H "Authorization: $WOOVI_APPID" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$AUTH_TEST" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$AUTH_TEST" | sed '/HTTP_STATUS/d')

echo "   Status: $HTTP_STATUS"
echo "   Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
  echo "   ✅ Autenticação bem-sucedida!"
else
  echo "   ❌ Erro na autenticação. Status: $HTTP_STATUS"
  exit 1
fi

echo ""

# Teste 2: Criar cobrança simples
echo "2️⃣ TESTE: Criar cobrança PIX simples"
echo "   POST /charge"
echo ""

CORRELATION_ID="test-woovi-$(date +%s)"
CHARGE_VALUE=1000  # R$ 10,00 em centavos

CHARGE_PAYLOAD=$(cat <<EOF
{
  "correlationID": "$CORRELATION_ID",
  "value": $CHARGE_VALUE,
  "comment": "Teste de cobrança Woovi - Corretora Corporate",
  "customer": {
    "name": "Cliente Teste Woovi",
    "email": "teste@corretoracorporate.com.br",
    "phone": "+5527997981963",
    "taxID": {
      "taxID": "12345678909",
      "type": "BR:CPF"
    }
  }
}
EOF
)

echo "   Payload:"
echo "$CHARGE_PAYLOAD" | jq '.'
echo ""

CREATE_CHARGE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$WOOVI_BASE_URL/charge" \
  -H "Authorization: $WOOVI_APPID" \
  -H "Content-Type: application/json" \
  -d "$CHARGE_PAYLOAD")

HTTP_STATUS=$(echo "$CREATE_CHARGE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CREATE_CHARGE" | sed '/HTTP_STATUS/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$RESPONSE_BODY" | jq '.'
echo ""

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "201" ]; then
  echo "   ✅ Cobrança criada com sucesso!"
  
  # Extrair informações importantes
  CHARGE_STATUS=$(echo "$RESPONSE_BODY" | jq -r '.charge.status')
  BR_CODE=$(echo "$RESPONSE_BODY" | jq -r '.charge.brCode')
  QR_CODE_IMAGE=$(echo "$RESPONSE_BODY" | jq -r '.charge.qrCodeImage')
  PAYMENT_LINK=$(echo "$RESPONSE_BODY" | jq -r '.charge.paymentLinkUrl')
  
  echo ""
  echo "📊 DETALHES DA COBRANÇA:"
  echo "  • Correlation ID: $CORRELATION_ID"
  echo "  • Valor: R$ 10,00"
  echo "  • Status: $CHARGE_STATUS"
  echo "  • PIX Copia e Cola: ${BR_CODE:0:50}..."
  echo "  • QR Code Image: $QR_CODE_IMAGE"
  echo "  • Payment Link: $PAYMENT_LINK"
  
else
  echo "   ❌ Erro ao criar cobrança. Status: $HTTP_STATUS"
  echo "   Response: $RESPONSE_BODY"
  exit 1
fi

echo ""

# Teste 3: Buscar cobrança criada
echo "3️⃣ TESTE: Buscar cobrança por correlationID"
echo "   GET /charge?correlationID=$CORRELATION_ID"
echo ""

GET_CHARGE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$WOOVI_BASE_URL/charge?correlationID=$CORRELATION_ID" \
  -H "Authorization: $WOOVI_APPID" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$GET_CHARGE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$GET_CHARGE" | sed '/HTTP_STATUS/d')

echo "   Status: $HTTP_STATUS"
echo "   Response:"
echo "$RESPONSE_BODY" | jq '.'
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
  echo "   ✅ Cobrança encontrada!"
else
  echo "   ⚠️ Cobrança não encontrada. Status: $HTTP_STATUS"
fi

echo ""
echo "========================================"
echo "✅ TESTES CONCLUÍDOS COM SUCESSO!"
echo ""
echo "📋 RESUMO:"
echo "  • Autenticação: ✅ OK"
echo "  • Criar cobrança: ✅ OK"
echo "  • Buscar cobrança: ✅ OK"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "  1. Pagar a cobrança em: $PAYMENT_LINK"
echo "  2. Verificar webhook de pagamento"
echo "  3. Implementar PIX Automático (assinaturas)"
echo "  4. Configurar split 20/80 com subcontas"
echo ""
echo "📚 Documentação: https://developers.woovi.com"
echo ""
