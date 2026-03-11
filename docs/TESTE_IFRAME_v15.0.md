# 🧪 Como Testar o Botão Link com Iframe (v15.0)

## 📱 **URL de Teste**

```
https://ae9a8f4f.corretoracorporate.pages.dev
```

## 🚀 **Passos para Testar**

### **1️⃣ Limpar Cache do Navegador (OBRIGATÓRIO!)**

**Android (Chrome):**
1. Abra o Chrome
2. ⋮ (três pontos) → **Configurações**
3. **Privacidade e segurança** → **Limpar dados de navegação**
4. Marque **"Imagens e arquivos em cache"**
5. Período: **"Última hora"**
6. **Limpar dados**
7. **Fechar completamente o Chrome** (arrastar para fora dos apps recentes)
8. **Abrir Chrome novamente**

**iPhone (Safari):**
1. **Ajustes** (⚙️)
2. **Safari**
3. **Limpar Histórico e Dados de Sites**
4. Confirmar
5. **Fechar Safari** (deslizar para cima)
6. **Abrir Safari novamente**

### **2️⃣ Fazer Login**

1. Acesse: https://ae9a8f4f.corretoracorporate.pages.dev
2. Faça login com suas credenciais
3. Aguarde carregar o dashboard

### **3️⃣ Ir para Subcontas**

1. Menu lateral → **Subcontas**
2. Aguarde a lista de subcontas carregar

### **4️⃣ Clicar no Botão "Link"**

1. No topo da página, você verá:
   ```
   📱 Subcontas
   [🔗 Link] [🔄 Atualizar]
   ```

2. Clique no botão **roxo/rosa "Link"**

### **5️⃣ Verificar o Iframe**

**O que deve acontecer:**

1. ✅ **Iframe aparece inline** abaixo dos botões
2. ✅ Mostra "Gerando link..." por 2-3 segundos
3. ✅ Exibe o link gerado
4. ✅ Mostra QR Code
5. ✅ Botões de compartilhamento aparecem:
   - Copiar
   - WhatsApp
   - Email
   - Telegram

**Visual esperado:**

```
┌─────────────────────────────┐
│  Subcontas                  │
│  [Link] [Atualizar]        │
│                             │
│  ┌─────────────────────┐   │  ← Iframe inline
│  │ Link de Cadastro    │   │
│  │                     │   │
│  │ Link: https://...   │   │
│  │ [Copiar]           │   │
│  │                     │   │
│  │ QR Code: [imagem]  │   │
│  │                     │   │
│  │ [WhatsApp] [Email]  │   │
│  └─────────────────────┘   │
│                             │
│  Franklin... ✅            │
│  Saulo... ✅               │
│  Tanar... ✅               │
└─────────────────────────────┘
```

### **6️⃣ Testar Funcionalidades**

- **Copiar link**: Clique em "Copiar" → deve aparecer alerta "✅ Link copiado!"
- **WhatsApp**: Abre WhatsApp com mensagem pré-formatada
- **Email**: Abre cliente de email com assunto e corpo
- **Telegram**: Abre Telegram para compartilhar
- **Fechar**: Botão **X** no canto fecha o iframe

### **7️⃣ Verificar Lista de Subcontas**

- ✅ A lista de subcontas deve continuar visível abaixo do iframe
- ✅ Você pode scroll naturalmente pela página
- ✅ Não perde o contexto da página

## ❌ **O Que NÃO Deve Acontecer**

1. ❌ Modal cobrindo tela inteira
2. ❌ Página travando
3. ❌ Nada acontecer ao clicar
4. ❌ Lista de subcontas desaparecendo

## 🔍 **Se Não Funcionar**

### **Problema: Nada acontece ao clicar**
- **Causa**: Cache antigo
- **Solução**: Limpar cache novamente (passo 1)

### **Problema: Modal aparece em vez de iframe**
- **Causa**: Versão antiga carregada
- **Solução**: Fechar navegador completamente e reabrir

### **Problema: Erro ao gerar link**
- **Causa**: Não autenticado ou API falhou
- **Solução**: 
  1. Fazer logout e login novamente
  2. Verificar conexão com internet
  3. Tentar novamente

### **Problema: Página trava**
- **Causa**: Erro na API
- **Solução**: 
  1. Abrir console do navegador (F12)
  2. Ver mensagens de erro
  3. Enviar screenshot dos logs

## 📋 **O Que Enviar Se Não Funcionar**

1. **Screenshot da tela** após clicar no botão Link
2. **Logs do console** (F12 → aba Console)
3. **Descrição** do que aconteceu:
   - "Nada aconteceu"
   - "Modal apareceu em vez de iframe"
   - "Página travou"
   - "Erro de autenticação"
4. **Confirmação** de que limpou o cache

## ✅ **Checklist de Teste**

- [ ] Limpei o cache do navegador
- [ ] Fechei e reabri o navegador
- [ ] Acessei a URL: https://ae9a8f4f.corretoracorporate.pages.dev
- [ ] Fiz login com sucesso
- [ ] Fui para a seção Subcontas
- [ ] Cliquei no botão "Link" (roxo/rosa)
- [ ] Aguardei 2-3 segundos
- [ ] Verifiquei se o iframe apareceu inline
- [ ] Testei o botão Copiar
- [ ] Testei os botões de compartilhamento
- [ ] Fechei o iframe com o botão X
- [ ] Verifiquei que a lista de subcontas continua visível

---

**Versão:** v15.0  
**URL:** https://ae9a8f4f.corretoracorporate.pages.dev  
**Data:** 08/03/2026  
**Status:** ✅ Deploy concluído

**Aguardo seu teste e feedback!** 🙏
