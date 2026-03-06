#!/bin/bash

# 🔐 Script para atualizar token de PRODUÇÃO no Cloudflare Pages
# Data: 06/03/2026

echo "🔐 Atualizar Token de PRODUÇÃO Asaas no Cloudflare"
echo "=================================================="
echo ""
echo "📋 Informações:"
echo "  - Projeto: corretoracorporate"
echo "  - Secret: ASAAS_API_KEY"
echo "  - Ambiente: Production"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  - Use o token de PRODUÇÃO (não sandbox)"
echo "  - Obtenha em: https://www.asaas.com/myAccount/integrations"
echo "  - Formato: \$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODk1MDA6OiRhYWNoXzc5YzA2OWU0LTlkZTEtNDVkYS05YjM5LTA0MjYzNTk3YzQzMQ=="
echo ""
echo "🚀 Executando atualização..."
echo ""

cd /home/user/webapp

npx wrangler pages secret put ASAAS_API_KEY --project-name corretoracorporate

echo ""
echo "✅ Token atualizado!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Aguardar novo deploy automático (~30s)"
echo "  2. Testar cobrança de R\$ 10"
echo "  3. Verificar split 20/80"
echo "  4. Validar repasses nas 4 subcontas"
echo ""
echo "🔗 Sistema: https://corretoracorporate.pages.dev"
echo "🔗 Dashboard: https://dash.cloudflare.com/pages/corretoracorporate"
echo ""
