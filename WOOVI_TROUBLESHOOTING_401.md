# 🔍 TROUBLESHOOTING: WOOVI API - ERRO 401 PERSISTENTE

**Data**: 05/03/2026 19:15  
**Problema**: AppID retorna "appID inválido" mesmo após regeneração  
**Status**: ⚠️ **BLOQUEADO - Investigando**  

---

## 📊 HISTÓRICO DE TENTATIVAS

### Tentativa #1: AppID Original
```
AppID: Q2xpZW50X0lkX2Q0OTk1YmJhLWUzOTItNDdkZi1iNThkLTQxMjc0NmQ0ZTUzYjpDbGllbnRfU2VjcmV0X1pzeEYzY1hWQ0t5SEUxUU9idTZNZ3l5MWFDbE54RzNHSFNuRW1lMkszVlE9

Decodificado:
Client_Id_d4995bba-e392-47df-b58d-412746d4e53b:Client_Secret_ZsxF3cXVCKyHE1QObu6Mgyy1aClNxG3GHSnEme2K3VQ=

Resultado: ❌ 401 "appID inválido"
```

### Tentativa #2: AppID Regenerado
```
AppID: Q2xpZW50X0lkXzI0MDE3MjFjLTAyNzktNGIzMy05OGRkLWFkMjE4NDA5YTIzYjpDbGllbnRfU2VjcmV0XzRuejI5Q3lJNmhLakFTeGtZd2l2a2l4S1dvdkUzSUZ0dHFidmVMZ0xVdkU9

Decodificado:
Client_Id_2401721c-0279-4b33-98dd-ad218409a23b:Client_Secret_4nz29CyI6hKjASxkYwivkixKWovE3IFttqbveLgLUvE=

Resultado: ❌ 401 "appID inválido"
```

### Tentativa #3: URL Alternativa
```
URL Original: https://api.woovi.com/api/v1
URL Alternativa: https://api.openpix.com.br/api/v1

Resultado: ❌ 401 em ambas
```

---

## 🔧 FORMATO DO REQUEST

### Request Atual (Conforme Documentação)
```bash
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Q2xpZW50X0lkXzI0MDE3MjFjLTAyNzktNGIzMy05OGRkLWFkMjE4NDA5YTIzYjpDbGllbnRfU2VjcmV0XzRuejI5Q3lJNmhLakFTeGtZd2l2a2l4S1dvdkUzSUZ0dHFidmVMZ0xVdkU9" \
  -H "Content-Type: application/json"
```

### Response Recebida
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

---

## 🤔 POSSÍVEIS CAUSAS

### 1. Aplicação Ainda Não Totalmente Ativada
**Probabilidade**: 🟡 Média

**Motivo**: Pode haver um delay entre a criação/regeneração e a ativação efetiva no sistema.

**Teste**: 
- Aguardar 10-15 minutos após regeneração
- Verificar se aparece alguma mensagem no painel

---

### 2. Conta "Conta de Teste" Não Configurada
**Probabilidade**: 🟢 Alta

**Motivo**: A aplicação está vinculada a "Conta de Teste", mas essa conta pode precisar de ativação/configuração adicional.

**Como verificar no painel**:
1. Menu principal → `Contas` ou `Configurações`
2. Procurar "Conta de Teste" ou "Sandbox"
3. Verificar se há:
   - ❌ Aviso de "Conta não ativada"
   - ❌ Mensagem de "Configuração pendente"
   - ❌ Status "Inativa"
4. Se houver, ativar a conta de teste

---

### 3. Permissões Não Configuradas
**Probabilidade**: 🟢 Alta

**Motivo**: A aplicação pode estar criada, mas sem permissões para acessar a API.

**Como verificar no painel**:
1. `API/Plugins` → Aplicação "teste"
2. Procurar seção "Permissões", "Scopes" ou "Autorização"
3. Verificar se existem checkboxes ou toggles desativados
4. Ativar TODAS as permissões disponíveis:
   - ✅ Cobranças (charge:read, charge:write)
   - ✅ Assinaturas (subscription:read, subscription:write)
   - ✅ Transações
   - ✅ Webhooks
   - ✅ Qualquer outra disponível

---

### 4. AppID Precisa de Prefixo Especial
**Probabilidade**: 🟡 Média

**Motivo**: Algumas APIs requerem prefixo no token (ex: "Bearer", "Basic", etc.)

**Testes a fazer**:
```bash
# Teste 1: Bearer
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Bearer Q2xpZW50X0lkX..." \
  -H "Content-Type: application/json"

# Teste 2: Basic
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Basic Q2xpZW50X0lkX..." \
  -H "Content-Type: application/json"

# Teste 3: AppID
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: AppID Q2xpZW50X0lkX..." \
  -H "Content-Type: application/json"
```

**Porém**: A documentação oficial mostra apenas `Authorization: <AppID>` sem prefixo.

---

### 5. Formato Incorreto do AppID
**Probabilidade**: 🔴 Baixa

**Motivo**: O formato `Client_Id:Client_Secret` em Base64 está correto conforme docs.

**Verificado**: ✅ Formato correto

---

### 6. Ambiente de Teste Separado
**Probabilidade**: 🟡 Média

**Motivo**: Pode haver um endpoint diferente para sandbox/teste.

**URLs para testar**:
```
https://api.woovi.com/api/v1 (principal) ✅ Testado
https://api.openpix.com.br/api/v1 (alternativo) ✅ Testado
https://sandbox.woovi.com/api/v1 (sandbox?) ⏳ Testar
https://test.woovi.com/api/v1 (teste?) ⏳ Testar
```

