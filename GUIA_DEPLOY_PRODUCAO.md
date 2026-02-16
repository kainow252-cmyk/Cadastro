# 🚀 Guia de Deploy para Produção
**Versão 2.6** | **Data**: 15/02/2026

---

## 📋 O que falta para integração real?

### 🔴 CRÍTICO (Obrigatório antes do deploy)

#### 1. **Configurar API Keys Reais**

**ASAAS API Key:**
```bash
# 1. Obter API Key real no painel Asaas (https://www.asaas.com)
# 2. Criar arquivo .dev.vars local (já existe, só atualizar):
cd /home/user/webapp
cat > .dev.vars << 'EOF'
ASAAS_API_KEY=sua_chave_real_aqui
ASAAS_API_URL=https://api.asaas.com/v3
MAILERSEND_API_KEY=sua_chave_mailersend_aqui
MAILERSEND_FROM_EMAIL=seu_email@dominio.com
MAILERSEND_FROM_NAME=Seu Nome
JWT_SECRET=uma_string_aleatoria_segura_minimo_32_caracteres
ADMIN_USERNAME=seu_usuario_admin
ADMIN_PASSWORD=sua_senha_forte_aqui
EOF

# 3. Para produção, usar wrangler secrets:
npx wrangler secret put ASAAS_API_KEY
npx wrangler secret put MAILERSEND_API_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
```

**MailerSend API Key:**
- Acesse: https://www.mailersend.com
- Crie conta e verifique domínio
- Gere API Key em Settings → API Tokens
- Configure em .dev.vars (local) e wrangler secrets (produção)

#### 2. **Criar Banco D1 em Produção**

```bash
# 1. Criar banco D1 na Cloudflare
npx wrangler d1 create asaas-manager-db

# Saída exemplo:
# ✅ Successfully created DB 'asaas-manager-db'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "asaas-manager-db"
# database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"

# 2. Atualizar wrangler.jsonc com o database_id real
# Copie o database_id da saída acima e cole em wrangler.jsonc
```

**Atualizar wrangler.jsonc:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-02-14",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "asaas-manager-db",
      "database_id": "SEU_DATABASE_ID_AQUI"  // ← Substituir por ID real
    }
  ]
}
```

#### 3. **Aplicar Migrations em Produção**

```bash
# Aplicar migrations no banco de produção
npx wrangler d1 migrations apply asaas-manager-db --remote

# Confirmar quando solicitado
# Verificar aplicação:
npx wrangler d1 execute asaas-manager-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

#### 4. **Mudar Credenciais Admin**

**Criar credenciais seguras:**
```bash
# Gerar senha forte
openssl rand -base64 32

# Atualizar .dev.vars local:
ADMIN_USERNAME=meu_usuario_seguro
ADMIN_PASSWORD=senha_gerada_pelo_openssl

# Configurar em produção:
npx wrangler secret put ADMIN_USERNAME
# Digite: meu_usuario_seguro
npx wrangler secret put ADMIN_PASSWORD
# Digite: senha_gerada_pelo_openssl
```

⚠️ **NUNCA use admin/admin123 em produção!**

#### 5. **Build Final**

```bash
cd /home/user/webapp
npm run build

# Verificar dist/
ls -lh dist/
# Deve mostrar _worker.js, _routes.json, etc.
```

#### 6. **Deploy para Cloudflare Pages**

**Opção A: Deploy Manual (Primeira vez)**
```bash
# 1. Autenticar (se ainda não autenticou)
npx wrangler login

# 2. Criar projeto Cloudflare Pages
npx wrangler pages project create webapp \
  --production-branch main

# 3. Deploy
npx wrangler pages deploy dist --project-name webapp

# 4. Configurar secrets (variáveis de ambiente)
npx wrangler pages secret put ASAAS_API_KEY --project-name webapp
npx wrangler pages secret put MAILERSEND_API_KEY --project-name webapp
npx wrangler pages secret put JWT_SECRET --project-name webapp
npx wrangler pages secret put ADMIN_USERNAME --project-name webapp
npx wrangler pages secret put ADMIN_PASSWORD --project-name webapp
npx wrangler pages secret put ASAAS_API_URL --project-name webapp
# Digite: https://api.asaas.com/v3
npx wrangler pages secret put MAILERSEND_FROM_EMAIL --project-name webapp
npx wrangler pages secret put MAILERSEND_FROM_NAME --project-name webapp
```

