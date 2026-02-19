# 🔧 Configuração Amazon SES - Corretora Corporate

**Data**: 19/02/2026  
**Account ID**: 5121-3130-0984  
**Account Name**: corretoracorporate  
**Status**: ✅ Conta criada  

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### ✅ Passo 1: Verificar Domínio (OBRIGATÓRIO)

#### 1.1. Acessar Console SES
```
1. Login: https://console.aws.amazon.com/ses/
2. Account: corretoracorporate (5121-3130-0984)
3. Região: us-east-1 (N. Virginia) OU sa-east-1 (São Paulo)
   - Recomendado: us-east-1 (menor latência global)
   - Alternativa: sa-east-1 (dados no Brasil, conformidade LGPD)
```

#### 1.2. Criar Identity (Verified Domain)
```
1. Menu lateral: Configuration → Verified identities
2. Botão: "Create identity"
3. Tipo: ✅ Domain
4. Domain: corretoracorporate.com.br
5. Configurações:
   ✅ Use a default DKIM signing key
   ✅ Publish DNS records to Route 53: NÃO (faremos manual)
6. Clicar: "Create identity"
```

#### 1.3. Copiar Registros DNS

Após criar, você receberá **5 registros DNS** para adicionar:

**A) DKIM Records (3 registros CNAME)**
```
Formato:
[random1]._domainkey.corretoracorporate.com.br → CNAME → [random1].dkim.amazonses.com
[random2]._domainkey.corretoracorporate.com.br → CNAME → [random2].dkim.amazonses.com
[random3]._domainkey.corretoracorporate.com.br → CNAME → [random3].dkim.amazonses.com

Exemplo real (seus valores serão diferentes):
abc123def._domainkey.corretoracorporate.com.br → CNAME → abc123def.dkim.amazonses.com
xyz456uvw._domainkey.corretoracorporate.com.br → CNAME → xyz456uvw.dkim.amazonses.com
mno789pqr._domainkey.corretoracorporate.com.br → CNAME → mno789pqr.dkim.amazonses.com
```

**B) MX Record (1 registro MX) - OPCIONAL**
```
feedback-smtp.us-east-1.amazonses.com (prioridade 10)
```

**C) SPF Record (1 registro TXT)**
```
Nome: corretoracorporate.com.br
Tipo: TXT
Valor: "v=spf1 include:amazonses.com ~all"

Se já tem SPF:
"v=spf1 include:_spf.google.com include:amazonses.com ~all"
```

**D) DMARC Record (1 registro TXT) - RECOMENDADO**
```
Nome: _dmarc.corretoracorporate.com.br
Tipo: TXT
Valor: "v=DMARC1; p=none; rua=mailto:[email protected]; ruf=mailto:[email protected]; pct=100"

Explicação:
- p=none: modo monitoramento (não rejeita emails)
- rua: relatórios agregados
- ruf: relatórios forenses
- pct=100: 100% dos emails são verificados
```

#### 1.4. Adicionar DNS no seu provedor

**Onde adicionar?**
- Se usa Cloudflare DNS: Dashboard Cloudflare → corretoracorporate.com.br → DNS
- Se usa Registro.br: Painel do Registro.br
- Se usa outro: Painel do seu provedor DNS

**Como adicionar no Cloudflare (exemplo)**:
```
1. Acessar: https://dash.cloudflare.com/
2. Selecionar: corretoracorporate.com.br
3. Menu: DNS → Records
4. Para cada registro DKIM:
   - Type: CNAME
   - Name: [valor copiado do SES]
   - Target: [valor copiado do SES]
   - Proxy status: DNS only (nuvem cinza)
5. SPF:
   - Type: TXT
   - Name: @
   - Content: "v=spf1 include:amazonses.com ~all"
6. DMARC:
   - Type: TXT
   - Name: _dmarc
   - Content: "v=DMARC1; p=none; rua=mailto:[email protected]"
7. Salvar todos
```

#### 1.5. Verificar Status
```
Voltar ao SES Console → Verified identities → corretoracorporate.com.br

Status esperado (após 10-30 minutos):
- Identity status: ✅ Verified
- DKIM: ✅ Successful
- Mail from domain: ✅ Success (ou pendente, ok)

Se demorar mais de 1 hora:
- Verificar se DNS foi adicionado corretamente
- Usar ferramenta: https://mxtoolbox.com/SuperTool.aspx
  - Buscar: corretoracorporate.com.br
  - Verificar DKIM records
```

---

### ✅ Passo 2: Solicitar Saída do Sandbox (CRÍTICO)

