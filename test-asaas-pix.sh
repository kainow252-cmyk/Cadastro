#!/bin/bash

# Teste para verificar se PIX está disponível na conta Asaas
# Usage: ./test-asaas-pix.sh

echo "🧪 Teste de disponibilidade PIX na conta Asaas"
echo ""

# Criar um customer de teste
echo "1️⃣ Criando customer de teste..."
CUSTOMER_RESPONSE=$(curl -s -X POST \
  "https://api-sandbox.asaas.com/v3/customers" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  -H "access_token: \$asaas_f97c8043a5fb5b8d1e9ab1c17e7e84c3a5d3d3ba1d70c4a651eca0c00ba5d3d4" \
  -d '{
    "name": "Teste PIX Disponivel",
    "cpfCnpj": "11144477735",
    "email": "teste@pixdisponivel.com"
  }')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | jq -r '.id')
echo "✅ Customer criado: $CUSTOMER_ID"
echo ""

# Tentar criar um pagamento PIX
echo "2️⃣ Tentando criar pagamento PIX..."
PIX_RESPONSE=$(curl -s -X POST \
  "https://api-sandbox.asaas.com/v3/payments" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  -H "access_token: \$asaas_f97c8043a5fb5b8d1e9ab1c17e7e84c3a5d3d3ba1d70c4a651eca0c00ba5d3d4" \
  -d "{
    \"customer\": \"$CUSTOMER_ID\",
    \"billingType\": \"PIX\",
    \"value\": 10,
    \"dueDate\": \"$(date -d '+7 days' +%Y-%m-%d)\",
    \"description\": \"Teste PIX\"
  }")

echo "$PIX_RESPONSE" | jq '.'
echo ""

# Verificar resultado
if echo "$PIX_RESPONSE" | jq -e '.errors' > /dev/null 2>&1; then
  echo "❌ PIX NÃO DISPONÍVEL"
  echo ""
  echo "Erro:"
  echo "$PIX_RESPONSE" | jq -r '.errors[0].description'
  echo ""
  echo "📋 SOLUÇÃO: Cadastre uma chave PIX no painel Asaas"
else
  echo "✅ PIX DISPONÍVEL!"
  echo "ID do pagamento: $(echo $PIX_RESPONSE | jq -r '.id')"
fi
