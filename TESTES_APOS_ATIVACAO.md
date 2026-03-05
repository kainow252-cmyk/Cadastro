# ✅ Lista de Testes Após Ativação do PIX Automático

Execute estes testes **APÓS** o suporte Asaas ativar a permissão.

---

## 🧪 Teste 1: Validar Permissão da API (5 min)

### Comando:
```bash
cd /home/user/webapp
./test-pix-automatico-sandbox.sh
```

### Resultado Esperado:
```
✅ Autenticação OK!
✅ Chaves PIX OK!
✅ Cliente criado com sucesso!
✅ SUCESSO! Autorização PIX Automático criada!

🔐 Autorização ID: auth_abc123...
📱 PIX Copia e Cola: 00020126580014br.gov.bcb.pix...
```

### Se Falhar:
- ❌ Ainda retorna `insufficient_permission`
- **Ação**: Aguardar mais ou contatar suporte novamente

---

## 🧪 Teste 2: Criar Link no Admin (10 min)

### Passos:

1. **Acesse o Admin**
   ```
   https://corretoracorporate.pages.dev/admin
   ```

2. **Navegue para Auto-Cadastro**
   - Dashboard → Menu → "Links de Auto-Cadastro"

3. **Criar Novo Link**
   - Clique em "Criar Novo Link"
   - Preencha:
     - Descrição: `Teste PIX Automático Produção`
     - Valor: `50.00`
     - Tipo: **Assinatura Mensal** (importante!)
     - Validade: 7 dias
     - Limite de usos: 10
   - Clique em "Criar Link"

4. **Copiar URL**
   - Copie o link gerado (ex: `https://corretoracorporate.pages.dev/subscription-signup/abc123...`)

### Resultado Esperado:
- ✅ Link criado com sucesso
- ✅ QR Code exibido no card
- ✅ Status "Ativo"

---

## 🧪 Teste 3: Testar no Frontend (10 min)

### Passos:

1. **Abrir Link em Aba Anônima**
   - Use o link copiado no teste anterior
   - Abra em modo anônimo (Ctrl+Shift+N)

2. **Preencher Formulário**
   - Nome: `João Silva Teste`
   - Email: `joao.teste@pixauto.com`
   - CPF: `111.444.777-35` (CPF válido de teste)
   - Data de Nascimento: `15/05/1990`

3. **Clicar em "Confirmar e Gerar PIX"**

4. **Verificar Resultado**

### Resultado Esperado:

#### ✅ Tela de Sucesso:
- 🔐 Título: **"Autorização PIX Automático"** (não "Pagamento PIX")
- 🟣 Alerta roxo: **"PIX Automático Ativado!"**
- 📱 QR Code exibido
- 💬 Mensagem: "Após o pagamento, débitos mensais serão automáticos"
- 📋 Botão "Copiar Pix Copia e Cola" funcionando

#### ✅ Console do Navegador (F12):
```javascript
✅ Dados recebidos: {customerName, customerEmail, ...}
✅ Criando autorização PIX Automático...
✅ Autorização criada: {id: "auth_xyz", status: "PENDING_AUTHORIZATION"}
📱 QR Code gerado com sucesso
```

### Se Falhar:
- ❌ Retorna erro com contato do suporte
- **Ação**: Verificar se permissão foi realmente ativada (voltar ao Teste 1)

---

## 🧪 Teste 4: Validar no Banco de Dados (5 min)

### Comando:
```bash
cd /home/user/webapp
npx wrangler d1 execute corretoracorporate-db --remote \
  --command="SELECT * FROM pix_authorizations ORDER BY created_at DESC LIMIT 5"
```

### Resultado Esperado:
```
┌──────────────┬────────────┬───────────┬──────────────┬──────────┬─────────┐
│ id           │ status     │ frequency │ value        │ payload  │ ...     │
├──────────────┼────────────┼───────────┼──────────────┼──────────┼─────────┤
│ auth_xyz123  │ PENDING... │ MONTHLY   │ 50.00        │ 000201...│ ...     │
└──────────────┴────────────┴───────────┴──────────────┴──────────┴─────────┘
```

### Campos Importantes:
- ✅ `authorization_id`: ID da autorização Asaas
- ✅ `status`: `PENDING_AUTHORIZATION`
- ✅ `frequency`: `MONTHLY`
- ✅ `value`: valor correto
- ✅ `payload`: QR Code PIX
- ✅ `customer_name`, `customer_email`, `customer_cpf`: dados corretos

