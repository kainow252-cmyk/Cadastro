# 🎯 Transações de Evidência - DeltaPag Sandbox

## 📋 Resumo Executivo

Este documento contém instruções para **gerar e obter evidências de transações** criadas via **API DeltaPag Sandbox** para validação da integração.

## ✅ Funcionalidade Implementada

### Endpoint: POST `/api/admin/create-evidence-transactions`

**Autenticação:** Requer token JWT (admin)

**Função:** Cria 5 transações completas via API DeltaPag Sandbox e salva no banco D1.

## 🔄 Fluxo de Criação de Transações

### Para Cada Transação:

1. **POST `/customers`** - Criar cliente na API DeltaPag
   ```json
   {
     "name": "João Silva Santos",
     "email": "joao.silva@evidencia.com",
     "cpf": "12345678901",
     "mobilePhone": "11987654321"
   }
   ```

2. **POST `/subscriptions`** - Criar assinatura recorrente
   ```json
   {
     "customer": "cus_XXX",
     "billingType": "CREDIT_CARD",
     "value": 149.90,
     "cycle": "MONTHLY",
     "creditCard": {
       "number": "5428258051342340",
       "holderName": "João Silva Santos",
       "expiryMonth": "12",
       "expiryYear": "2027",
       "ccv": "123"
     }
   }
   ```

3. **INSERT** no banco D1 local com todos os dados

## 📊 Transações de Evidência Criadas

| # | Cliente | Email | CPF | Valor | Cartão | Bandeira | Recorrência |
|---|---------|-------|-----|-------|--------|----------|-------------|
| 1 | João Silva Santos | joao.silva@evidencia.com | 123.456.789-01 | R$ 149,90 | 5428258051342340 | Visa | Mensal |
| 2 | Maria Oliveira Costa | maria.oliveira@evidencia.com | 234.567.890-12 | R$ 249,90 | 5448280000000007 | Mastercard | Mensal |
| 3 | Pedro Henrique Lima | pedro.lima@evidencia.com | 345.678.901-23 | R$ 399,90 | 5308547387340761 | Visa | Mensal |
| 4 | Ana Paula Rodrigues | ana.rodrigues@evidencia.com | 456.789.012-34 | R$ 599,90 | 4235647728025682 | Mastercard | Anual |
| 5 | Carlos Eduardo Almeida | carlos.almeida@evidencia.com | 567.890.123-45 | R$ 899,90 | 6062825624254001 | Hipercard | Anual |

## 🚀 Como Gerar as Evidências

### Opção 1: Interface Web (Recomendado)

1. **Acesse o Dashboard**:
   ```
   https://gerenciador.corretoracorporate.com.br/dashboard
   ```

2. **Login**:
   - Usuário: `admin`
   - Senha: `admin123`

3. **Abra a Seção DeltaPag**:
   - Clique no card "💳 Cartão Crédito"

4. **Clique no Botão Laranja**:
   - Botão: **"📧 Criar Evidências"**
   - Confirmação aparecerá listando as 5 transações
   - Clique em **"OK"** para confirmar

5. **Aguarde**:
   - Tempo estimado: **30-60 segundos**
   - Spinner mostrará "Criando via API..."

6. **Resultado**:
   ```
   ✅ 5 transações de evidência criadas com sucesso!
   
   📋 Detalhes:
   
   1. João Silva Santos
      Email: joao.silva@evidencia.com
      Visa •••• 2340 - R$ 149.90
      Status: ACTIVE
      ID DeltaPag: sub_XXXXXXXXXXXXXX
   
   2. Maria Oliveira Costa
      Email: maria.oliveira@evidencia.com
      Mastercard •••• 0007 - R$ 249.90
      Status: ACTIVE
      ID DeltaPag: sub_XXXXXXXXXXXXXX
   
   [... mais 3 transações ...]
   ```

7. **Copie os IDs DeltaPag** e envie para a equipe DeltaPag

### Opção 2: API Direta (via cURL)

```bash
# 1. Login para obter token
curl -X POST https://gerenciador.corretoracorporate.com.br/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# 2. Criar transações de evidência
curl -X POST https://gerenciador.corretoracorporate.com.br/api/admin/create-evidence-transactions \
  -b cookies.txt \
  -H "Content-Type: application/json"

# Resposta esperada:
{
  "ok": true,
  "message": "5 transações de evidência criadas com sucesso via API DeltaPag Sandbox",
  "count": 5,
  "transactions": [
    {
      "id": "uuid-local",
      "deltapag_id": "sub_XXXXXX",
      "customer": "João Silva Santos",
      "email": "joao.silva@evidencia.com",
      "value": 149.90,
      "card": "Visa •••• 2340",
      "status": "ACTIVE",
      "description": "Plano Premium Mensal - Evidência #1"
    },
    ...
  ]
}
```

## 📝 Informações para Enviar à DeltaPag

Após criar as transações, envie à DeltaPag:

### 1. IDs das Assinaturas (DeltaPag)
```
sub_XXXXXXXXXXXXXX  (João Silva Santos)
sub_XXXXXXXXXXXXXX  (Maria Oliveira Costa)
sub_XXXXXXXXXXXXXX  (Pedro Henrique Lima)
sub_XXXXXXXXXXXXXX  (Ana Paula Rodrigues)
sub_XXXXXXXXXXXXXX  (Carlos Eduardo Almeida)
```

### 2. Screenshot da Interface
- Captura da tela mostrando as 5 transações na tabela
- Deve incluir: Nome, Email, Cartão, Valor, Status

### 3. Export Excel/CSV
- Exportar arquivo Excel ou CSV
- Anexar à resposta do email
- Arquivo contém todos os dados das transações

### 4. Logs do Console (Opcional)
Abra o Console do navegador (F12) ao criar transações:
```
🔄 Criando transação para João Silva Santos...
📤 Criando cliente: {name, email, cpf, phone}
✅ Cliente criado: cus_XXX
📤 Criando assinatura DeltaPag: {customer, value, billingType}
✅ Assinatura DeltaPag criada: sub_XXX
💾 Salvo no banco D1: uuid
✅ Transação 1/5 criada com sucesso
```

## 🔍 Como Verificar as Transações

### No Dashboard:

1. **Tabela de Assinaturas**:
   - As 5 novas transações aparecerão no topo
   - Status: **ACTIVE**
   - Coluna "Cartão" mostrará número completo ou mascarado

2. **Filtros**:
   - Buscar por nome: "João Silva"
   - Buscar por email: "@evidencia.com"
   - Filtrar por status: ACTIVE

3. **Exportar**:
   - Botão "📥 Exportar Excel" ou "📄 Exportar CSV"
   - Arquivo incluirá todas as 5 transações

### No Banco de Dados (D1):

```sql
SELECT 
  customer_name, 
  customer_email, 
  deltapag_subscription_id, 
  value, 
  status,
  card_brand,
  created_at
FROM deltapag_subscriptions
WHERE customer_email LIKE '%@evidencia.com'
ORDER BY created_at DESC
LIMIT 5;
```

## ⚠️ Notas Importantes

### Ambiente

- **API Base URL**: https://deltapag-sandbox.bempaggo.io
- **Ambiente**: SANDBOX (testes)
- **Cartões de Teste**: Homologação Cielo/Rede

### Dados Sensíveis

- Cartões são de **teste** (ambiente sandbox)
- Números completos **visíveis** apenas no dashboard admin
- Exportações incluem números completos
- **NÃO usar em produção** sem criptografia adequada

### Próximos Passos

1. ✅ Gerar evidências
2. ✅ Copiar IDs DeltaPag
3. ✅ Fazer screenshot/export
4. ✅ Enviar para DeltaPag
5. ⏳ Aguardar aprovação
6. 🎉 Receber chave de produção!

## 📧 Template de Email para DeltaPag

```
Assunto: Evidências de Transações - Integração Sandbox

Olá equipe DeltaPag,

Seguem as evidências das transações criadas via API DeltaPag Sandbox:

📊 Resumo:
- Total de transações: 5
- Ambiente: Sandbox
- Data: [DATA_ATUAL]

🔑 IDs das Assinaturas (DeltaPag):
1. sub_XXXXXX - João Silva Santos (R$ 149,90)
2. sub_XXXXXX - Maria Oliveira Costa (R$ 249,90)
3. sub_XXXXXX - Pedro Henrique Lima (R$ 399,90)
4. sub_XXXXXX - Ana Paula Rodrigues (R$ 599,90)
5. sub_XXXXXX - Carlos Eduardo Almeida (R$ 899,90)

📎 Anexos:
- Screenshot da interface
- Export Excel/CSV com detalhes completos

✅ Fluxo implementado:
1. POST /customers - Cliente criado
2. POST /subscriptions - Assinatura recorrente criada
3. Dados salvos no banco local (Cloudflare D1)

Aguardo retorno para liberação da chave de produção.

Atenciosamente,
[SEU_NOME]
```

## 🔗 Links Úteis

- **Dashboard**: https://gerenciador.corretoracorporate.com.br/dashboard
- **API DeltaPag Sandbox**: https://deltapag-sandbox.bempaggo.io
- **Documentação**: (link da doc DeltaPag se disponível)

## ✅ Checklist de Validação

- [ ] Transações criadas via API DeltaPag
- [ ] IDs DeltaPag copiados
- [ ] Screenshot capturado
- [ ] Excel/CSV exportado
- [ ] Email enviado para DeltaPag
- [ ] Aguardando retorno da equipe

## 📞 Suporte

Em caso de dúvidas ou problemas ao gerar as evidências, verifique:

1. **Console do navegador** (F12) - logs detalhados
2. **Resposta da API** - mensagens de erro
3. **Status das transações** - ACTIVE esperado
4. **Conexão com API DeltaPag** - sandbox deve estar online

---

**Versão**: 1.0  
**Data**: 2026-02-19  
**Commit**: 7c19e73  
**Status**: ✅ Pronto para gerar evidências
