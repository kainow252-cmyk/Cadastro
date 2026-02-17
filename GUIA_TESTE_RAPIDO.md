# 🧪 Guia de Teste Rápido - Sistema Auto-Cadastro PIX v5.0

## 🎯 Objetivo

Testar o fluxo completo:
1. ✅ Login no painel
2. ✅ Gerar link de auto-cadastro
3. ✅ Simular cliente acessando o link
4. ✅ Verificar criação de assinatura
5. ✅ Confirmar split 80/20

---

## 📝 PASSO 1: Login no Painel

### URL de Acesso
```
https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
```

### Credenciais
```
Usuário: admin
Senha: admin123
```

### ✅ Checkpoint
- [ ] Login bem-sucedido
- [ ] Painel de subcontas carregado
- [ ] Lista de subcontas visível

---

## 📝 PASSO 2: Gerar Link de Auto-Cadastro

### Ações
1. **Encontre uma subconta** na lista (qualquer uma que tenha Wallet ID)
2. **Localize os 4 botões** de ação:
   - 🟢 QR Code Avulso
   - 🟣 Assinatura Mensal
   - 🔵 PIX Automático
   - 🟠 **Link Auto-Cadastro** ← ESTE!

3. **Clique no botão laranja** "Link Auto-Cadastro"

### Formulário
```
┌────────────────────────────────────┐
│ Valor mensal (R$): 50.00          │
│ Descrição: Mensalidade             │
│ [Gerar Link e QR Code]            │
└────────────────────────────────────┘
```

### ✅ Checkpoint
- [ ] Formulário aberto
- [ ] Campos preenchidos
- [ ] Botão clicado