---

## 🧪 Teste 5: Verificar no Asaas (5 min)

### Passos:

1. **Acessar Asaas Sandbox**
   ```
   https://sandbox.asaas.com
   ```

2. **Navegar para PIX Automático**
   - Menu → PIX → PIX Automático
   - Ou: Menu → Cobranças → PIX Automático

3. **Buscar Autorização**
   - Procure pela autorização criada
   - Status: `PENDING_AUTHORIZATION`

### Resultado Esperado:
- ✅ Autorização aparece na lista
- ✅ Status: Aguardando autorização do cliente
- ✅ Valor e cliente corretos

---

## 🧪 Teste 6: Simular Pagamento (Sandbox) (10 min)

### Passos:

1. **Copiar PIX Copia e Cola**
   - Da tela de sucesso do Teste 3
   - Ou consultar no banco (campo `payload`)

2. **Simular Pagamento no Sandbox**
   - Use ferramenta de teste do Asaas (se disponível)
   - Ou use app de banco em modo sandbox

3. **Aguardar Confirmação**
   - Status deve mudar de `PENDING_AUTHORIZATION` para `AUTHORIZED`

### Resultado Esperado:
- ✅ Pagamento confirmado
- ✅ Status atualizado para `AUTHORIZED`
- ✅ Débitos mensais agendados no Asaas

**Nota:** No ambiente de produção, o cliente usaria o app do banco real.

---

## 🧪 Teste 7: Verificar Logs (5 min)

### Comando:
```bash
cd /home/user/webapp
npx wrangler pages deployment tail --project-name corretoracorporate
```

### Resultado Esperado:
```
[INFO] 📥 Dados recebidos: {customerName: "João Silva Teste", ...}
[INFO] 👤 Customer criado: cus_abc123
[INFO] 🔄 Criando autorização PIX Automático...
[INFO] ✅ Autorização criada com sucesso: auth_xyz789
[INFO] 💾 Autorização registrada no banco
```

### Se Houver Erros:
- Verificar stack trace completo
- Conferir se API Key está correta
- Validar estrutura do payload

---

## 📊 Checklist Final de Validação

Marque cada item conforme testa:

### Infraestrutura
- [ ] ✅ Teste 1: API retorna sucesso (não mais `insufficient_permission`)
- [ ] ✅ Teste 7: Logs sem erros

### Sistema Web
- [ ] ✅ Teste 2: Link de assinatura criado no admin
- [ ] ✅ Teste 3: Frontend exibe "PIX Automático Ativado!"
- [ ] ✅ Teste 3: QR Code gerado e exibido
- [ ] ✅ Teste 3: Botão "Copiar" funciona

### Banco de Dados
- [ ] ✅ Teste 4: Registro criado em `pix_authorizations`
- [ ] ✅ Teste 4: Todos os campos preenchidos corretamente

### Asaas
- [ ] ✅ Teste 5: Autorização aparece no painel Asaas
- [ ] ✅ Teste 6: Pagamento simulado com sucesso (sandbox)

---

## 🎉 Após Todos os Testes

### Se Todos os Testes Passaram ✅

1. **Deploy em Produção**
   ```bash
   cd /home/user/webapp
   npm run deploy:prod
   ```

2. **Configurar API Key de Produção**
   - Trocar de sandbox para produção
   - Configurar chave PIX na conta de produção

3. **Testar Novamente** (repetir testes acima em produção)

4. **🚀 Sistema Pronto para Uso!**

### Se Algum Teste Falhou ❌

1. **Registrar Falha**
   - Anotar qual teste falhou
   - Capturar logs de erro
   - Screenshot da tela (se aplicável)

2. **Contatar Suporte**
   - Enviar detalhes da falha
   - Mencionar qual teste específico falhou

3. **Aguardar Resolução**
   - Suporte Asaas investigará
   - Repetir teste após correção

---

## 📞 Contatos de Emergência

**Se encontrar problemas durante os testes:**

### Asaas
- WhatsApp: (16) 3347-8031
- Email: atendimento@asaas.com

### Documentação
- `ATIVAR_PIX_AUTOMATICO.md` - Guia completo
- `RESUMO_PIX_AUTOMATICO.md` - Status visual
- `GUIA_RAPIDO_PIX_AUTO.md` - Guia de 1 página

---

**Tempo Total Estimado:** 50-60 minutos  
**Pré-requisito:** Suporte Asaas ter ativado a permissão  
**Última atualização:** 05/03/2026