**Por quê?**
- ❌ No Sandbox: Só envia para emails verificados manualmente
- ❌ No Sandbox: Limite 200 emails/dia
- ✅ Em Produção: Envia para qualquer email
- ✅ Em Produção: Limite 50.000 emails/dia (inicial)

#### 2.1. Request Production Access
```
1. SES Console → Account dashboard
2. Botão: "Request production access"
3. Preencher formulário:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULÁRIO DE SOLICITAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mail type:
✅ Transactional

Website URL:
https://gerenciador.corretoracorporate.com.br

Use case description:
We are a financial services company that provides automated 
payment management. We need to send welcome emails to our 
customers after they complete their first payment via PIX 
(Brazilian instant payment system).

Email types:
- Welcome emails after successful payment
- Account activation confirmations
- Subscription status updates
- Payment receipts

Our customers explicitly opt-in by completing a payment 
transaction. All emails include unsubscribe links and comply 
with CAN-SPAM Act and Brazilian LGPD regulations.

Additional contacts (optional):
[email protected]

Acknowledgement:
✅ I understand that AWS may suspend my account if I don't 
   comply with AWS Service Terms and AUP
✅ I understand I must handle bounces and complaints properly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. Submit request
5. Aguardar aprovação (geralmente 24 horas, máximo 48h)
```

#### 2.2. Enquanto aguarda aprovação (Sandbox Mode)

**Opção A: Adicionar emails de teste como verified**
```
1. SES Console → Verified identities
2. Create identity → Email address
3. Adicionar: [email protected]
4. Verificar email e clicar no link
5. Repetir para cada email de teste
```

**Opção B: Testar localmente**
```
Usar endpoint local com credenciais de desenvolvimento:
http://localhost:3000/api/admin/configure-ses
```

---

### ✅ Passo 3: Criar Credenciais IAM (Access Keys)

#### 3.1. Criar IAM User
```
1. AWS Console → IAM → Users
2. Botão: "Create user"
3. Nome: ses-sender-corretoracorporate
4. Next
5. Permissions: "Attach policies directly"
6. Buscar e selecionar: ✅ AmazonSESFullAccess
7. Next → Create user
```

#### 3.2. Criar Access Key
```
1. Clicar no user criado: ses-sender-corretoracorporate
2. Tab: "Security credentials"
3. Seção: "Access keys"
4. Botão: "Create access key"
5. Use case: ✅ Application running outside AWS
6. Next
7. Description: "Cloudflare Pages - Email Service"
8. Create access key

⚠️ IMPORTANTE: Copiar AGORA (não terá segunda chance):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Access key ID: [COPIAR E SALVAR]
Secret access key: [COPIAR E SALVAR]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Exemplo (valores reais serão diferentes):
Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

9. Download .csv (backup)
10. Done
```

**⚠️ SEGURANÇA IMPORTANTE**:
- ❌ NUNCA commit essas keys no git
- ❌ NUNCA compartilhe publicamente
- ❌ NUNCA coloque no código frontend
- ✅ Usar apenas como secrets do Cloudflare
- ✅ Rotacionar a cada 90 dias (boa prática)

---

### ✅ Passo 4: Adicionar Credenciais no Cloudflare Pages

#### 4.1. Via Wrangler (linha de comando)
```bash
# No terminal do sandbox:
cd /home/user/webapp

# Adicionar Access Key ID
npx wrangler pages secret put AWS_ACCESS_KEY_ID --project-name corretoracorporate
# Quando solicitar, colar: AKIAIOSFODNN7EXAMPLE

# Adicionar Secret Access Key
npx wrangler pages secret put AWS_SECRET_ACCESS_KEY --project-name corretoracorporate
# Quando solicitar, colar: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Adicionar região
npx wrangler pages secret put AWS_REGION --project-name corretoracorporate
# Quando solicitar, digitar: us-east-1
```

#### 4.2. Via Dashboard Cloudflare (alternativa)
```
1. Acessar: https://dash.cloudflare.com/
2. Pages → corretoracorporate
3. Settings → Environment variables
4. Production tab
5. Add variable:
   - Variable name: AWS_ACCESS_KEY_ID
   - Value: [colar access key ID]
   - Type: Secret (cadeado fechado)
   - Save
6. Add variable:
   - Variable name: AWS_SECRET_ACCESS_KEY
   - Value: [colar secret access key]
   - Type: Secret
   - Save
7. Add variable:
   - Variable name: AWS_REGION
   - Value: us-east-1
   - Type: Plain text
   - Save
8. Redeploy (se necessário)
```

---

### ✅ Passo 5: Verificar Configuração

