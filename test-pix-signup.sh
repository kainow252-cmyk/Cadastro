#!/bin/bash

# Teste do endpoint PIX signup
# Usage: ./test-pix-signup.sh <linkId>

LINK_ID="${1:-295f0e48-2d43-4806-b390-f8bb497c7540}"
BASE_URL="https://4cac679a.corretoracorporate.pages.dev"

echo "🧪 Testando PIX Signup"
echo "📝 Link ID: $LINK_ID"
echo "🌐 Base URL: $BASE_URL"
echo ""

# 1. Testar GET (carregar dados do link)
echo "1️⃣ Testando GET /api/pix/subscription-signup/$LINK_ID"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "$BASE_URL/api/pix/subscription-signup/$LINK_ID" | jq '.'

echo ""
echo "---"
echo ""

# 2. Testar POST (criar cadastro)
echo "2️⃣ Testando POST /api/pix/subscription-signup/$LINK_ID"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Teste Shell Script",
    "customerEmail": "teste@shell.com",
    "customerCpf": "12345678900",
    "customerBirthdate": "1990-05-15"
  }' \
  "$BASE_URL/api/pix/subscription-signup/$LINK_ID" | jq '.'
