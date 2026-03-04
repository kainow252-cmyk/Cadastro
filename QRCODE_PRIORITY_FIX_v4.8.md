# ✅ CORREÇÃO CRÍTICA - Prioridade de Busca do QR Code (v4.8)

## 🔴 Problema Identificado
**Erro**: Canvas encontrado mas **vazio** (300x150) - download falhava

**Logs do Console**:
```
📥 downloadQRCodeFromCanvas chamada
📊 currentQRData: null
✅ Canvas encontrado: <canvas id="qrcode-canvas">
📏 Canvas width: 300 height: 150
❌ Canvas está vazio - QR Code ainda não foi renderizado
```

**Causa Raiz**: **Ordem de busca incorreta**
- Função procurava `qrcode-canvas` (modal DeltaPag) **PRIMEIRO**
- Encontrava canvas vazio do modal DeltaPag (que estava oculto/fechado)
- **Nunca chegava** a procurar a `<img>` no `qr-code-container` (modal Link de Cadastro)

### Estrutura de Modais
```
Modal DeltaPag (Links de Pagamento):
  └─ <canvas id="qrcode-canvas"> ← Canvas vazio quando modal fechado

Modal Link de Cadastro (Subcontas):
  └─ <div id="qr-code-container">
     └─ <img src="api.qrserver.com" crossorigin="anonymous"> ← QR Code válido!
```

## ✅ Solução Implementada
**Inverter ordem de busca** para priorizar o modal correto:

### Nova Prioridade de Busca
```javascript
// PRIORIDADE 1: Procurar <img> no qr-code-container PRIMEIRO (modal Link de Cadastro)
const container = document.getElementById('qr-code-container');
if (container) {
    const img = container.querySelector('img');
    if (img && img.complete) {
        // Converter <img> para canvas temporário
        canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        isTemporaryCanvas = true;
    }
}

// PRIORIDADE 2: Procurar <canvas> no qr-code-container (se houver)
if (!canvas && container) {
    canvas = container.querySelector('canvas');
}

// PRIORIDADE 3: Procurar qrcode-canvas (modal DeltaPag) - APENAS como fallback
if (!canvas) {
    canvas = document.getElementById('qrcode-canvas');
}
```

### Por que Funciona Agora?
1. ✅ Procura `qr-code-container` primeiro (modal visível/ativo)
2. ✅ Detecta `<img>` e converte para canvas imediatamente
3. ✅ Ignora `qrcode-canvas` vazio do modal DeltaPag fechado
4. ✅ Fallback para `qrcode-canvas` só se nada for encontrado

## 🧪 Teste
1. Acesse https://admin.corretoracorporate.com.br
2. **Hard refresh** obrigatório: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
3. Login: admin / admin123
4. Navegue: Subcontas → Selecionar subconta → "Link Auto-Cadastro"
5. Verifique QR Code visível no modal
6. Clique no botão roxo **"Baixar QR Code"**

### Logs Esperados Agora (Console F12)
```
📥 downloadQRCodeFromCanvas chamada
📊 currentQRData: null
🖼️ Imagem QR Code encontrada no qr-code-container, convertendo para canvas...
✅ Imagem convertida para canvas: {width: 200, height: 200}
✅ Canvas encontrado: HTMLCanvasElement
📏 Canvas width: 200 height: 200
✅ Canvas tem conteúdo válido
🔗 Link de download criado: {filename: "qrcode-1709567890123.png", hrefLength: 12345}
✅ QR Code download iniciado: qrcode-1709567890123.png
```

### Resultado
- ✅ Detecta `<img>` do modal correto (Link de Cadastro)
- ✅ Converte para canvas temporário (200x200)
- ✅ Exporta PNG com conteúdo válido
- ✅ Arquivo `qrcode-<timestamp>.png` é baixado automaticamente
- ✅ Alert de confirmação aparece

## 🚀 Deploy
- **Preview**: https://1d61bfa8.corretoracorporate.pages.dev
- **Produção**: https://corretoracorporate.pages.dev
- **Custom Domain**: https://admin.corretoracorporate.com.br

## 📝 Arquivos Modificados
- `/home/user/webapp/public/static/deltapag-section.js` → Função `downloadQRCodeFromCanvas()` (invertida ordem de busca)
- `/home/user/webapp/src/index.tsx` → Versão `v=4.8`

## 🎯 Fluxo Corrigido
```
Modal Link de Cadastro aberto
    ↓
Clicar "Baixar QR Code"
    ↓
1️⃣ Buscar qr-code-container (✅ encontrado)
    ↓
2️⃣ Buscar <img> dentro dele (✅ encontrado)
    ↓
3️⃣ Converter <img> para canvas (✅ 200x200)
    ↓
4️⃣ Exportar PNG (✅ sucesso)
    ↓
5️⃣ Download iniciado (✅ arquivo salvo)
```

## ⚠️ Antes vs Depois

### ❌ Antes (v4.7)
```
1. Buscar qrcode-canvas → ✅ Encontrado (mas ERRADO - modal fechado!)
2. Canvas vazio (300x150) → ❌ Falha
3. Nunca chega a buscar qr-code-container
```

### ✅ Depois (v4.8)
```
1. Buscar qr-code-container + <img> → ✅ Encontrado (CORRETO!)
2. Converter para canvas (200x200) → ✅ Sucesso
3. Download funcionando
```

## 🎉 Conclusão
**Download de QR Code agora funciona perfeitamente** detectando o modal correto primeiro!

**IMPORTANTE**: 
- Sempre faça **hard refresh** após o deploy
- Aguarde ~10-15 segundos para CDN do Cloudflare atualizar cache

---

**Versão**: 4.8  
**Data**: 2026-03-03  
**Commit**: a655dc7