**Opção B: Deploy via GitHub (Recomendado)**
```bash
# 1. Push para GitHub
git push origin main

# 2. Acesse Cloudflare Dashboard
# 3. Pages → Create a project → Connect to Git
# 4. Selecione o repositório
# 5. Configure build:
#    - Build command: npm run build
#    - Build output directory: dist
#    - Root directory: /
# 6. Adicione variáveis de ambiente no dashboard:
#    ASAAS_API_KEY, MAILERSEND_API_KEY, JWT_SECRET, etc.
# 7. Deploy automático acontecerá
```

---

## 🟡 IMPORTANTE (Recomendado)

#### 7. **Testar Integrações em Produção**

```bash
# Script de teste de integração
cat > /tmp/test_production.sh << 'EOTEST'
#!/bin/bash
PROD_URL="https://webapp.pages.dev"  # Substituir pela URL real

echo "Testando produção: $PROD_URL"

# 1. Teste de ping
echo "1. Teste de ping..."
curl -s -o /dev/null -w "HTTP %{http_code}\n" $PROD_URL

# 2. Teste de login
echo "2. Teste de login..."
curl -s -X POST $PROD_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"SEU_USER","password":"SUA_SENHA"}' | jq .

# 3. Teste de geração de link
echo "3. Teste de geração de link..."
# (precisa token do passo anterior)

echo "✅ Testes concluídos"
EOTEST

chmod +x /tmp/test_production.sh
```

#### 8. **Configurar Domínio Customizado**

```bash
# No dashboard Cloudflare Pages:
# 1. Pages → Seu projeto → Custom domains
# 2. Add custom domain
# 3. Digite: asaas.seudominio.com
# 4. Adicione registro CNAME no seu DNS:
#    CNAME asaas.seudominio.com → webapp.pages.dev
# 5. Aguarde propagação DNS (até 24h)
```

#### 9. **Adicionar Monitoramento**

```bash
# Cloudflare Analytics (grátis):
# - Acesse Pages → Seu projeto → Analytics
# - Veja métricas de requisições, bandwidth, etc.

# Cloudflare Logpush (opcional, pago):
# - Configure logs para análise externa
# - Integre com Datadog, Splunk, etc.
```

#### 10. **Configurar Backups do Banco D1**

```bash
# Export manual do banco
npx wrangler d1 export asaas-manager-db --remote --output backup.sql

# Agendar backups automáticos (cron job local ou CI/CD):
# - Criar GitHub Action para backup semanal
# - Armazenar em S3, R2 ou GitHub Releases
```

---

## 🟢 OPCIONAL (Melhorias)

#### 11. **Rate Limiting**

Adicionar rate limiting no backend:
```typescript
// src/index.tsx
import { RateLimiter } from '@cloudflare/workers-rate-limiter'

// Middleware de rate limiting
app.use('/api/*', async (c, next) => {
  const limiter = new RateLimiter({
    max: 100, // 100 requisições
    window: 60000 // por minuto
  })
  
  const ip = c.req.header('cf-connecting-ip') || 'unknown'
  const allowed = await limiter.check(ip)
  
  if (!allowed) {
    return c.json({ error: 'Too many requests' }, 429)
  }
  
  await next()
})
```

#### 12. **Analytics**

Adicionar Google Analytics ou Plausible:
```html
<!-- Em src/index.tsx, no <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### 13. **Logs Centralizados**

Usar Cloudflare Workers Logs:
```typescript
// Adicionar logging estruturado
console.log(JSON.stringify({
  level: 'info',
  message: 'Subconta criada',
  accountId: account.id,
  timestamp: new Date().toISOString()
}))
```

#### 14. **Testes Automatizados**

Criar testes E2E com Playwright:
```bash
npm install -D @playwright/test

# playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://webapp.pages.dev',
  },
})

# tests/login.spec.ts
import { test, expect } from '@playwright/test'

