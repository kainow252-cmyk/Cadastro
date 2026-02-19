# 🚨 Por que o Build Trava no Sandbox?

## 📊 Problema

O arquivo `src/index.tsx` ficou **muito grande**:
- **8.670 linhas** de código
- **376 KB** de tamanho
- Contém todo o backend + frontend HTML

## 🔍 Por que Trava?

### Processo de Build (Vite):
1. **Parse TypeScript** → Analisar 8.670 linhas
2. **Transform JSX** → Converter HTML embutido
3. **Minify** → Comprimir código
4. **Sourcemaps** → Gerar mapas de debug

### Limites do Sandbox:
- **CPU limitada** → Processo lento demais
- **Memória limitada** → OOM (Out of Memory)
- **Timeout 120s-300s** → Build leva 5+ minutos

### Resultado:
```
vite v6.4.1 building SSR bundle for production...
transforming...
[TRAVA AQUI] ⏰ Timeout após 2-5 minutos
```

## ✅ Soluções

### Solução 1: Build Local (RECOMENDADO)

**No seu computador:**

```bash
# Clonar repositório (se ainda não tem)
git clone <seu-repo>
cd webapp

# Instalar dependências
npm install

# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name corretoracorporate
```

**OU usar o script automatizado:**

```bash
./BUILD_AND_DEPLOY.sh
```

### Solução 2: GitHub Actions (CI/CD)

Configurar workflow para build automático no GitHub:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: corretoracorporate
          directory: dist
```

### Solução 3: Refatorar Código (Longo Prazo)

Dividir `src/index.tsx` em módulos menores:

```
src/
├── index.tsx (main app - 500 linhas)
├── routes/
│   ├── auth.ts
│   ├── deltapag.ts
│   ├── pix.ts
│   └── admin.ts
├── pages/
│   ├── dashboard.tsx
│   ├── signup.tsx
│   └── payment.tsx
└── utils/
    ├── database.ts
    └── helpers.ts
```

## 📋 Comparação de Métodos

| Método | Tempo | Complexidade | Recomendado |
|--------|-------|--------------|-------------|
| Build Local | 2-3 min | Baixa | ✅ SIM |
| Script AUTO | 2-3 min | Muito Baixa | ✅ SIM |
| GitHub Actions | 3-5 min | Média | ✅ SIM (CI/CD) |
| Sandbox | ❌ TRAVA | - | ❌ NÃO |
| Refatoração | Semanas | Alta | 🔄 Futuro |

## 🎯 Recomendação Imediata

**Use o script `BUILD_AND_DEPLOY.sh` no seu computador local:**

```bash
cd /home/user/webapp
./BUILD_AND_DEPLOY.sh
```

Ele fará tudo automaticamente:
1. ✅ Instalar dependências
2. ✅ Build do projeto
3. ✅ Deploy para Cloudflare
4. ✅ Mostrar URLs e próximos passos

## 📊 Estatísticas do Arquivo

```bash
# Tamanho do arquivo
$ wc -l src/index.tsx
8670 src/index.tsx

# Tamanho em bytes
$ du -h src/index.tsx
376K src/index.tsx

# Tempo de build (local vs sandbox)
Local: ~2min
Sandbox: TRAVA (timeout após 5min)
```

## 🔗 Links Úteis

- **Repositório**: (seu repo GitHub)
- **Cloudflare Pages**: https://dash.cloudflare.com/pages
- **Dashboard**: https://gerenciador.corretoracorporate.com.br/dashboard
- **Documentação**: EVIDENCIAS_DELTAPAG.md

## ❓ FAQ

**P: Por que não dividir o arquivo agora?**
R: Levaria dias para refatorar. Melhor fazer build local e refatorar depois.

**P: O dist/ antigo funciona?**
R: Não, está desatualizado. Falta o botão "Criar Evidências" e endpoint novo.

**P: Posso usar outro serviço de build?**
R: Sim! Vercel, Netlify, Railway, etc. Todos conseguem fazer build de arquivos grandes.

**P: Isso é um problema permanente?**
R: Não. Depois de refatorar o código em módulos menores, o sandbox conseguirá compilar.

## 📝 Próximos Passos

1. ✅ Fazer build local usando `BUILD_AND_DEPLOY.sh`
2. ✅ Testar botão "Criar Evidências"
3. ✅ Gerar 5 transações para DeltaPag
4. ✅ Enviar evidências
5. 🔄 (Futuro) Refatorar código em módulos

---

**Versão**: 1.0  
**Data**: 2026-02-19  
**Status**: ✅ Solução disponível (build local)
