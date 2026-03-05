# 📧 MENSAGEM PARA SUPORTE WOOVI

**Use este texto para contactar o suporte Woovi/OpenPix**

---

## 📨 ASSUNTO
```
Erro 401 "appID inválido" - Aplicação não consegue autenticar na API
```

---

## 📝 MENSAGEM

Olá, equipe Woovi!

Estou tentando integrar meu sistema com a API Woovi, mas **todos os AppIDs que gero retornam erro 401 "appID inválido"**.

### 🔍 Detalhes da Aplicação

**Nome da aplicação**: teste  
**Tipo**: API REST  
**Status**: Ativado  
**Conta vinculada**: Conta de Teste  

**Client IDs testados**:
1. `Client_Id_d4995bba-e392-47df-b58d-412746d4e53b`
2. `Client_Id_2401721c-0279-4b33-98dd-ad218409a23b`
3. `Client_Id_f7b5eaea-7c1b-4b51-bd37-25e12d5276d7` ← Atual

### ❌ Erro Recebido

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

### 🧪 Testes Realizados

Testei **exaustivamente** todas as combinações:

1. **3 AppIDs diferentes** (todos regenerados)
2. **2 URLs**:
   - `https://api.woovi.com/api/v1`
   - `https://api.openpix.com.br/api/v1`
3. **4 formatos de autorização**:
   - `Authorization: [AppID em Base64]`
   - `Authorization: Bearer [AppID]`
   - `Authorization: AppID [AppID]`
   - `Authorization: [Client_Id:Secret direto]`

**Resultado**: TODOS retornam erro 401 "appID inválido"

### ✅ Verificações Realizadas

- [x] AppID está em formato Base64 correto
- [x] Decodificação mostra `Client_Id:Client_Secret` válido
- [x] Aplicação está com status "Ativado" no painel
- [x] Conta bancária "Conta de Teste" está vinculada
- [x] Aguardei 15+ minutos após regenerar
- [x] Conexão SSL está OK (TLSv1.3)
- [x] URLs conforme documentação oficial

### 🔍 Exemplo de Request

```bash
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Q2xpZW50X0lkX2Y3YjVlYWVhLTdjMWItNGI1MS1iZDM3LTI1ZTEyZDUyNzZkNzpDbGllbnRfU2VjcmV0X2EwL0grQ1hsd24yd2hFbUYydGlyNFFnTElyTkpoL0tCZDR4c2phTXdKVE09" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{"data":null,"errors":[{"message":"appID inválido"}]}
```

### ❓ Perguntas

1. **A "Conta de Teste" precisa de alguma ativação adicional?**
2. **Existe alguma seção de "Permissões" ou "Scopes" que preciso ativar na aplicação?**
3. **Há alguma configuração adicional necessária para usar a API?**
4. **O erro "appID inválido" pode ter outra causa além do token estar incorreto?**

### 🎯 Objetivo

Preciso usar a API para:
- Criar cobranças PIX (`POST /api/v1/charge`)
- Criar assinaturas PIX Automático (`POST /api/v1/subscriptions`)
- Receber webhooks de pagamento

### 📸 Anexos

[Se possível, anexe screenshots da tela da aplicação no painel]

---

Agradeço muito a ajuda!

**Dados de contato**: [seu email ou telefone]

---

**Enviado em**: 05/03/2026

---

## 🔗 COMO ENVIAR

### Opção 1: Chat no Painel (RECOMENDADO)
1. Acesse: https://woovi.com
2. Procure ícone de chat (geralmente canto inferior direito)
3. Cole a mensagem acima
4. Anexe screenshots se possível

### Opção 2: Email
**Para**: [email protected]  
**Assunto**: Erro 401 "appID inválido" - Aplicação não consegue autenticar  
**Corpo**: Cole a mensagem acima

### Opção 3: WhatsApp / Telefone
Se houver número de suporte:
- Explique o problema resumidamente
- Mencione que testou 3 AppIDs diferentes
- Peça para verificar configurações da conta

---

## ⏱️ TEMPO ESPERADO DE RESPOSTA

- **Chat**: 5-30 minutos (horário comercial)
- **Email**: 1-24 horas
- **WhatsApp**: Imediato (se disponível)

---

## 📋 INFORMAÇÕES ADICIONAIS (Para o Suporte)

Se o suporte pedir mais detalhes:

### Decodificação do AppID Atual
```
Base64: Q2xpZW50X0lkX2Y3YjVlYWVhLTdjMWItNGI1MS1iZDM3LTI1ZTEyZDUyNzZkNzpDbGllbnRfU2VjcmV0X2EwL0grQ1hsd24yd2hFbUYydGlyNFFnTElyTkpoL0tCZDR4c2phTXdKVE09

Decodificado: Client_Id_f7b5eaea-7c1b-4b51-bd37-25e12d5276d7:Client_Secret_a0/H+CXlwn2whEmF2tir4QgLIrNJh/KBd4xsjaMwJTM=
```

### User Agent
```
curl/7.88.1
```

### IP de Origem
Sandbox E2B (provedor de desenvolvimento em nuvem)

### Sistema Operacional
Linux (Ubuntu)

---

## 🎯 RESULTADO ESPERADO

Após contato com suporte, você deve receber:

1. **Confirmação** se a conta/aplicação está OK
2. **Instruções** de configuração adicional (se houver)
3. **Ativação manual** da aplicação (se necessário)
4. **AppID funcional** ou explicação do problema

---

## 📞 CONTATOS WOOVI (Se não souber)

- **Site**: https://woovi.com
- **Docs**: https://developers.woovi.com
- **Email provável**: [email protected] ou [email protected]
- **Chat**: No painel após login

---

**Boa sorte!** 🍀

Assim que receberem a resposta, me avise para continuarmos a integração!
