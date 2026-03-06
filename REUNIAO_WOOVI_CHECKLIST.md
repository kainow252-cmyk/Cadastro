# 📋 CHECKLIST PARA REUNIÃO COM SUPORTE WOOVI

**Data**: 05/03/2026  
**Objetivo**: Resolver erro 401 e entender recursos disponíveis  
**Duração estimada**: 30-60 minutos  

---

## 🎯 OBJETIVOS DA REUNIÃO

### Objetivo Principal
✅ Resolver erro 401 "appID inválido"

### Objetivos Secundários
1. ❓ Confirmar se Woovi tem **app mobile** para clientes
2. ❓ Confirmar se Woovi tem **painel web** para clientes consultarem saldo
3. ❓ Entender configurações necessárias para ativar API
4. ✅ Testar conexão ao vivo durante a reunião

---

## 📊 INFORMAÇÕES DA APLICAÇÃO

### Dados Básicos
- **Nome da Aplicação**: teste
- **Tipo**: API REST
- **Status no Painel**: Ativado ✅
- **Conta Vinculada**: Conta de Teste

### Client IDs Testados (3)
```
1. Client_Id_d4995bba-e392-47df-b58d-412746d4e53b
2. Client_Id_2401721c-0279-4b33-98dd-ad218409a23b
3. Client_Id_f7b5eaea-7c1b-4b51-bd37-25e12d5276d7 ← Atual
```

### AppID Atual (Base64)
```
Q2xpZW50X0lkX2Y3YjVlYWVhLTdjMWItNGI1MS1iZDM3LTI1ZTEyZDUyNzZkNzpDbGllbnRfU2VjcmV0X2EwL0grQ1hsd24yd2hFbUYydGlyNFFnTElyTkpoL0tCZDR4c2phTXdKVE09
```

---

## ❌ PROBLEMA ATUAL

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

### Request Exemplo
```bash
curl -X GET "https://api.woovi.com/api/v1/charge" \
  -H "Authorization: Q2xpZW50X0lkX2Y3YjVlYWVhLTdjMWItNGI1MS1iZDM3LTI1ZTEyZDUyNzZkNzpDbGllbnRfU2VjcmV0X2EwL0grQ1hsd24yd2hFbUYydGlyNFFnTElyTkpoL0tCZDR4c2phTXdKVE09" \
  -H "Content-Type: application/json"
```

### Status HTTP
- **Code**: 401 Unauthorized
- **Response Time**: ~500ms
- **SSL**: OK (TLSv1.3)

---

## 🧪 TESTES REALIZADOS

### ✅ Já Testamos
1. ✅ 3 AppIDs diferentes (todos falharam)
2. ✅ 2 URLs (api.woovi.com + api.openpix.com.br)
3. ✅ 4 formatos de autorização:
   - AppID direto
   - Bearer + AppID
   - AppID prefix
   - Client_Id:Secret sem Base64
4. ✅ Aguardamos 15+ minutos após regenerar
5. ✅ Verificamos formato Base64 correto
6. ✅ Verificamos decodificação OK

### ❌ Resultado
**TODOS** retornaram erro 401 "appID inválido"

---

## ❓ PERGUNTAS PARA O SUPORTE

### 🔴 Críticas (DEVEM ser respondidas)

1. **Permissões da Aplicação**
   - ❓ A aplicação precisa de permissões específicas ativadas?
   - ❓ Onde fica a seção de "Permissões" ou "Scopes" no painel?
   - ❓ Quais permissões são necessárias para usar a API?

2. **Conta de Teste**
   - ❓ A "Conta de Teste" precisa de ativação adicional?
   - ❓ Há alguma configuração pendente na conta?
   - ❓ Status atual da conta está OK?

3. **App e Painel para Clientes** 🔴 **CRÍTICO**
   - ❓ Woovi tem **app mobile** (iOS/Android) para **clientes** consultarem saldo?
   - ❓ Woovi tem **painel web** para **clientes** (não admin) acessarem a conta?
   - ❓ Cliente consegue ver saldo e extrato da conta dele?
   - ❓ Como o cliente final gerencia a conta dele?

4. **Ativação da API**
   - ❓ Existe algum processo de aprovação manual?
   - ❓ Quanto tempo leva para API ficar ativa após criar app?
   - ❓ Há alguma configuração oculta que não está visível?

### 🟡 Importantes (Bom saber)

