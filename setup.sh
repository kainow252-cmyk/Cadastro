#!/bin/bash
echo "🚀 Setup rápido do projeto..."
echo ""

if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install --silent
  echo "✅ Dependências instaladas"
else
  echo "✅ Dependências já instaladas"
fi

echo ""
echo "🎉 Projeto pronto para usar!"
echo ""
echo "📝 Comandos disponíveis:"
echo "  npm run dev        - Desenvolvimento local"
echo "  npm run build      - Build para produção"
echo "  npm run deploy     - Deploy no Cloudflare"