test('admin can login', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'senha123')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Dashboard')).toBeVisible()
})
```

---

## 📝 Checklist Completo de Deploy

### Pré-Deploy
- [ ] Obter ASAAS_API_KEY real
- [ ] Obter MAILERSEND_API_KEY real
- [ ] Gerar JWT_SECRET seguro (min. 32 caracteres)
- [ ] Definir ADMIN_USERNAME/PASSWORD seguros
- [ ] Criar arquivo .dev.vars com todas as chaves
- [ ] Testar localmente com chaves reais

### Banco de Dados
- [ ] Criar banco D1 em produção (`wrangler d1 create`)
- [ ] Atualizar wrangler.jsonc com database_id real
- [ ] Aplicar migrations em produção (`--remote`)
- [ ] Verificar tabelas criadas

### Build & Deploy
- [ ] Fazer build final (`npm run build`)
- [ ] Verificar dist/ gerado corretamente
- [ ] Fazer deploy para Cloudflare Pages
- [ ] Configurar secrets no Cloudflare Pages
- [ ] Verificar deploy bem-sucedido

### Testes Pós-Deploy
- [ ] Testar login com novas credenciais
- [ ] Testar criação de subconta via dashboard
- [ ] Testar geração de link de cadastro
- [ ] Testar cadastro via link público
- [ ] Testar envio de email
- [ ] Testar geração de QR Code PIX

### Configuração Adicional
- [ ] Configurar domínio customizado (opcional)
- [ ] Adicionar monitoramento
- [ ] Configurar backups automáticos
- [ ] Adicionar rate limiting (opcional)
- [ ] Adicionar analytics (opcional)

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real (produção)
npx wrangler pages deployment tail --project-name webapp

# Listar secrets configurados
npx wrangler pages secret list --project-name webapp

# Ver informações do banco D1
npx wrangler d1 info asaas-manager-db

# Executar query no banco de produção
npx wrangler d1 execute asaas-manager-db --remote --command="SELECT COUNT(*) FROM signup_links"

# Rollback para deploy anterior
npx wrangler pages deployment list --project-name webapp
npx wrangler pages deployment rollback <deployment-id> --project-name webapp

# Ver status do projeto
npx wrangler pages project list
```

---

## 🆘 Troubleshooting

### Erro: "API Key inválida"
- Verificar se ASAAS_API_KEY está configurada corretamente
- Testar API key manualmente:
```bash
curl -H "access_token: SUA_CHAVE" https://api.asaas.com/v3/customers | jq .
```

### Erro: "Database not found"
- Verificar database_id em wrangler.jsonc
- Listar bancos disponíveis: `npx wrangler d1 list`
- Recriar banco se necessário

### Erro: "Email não enviado"
- Verificar MAILERSEND_API_KEY
- Verificar domínio verificado no MailerSend
- Testar envio manual via API MailerSend

### Erro: "Login inválido"
- Verificar ADMIN_USERNAME e ADMIN_PASSWORD em secrets
- Usar wrangler pages secret list para verificar

---

## 🎯 Resumo: Do Desenvolvimento à Produção

```
DESENVOLVIMENTO (Atual)
  ├─ Rodando em: http://localhost:3000
  ├─ Banco: SQLite local (.wrangler/state/v3/d1)
  ├─ API Keys: .dev.vars (desenvolvimento/teste)
  └─ Credenciais: admin/admin123 (inseguro)

            ⬇️  DEPLOY  ⬇️

PRODUÇÃO (Após seguir este guia)
  ├─ Rodando em: https://webapp.pages.dev ou domínio próprio
  ├─ Banco: Cloudflare D1 (remoto, replicado globalmente)
  ├─ API Keys: Wrangler secrets (criptografadas)
  ├─ Credenciais: Customizadas (seguras)
  └─ Features:
      ✅ Gestão de subcontas Asaas
      ✅ Links únicos de cadastro
      ✅ QR Codes PIX com split 20/80
      ✅ Emails automáticos
      ✅ Dashboard admin completo
      ✅ Busca e filtros avançados
```

---

## 📞 Suporte

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Asaas API Docs**: https://docs.asaas.com
- **MailerSend Docs**: https://developers.mailersend.com
- **GitHub Issues**: Reportar problemas no repositório

---

**Status Atual**: 🟢 Pronto para deploy após configurar API keys reais  
**Última Atualização**: 15/02/2026  
**Versão**: 2.6
