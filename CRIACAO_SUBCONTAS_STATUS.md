# ✅ CRIAÇÃO DE SUBCONTAS - STATUS E LIMITAÇÕES

**Data**: 06/03/2026 - 18:00  
**API Token**: Validada e funcionando  
**Endpoint**: `POST /v3/accounts`

---

## 📊 TESTE DE CRIAÇÃO DE SUBCONTAS

### ✅ Endpoint Funcionando
O endpoint de criação de subcontas **ESTÁ FUNCIONANDO**, mas tem **validações rigorosas** da Asaas.

### ⚠️ Validações Requeridas

| Campo | Validação | Exemplo |
|-------|-----------|---------|
| **CPF** | Deve ser válido E único | ✅ `11144477735` |
| **Email** | Deve ser único | ✅ `novo@example.com` |
| **Telefone** | Formato correto | ✅ `1133334444` |
| **Celular** | Formato correto E único | ✅ `11987654321` |
| **CEP** | Deve existir | ✅ `01310100` |

---

## ❌ ERROS ENCONTRADOS NOS TESTES

### 1. CPF Inválido
```json
{
  "code": "invalid_object",
  "description": "O campo cpfCnpj informado é inválido."
}
```
**Causa**: CPF não passa na validação do dígito verificador

### 2. CPF Já Em Uso
```json
{
  "code": "invalid_object",
  "description": "O CPF 11144477735 já está em uso."
}
```
**Causa**: CPF já cadastrado como cliente ou subconta

### 3. Celular Excedeu Limite
```json
{
  "code": "invalid_action",
  "description": "O número de celular informado já excedeu o limite de uso."
}
```
**Causa**: Celular foi usado em muitas contas

### 4. Telefone/Celular Inválido
```json
{
  "code": "invalid_phone",
  "description": "O telefone informado é inválido."
}
```
**Causa**: Formato incorreto (ex: `11999999999` sem DDD válido)

---

## ✅ SUBCONTAS EXISTENTES (FUNCIONANDO)

**Total**: 4 subcontas ativas

| # | Nome | CPF | Email | Status |
|---|------|-----|-------|--------|
| 1 | **Franklin Madson** | 136.155.747-88 | soaresfranklin626@gmail.com | ✅ APROVADO |
| 2 | **Saulo Salvador** | 088.272.847-45 | saulosalvador323@gmail.com | ✅ APROVADO |
| 3 | **Tanara Helena** | 824.843.680-20 | tanarahelena@hotmail.com | ✅ APROVADO |
| 4 | **Roberto Caporalle** | 068.530.578-30 | rmayo@bol.com.br | ✅ APROVADO |

**Todas com split 20/80 funcionando perfeitamente!**

---

## 📝 COMO CRIAR UMA NOVA SUBCONTA

### Via API (Requer dados válidos e únicos)

**Requisição:**
```bash
POST https://api.asaas.com/v3/accounts
Authorization: access_token $ASAAS_API_KEY

{
  "name": "Nome Completo",
  "email": "email.unico@exemplo.com",      // DEVE SER ÚNICO
  "cpfCnpj": "12345678909",                // DEVE SER VÁLIDO E ÚNICO
  "birthDate": "1990-01-01",
  "phone": "1133334444",                   // FORMATO CORRETO
  "mobilePhone": "11987654321",            // ÚNICO E VÁLIDO
  "address": "Rua Exemplo",
  "addressNumber": "123",
  "province": "Bairro",
  "postalCode": "01310100",                // CEP VÁLIDO
  "incomeValue": 5000
}
```

### Checklist Antes de Criar

- [ ] **CPF válido** (verificar dígitos verificadores)
- [ ] **CPF não usado** anteriormente
- [ ] **Email único** (não cadastrado)
- [ ] **Celular único** (não usado em outras contas)
- [ ] **CEP existente** (verificar nos Correios)
- [ ] **DDD válido** no telefone
- [ ] **Todos os campos obrigatórios** preenchidos

---

## 🔧 PROCESSO DE APROVAÇÃO

