#!/bin/bash

echo "🧹 Iniciando limpeza do projeto..."

# 1. Remover arquivos de backup
echo "📦 Removendo arquivos de backup..."
find . -name "*.backup" -delete
find . -name "*.bak" -delete
find . -name "*~" -delete

# 2. Consolidar documentação
echo "📚 Consolidando documentação..."
mkdir -p docs/archive

# Mover docs antigos para archive
mv MELHORIAS.md docs/archive/ 2>/dev/null || true
mv SUGESTOES_PIX.md docs/archive/ 2>/dev/null || true
mv GUIA_API_KEY.md docs/archive/ 2>/dev/null || true
mv USO_API_KEY_SPLIT.md docs/archive/ 2>/dev/null || true
mv CONFIGURAR_API_KEYS.md docs/archive/ 2>/dev/null || true
mv TESTE_PIX_COBRANÇAS.md docs/archive/ 2>/dev/null || true
mv FLUXO_CADASTRO_PIX.md docs/archive/ 2>/dev/null || true
mv RELATORIO_INTEGRACOES.md docs/archive/ 2>/dev/null || true
mv FUNCIONALIDADES_BUSCA.md docs/archive/ 2>/dev/null || true
mv RELATORIO_FINAL.md docs/archive/ 2>/dev/null || true
mv INTERFACE_IFRAME.md docs/archive/ 2>/dev/null || true
mv GUIA_DEPLOY_PRODUCAO.md docs/archive/ 2>/dev/null || true
mv PROXIMOS_PASSOS.md docs/archive/ 2>/dev/null || true
mv RESTRICOES_PIX.md docs/archive/ 2>/dev/null || true
mv DEPLOY_CLOUDFLARE_DOMAIN.md docs/archive/ 2>/dev/null || true
mv PASSOS_DEPLOY.md docs/archive/ 2>/dev/null || true
mv CORRIGIR_API_KEY_CLOUDFLARE.md docs/archive/ 2>/dev/null || true
mv CONFIGURAR_D1_PASSO_PASSO.md docs/archive/ 2>/dev/null || true
mv ESTUDO_INFORMACOES_PERSONALIZADAS_ASAAS.md docs/archive/ 2>/dev/null || true
mv SISTEMA_EMAILS_PERSONALIZADOS.md docs/archive/ 2>/dev/null || true
mv VARIAVEIS_CLOUDFLARE_PAGES.md docs/archive/ 2>/dev/null || true
mv README_DEPLOY_RAPIDO.txt docs/archive/ 2>/dev/null || true

# 3. Limpar cache do Wrangler
echo "🗑️  Limpando cache do Wrangler..."
rm -rf .wrangler/tmp/* 2>/dev/null || true

# 4. Limpar logs antigos
echo "📝 Removendo logs antigos..."
find . -name "*.log" -mtime +7 -delete 2>/dev/null || true

# 5. Otimizar .gitignore
echo "📋 Atualizando .gitignore..."
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/

# Build outputs
dist/
.wrangler/
*.local

# Environment variables
.env
.dev.vars

# Logs
*.log
logs/
*.pid
*.seed
*.pid.lock

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Backup files
*.backup
*.bak

# Temporary files
*.tmp
tmp/

# Database files
*.sqlite
*.db

# Documentation archive
docs/archive/
GITIGNORE

echo "✅ Limpeza concluída!"
echo ""
echo "📊 Estatísticas:"
du -sh . | awk '{print "Tamanho total: " $1}'
du -sh node_modules/ 2>/dev/null | awk '{print "node_modules: " $1}' || echo "node_modules: 0"
du -sh dist/ 2>/dev/null | awk '{print "dist: " $1}' || echo "dist: 0"
echo ""
echo "🗂️  Documentação arquivada em: docs/archive/"
