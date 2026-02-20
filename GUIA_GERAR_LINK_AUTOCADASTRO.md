# 🎯 Guia: Como Gerar Link de Auto-Cadastro e QR Code

## 📋 Índice
1. [Acesso ao Sistema](#acesso)
2. [Gerar Link de Auto-Cadastro](#gerar-link)
3. [Download do QR Code](#download-qr)
4. [Testar o Link](#testar)
5. [Solução de Problemas](#problemas)

---

## 🔐 1. Acesso ao Sistema <a name="acesso"></a>

### URL de Produção
```
https://corretoracorporate.pages.dev
```

### Credenciais
- **Usuário:** `admin`
- **Senha:** `admin123`

### Passo a Passo
1. Abra o navegador (Chrome, Firefox, Edge)
2. Acesse: https://corretoracorporate.pages.dev
3. Faça login com as credenciais acima
4. Você verá o **Dashboard** com as estatísticas

---

## 🔗 2. Gerar Link de Auto-Cadastro <a name="gerar-link"></a>

### Método 1: Pela Aba "Contas"

1. **Clique na aba "Contas"** no menu superior
2. Você verá a lista de **3 sub-contas Asaas** ativas:
   - Franklin Madson Oliveira Soares
   - Saulo Salvador
   - Tanara Helena Maciel da Silva

3. **Escolha uma conta** e clique no botão **"👁️ Ver Detalhes"**

4. Na seção **"📋 Gerar Links de Auto-Cadastro"**:
   - Digite um **Valor** (ex: 149.90)
   - Digite uma **Descrição** (ex: "Plano Premium Mensal")
   - Clique no botão **"✨ Gerar Link e QR Code"**

5. **Aguarde 3-5 segundos** enquanto:
   - O sistema cria o link
   - Gera o QR Code
   - Conecta com a API Asaas

### O que você verá:

```
✅ Link de Auto-Cadastro Criado!

┌─────────────────────────────────────────┐
│  Valor Mensal: R$ 149.90                │
│  Descrição: Plano Premium Mensal        │
├─────────────────────────────────────────┤
│  [QR CODE AQUI]                         │
│                                          │
│  [📥 Baixar QR Code] [📄 Gerar HTML]   │
├─────────────────────────────────────────┤
│  Link: https://...                      │
│  [📋 Copiar Link]                       │
└─────────────────────────────────────────┘
```

---

## 📥 3. Download do QR Code <a name="download-qr"></a>

### Opção A: Download Direto

1. Após gerar o link, você verá o **QR Code** na tela
2. Clique no botão **"📥 Baixar QR Code"**
3. O arquivo será baixado como: `qrcode-auto-cadastro-{ID}.png`

### Opção B: Gerar HTML Completo

1. Clique no botão **"📄 Gerar HTML"**
2. Uma nova janela abrirá com:
   - Página HTML completa e estilizada
   - QR Code incorporado
   - Instruções para o cliente
   - Botão "Copiar Código HTML"

3. Você pode:
   - Salvar a página HTML (Ctrl+S / ⌘+S)
   - Copiar o código HTML
   - Compartilhar o link direto

### Opção C: Copiar Link Direto

1. Role até a seção **"Link de Auto-Cadastro"**
2. Clique no botão **"📋 Copiar Link"**
3. O link será copiado para sua área de transferência
4. Cole onde desejar (WhatsApp, Email, etc.)

**Exemplo de Link:**
```
https://corretoracorporate.pages.dev/subscription-signup/bbcc3ebb-cefe-4c4f-994c-806cc5074e1a
```

---

## 🧪 4. Testar o Link <a name="testar"></a>

### Como Cliente

1. **Abra o link** em uma nova aba anônima/privada
2. Você verá uma página de **cadastro de assinatura**:

```
┌────────────────────────────────────────┐
│  🎯 Assinatura Mensal                  │
│  Plano Premium Mensal                  │
│  R$ 149,90/mês                         │
├────────────────────────────────────────┤
│  📝 PREENCHA SEUS DADOS:               │
│  Nome Completo: [_________________]    │
│  Email: [_________________________]    │
│  CPF: [___________________________]    │
│  [✅ Continuar e Gerar PIX]           │
└────────────────────────────────────────┘
```

3. **Preencha os dados** de teste:
   - **Nome:** João Silva Santos
   - **Email:** joao.teste@exemplo.com
   - **CPF:** 783.686.313-19 *(CPF válido de teste)*

4. Clique em **"✅ Continuar e Gerar PIX"**

5. O sistema irá:
   - ✅ Validar os dados
   - ✅ Criar a cobrança PIX no Asaas
   - ✅ Gerar QR Code PIX para pagamento
   - ✅ Aplicar split 80/20 automaticamente

6. Você verá o **QR Code PIX** para pagamento:

```
┌────────────────────────────────────────┐
│  ✨ Cobrança PIX Criada!               │
│  Valor: R$ 149,90                      │
│  Vencimento: Hoje                      │
├────────────────────────────────────────┤
│  [QR CODE PIX AQUI]                    │
│  Escaneie para pagar                   │
├────────────────────────────────────────┤
│  Após o pagamento:                     │
│  ✅ Assinatura mensal ativada          │
│  ✅ Split 80/20 aplicado               │
│  ✅ Próxima cobrança automática        │
└────────────────────────────────────────┘
```

### Como Administrador

1. **Volte ao painel admin**
2. Clique na aba **"Contas"**
3. Você verá o **contador de conversões** aumentar
4. Na aba **"Estatísticas"**:
   - Total de cadastros aumentará
   - Taxa de conversão será atualizada

---

## 🔧 5. Solução de Problemas <a name="problemas"></a>

### ❌ Erro: "Cannot read properties of null (reading 'description')"

**Causa:** Você clicou em "Baixar QR Code" antes de gerar o link

**Solução:**
1. Clique novamente em **"✨ Gerar Link e QR Code"**
2. Aguarde o QR Code aparecer na tela
3. Agora clique em **"📥 Baixar QR Code"**

---

### ❌ QR Code não baixa

**Possíveis causas:**
- Bloqueador de pop-ups ativo
- Navegador bloqueou o download

**Solução:**
1. Desative bloqueadores de pop-up temporariamente
2. Tente novamente
3. Se não funcionar:
   - Clique com botão direito no QR Code
   - Selecione "Salvar imagem como..."

---

### ❌ Link não abre a página de cadastro

**Possíveis causas:**
- Link expirado (validade de 30 dias)
- Link foi desativado

**Solução:**
1. Gere um novo link
2. Verifique se o link está ativo na lista
3. Teste novamente

---

### ❌ Erro ao criar cobrança PIX

**Possíveis causas:**
- Token Asaas inválido/expirado
- Sub-conta não aprovada
- CPF inválido

**Solução:**
1. Verifique se a sub-conta está **APPROVED**
2. Use um CPF válido de teste
3. Verifique as variáveis de ambiente:
   - `ASAAS_API_KEY`
   - `ASAAS_API_URL`

---

### 🆘 Console do Navegador (para debug)

Para ver logs detalhados:

1. Pressione **F12** (Chrome/Firefox/Edge)
2. Clique na aba **"Console"**
3. Recarregue a página (**Ctrl+R** / **⌘+R**)
4. Gere o link novamente
5. Veja os logs:

```
✅ DeltaPag Section JS carregado
📤 Enviando requisição: POST /api/pix/subscription-link
📥 Link criado: {...}
✅ QR Code gerado com sucesso
```

Se houver erros, você verá:
```
❌ Erro ao gerar link: {...}
```

---

## 📊 Estatísticas do Sistema

### Dados Atuais (20/02/2026)

- **Sub-contas Asaas:** 3 ativas
- **Links de cadastro:** 28 ativos
- **Cadastros realizados:** 9 conversões
- **Taxa de conversão:** 32.1%
- **Assinaturas DeltaPag:** 208 ativas
- **Status:** 100% operacional ✅

---

## 🎯 Próximos Passos

1. ✅ **Testar o fluxo completo** (gerar link → cadastrar → pagar)
2. ✅ **Compartilhar links** via WhatsApp/Email
3. ✅ **Monitorar conversões** no dashboard
4. ⚠️ **Aplicar migrations D1** (sistema de limpeza)
5. 🔧 **Configurar domínio customizado** (opcional)

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console do navegador** (F12)
2. **Copie os logs de erro**
3. **Entre em contato** com a equipe de suporte

---

**Data:** 20/02/2026  
**Versão:** 1.0.0  
**Status:** ✅ Sistema 100% funcional em produção
