#!/bin/bash

# Teste de permissões da API Asaas Sandbox
# Verifica quais endpoints estão disponíveis

set -e

API_KEY='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5'
API_URL='https://sandbox.asaas.com/api/v3'

echo "🔍 Testando permissões da API Asaas Sandbox"
echo "============================================"
echo ""

# Teste 1: Criar cobrança PIX simples
echo "1️⃣ Teste: Criar cobrança PIX única (POST /payments)..."
PAYMENT_DATA='{
  "customer": "cus_000005735721",
  "billingType": "PIX",
  "value": 10.00,
  "dueDate": "2026-03-12",
  "description": "Teste PIX único"
}'

PAYMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "access_token: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYMENT_DATA" \
  "$API_URL/payments")

HTTP_CODE=$(echo "$PAYMENT_RESPONSE" | tail -n1)
PAYMENT=$(echo "$PAYMENT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Cobrança PIX criada com sucesso!"
  PAYMENT_ID=$(echo "$PAYMENT" | jq -r '.id')
  echo "   Payment ID: $PAYMENT_ID"
  
  # Buscar QR Code
  echo ""
  echo "   Buscando QR Code..."
  QR_RESPONSE=$(curl -s -X GET \
    -H "access_token: $API_KEY" \
    "$API_URL/payments/$PAYMENT_ID/pixQrCode")
  
  QR_PAYLOAD=$(echo "$QR_RESPONSE" | jq -r '.payload // "N/A"')
  echo "   PIX Copia e Cola: ${QR_PAYLOAD:0:50}..."
  
else
  echo "❌ Erro ao criar cobrança (HTTP $HTTP_CODE)"
  echo "$PAYMENT" | jq '.'
fi

echo ""
echo "2️⃣ Teste: Listar autorizações PIX Automático (GET /pix/automatic/authorizations)..."
AUTH_LIST=$(curl -s -w "\n%{http_code}" -X GET \
  -H "access_token: $API_KEY" \
  "$API_URL/pix/automatic/authorizations")

HTTP_CODE=$(echo "$AUTH_LIST" | tail -n1)
AUTH_DATA=$(echo "$AUTH_LIST" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Listagem OK!"
  TOTAL=$(echo "$AUTH_DATA" | jq -r '.totalCount // 0')
  echo "   Total de autorizações: $TOTAL"
  
  if [ "$TOTAL" -gt 0 ]; then
    echo "   Autorizações existentes:"
    echo "$AUTH_DATA" | jq -r '.data[] | "   - \(.id) - \(.status) - R$ \(.value)"'
  fi
else
  echo "❌ Erro ao listar (HTTP $HTTP_CODE)"
  echo "$AUTH_DATA" | jq '.'
fi

echo ""
echo "3️⃣ Teste: Verificar permissões da chave de API..."
echo "   Possíveis problemas:"
echo "   • PIX Automático requer permissões especiais"
echo "   • Endpoint pode estar em beta/preview"
echo "   • Conta pode precisar de ativação pelo suporte"

echo ""
echo "📝 Soluções sugeridas:"
echo "   1. Contatar suporte Asaas: (16) 3347-8031 ou atendimento@asaas.com"
echo "   2. Solicitar ativação do PIX Automático (Jornada 3)"
echo "   3. Verificar se a chave de API tem escopo 'all' ou 'pix_automatic'"
echo "   4. Como alternativa, usar cobrança PIX recorrente (mensal manual)"

echo ""
echo "============================================"
echo "Teste concluído!"
