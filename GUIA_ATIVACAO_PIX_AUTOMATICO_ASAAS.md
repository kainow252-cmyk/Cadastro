# Guia Completo de Ativação - PIX Automático Asaas

## 📋 Índice
1. [Para Empresas (Receber)](#para-empresas-receber)
2. [Para Clientes (Pagar)](#para-clientes-pagar)
3. [Configuração no Sistema](#configuração-no-sistema)
4. [Checklist de Ativação](#checklist-de-ativação)
5. [Troubleshooting](#troubleshooting)

---

## 🏢 Para Empresas (Receber)

### Passo 1: Habilitar Módulo PIX Automático

#### 1.1. Acessar Painel Asaas
```
URL: https://app.asaas.com
Login: seu_email@empresa.com
```

#### 1.2. Navegar até Configurações
```
Menu lateral → Configurações → PIX
ou
Menu superior → Configurações → Recebimentos → PIX
```

#### 1.3. Localizar Seção "PIX Automático"
```
Procurar por:
• "PIX Automático"
• "PIX Recorrente"
• "Débito Automático PIX"
• "Autorização de Débito PIX"
```

#### 1.4. Habilitar o Módulo
```
☐ Ler os Termos e Condições
☑ Aceitar os Termos
☐ Clicar em "Habilitar PIX Automático"
☐ Aguardar confirmação (pode levar alguns minutos)
```

**Status esperado:** ✅ "PIX Automático habilitado com sucesso"

---

### Passo 2: Criar/Verificar Chave PIX

#### 2.1. Acessar Gerenciamento de Chaves
```
Menu lateral → PIX → Minhas Chaves PIX
ou
Configurações → PIX → Chaves PIX
```

#### 2.2. Verificar Chaves Existentes
```
Chaves recomendadas:
1. ✅ EVP (Chave Aleatória) - RECOMENDADO
   • Exemplo: 123e4567-e89b-12d3-a456-426614174000
   • Mais segura
   • Não expõe dados pessoais

2. ✅ CNPJ (Chave CNPJ da empresa)
   • Exemplo: 12.345.678/0001-90
   • Fácil de memorizar

3. ⚠️ Email/Telefone (menos recomendado)
   • Pode mudar ao longo do tempo
```

#### 2.3. Criar Nova Chave EVP (se necessário)
```
1. Clicar em "Criar Nova Chave"
2. Selecionar "Chave Aleatória (EVP)"
3. Confirmar criação
4. Copiar e salvar chave gerada
5. Status: ATIVA
```

**Chave atual do sistema:** `b0e857ff-e03b-4b16-8492-f0431de088f8` ✅

---

### Passo 3: Configurar Permissões da API Key

#### 3.1. Acessar Chaves de API
```
Menu lateral → Configurações → Integrações → API
ou
Configurações → API → Chaves de API
```

#### 3.2. Localizar API Key Atual
```
API Key atual: $aact_prod_000MzkwODA...
Status: ATIVA
Permissões: [listar permissões atuais]
```

#### 3.3. Editar Permissões
```
1. Clicar em "Editar" na API Key
2. Procurar seção "Permissões PIX"
3. Marcar:
   ☑ PIX:READ (leitura)
   ☑ PIX:WRITE (escrita)
   ☑ PIX_AUTOMATIC:READ (PIX Automático - leitura)
   ☑ PIX_AUTOMATIC:WRITE (PIX Automático - escrita) ← OBRIGATÓRIO
4. Salvar alterações
```

#### 3.4. Atualizar API Key no Sistema (se necessário)
```bash
# Se a API Key mudou, atualizar .dev.vars
cd /home/user/webapp

# Editar .dev.vars
nano .dev.vars

# Atualizar linha:
ASAAS_API_KEY=nova_api_key_aqui

# Salvar (Ctrl+O) e sair (Ctrl+X)

# Reiniciar servidor
pm2 restart asaas-manager
```

---

### Passo 4: Criar Solicitação de Autorização (via API)

#### 4.1. Endpoint da API
```
POST https://api.asaas.com/v3/pix/automatic/authorizations

Headers:
  Content-Type: application/json
  access_token: $aact_prod_...

Body:
{
  "customer": "cus_000161811061",
  "billingType": "PIX",
  "value": 50.00,
  "description": "Mensalidade Plano Premium",
  "recurrenceType": "MONTHLY",
  "startDate": "2026-03-17",
  "endDate": null,
  "split": [{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "percentualValue": 20
  }]
}
```

#### 4.2. Usar o Sistema (Mais Fácil)
```
1. Acessar: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
2. Login: admin / admin123
3. Ir em "Subcontas Cadastradas"
4. Selecionar subconta
5. Clicar em "PIX Automático" (botão azul/cyan)
6. Preencher formulário:
   • Nome: João Silva
   • Email: joao@example.com
   • CPF: 12345678900
   • Valor: R$ 50,00
   • Descrição: Mensalidade
7. Clicar "Criar Autorização"
```

#### 4.3. Resposta Esperada
```json
{
  "ok": true,
  "authorization": {
    "id": "auth_abc123def456",
    "status": "PENDING_AUTHORIZATION",
    "customer": "cus_000161811061",
    "value": 50.00,
    "recurrenceType": "MONTHLY",
    "startDate": "2026-03-17",
    "endDate": null,
    "conciliationIdentifier": "123456789"
  },
  "qrCode": {
    "payload": "00020126580014br.gov.bcb.pix...",
    "encodedImage": "data:image/png;base64,iVBORw0KGgo...",
    "expirationDate": "2026-02-17T23:59:59"
  }
}
```

---

### Passo 5: Enviar QR Code para o Cliente

#### 5.1. Via Sistema (Email Automático)
```
✅ Sistema Corretora Corporate envia automaticamente:
• Email com QR Code anexado
• Link para visualizar online
• Instruções de uso
```

#### 5.2. Via WhatsApp/Telegram
```
1. Copiar imagem do QR Code
2. Enviar para cliente com mensagem:

"Olá [Nome]!

Para ativar sua mensalidade de R$ 50,00/mês via PIX Automático:

1. Abra o app do seu banco
2. Vá em PIX → Ler QR Code
3. Escaneie o QR Code anexo
4. Autorize o débito automático mensal
5. Pague a primeira parcela

Após isso, todo mês o banco debitará automaticamente R$ 50,00.

Qualquer dúvida, estamos à disposição!"
```

#### 5.3. Via Portal do Cliente
```
1. Cliente acessa portal: https://cadastro.corretoracorporate.com.br
2. Login com CPF/Email
3. Visualiza QR Code de autorização
4. Escaneia direto da tela
```

---

## 👤 Para Clientes (Pagar)

### Passo 1: Receber Proposta de Autorização

#### 1.1. Via QR Code
```
Cliente recebe:
• Email com QR Code
• WhatsApp com imagem
• Portal web com QR Code
```

#### 1.2. Via Link Dinâmico
```
Cliente acessa link:
https://pay.asaas.com/pix/auth/abc123

Visualiza:
• Dados da empresa
• Valor mensal
• Descrição
• QR Code para escanear
```

---

### Passo 2: Autorizar no App do Banco

#### 2.1. Abrir App do Banco
```
Exemplos de apps:
• Nubank
• Inter
• Itaú
• Bradesco
• Banco do Brasil
• Caixa
• Santander
• Sicoob
• Sicredi
```

#### 2.2. Navegar até PIX
```
Menu → PIX → Ler QR Code
ou
PIX → Copia e Cola
ou
PIX → Autorizar Débito Automático
```

#### 2.3. Escanear QR Code
```
1. Apontar câmera para QR Code
2. Aguardar leitura
3. App mostra dados da autorização:
   • Empresa: Corretora Corporate LTDA
   • Valor mensal: R$ 50,00
   • Periodicidade: Mensal
   • Início: 17/03/2026
   • Fim: Indeterminado
```

#### 2.4. Revisar e Confirmar
```
Verificar:
☐ Nome da empresa correto
☐ Valor mensal correto
☐ Periodicidade correta (MENSAL)
☐ Data de início

Confirmações:
☑ Autorizo débito automático mensal
☑ Tenho saldo suficiente na conta
☑ Li e aceito os termos

Botão: "Autorizar e Pagar"
```

#### 2.5. Pagar Primeira Parcela
```
• Banco debita R$ 50,00 imediatamente
• Transfere via PIX para empresa
• Registra autorização no BACEN
• Status: ATIVO
• Próxima cobrança: 17/04/2026
```

---

### Passo 3: Gerenciar Autorizações

#### 3.1. Acessar Menu de Autorizações
```
App do Banco:
Menu → PIX → Pagamentos Agendados
ou
PIX → Minhas Autorizações
ou
PIX → Débitos Automáticos
```

#### 3.2. Visualizar Detalhes
```
Lista de autorizações:
┌─────────────────────────────────────────┐
│ Corretora Corporate LTDA                │
│ R$ 50,00/mês                            │
│ Próxima: 17/03/2026                     │
│ Status: ATIVO                           │
│ [Ver Detalhes] [Cancelar]               │
└─────────────────────────────────────────┘
```

#### 3.3. Consultar Histórico
```
Histórico de pagamentos:
• 17/02/2026 - R$ 50,00 - PAGO ✅
• 17/01/2026 - R$ 50,00 - PAGO ✅
• 17/12/2025 - R$ 50,00 - PAGO ✅
```

#### 3.4. Cancelar Autorização (se necessário)
```
1. Selecionar autorização
2. Clicar em "Cancelar"
3. Confirmar motivo:
   • Não preciso mais do serviço
   • Vou pagar de outra forma
   • Outro motivo
4. Confirmar cancelamento
5. Status: CANCELADO
6. Empresa é notificada
```

---

## ⚙️ Configuração no Sistema

### Passo 1: Verificar Variáveis de Ambiente

```bash
cd /home/user/webapp
cat .dev.vars
```

**Variáveis necessárias:**
```bash
ASAAS_API_KEY=$aact_prod_...
ASAAS_API_URL=https://api.asaas.com/v3
JWT_SECRET=sua-chave-secreta
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Passo 2: Aplicar Migrações

```bash
# Aplicar migrações locais
npx wrangler d1 migrations apply corretoracorporate-db --local

# Aplicar migrações produção (quando deploy)
npx wrangler d1 migrations apply corretoracorporate-db
```

### Passo 3: Testar Endpoints

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# 2. Criar autorização
curl -X POST "http://localhost:3000/api/pix/automatic-authorization" \
  -H "Cookie: auth_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "value": 50.00,
    "customerName": "João Silva",
    "customerEmail": "joao@example.com",
    "customerCpf": "12345678900"
  }' | jq .

# 3. Listar autorizações
curl -s "http://localhost:3000/api/pix/automatic-authorizations" \
  -H "Cookie: auth_token=$TOKEN" | jq .
```

---

## ✅ Checklist de Ativação

### Para Asaas (Painel)
- [ ] Habilitar módulo PIX Automático nas configurações
- [ ] Verificar chave PIX EVP ativa
- [ ] Editar API Key e marcar permissão `PIX_AUTOMATIC:WRITE`
- [ ] Salvar alterações
- [ ] Testar criação de autorização via API

### Para Sistema (Código)
- [x] Backend implementado (3 endpoints)
- [x] Frontend implementado (botão + formulário)
- [x] Banco de dados configurado (migração 0004)
- [x] Split 20/80 configurado
- [ ] Atualizar `.dev.vars` com nova API Key (se necessário)
- [ ] Reiniciar servidor
- [ ] Testar criação de autorização

### Para Cliente (Uso)
- [ ] Receber QR Code (email/WhatsApp/portal)
- [ ] Abrir app do banco
- [ ] Escanear QR Code
- [ ] Revisar dados (empresa, valor, periodicidade)
- [ ] Autorizar débito automático
- [ ] Pagar primeira parcela
- [ ] Verificar status ATIVO
- [ ] Gerenciar no menu "Pagamentos Agendados"

---

## 🔧 Troubleshooting

### Erro: "Você não possui permissão para utilizar este recurso"

**Causa:** API Key sem permissão `PIX_AUTOMATIC:WRITE`

**Solução:**
1. Acessar https://app.asaas.com
2. Menu → Configurações → API → Chaves de API
3. Editar chave atual
4. Marcar `PIX_AUTOMATIC:WRITE`
5. Salvar
6. Aguardar propagação (1-2 minutos)
7. Testar novamente

---

### Erro: "Módulo PIX Automático não habilitado"

**Causa:** Módulo não ativado no painel

**Solução:**
1. Acessar https://app.asaas.com
2. Menu → Configurações → PIX
3. Procurar "PIX Automático"
4. Clicar "Habilitar"
5. Aceitar termos
6. Aguardar ativação

---

### Erro: "Chave PIX não encontrada"

**Causa:** walletId inválido ou chave não existe

**Solução:**
1. Verificar chaves no painel Asaas
2. Copiar walletId correto
3. Atualizar no código/formulário
4. Testar novamente

---

### Cliente não consegue autorizar

**Causa 1:** App do banco não suporta PIX Automático

**Solução:**
- Atualizar app para versão mais recente
- Verificar se banco suporta PIX Automático
- Tentar outro banco

**Causa 2:** QR Code expirado

**Solução:**
- Gerar novo QR Code
- Enviar para cliente
- QR Code válido por 24h

**Causa 3:** Dados incorretos

**Solução:**
- Verificar nome da empresa no QR
- Verificar valor correto
- Verificar periodicidade

---

### Cobrança não debitada automaticamente

**Causa 1:** Cliente sem saldo

**Solução:**
- Cliente deve manter saldo na conta
- Banco tentará novamente (depende do banco)
- Notificar cliente

**Causa 2:** Autorização cancelada

**Solução:**
- Verificar status no painel Asaas
- Solicitar nova autorização ao cliente

**Causa 3:** Erro no Asaas/BACEN

**Solução:**
- Verificar logs no painel
- Entrar em contato com suporte Asaas
- Verificar status do sistema BACEN

---

## 📞 Suporte

### Asaas
- **Painel:** https://app.asaas.com
- **Documentação:** https://docs.asaas.com/docs/pix-automatico
- **Suporte:** suporte@asaas.com
- **Telefone:** (11) 4950-1234

### Sistema Corretora Corporate
- **URL Dev:** https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
- **URL Prod:** https://cadastro.corretoracorporate.com.br
- **Login:** admin / admin123

---

## 🎉 Conclusão

Após seguir todos os passos:

✅ **Empresa:**
- Módulo PIX Automático habilitado
- Chave PIX ativa
- API Key com permissões
- Sistema funcionando

✅ **Cliente:**
- Autorização criada
- Primeira parcela paga
- Débito automático ativo
- Gerenciamento disponível

✅ **Sistema:**
- Split 20/80 aplicado automaticamente
- Cobranças mensais garantidas
- Inadimplência mínima
- Fluxo de caixa previsível

---

**Versão:** 4.7  
**Data:** 16/02/2026  
**Status:** ⏳ Pronto para ativação  
**Próximo passo:** Habilitar `PIX_AUTOMATIC:WRITE` no Asaas

🚀 **Sistema 100% pronto para uso após ativação!**