#### 5.1. Via API
```bash
# Verificar status do SES
curl https://gerenciador.corretoracorporate.com.br/api/admin/ses-status

# Resposta esperada:
{
  "ok": true,
  "configured": false,  # false até restart do Worker
  "hasCredentials": true,
  "region": "us-east-1"
}
```

#### 5.2. Forçar restart do Worker
```bash
# Redeploy para carregar as novas secrets
cd /home/user/webapp
npx wrangler pages deploy dist --project-name corretoracorporate

# Aguardar ~30 segundos
# Verificar novamente
curl https://gerenciador.corretoracorporate.com.br/api/admin/ses-status

# Resposta esperada agora:
{
  "ok": true,
  "configured": true,  # ✅ true após restart
  "hasCredentials": true,
  "region": "us-east-1"
}
```

#### 5.3. Verificar domínio verificado
```bash
# Se já adicionou DNS e está verificado:
aws ses list-verified-email-addresses --region us-east-1
aws ses get-identity-verification-attributes \
  --identities corretoracorporate.com.br \
  --region us-east-1

# Ou via console:
https://console.aws.amazon.com/ses/ → Verified identities
```

---

### ✅ Passo 6: Configurar Webhook Asaas

```
1. Acessar: https://www.asaas.com/
2. Login → Configurações → Webhooks
3. Adicionar webhook:
   - URL: https://gerenciador.corretoracorporate.com.br/api/webhooks/asaas
   - Eventos ativar:
     ✅ PAYMENT_RECEIVED
     ✅ PAYMENT_CONFIRMED
     ✅ PIX_AUTOMATIC_AUTHORIZATION_ACTIVATED
   - Versão: V2
   - Status: ✅ Ativo
4. Salvar
```

**Token de segurança (opcional mas recomendado)**:
```bash
# Gerar token no Asaas (campo "Token de autenticação")
# Exemplo: webhook_token_abc123xyz789

# Adicionar como secret
npx wrangler pages secret put ASAAS_WEBHOOK_TOKEN --project-name corretoracorporate
# Quando solicitar, colar: webhook_token_abc123xyz789
```

---

### ✅ Passo 7: Recriar Banco D1 (se necessário)

```bash
# Se ainda não criou a tabela welcome_emails:
curl -X POST https://gerenciador.corretoracorporate.com.br/api/admin/init-db

# Resposta esperada:
{
  "ok": true,
  "message": "Tabelas criadas com sucesso e dados de teste inseridos",
  "tables": [
    "subscription_signup_links",
    "subscription_conversions",
    "transactions",
    "pix_automatic_signup_links",
    "pix_automatic_authorizations",
    "welcome_emails"  # ← Nova tabela
  ]
}
```

---

### ✅ Passo 8: TESTAR SISTEMA

#### 8.1. Criar Link PIX Automático
```
1. Login: https://gerenciador.corretoracorporate.com.br
2. User: admin | Pass: admin123
3. Menu: Subcontas → PIX Automático
4. Preencher:
   - Valor: R$ 10,00
   - Descrição: Teste E-mail Premium
   - Validade: 30 dias
5. Clicar: "Gerar Link PIX Automático"
6. Copiar link gerado
```

#### 8.2. Criar Autorização (seu e-mail real)
```
1. Abrir link em janela anônima
2. Preencher:
   - Nome: [Seu Nome]
   - E-mail: [SEU_EMAIL_REAL@gmail.com]  ← IMPORTANTE
   - CPF: 123.456.789-00
3. Clicar: "Criar Autorização PIX Automático"
4. QR Code aparece
```

#### 8.3. Fazer Pagamento Teste

**Opção A: Ambiente Sandbox Asaas (recomendado)**
```
Asaas sandbox simula pagamento automaticamente após 30 segundos
Não precisa pagar de verdade
```

**Opção B: Ambiente Produção Asaas**
```
1. Escanear QR Code com app do banco
2. Pagar R$ 10,00
3. Confirmar pagamento
```

#### 8.4. Verificar E-mail (1-5 minutos)
```
✉️ Verificar caixa de entrada: [SEU_EMAIL_REAL@gmail.com]

Você deve receber 2 e-mails:
1. Asaas: "Pagamento confirmado" (padrão Asaas)
2. Corretora Corporate: "⭐ Bem-vindo ao Premium..." (nosso template)

Verificar no e-mail nosso:
✅ Assunto correto: "⭐ Bem-vindo ao Premium, [Seu Nome]! Seus recursos exclusivos..."
✅ Template roxo (Premium)
✅ Seu nome personalizado
✅ Valor R$ 10,00
✅ Data de ativação
✅ Recursos Premium listados
✅ Botões funcionais
✅ Design responsivo
✅ Footer com links legais
```

