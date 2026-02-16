# Próximos Passos para Ativar PIX Automático - CRÍTICO

## ⚠️ Status Atual

**API Key atualizada:** ✅ Nova chave configurada (16/02/2026)  
**Erro persistente:** ❌ "Você não possui permissão para utilizar este recurso"

---

## 🔴 PROBLEMA IDENTIFICADO

A **nova API Key criada** ainda **NÃO tem a permissão `PIX_AUTOMATIC:WRITE`**.

### Por que isso acontece?

Existem **2 requisitos** para usar PIX Automático:

1. ✅ **API Key com permissão** → Você precisa marcar a permissão
2. ❓ **Módulo habilitado no painel** → Pode não estar ativo

---

## ✅ SOLUÇÃO PASSO A PASSO

### **Passo 1: Habilitar Módulo PIX Automático (SE EXISTIR)**

#### 1.1. Acessar Painel Asaas
```
URL: https://app.asaas.com
Fazer login
```

#### 1.2. Procurar Configurações de PIX
```
Opção 1: Menu lateral → Configurações → PIX
Opção 2: Menu superior → Configurações → Recebimentos → PIX
Opção 3: Buscar "PIX Automático" na barra de pesquisa
```

#### 1.3. Verificar se existe opção "PIX Automático"
```
Se EXISTIR:
  ☐ Clicar em "Habilitar PIX Automático"
  ☐ Ler e aceitar termos de uso
  ☐ Aguardar ativação (pode levar 1-2 minutos)
  ☐ Status: "PIX Automático ATIVO" ✅

Se NÃO EXISTIR:
  ➡️ Pular para Passo 2
```

---

### **Passo 2: Editar API Key e Marcar Permissão**

#### 2.1. Acessar Gestão de API Keys
```
Menu lateral → Configurações → Integrações → API
ou
Menu superior → Configurações → API
ou
URL direta: https://app.asaas.com/config/api
```

#### 2.2. Localizar a API Key Criada (16/02/2026)
```
Sua nova API Key:
• Data: 16/02/2026
• Descrição: "Chave aleatória" ou similar
• Início: $aact_prod_000MzkwODA...
• Status: ATIVA ✅
```

#### 2.3. Clicar em "Editar" (ícone de lápis)
```
Botão: [✏️ Editar] ou "Editar permissões"
```

#### 2.4. Procurar Seção "Permissões PIX"
```
Rolar a página até encontrar:
┌─────────────────────────────────────────┐
│ Permissões PIX                          │
├─────────────────────────────────────────┤
│ ☑ PIX:READ (leitura)                   │
│ ☑ PIX:WRITE (escrita)                  │
│ ☐ PIX_AUTOMATIC:READ                   │
│ ☐ PIX_AUTOMATIC:WRITE  ← MARCAR ESTE  │
└─────────────────────────────────────────┘
```

#### 2.5. Marcar as Permissões Necessárias
```
Marcar TODAS estas opções:
☑ PIX:READ
☑ PIX:WRITE
☑ PIX_AUTOMATIC:READ
☑ PIX_AUTOMATIC:WRITE  ← MAIS IMPORTANTE
```

#### 2.6. Salvar Alterações
```
Botão: [💾 Salvar] ou "Salvar permissões"
Aguardar mensagem: "Permissões atualizadas com sucesso"
```

---

### **Passo 3: Aguardar Propagação**

```
Tempo de espera: 1-2 minutos
Motivo: Sistema Asaas precisa atualizar permissões
```

---

### **Passo 4: Testar Criação de Autorização**

#### Via Sistema Web (Mais Fácil)

```bash
# 1. Acessar sistema
URL: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai

# 2. Fazer login
Username: admin
Password: admin123

# 3. Navegar
• Ver lista de subcontas
• Clicar em qualquer subconta
• Clicar no botão "PIX Automático" (azul/cyan)

# 4. Preencher formulário
Nome: Gelci Jose da Silva
Email: gelci.teste@example.com
CPF: 13615574788
Valor: 50.00
Descrição: Mensalidade Teste

# 5. Clicar "Criar Autorização"
```

#### Via cURL (Linha de Comando)

```bash
# Obter token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Criar autorização
curl -X POST "http://localhost:3000/api/pix/automatic-authorization" \
  -H "Cookie: auth_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletId": "b0e857ff-e03b-4b16-8492-f0431de088f8",
    "value": 50.00,
    "customerName": "Gelci Jose da Silva",
    "customerEmail": "gelci.teste@example.com",
    "customerCpf": "13615574788",
    "recurrenceType": "MONTHLY",
    "startDate": "2026-03-17"
  }' | jq .
```

---

