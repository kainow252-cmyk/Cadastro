# 🔧 STATUS DO SETUP WOOVI/OPENPIX

**Data**: 05/03/2026  
**Status**: ⚠️ **EM ANDAMENTO - AppID com erro 401**  

---

## ✅ O QUE JÁ FOI FEITO

### 1️⃣ Documentação Completa
- [x] Análise da API Woovi (RELATORIO_WOOVI_OPENPIX.md - 11.5 KB)
- [x] Configuração de webhooks (WOOVI_WEBHOOK_CONFIG.md - 9.7 KB)
- [x] Chave pública do webhook recebida

### 2️⃣ Código Implementado
- [x] Configuração TypeScript (src/config/woovi.ts - 6 KB)
- [x] WooviAdapter (conversão Asaas → Woovi)
- [x] WooviClient (cliente API completo)
- [x] Tipos TypeScript para todas as entidades

### 3️⃣ Testes Criados
- [x] Script de teste de conexão (test-woovi-connection.sh)
- [x] Validação de autenticação
- [x] Teste de criação de cobrança

### 4️⃣ Variáveis de Ambiente
- [x] `.dev.vars` atualizado com AppID Woovi
- [x] Chave pública do webhook configurada
- [x] URLs de sandbox/produção

---

## ⚠️ PROBLEMA ATUAL: AppID Inválido (401)

### Erro Recebido
```json
{
  "data": null,
  "errors": [
    {
      "message": "appID inválido"
    }
  ]
}
```

### Tentativas Realizadas
1. ✅ AppID está em Base64 correto
2. ✅ Formato é `Client_Id:Client_Secret`
3. ✅ Decodificação: `Client_Id_d4995bba-e392-47df-b58d-412746d4e53b:Client_Secret_ZsxF3cXVCKyHE1QObu6Mgyy1aClNxG3GHSnEme2K3VQ=`
4. ✅ Conexão SSL funcionando (TLSv1.3)
5. ❌ API retorna erro 401

---

## 🔍 POSSÍVEIS CAUSAS

### 1. Aplicação Não Totalmente Ativada
**Verificar no painel Woovi**:
- Menu `API/Plugins`
- Aplicação "teste"
- Status: **"Ativado"** ✅ (confirmado)
- Mas pode haver delay de ativação

**Solução**: Aguardar alguns minutos e tentar novamente

---

### 2. Falta de Permissões na Aplicação
**Possível problema**: A aplicação pode precisar de permissões específicas (scopes)

**Como verificar**:
1. Painel Woovi → `API/Plugins`
2. Clicar na aplicação "teste"
3. Procurar seção "Permissões" ou "Scopes"
4. Verificar se tem permissões para:
   - ✅ Criar cobranças (`charge:write`)
   - ✅ Ler cobranças (`charge:read`)
   - ✅ Criar assinaturas (`subscription:write`)
   - ✅ Ler assinaturas (`subscription:read`)

**Solução**: Ativar todas as permissões disponíveis

---

### 3. Conta de Teste Não Configurada
**Problema identificado**: 
- Aplicação está vinculada a **"Conta de Teste"**
- A conta de teste pode precisar de configuração adicional

**Como configurar**:
1. Painel Woovi → `Configurações`
2. Procurar "Conta de Teste" ou "Sandbox"
3. Verificar se há alguma configuração pendente
4. Ativar modo sandbox se necessário

---

### 4. AppID Precisa Ser Regenerado
**Possível causa**: Token pode ter sido invalidado

**Solução**:
1. Painel Woovi → `API/Plugins` → Aplicação "teste"
2. Procurar botão "Regenerar Token" ou "Regenerar AppID"
3. **IMPORTANTE**: Você só verá o novo token UMA VEZ
4. Copiar o novo token
5. Substituir em `.dev.vars` e testar novamente

---

### 5. Endpoint Incorreto
**Possível causa**: A URL base pode estar incorreta

**URLs para testar**:
```bash
# Opção 1: API principal (atual)
https://api.woovi.com/api/v1

# Opção 2: OpenPix (antigo nome)
https://api.openpix.com.br/api/v1

# Opção 3: API de teste/sandbox
https://sandbox.woovi.com/api/v1
```

**Teste manual**:
```bash
# Testar endpoint alternativo
curl -X GET "https://api.openpix.com.br/api/v1/charge" \
  -H "Authorization: SEU_APPID" \
  -H "Content-Type: application/json"
```

---