#### 8.5. Se não recebeu e-mail

**Verificar Logs**:
```bash
# Via PM2 (se rodando local)
pm2 logs --nostream | grep -A 20 "Pagamento recebido"

# Verificar banco D1
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM welcome_emails ORDER BY created_at DESC LIMIT 5"

# Verificar status SES
curl https://gerenciador.corretoracorporate.com.br/api/admin/ses-status
```

**Possíveis problemas**:
1. ❌ SES não configurado → Adicionar secrets
2. ❌ Domínio não verificado → Verificar DNS
3. ❌ Ainda em Sandbox → Verificar seu e-mail como identity
4. ❌ Webhook não configurado → Configurar no Asaas
5. ❌ Autorização não criada → Verificar tabela pix_automatic_authorizations

---

## 📊 MONITORAMENTO

### Ver estatísticas SES
```
AWS Console → SES → Account dashboard → Sending statistics

Métricas importantes:
- Emails sent: Total enviados
- Delivery rate: Taxa de entrega (meta: >98%)
- Bounce rate: Taxa de rejeição (meta: <5%)
- Complaint rate: Taxa de spam (meta: <0.1%)
```

### Ver logs no banco D1
```sql
-- Total de e-mails enviados hoje
SELECT COUNT(*) FROM welcome_emails 
WHERE DATE(sent_at) = DATE('now');

-- E-mails por status
SELECT status, COUNT(*) as count 
FROM welcome_emails 
GROUP BY status;

-- E-mails com erro
SELECT * FROM welcome_emails 
WHERE status = 'failed' 
ORDER BY sent_at DESC 
LIMIT 10;

-- Taxa de sucesso por plano
SELECT 
  plan_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as success,
  (SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM welcome_emails
GROUP BY plan_type;
```

---

## ✅ CHECKLIST FINAL

### Antes de usar em produção:
- [ ] Domínio verificado no SES (DKIM + SPF + DMARC)
- [ ] Saída do Sandbox aprovada (ou emails de teste verificados)
- [ ] Credenciais IAM criadas
- [ ] Secrets adicionados no Cloudflare
- [ ] Worker redeploy feito (secrets carregadas)
- [ ] Webhook Asaas configurado
- [ ] Tabela welcome_emails criada
- [ ] Teste completo realizado com sucesso
- [ ] E-mail recebido e verificado

### Após go-live (monitorar primeiros 7 dias):
- [ ] Taxa de entrega > 98%
- [ ] Taxa de bounce < 5%
- [ ] Taxa de complaint < 0.1%
- [ ] Nenhum e-mail com status 'failed'
- [ ] Templates renderizando corretamente
- [ ] Botões e links funcionando
- [ ] Design responsivo OK em mobile

---

## 🆘 SUPORTE

### Problemas comuns e soluções

**1. "Domain not verified"**
```
Solução: Verificar se DNS foi adicionado corretamente
Ferramenta: https://mxtoolbox.com/dkim.aspx
Aguardar: 10-30 minutos após adicionar DNS
```

**2. "MessageRejected: Email address not verified"**
```
Solução: Ainda está em Sandbox
Opção A: Verificar e-mail destino manualmente
Opção B: Aguardar aprovação para Production
```

**3. "CredentialsError: Missing credentials"**
```
Solução: Secrets não foram adicionadas ou Worker não foi redeployed
Verificar: /api/admin/ses-status → hasCredentials: true
```

**4. "Rate exceeded"**
```
Solução: Limite de 1 email/segundo (Sandbox) ou 14/segundo (Production)
Adicionar: Retry logic com backoff
```

---

## 📞 CONTATOS ÚTEIS

**AWS Support**:
- Console: https://console.aws.amazon.com/support/
- Phone: Disponível no console (depende do plano)
- Chat: Disponível no console

**Cloudflare Support**:
- Dashboard: https://dash.cloudflare.com/
- Community: https://community.cloudflare.com/

**Asaas Support**:
- Email: [email protected]
- WhatsApp: 0800 009 0037
- Dashboard: https://www.asaas.com/

---

**📄 Documento criado**: 19/02/2026 02:45  
**📁 Localização**: `/home/user/webapp/CONFIGURACAO_AWS_SES.md`  
**✍️ Autor**: Gerenciador Asaas - AI Assistant  
**🔄 Última atualização**: 19/02/2026 02:45  

---

**Fim do guia** 🎉