### ✅ Resultado Esperado
Deve aparecer uma caixa verde com:
- ✅ Mensagem "Link de Auto-Cadastro Criado!"
- ✅ Valor mensal: R$ 50,00
- ✅ QR Code grande e visível
- ✅ Link completo (https://...)
- ✅ Botão "Baixar QR Code"
- ✅ Botão para copiar link
- ✅ Data de expiração (30 dias)
- ✅ Instruções de como funciona

### 🔍 Exemplo de Link Gerado
```
https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai/subscription-signup/550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 PASSO 3: Testar como Cliente

### Opção A: Copiar Link
1. Clique no botão de **copiar** ao lado do link
2. Abra nova aba **anônima/privada** do navegador
3. Cole o link e acesse

### Opção B: Baixar QR Code
1. Clique em **"Baixar QR Code"**
2. Use app de leitura de QR Code no celular
3. Acesse a URL

### ✅ Checkpoint - Página do Cliente
Deve abrir página com:
- [ ] Header com valor mensal destacado: **R$ 50,00**
- [ ] Descrição: "Mensalidade"
- [ ] Formulário com 3 campos:
  - Nome Completo
  - E-mail
  - CPF
- [ ] Informações sobre pagamento automático
- [ ] Botão "Confirmar e Gerar PIX"

---

## 📝 PASSO 4: Simular Cadastro do Cliente

### Dados de Teste
```
Nome: João da Silva Teste
Email: joao.teste@email.com
CPF: 12345678900
```

**⚠️ IMPORTANTE:** Use um CPF válido mas que seja de teste!

### Ações
1. Preencher os 3 campos
2. O CPF será formatado automaticamente: `123.456.789-00`
3. Clicar em **"Confirmar e Gerar PIX"**

### ✅ Checkpoint - Processamento
Deve aparecer:
- [ ] Mensagem "Criando assinatura..."
- [ ] Spinner/loading

---

## 📝 PASSO 5: Verificar Tela de Sucesso

### ✅ Resultado Esperado

```
┌─────────────────────────────────────────────────┐
│  ✅ Assinatura Criada!                          │
│  Pague o primeiro PIX para ativar               │
│                                                  │
│  Cliente: João da Silva Teste                   │
│  Valor Mensal: R$ 50,00                        │
│  ID da Assinatura: sub_abc123                   │
│  Próximo Vencimento: 17/03/2026                 │
│                                                  │
│  💰 Split 80/20:                                │
│  • R$ 40,00 (empresa) + R$ 10,00 (corretor)   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │     [QR CODE PIX - Grande e visível]     │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  PIX Copia e Cola:                              │
│  00020126... [payload completo] [Copiar]       │
│                                                  │
│  Como funciona:                                  │
│  1️⃣ Pague este PIX agora (primeira parcela)    │
│  2️⃣ A partir de amanhã: assinatura ativa       │
│  3️⃣ Todo mês: novo PIX gerado automaticamente  │
│  4️⃣ Você receberá notificação por email        │
└─────────────────────────────────────────────────┘
```

### ✅ Checkpoint Final
- [ ] QR Code PIX visível
- [ ] Payload PIX disponível
- [ ] Valor correto: R$ 50,00
- [ ] Split exibido: R$ 40,00 + R$ 10,00
- [ ] ID da assinatura presente
- [ ] Instruções claras

---

## 📝 PASSO 6: Verificar no Banco de Dados

### Comando para verificar link criado
```bash
cd /home/user/webapp && npx wrangler d1 execute corretoracorporate-db --local --command="SELECT * FROM subscription_signup_links ORDER BY created_at DESC LIMIT 1"
```

### ✅ Checkpoint
- [ ] Link encontrado
- [ ] Valor correto: 50.00
- [ ] Descrição: "Mensalidade"
- [ ] Data de expiração: 30 dias no futuro
- [ ] Status ativo: 1

### Comando para verificar conversão
```bash
cd /home/user/webapp && npx wrangler d1 execute corretoracorporate-db --local --command="SELECT * FROM subscription_conversions ORDER BY converted_at DESC LIMIT 1"
```

### ✅ Checkpoint
- [ ] Conversão registrada
- [ ] Nome do cliente: "João da Silva Teste"
- [ ] Email: joao.teste@email.com
- [ ] CPF: 12345678900
- [ ] ID da assinatura preenchido
- [ ] Data de conversão: agora

---

## 🐛 Possíveis Erros e Soluções

### ❌ Erro: "Link não encontrado ou expirado"
**Causa:** Link ID inválido ou expirado  
**Solução:** Gerar novo link no painel

### ❌ Erro: "Erro ao criar cadastro"
**Causa:** Problema com API Asaas ou CPF duplicado  
**Solução:** 
- Verificar logs: `pm2 logs asaas-manager --nostream`
- Usar CPF diferente

### ❌ Erro: "Erro ao criar assinatura"
**Causa:** Wallet ID inválido ou problema na API  
**Solução:**
- Verificar se subconta tem Wallet ID
- Ver logs da API Asaas

### ❌ Erro: hideAllFrames is not defined
**Causa:** Cache do navegador  
**Solução:**
- Limpar cache do navegador (Ctrl+Shift+Delete)
- Forçar reload (Ctrl+F5)
- Abrir em aba anônima

---

## 📊 Checklist Completo

### Backend
- [ ] Servidor rodando na porta 3000
- [ ] Endpoint `/api/pix/subscription-link` funcionando
- [ ] Endpoint `/api/pix/subscription-link/:linkId` funcionando
- [ ] Endpoint `/api/pix/subscription-signup/:linkId` funcionando
- [ ] Página `/subscription-signup/:linkId` carregando

### Frontend - Painel Admin
- [ ] Login funcionando
- [ ] Lista de subcontas carregando
- [ ] Botão "Link Auto-Cadastro" visível
- [ ] Formulário abrindo ao clicar
- [ ] QR Code sendo gerado
- [ ] Link copiável
- [ ] Download de QR Code funcionando

### Frontend - Página Pública
- [ ] Página carregando via link
- [ ] Dados do link sendo carregados
- [ ] Formulário funcionando
- [ ] Validação de CPF funcionando
- [ ] Submissão criando assinatura
- [ ] QR Code PIX aparecendo
- [ ] Split sendo exibido

### Banco de Dados
- [ ] Tabela `subscription_signup_links` criada
- [ ] Tabela `subscription_conversions` criada
- [ ] Links sendo salvos
- [ ] Conversões sendo registradas

### Integração Asaas
- [ ] Cliente sendo criado/encontrado
- [ ] Assinatura sendo criada
- [ ] Split 80/20 aplicado
- [ ] Primeiro pagamento gerado
- [ ] QR Code PIX obtido

---

## 🎯 Teste de Ponta a Ponta (E2E)

### Cenário: Cliente se cadastra e paga

1. **Admin:** Gera link para R$ 50,00
2. **Cliente:** Escaneia QR Code
3. **Cliente:** Preenche dados
4. **Sistema:** Cria assinatura com split 80/20
5. **Cliente:** Visualiza QR Code PIX
6. **Cliente:** Paga primeira parcela (simular)
7. **Sistema:** Registra pagamento
8. **Sistema:** Agendamento mensal ativo

### ✅ Sucesso se:
- Assinatura criada: `status = ACTIVE`
- Split configurado: 20% / 80%
- Próximo vencimento: 1 mês
- Conversão registrada no banco

---

## 📸 Screenshots Esperados

### 1. Painel Admin - Botões
```
[ QR Code Avulso ] [ Assinatura Mensal ] [ PIX Automático ] [ Link Auto-Cadastro ]
     (Verde)             (Roxo)              (Azul)            (Laranja) ← NOVO
```

### 2. Painel Admin - QR Code Gerado
```
✅ Link de Auto-Cadastro Criado!
[QR CODE GRANDE]
Link: https://...
[Copiar] [Baixar]
```

### 3. Página Cliente - Formulário
```
🎯 Assinatura Mensal PIX
💰 R$ 50,00/mês

Nome: ___________
Email: __________
CPF: ____________

[Confirmar e Gerar PIX]
```

### 4. Página Cliente - Sucesso
```
✅ Assinatura Criada!

[QR CODE PIX]

Split 80/20:
R$ 40,00 + R$ 10,00
```

---

## 🚀 Comandos Úteis

### Ver logs do servidor
```bash
pm2 logs asaas-manager --nostream --lines 50
```

### Reiniciar servidor
```bash
cd /home/user/webapp && pm2 restart asaas-manager
```

### Ver links no banco
```bash
cd /home/user/webapp && npx wrangler d1 execute corretoracorporate-db --local --command="SELECT id, value, description, uses_count, active FROM subscription_signup_links"
```

### Ver conversões
```bash
cd /home/user/webapp && npx wrangler d1 execute corretoracorporate-db --local --command="SELECT * FROM subscription_conversions"
```

### Limpar cache do build
```bash
cd /home/user/webapp && rm -rf dist .wrangler && npm run build
```

---

## ✅ Resultado Final Esperado

Após completar todos os passos:

1. ✅ Link gerado com sucesso
2. ✅ QR Code criado
3. ✅ Cliente consegue acessar link
4. ✅ Formulário funciona
5. ✅ Assinatura criada na API Asaas
6. ✅ Split 80/20 aplicado
7. ✅ QR Code PIX gerado
8. ✅ Dados salvos no banco

**Status:** 🟢 Sistema funcionando perfeitamente!

---

## 📞 Suporte

Se algum teste falhar:
1. Verificar logs: `pm2 logs asaas-manager --nostream`
2. Verificar banco: comandos SQL acima
3. Limpar cache do navegador
4. Reiniciar servidor

**Versão:** 5.0  
**Data:** 17/02/2026  
**Status:** ✅ Pronto para teste