5. **Split de Pagamento**
   - ❓ Split funciona com chaves PIX de subcontas?
   - ❓ Limite de subcontas por transação?
   - ❓ Taxa adicional para split?

6. **PIX Automático**
   - ❓ PIX Automático (recorrente) funciona out-of-the-box?
   - ❓ Precisa de ativação adicional?
   - ❓ Limite de assinaturas por conta?

7. **Webhooks**
   - ❓ Validação de assinatura é obrigatória?
   - ❓ Chave pública já foi fornecida (temos)?
   - ❓ Eventos disponíveis cobrem nosso caso de uso?

---

## 💻 TESTE AO VIVO (Durante a Reunião)

### Preparação
Se o suporte conseguir resolver durante a call:

1. **Peça para verificarem**:
   - Status da aplicação "teste"
   - Permissões ativadas
   - Configurações da Conta de Teste

2. **Após eles ativarem**:
   - Aguardar 1-2 minutos
   - Rodar teste ao vivo

3. **Comando para testar**:
```bash
cd /home/user/webapp
./test-woovi-connection.sh
```

### Resultado Esperado
```
✅ Autenticação bem-sucedida!
✅ Cobrança criada com sucesso!
  • Valor: R$ 10,00
  • Status: ACTIVE
  • PIX Copia e Cola: 00020126...
  • QR Code Image: https://...
  • Payment Link: https://...
```

---

## 📸 INFORMAÇÕES PARA COMPARTILHAR

### Se Pedirem Screenshots
Mostrar:
1. Tela da aplicação "teste" no painel
2. Status "Ativado"
3. Client ID atual
4. Conta de Teste vinculada

### Se Pedirem Logs
```
Todas as tentativas retornam:
HTTP 401
{"data":null,"errors":[{"message":"appID inválido"}]}
```

### Se Pedirem Detalhes Técnicos
- **User Agent**: curl/7.88.1
- **Content-Type**: application/json
- **Authorization Header**: Base64 de Client_Id:Client_Secret
- **SSL**: TLSv1.3
- **Ambiente**: Sandbox E2B (cloud development)

---

## 🎯 REQUISITOS DO NEGÓCIO

### O que PRECISAMOS
1. ✅ **Criar cobranças PIX** (simples)
2. ✅ **Split 20/80** (subconta recebe 20%, principal 80%)
3. ✅ **PIX Automático** (assinaturas recorrentes)
4. ✅ **Webhooks** (notificação de pagamento)
5. 🔴 **App/Painel para CLIENTE** (consultar saldo) ← **CRÍTICO**

### Se Não Tiverem App Cliente
Explicar que:
- ❌ Cliente precisa consultar saldo
- ❌ Cliente precisa ver extrato
- ❌ Cliente precisa gerenciar conta
- ❌ Sem isso, Woovi não atende nosso caso de uso

**Decisão**: Se não tiver app cliente, vamos continuar com Asaas.

---

## ✅ O QUE TEMOS PRONTO

### Código 100% Implementado
- ✅ `src/config/woovi.ts` (6 KB)
- ✅ WooviAdapter (conversão Asaas → Woovi)
- ✅ WooviClient (todos os métodos)
- ✅ Tipos TypeScript completos
- ✅ Script de teste automatizado

### Documentação Completa
- ✅ RELATORIO_WOOVI_OPENPIX.md (11.5 KB)
- ✅ WOOVI_WEBHOOK_CONFIG.md (9.7 KB)
- ✅ WOOVI_SETUP_STATUS.md (6.8 KB)
- ✅ WOOVI_TROUBLESHOOTING_401.md (8.2 KB)

**Total**: ~50 KB de código + documentação prontos!

---

## 🤝 COMO CONDUZIR A REUNIÃO

### 1. Início (5 min)
- ✅ Agradecer pela reunião
- ✅ Explicar problema resumidamente
- ✅ Mostrar que já testamos exaustivamente

### 2. Demonstração (10 min)
- ✅ Compartilhar tela (se possível)
- ✅ Mostrar painel da aplicação
- ✅ Mostrar erro 401 ao vivo
- ✅ Mostrar testes realizados

### 3. Perguntas (15 min)
- ✅ Fazer perguntas críticas (seção acima)
- ✅ **Focar em app/painel para cliente** 🔴
- ✅ Entender o que precisa ser configurado

### 4. Resolução (15 min)
- ✅ Se eles conseguirem resolver: testar ao vivo
- ✅ Se não: entender próximos passos
- ✅ Definir prazo para resolução