## 🎯 PRÓXIMOS PASSOS (NA ORDEM)

### 1️⃣ Verificar Painel Woovi (VOCÊ)
- [ ] Ir em `API/Plugins` → Aplicação "teste"
- [ ] Ver se há algum aviso ou mensagem de erro
- [ ] Verificar seção "Permissões" (ativar todas)
- [ ] Verificar "Conta bancária atrelada" (deve estar OK)
- [ ] Se necessário, regenerar AppID

### 2️⃣ Testar Endpoint Alternativo (EU)
- [ ] Testar `https://api.openpix.com.br` se não funcionar
- [ ] Verificar documentação oficial para URL correta

### 3️⃣ Suporte Woovi (SE NECESSÁRIO)
Se nada funcionar, contactar suporte:
- **Email**: [email protected] (provável)
- **Chat**: Disponível no painel
- **Mensagem sugerida**:
```
Olá! Criei uma aplicação API (nome: "teste") e recebi o AppID, 
mas estou recebendo erro 401 "appID inválido" ao tentar usar 
a API. A aplicação está ativa e vinculada à Conta de Teste.

Client ID: Client_Id_d4995bba-e392-47df-b58d-412746d4e53b

Poderiam verificar se há alguma configuração faltando?
```

---

## 📊 COMPARAÇÃO: ONDE ESTAMOS vs ONDE QUEREMOS CHEGAR

| Item | Status Atual | Meta |
|------|--------------|------|
| **Documentação** | ✅ 100% Completa | ✅ OK |
| **Código** | ✅ 100% Implementado | ✅ OK |
| **Testes** | ✅ Scripts criados | ✅ OK |
| **AppID** | ❌ Erro 401 | ⏳ Aguardando fix |
| **Conexão API** | ❌ Bloqueada | ⏳ Aguardando AppID válido |
| **Cobranças** | ⏳ Aguardando conexão | ❌ Não testado |
| **PIX Automático** | ⏳ Aguardando conexão | ❌ Não testado |
| **Split 20/80** | ⏳ Aguardando conexão | ❌ Não testado |

---

## 💡 ALTERNATIVA: CONTINUAR COM ASAAS

Enquanto resolve o problema da Woovi, você pode:

### Opção A: Manter Asaas + Aguardar Suporte
- ⏳ Ligar (16) 3347-8031 para ativar PIX Automático
- ✅ Split 20/80 já funciona 100%
- ✅ 6 cobranças já criadas e testadas
- Tempo: 1-3 dias para ativação

### Opção B: Usar Ambos (Dual Gateway)
- ✅ Asaas para split 20/80 (já funciona)
- ✅ Woovi para PIX Automático (quando AppID funcionar)
- Complexidade: Média (mas código já suporta)

---

## 🔧 COMANDOS ÚTEIS

### Testar AppID Atual
```bash
cd /home/user/webapp
./test-woovi-connection.sh
```

### Atualizar AppID (Quando Conseguir Novo)
```bash
# Editar .dev.vars
vim .dev.vars

# Atualizar linha:
WOOVI_APPID=NOVO_APPID_AQUI

# Testar novamente
./test-woovi-connection.sh
```

### Ver Logs Detalhados
```bash
# Teste com verbose
curl -v -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: SEU_APPID" \
  -H "Content-Type: application/json"
```

---

## 📚 RECURSOS

### Documentação Oficial
- **Getting Started**: https://developers.woovi.com/docs/apis/api-getting-started
- **Autenticação**: https://developers.woovi.com/docs/apis/api-getting-started#como-utilizar-a-api
- **Troubleshooting**: https://developers.woovi.com/docs/apis/api-getting-started#appid-inválido

### Suporte
- **Painel**: https://woovi.com (botão de chat)
- **Docs**: https://developers.woovi.com
- **Comunidade**: GitHub, Discord (verificar no site)

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de contactar suporte, verificar:

- [ ] Aplicação está com status "Ativado" no painel
- [ ] Conta bancária "Conta de Teste" está configurada
- [ ] AppID foi copiado corretamente (sem espaços extras)
- [ ] Não há caracteres especiais escondidos no AppID
- [ ] Testou aguardar alguns minutos (delay de ativação)
- [ ] Verificou seção "Permissões" (se existir)
- [ ] Tentou regenerar o AppID

---

**Desenvolvido por**: Corretora Corporate System  
**Data**: 05/03/2026 19:00  
**Versão**: v6.1.1  
**Status**: ⏳ Aguardando Resolução do AppID
