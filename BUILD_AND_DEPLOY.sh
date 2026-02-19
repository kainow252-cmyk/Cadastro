#!/bin/bash

echo "🚀 Script de Build e Deploy - Gerenciador Corporate"
echo "======================================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta do projeto (webapp)"
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo ""
echo "✅ Build concluído com sucesso!"
echo ""
echo "📤 Fazendo deploy para Cloudflare Pages..."
npx wrangler pages deploy dist --project-name corretoracorporate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "🔗 URLs:"
    echo "   Produção: https://gerenciador.corretoracorporate.com.br"
    echo "   Dashboard: https://gerenciador.corretoracorporate.com.br/dashboard"
    echo ""
    echo "🎯 Próximos passos para DeltaPag:"
    echo "   1. Login: admin / admin123"
    echo "   2. Abrir 'Cartão Crédito'"
    echo "   3. Clicar em 'Criar Evidências' (botão laranja)"
    echo "   4. Copiar os 5 IDs DeltaPag"
    echo "   5. Enviar para a equipe DeltaPag"
else
    echo ""
    echo "❌ Erro no deploy!"
    exit 1
fi