### 5. Decisão (5 min)
- ✅ Se tiver app cliente + API funcionar: **Continuar com Woovi**
- ✅ Se NÃO tiver app cliente: **Focar no Asaas**
- ✅ Agradecer e definir follow-up

---

## 📝 ANOTAÇÕES DURANTE A REUNIÃO

### Respostas do Suporte

**1. Erro 401 - Causa:**
```
[Anotar aqui o que eles disserem]
```

**2. App/Painel para Cliente:**
```
[ ] ✅ Sim, tem app mobile (iOS/Android)
[ ] ✅ Sim, tem painel web para cliente
[ ] ❌ Não tem app/painel para cliente
[ ] ❓ Outro: __________________
```

**3. Permissões Necessárias:**
```
[Anotar quais permissões precisam ser ativadas]
```

**4. Próximos Passos:**
```
[Anotar o que precisa ser feito]
```

**5. Prazo de Resolução:**
```
[Anotar prazo estimado]
```

---

## ✅ CHECKLIST PÓS-REUNIÃO

Após a reunião, verificar:

- [ ] Entendi a causa do erro 401?
- [ ] Sei como resolver o erro 401?
- [ ] Confirmei se tem app/painel para cliente?
- [ ] Testei a API (se resolveram na call)?
- [ ] Defini próximos passos?
- [ ] Tenho prazo de resolução?
- [ ] Tomei decisão: Woovi ou Asaas?

---

## 🎯 CENÁRIOS POSSÍVEIS

### Cenário A: App Cliente Existe + API Resolve ✅
**Ação**: Continuar com Woovi
- Testar API
- Validar split 20/80
- Implementar PIX Auto
- Deploy

### Cenário B: App Cliente Existe + API Não Resolve ⚠️
**Ação**: Aguardar resolução do erro 401
- Definir prazo com suporte
- Se demorar >1 semana: focar Asaas temporariamente

### Cenário C: App Cliente NÃO Existe ❌
**Ação**: **Focar 100% no Asaas**
- Woovi não atende requisito crítico
- Asaas tem app completo
- Decisão final: Asaas

### Cenário D: App Cliente Existe (Mas Limitado) 🟡
**Ação**: Avaliar limitações
- Cliente consegue ver saldo? ✅/❌
- Cliente consegue ver extrato? ✅/❌
- Cliente consegue fazer pagamentos? ✅/❌
- Se tudo OK: Continuar com Woovi
- Se faltar algo: Focar Asaas

---

## 📞 CONTATOS

### Suporte Woovi
- **Chat**: No painel após login
- **Email**: [email protected]
- **Docs**: https://developers.woovi.com
- **Comunidade**: (verificar se existe)

---

## 🚀 APÓS A REUNIÃO

### Se Resolverem o Erro 401
Executar imediatamente:
```bash
cd /home/user/webapp
./test-woovi-connection.sh
```

### Se Funcionar
1. Criar primeira cobrança
2. Testar PIX Automático
3. Configurar split 20/80
4. Validar webhooks
5. Deploy

### Se NÃO Tiver App Cliente
1. Agradecer suporte
2. Explicar que não atende requisito
3. Focar no Asaas
4. Ligar (16) 3347-8031

---

## 💡 DICAS PARA A REUNIÃO

1. ✅ **Seja direto**: Explique o problema claramente
2. ✅ **Mostre evidências**: Temos 20+ testes documentados
3. ✅ **Seja educado**: Eles estão ajudando
4. ✅ **Pergunte sobre app cliente logo**: É crítico
5. ✅ **Teste ao vivo**: Se possível, durante a call
6. ✅ **Anote tudo**: Respostas e próximos passos
7. ✅ **Defina prazo**: Quando teremos resolução?

---

## 🎯 RESULTADO DESEJADO

### Ideal
- ✅ Erro 401 resolvido na call
- ✅ Confirmação de app cliente existe
- ✅ API funcionando
- ✅ Teste bem-sucedido ao vivo
- ✅ Próximos passos claros

### Mínimo Aceitável
- ✅ Entendi causa do erro 401
- ✅ Sei se tem app cliente ou não
- ✅ Tenho prazo de resolução
- ✅ Tomei decisão: Woovi ou Asaas

---

**Boa reunião! 🚀**

**Depois me conta o resultado!** 📞

---

**Data**: 05/03/2026 20:15  
**Status**: Pronto para reunião  
**Código**: 100% implementado e aguardando