---

### 7. IP Whitelist ou Restrições Geográficas
**Probabilidade**: 🔴 Baixa

**Motivo**: Improvável, mas possível se houver restrições de IP/região.

**Como verificar**:
- Painel → Configurações de Segurança
- Procurar "IP Whitelist" ou "Restrições de acesso"

---

## 🎯 AÇÕES RECOMENDADAS (NA ORDEM)

### ✅ 1. Verificar Painel Woovi - Permissões
**PRIORIDADE: ALTA** 🔴

No painel da aplicação "teste", procurar:
- Seção "Permissões" ou "Scopes"
- Seção "Autorização" ou "Acesso à API"
- Toggles ou checkboxes desativados

**Se encontrar**: Ativar TODAS as permissões

---

### ✅ 2. Verificar Status da "Conta de Teste"
**PRIORIDADE: ALTA** 🔴

Menu principal → Procurar "Conta de Teste":
- Status deve estar "Ativa" ou "Aprovada"
- Sem mensagens de erro ou configuração pendente

**Se não estiver ativa**: Ativar a conta de teste

---

### ✅ 3. Aguardar 10-15 Minutos
**PRIORIDADE: MÉDIA** 🟡

Após regenerar AppID:
- Aguardar 10-15 minutos
- Sistema pode precisar propagar mudanças
- Tentar novamente após esse período

---

### ✅ 4. Verificar Documentação no Painel
**PRIORIDADE: MÉDIA** 🟡

No painel da aplicação, procurar:
- Seção "Como usar" ou "Getting Started"
- Link para documentação específica
- Exemplos de código ou curl

**Objetivo**: Ver se há alguma instrução adicional que não está na docs pública

---

### ✅ 5. Contactar Suporte Woovi
**PRIORIDADE: BAIXA** 🟢 (Última opção)

Se nada funcionar após 1-2 horas:

**Chat no painel** ou **Email**: [email protected]

**Mensagem sugerida**:
```
Olá!

Estou tentando integrar com a API Woovi mas recebo erro 401 "appID inválido".

Detalhes:
- Aplicação: "teste" (criada e ativa)
- Client ID: Client_Id_2401721c-0279-4b33-98dd-ad218409a23b
- Conta vinculada: Conta de Teste
- Endpoint testado: GET /api/v1/charge
- Erro: {"data": null, "errors": [{"message": "appID inválido"}]}

Já tentei:
✅ Regenerar AppID (2x)
✅ Testar URLs api.woovi.com e api.openpix.com.br
✅ Verificar formato Base64
✅ Aguardar alguns minutos

Poderiam verificar se:
1. A "Conta de Teste" está ativa?
2. A aplicação tem permissões necessárias?
3. Há alguma configuração adicional pendente?

Agradeço a ajuda!
```

---

## 📸 INFORMAÇÕES ÚTEIS PARA ENVIAR

Se precisar contactar suporte, enviar:

### Screenshot 1: Detalhes da Aplicação
- Painel → API/Plugins → "teste"
- Mostrar:
  - Nome: "teste"
  - Tipo: "API REST"
  - Client ID
  - Status: "Ativado"
  - Conta bancária: "Conta de Teste"

### Screenshot 2: Seção de Permissões (Se existir)
- Mostrar todas as permissões disponíveis
- Status de cada permissão (ativada/desativada)

### Screenshot 3: Conta de Teste
- Menu → Conta de Teste
- Mostrar status da conta

---

## 🧪 TESTES ALTERNATIVOS

### Teste com Prefixos
```bash
# Teste 1: Bearer
curl -s "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Bearer Q2xpZW50X0lkXzI0MDE3MjFjLTAyNzktNGIzMy05OGRkLWFkMjE4NDA5YTIzYjpDbGllbnRfU2VjcmV0XzRuejI5Q3lJNmhLakFTeGtZd2l2a2l4S1dvdkUzSUZ0dHFidmVMZ0xVdkU9"

# Teste 2: Sandbox URL
curl -s "https://sandbox.woovi.com/api/v1/charge" \
  -H "Authorization: Q2xpZW50X0lkXzI0MDE3MjFjLTAyNzktNGIzMy05OGRkLWFkMjE4NDA5YTIzYjpDbGllbnRfU2VjcmV0XzRuejI5Q3lJNmhLakFTeGtZd2l2a2l4S1dvdkUzSUZ0dHFidmVMZ0xVdkU9"
```

---

## 📚 RECURSOS

### Documentação Oficial
- **Getting Started**: https://developers.woovi.com/docs/apis/api-getting-started
- **Troubleshooting**: https://developers.woovi.com/docs/apis/api-getting-started#appid-inválido

### Suporte
- **Painel**: https://woovi.com (chat ao vivo)
- **Email**: [email protected]
- **Docs**: https://developers.woovi.com

---

## 🎯 PRÓXIMOS PASSOS

1. ⏳ **Você**: Verificar painel Woovi (permissões + conta teste)
2. ⏳ **Você**: Aguardar 10-15 minutos se necessário
3. ⏳ **Você**: Enviar screenshots ou informações adicionais
4. ⏳ **Eu**: Testar com novas informações
5. ⏳ **Nós**: Contactar suporte se necessário

---

**Status**: ⏳ Aguardando verificação do painel  
**Próxima ação**: Verificar permissões e conta de teste  
**Data**: 05/03/2026 19:15