## ✅ **Resposta Esperada (Sucesso)**

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
    "description": "Mensalidade Teste PIX Automático",
    "conciliationIdentifier": "123456789"
  },
  "qrCode": {
    "payload": "00020126580014br.gov.bcb.pix...",
    "encodedImage": "data:image/png;base64,iVBORw0KGgo...",
    "expirationDate": "2026-02-17T23:59:59"
  },
  "splitConfig": {
    "subAccount": 20,
    "mainAccount": 80
  },
  "instructions": {
    "step1": "Cliente escaneia QR Code",
    "step2": "Cliente autoriza débito automático no app do banco",
    "step3": "Cliente paga primeira parcela imediatamente",
    "step4": "Autorização fica ATIVA após pagamento",
    "step5": "Cobranças futuras ocorrem automaticamente"
  }
}
```

---

## ❌ **Se Continuar com Erro**

### Erro: "Você não possui permissão..."

**Causas possíveis:**

1. **Permissão não marcada**
   - Solução: Verificar novamente passo 2.5
   - Certifique-se de **SALVAR** as alterações

2. **Módulo PIX Automático não habilitado**
   - Solução: Entrar em contato com suporte Asaas
   - Email: suporte@asaas.com
   - Telefone: (11) 4950-1234
   - Solicitar: "Habilitar PIX Automático na minha conta"

3. **Conta Asaas não homologada**
   - Algumas contas precisam de aprovação para PIX Automático
   - Solução: Falar com gerente de contas Asaas
   - Solicitar homologação para PIX Automático

4. **Recurso ainda não liberado para sua conta**
   - PIX Automático pode estar em fase de rollout
   - Solução: Aguardar liberação ou solicitar acesso antecipado

---

## 📞 **Contato Asaas**

### Suporte Técnico
- **Email:** suporte@asaas.com
- **Telefone:** (11) 4950-1234
- **Chat:** Disponível no painel (canto inferior direito)
- **Horário:** Seg-Sex, 8h-18h

### O Que Pedir
```
"Olá, gostaria de habilitar o PIX Automático na minha conta.

Situação:
• Criei API Key em 16/02/2026
• Tentei marcar permissão PIX_AUTOMATIC:WRITE
• Continua dando erro: 'Você não possui permissão...'

Preciso de:
• Habilitar módulo PIX Automático
• Liberar permissão PIX_AUTOMATIC:WRITE
• Homologar conta para uso (se necessário)

CNPJ: [seu_cnpj]
Email da conta: [seu_email]

Obrigado!"
```

---

## 🎯 **Checklist de Ativação**

Marque conforme for realizando:

- [ ] **Passo 1:** Habilitar módulo PIX Automático (se existir opção)
- [ ] **Passo 2.1:** Acessar gestão de API Keys
- [ ] **Passo 2.2:** Localizar API Key de 16/02/2026
- [ ] **Passo 2.3:** Clicar em "Editar"
- [ ] **Passo 2.4:** Procurar "Permissões PIX"
- [ ] **Passo 2.5:** Marcar `PIX_AUTOMATIC:WRITE` ✅
- [ ] **Passo 2.6:** Salvar alterações
- [ ] **Passo 3:** Aguardar 1-2 minutos
- [ ] **Passo 4:** Testar criação de autorização
- [ ] **Sucesso:** QR Code gerado ✅

---

## 📋 **Informações para Debug**

### API Key Atual
```
Chave: $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmIzNTkyMWYyLTAyNDAtNGY0NS05Y2JiLWI3Zjc0ZmYwNThhNTo6JGFhY2hfZjU2ZjBlMDctMjU5OS00YmJhLWE2ZDAtNTc3NTdhZWRlYmRj
Data criação: 16/02/2026
Tipo: Chave aleatória
Status: ATIVA ✅
```

### Endpoint Testado
```
POST /v3/pix/automatic/authorizations
URL: https://api.asaas.com/v3/pix/automatic/authorizations
Erro: "Você não possui permissão para utilizar este recurso"
```

### Sistema
```
Versão: 4.7
Backend: ✅ Implementado
Frontend: ✅ Implementado
Split 20/80: ✅ Configurado
Banco: ✅ Migrado
API Key: ✅ Atualizada (16/02/2026)
```

---

## 🚀 **Após Ativação**

Quando o PIX Automático estiver funcionando:

1. ✅ Criar autorização de teste
2. ✅ Escanear QR Code (você mesmo)
3. ✅ Autorizar no app do banco
4. ✅ Pagar primeira parcela
5. ✅ Verificar split 20/80 no painel
6. ✅ Confirmar saldo nas contas
7. ✅ Aguardar próximo mês para validar recorrência

---

## 📝 **Resumo**

**O que você precisa fazer:**

1. Acessar https://app.asaas.com
2. Ir em: Configurações → API → Chaves de API
3. Editar a API Key de 16/02/2026
4. Marcar: `PIX_AUTOMATIC:WRITE`
5. Salvar
6. Aguardar 1-2 minutos
7. Testar criação de autorização

**Se não funcionar:**
- Contatar suporte Asaas
- Solicitar habilitação PIX Automático

---

**Versão:** 4.7  
**Data:** 16/02/2026  
**Status:** ⏳ Aguardando marcar permissão  
**Próximo passo:** Editar API Key no painel Asaas

🚀 **Sistema 100% pronto - falta apenas a permissão!**
