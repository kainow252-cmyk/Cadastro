# 🎨 v15.0 - Botão Link com Iframe Inline

## 🆕 Nova Funcionalidade

**Antes (v14.x):** Botão "Link" abria um **modal separado** que cobria toda a tela.

**Agora (v15.0):** Botão "Link" abre um **iframe inline** na mesma página de Subcontas!

## ✨ Mudanças Visuais

### Antes
```
┌─────────────────────────────┐
│  📱 Subcontas              │
│  [Link] [Atualizar]        │
│                             │
│  Lista de subcontas...      │
└─────────────────────────────┘

(Ao clicar em Link)
↓

┌─────────────────────────────┐
│ ██████████████████████████  │  ← Modal cobrindo tudo
│ █  Link de Cadastro      █  │
│ █  QR Code              █  │
│ ██████████████████████████  │
└─────────────────────────────┘
```

### Agora
```
┌─────────────────────────────┐
│  📱 Subcontas              │
│  [Link] [Atualizar]        │
│                             │
│  ┌───────────────────────┐  │  ← Iframe inline
│  │ 🔗 Link de Cadastro   │  │
│  │ Link: https://...     │  │
│  │ QR Code: [imagem]     │  │
│  │ [Copiar] [WhatsApp]   │  │
│  └───────────────────────┘  │
│                             │
│  Lista de subcontas...      │
└─────────────────────────────┘
```

## 🔧 Mudanças Técnicas

### Novo HTML (src/index.tsx)
Adicionado container do iframe após os filtros, antes da lista:

```html
<div id="link-iframe-container" class="hidden border-t border-gray-200">
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        <div class="flex justify-between items-center mb-3">
            <h3>Link de Cadastro de Subconta</h3>
            <button onclick="closeLinkIframe()">✕</button>
        </div>
        <div id="link-iframe-content">
            <!-- Conteúdo dinâmico aqui -->
        </div>
    </div>
</div>
```

### Novo JavaScript (public/static/app.js)

#### 1. openLinkModal() atualizada
Agora manipula o iframe em vez do modal:

```javascript
window.openLinkModal = async function() {
    // Mostra container do iframe
    container.classList.remove('hidden');
    
    // Scroll até o iframe
    container.scrollIntoView({ behavior: 'smooth' });
    
    // Gera link via API
    const r = await axios.post('/api/signup-link', {...});
    
    // Preenche conteúdo do iframe
    content.innerHTML = `
        <div>Link: ${url}</div>
        <img src="QR_CODE_URL">
        <button onclick="copyLinkFromIframe()">Copiar</button>
        <button onclick="shareWhatsAppIframe()">WhatsApp</button>
    `;
};
```

#### 2. Novas funções auxiliares
```javascript
window.closeLinkIframe()        // Fecha o iframe
window.copyLinkFromIframe()     // Copia link do iframe
window.shareWhatsAppIframe()    // Compartilha via WhatsApp
window.shareEmailIframe()       // Compartilha via Email
window.shareTelegramIframe()    // Compartilha via Telegram
```

## 🎯 Benefícios

| Antes (Modal) | Agora (Iframe) |
|---------------|----------------|
| ❌ Cobre tela inteira | ✅ Inline na página |
| ❌ Perde contexto das subcontas | ✅ Mantém lista visível |
| ❌ Precisa fechar para ver lista | ✅ Scroll natural |
| ❌ Experiência "pesada" | ✅ Experiência fluida |

## 📱 Experiência Mobile

No celular, o iframe aparece:
1. **Direto abaixo dos botões** Link e Atualizar
2. **Antes da lista** de subcontas
3. **Com scroll suave** até ele
4. **Botão X** no canto para fechar

## 🚀 Como Usar

1. Login → Subcontas
2. Clicar botão **"Link"** (roxo/rosa)
3. **Iframe aparece inline** com:
   - Link gerado
   - QR Code
   - Botão Copiar
   - Botões de compartilhamento
4. **Fechar** clicando no X
5. **Lista de subcontas** continua visível abaixo

## 🔍 Como Testar

### URL de Teste (v15.0)
```
https://ef5c0259.corretoracorporate.pages.dev
```

### Passos
1. **Limpar cache** do navegador
2. Acessar URL acima
3. Login → Subcontas
4. Clicar botão **"Link"**
5. Verificar que iframe aparece **na mesma página**
6. Testar botões: Copiar, WhatsApp, Email, Telegram
7. Fechar com botão **X**
8. Verificar que lista de subcontas ainda está visível

## 📊 Comparação de Código

| Versão | Arquivos Alterados | Linhas Adicionadas |
|--------|--------------------|--------------------|
| v14.4 | 2 | 65 |
| **v15.0** | **2** | **159** |

## ✅ Status

- **Versão:** v15.0
- **Deploy:** https://ef5c0259.corretoracorporate.pages.dev
- **Data:** 08/03/2026
- **Status:** ✅ Funcionando
- **Compatibilidade:** Mobile + Desktop

## 🐛 Problemas Conhecidos

Nenhum identificado ainda. Se encontrar algum, reporte!

---

**Desenvolvido em:** 08/03/2026  
**Commit:** 122922a  
**Tipo:** Feature (Interface)