### Após Criação
1. **Status inicial**: `PENDING` (Aguardando análise)
2. **Análise Asaas**: 1-3 dias úteis
3. **Documentação**: Pode solicitar documentos
4. **Aprovação**: Status muda para `APPROVED`
5. **WalletId**: Gerado após aprovação
6. **Uso imediato**: Pode receber splits

### Timeline Típica
- **Criação**: Instantânea
- **Análise**: 1-3 dias úteis
- **Aprovação**: Automática (se dados corretos)
- **Uso**: Imediato após aprovação

---

## 🎯 RECOMENDAÇÕES

### Para Criar Novas Subcontas

**1. Use Dados Reais e Únicos**
- CPF de pessoa real
- Email ativo e válido
- Celular funcional
- Endereço completo e correto

**2. Verifique Antes de Enviar**
- Valide o CPF online
- Confirme que email está disponível
- Teste o celular
- Verifique o CEP nos Correios

**3. Aguarde Aprovação**
- Não force múltiplas criações
- Aguarde retorno da Asaas
- Responda solicitações de documentos
- Acompanhe pelo painel Asaas

### Para Testar Split

**Use as 4 subcontas existentes:**
- ✅ Já aprovadas
- ✅ WalletIds válidos
- ✅ Split funcionando
- ✅ Prontas para uso

---

## 📊 LIMITAÇÕES DA ASAAS

### Limites por Conta Principal

| Item | Limite | Observação |
|------|--------|------------|
| **Subcontas** | Sem limite oficial | Depende do plano |
| **CPF/Celular por dia** | 5-10 tentativas | Proteção anti-fraude |
| **Análise** | 1-3 dias úteis | Pode variar |
| **Documentação** | Pode solicitar | Identidade, comprovante |

### Proteções Anti-Fraude
- Celular não pode ser reutilizado em muitas contas
- CPF só pode ser usado uma vez
- Email deve ser único
- Dados devem ser consistentes

---

## ✅ SOLUÇÃO PARA TESTES

### Use as Subcontas Existentes

**Para testar split 20/80:**
1. **Escolha** uma das 4 subcontas aprovadas
2. **Crie** uma cobrança via sistema
3. **Pague** e veja o split acontecer
4. **Não precisa** criar novas subcontas

### Para Produção

**Crie subcontas apenas quando:**
- Tiver dados reais de pessoas reais
- For usar de verdade (não teste)
- Precisar de mais de 4 subcontas
- Tiver CPFs únicos disponíveis

---

## 📞 SUPORTE ASAAS

### Para Dúvidas sobre Subcontas

**Contato:**
- 📞 Telefone: (16) 3347-8031
- 📧 Email: contato@asaas.com
- ⏰ Horário: Seg-Sex, 8h-18h

**Perguntas comuns:**
- "Quantas subcontas posso criar?"
- "Como acelerar aprovação de subconta?"
- "Posso usar CPF de terceiros?"
- "Como remover subconta?"

---

## 🎯 CONCLUSÃO

### ✅ O Que Funciona
- Endpoint de criação de subcontas **ATIVO**
- **4 subcontas** já aprovadas e funcionando
- Split 20/80 **operacional** em todas
- API validando dados corretamente

### ⚠️ Limitações
- **Dados devem ser únicos** (CPF, email, celular)
- **CPF deve ser válido** (dígitos verificadores)
- **Análise leva 1-3 dias** úteis
- **Proteção anti-fraude** ativa

### 💡 Recomendação
**Use as 4 subcontas existentes** para testes e produção inicial. Crie novas apenas quando necessário e com dados reais.

---

## 📄 DOCUMENTAÇÃO

### Arquivos Relacionados
- ✅ `TESTE_SPLIT_TODAS_SUBCONTAS.md` - Testes de split
- ✅ `TESTE_COMPLETO_FUNCIONALIDADES.md` - Testes gerais
- ✅ `CRIACAO_SUBCONTAS_STATUS.md` - Este documento

### Links
- **Dashboard**: https://admin.corretoracorporate.com.br
- **Painel Asaas**: https://www.asaas.com
- **Docs**: https://docs.asaas.com/reference/criar-conta

---

**Última atualização**: 06/03/2026 18:00  
**Status**: ✅ Endpoint funcionando  
**Subcontas ativas**: 4  
**Recomendação**: Usar subcontas existentes para testes
