# 📋 Interface com Iframe Embutido - QR Code PIX
**Versão 2.5** | **Data**: 15/02/2026

---

## 📊 Resumo Executivo
Implementada interface com **iframe embutido** na lista de subcontas, permitindo gerar QR Code PIX diretamente dentro do card de cada subconta aprovada.

---

## ✨ Funcionalidades Implementadas

### 1️⃣ **Botão de Abertura do Iframe**
Na lista de subcontas, cada subconta aprovada exibe um botão:
```
┌────────────────────────────────────────────────────────┐
│  [🔍] Gerar QR Code PIX com Valor Fixo (Split 20/80)  │
└────────────────────────────────────────────────────────┘
```
- Cor: **Gradiente verde-azul** (bg-gradient-to-r from-green-500 to-blue-500)
- Largura: **100%** do card
- Ícone: **QR Code** (fas fa-qrcode)

### 2️⃣ **Iframe Embutido Expansível**
Ao clicar no botão, abre um iframe **dentro do próprio card**:

```
┌──────────────────────────────────────────────────────────┐
│ 🔵 QR Code PIX                                      [X] │ ← Header
├──────────────────────────────────────────────────────────┤
│  Formulário:                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Valor (R$)   │ │ Descrição    │ │ Gerar QR     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
├──────────────────────────────────────────────────────────┤
│  Resultado (após gerar):                                 │
│  ┌──────────────┐    ┌─────────────────────────────┐   │
│  │ ░░░░░░░░░░░░ │    │ 💰 Valor Fixo: R$ 10.00     │   │
│  │ ░░QR Code░░  │    │ 📋 Chave PIX (copia e cola) │   │
│  │ ░░░░░░░░░░░░ │    │ 💵 Split 20/80:             │   │
│  └──────────────┘    │   R$ 2.00 + R$ 8.00         │   │
│                      └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 3️⃣ **Funcionalidades do Iframe**
- **Formulário de entrada**:
  - Campo "Valor fixo (R$)" (input number)
  - Campo "Descrição" (input text, valor padrão: "Pagamento via PIX")
  - Botão "Gerar QR Code" (verde)

- **Resultado após geração**:
  - QR Code visual (220x220px)
  - Valor fixo formatado (R$ XX.XX)
  - Chave PIX (copia e cola) com botão de copiar
  - Split automático 20/80 destacado
  - Botão "Gerar Outro" para resetar formulário

- **Controles**:
  - Botão **[X]** no topo direito para fechar
  - Botão principal muda para "Fechar QR Code" quando aberto
  - Fecha automaticamente ao resetar

---

## 🎨 Design e Estilo

### Cores
- **Botão principal**: Gradiente verde-azul (#10b981 → #3b82f6)
- **Header do iframe**: Gradiente verde-azul com texto branco
- **Border do iframe**: Verde (#10b981), 2px
- **Background interno**: Branco (#ffffff) e cinza claro (#f9fafb)

### Responsividade
- Layout **grid** em telas grandes (md:grid-cols-3)
- **Coluna única** em mobile
- Iframe **100% largura** do card pai

---

## 🔧 Funções JavaScript

### `togglePixForm(accountId, walletId)`
Alterna a visibilidade do iframe:
- **Abrir**: Mostra iframe, muda botão para "Fechar", foca no input
- **Fechar**: Esconde iframe, restaura botão original

```javascript
function togglePixForm(accountId, walletId) {
    const frame = document.getElementById(`pix-frame-${accountId}`);
    const btn = document.getElementById(`btn-toggle-${accountId}`);
    
    if (frame.classList.contains('hidden')) {
        frame.classList.remove('hidden');
        btn.innerHTML = '<i class="fas fa-times mr-2"></i>Fechar QR Code';
        // ...
    } else {
        closePixFrame(accountId);
    }
}
```

### `closePixFrame(accountId)`
Fecha o iframe e reseta:
- Remove visibilidade
- Restaura botão original
- Chama `resetPixForm()` para limpar campos

### `generateStaticPix(accountId, walletId)`
Gera o QR Code:
1. Valida valor inserido
2. Chama API `/api/pix/static`
3. Esconde formulário
4. Exibe resultado com QR Code, chave PIX e split

### `resetPixForm(accountId)`
Limpa e reinicia:
- Mostra formulário novamente
- Limpa resultado
- Reseta campos de valor e descrição

---

## 📂 Estrutura de IDs HTML

Para cada subconta (exemplo: ID `abc123...`):
```html
<button id="btn-toggle-abc123">...</button>
<div id="pix-frame-abc123">
    <div id="qr-form-abc123">...</div>
    <div id="pix-static-abc123">...</div>
</div>
<input id="pix-value-abc123">
<input id="pix-desc-abc123">
```

---

## 🔄 Fluxo de Interação

```
1. Usuário vê lista de subcontas
   ↓
2. Clica em "Gerar QR Code PIX" em uma subconta aprovada
   ↓
3. Iframe abre dentro do card
   ↓
4. Preenche valor (ex: R$ 10,00) e descrição
   ↓
5. Clica "Gerar QR Code"
   ↓
6. API gera QR Code com split 20/80
   ↓
7. Exibe QR Code, chave PIX e split calculado
   ↓
8. Opções:
   - Copiar chave PIX
   - Gerar outro QR Code (reseta formulário)
   - Fechar iframe (botão X ou "Fechar QR Code")
```

---

## 📊 Comparação: Antes vs. Depois

| Aspecto | Antes (v2.4) | Depois (v2.5) |
|---------|--------------|---------------|
| **Localização do formulário** | Sempre visível no card | Escondido até clicar no botão |
| **Ocupação de espaço** | Ocupa espaço permanentemente | Expande sob demanda |
| **Interação** | Formulário fixo | Iframe expansível com header |
| **Fechamento** | Não havia botão de fechar | Botão [X] e botão principal toggle |
| **Experiência do usuário** | Poluído, muitos campos visíveis | Limpo, funcionalidade revelada progressivamente |
| **Organização visual** | Cards muito longos | Cards compactos, iframe contextual |

### 🖼️ Visual Comparativo

**ANTES (v2.4)**:
```
┌─────────────────────────┐
│ Gelci Jose da Silva     │
│ ✅ Aprovado             │
│ Email: ...              │
│ CPF: ...                │
│                         │
│ QR Code PIX:            │ ← SEMPRE VISÍVEL
│ [Valor] [Desc] [Gerar]  │ ← OCUPA ESPAÇO
│                         │
└─────────────────────────┘
```

**DEPOIS (v2.5)**:
```
┌─────────────────────────┐
│ Gelci Jose da Silva     │
│ ✅ Aprovado             │
│ Email: ...              │
│ CPF: ...                │
│                         │
│ [Gerar QR Code PIX]     │ ← BOTÃO COMPACTO
└─────────────────────────┘
        ↓ (ao clicar)
┌─────────────────────────┐
│ Gelci Jose da Silva     │
│ ✅ Aprovado             │
│ Email: ...              │
│ CPF: ...                │
│                         │
│ [Fechar QR Code]        │
│ ┌───────────────────┐   │
│ │ 🔵 QR Code PIX [X]│   │ ← IFRAME EXPANDIDO
│ │ [Valor] [Desc]    │   │
│ │ [Gerar QR Code]   │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

---

## 🎯 Benefícios da Nova Interface

### ✅ **Vantagens**
1. **Menor poluição visual**: Cards mais limpos e compactos
2. **Progressão clara**: Usuário avança passo a passo
3. **Contexto preservado**: Iframe abre no próprio card, mantém informações da subconta visíveis
4. **Controle intuitivo**: Botão único faz open/close
5. **Feedback visual**: Botão muda de cor e texto ao abrir/fechar
6. **Responsivo**: Funciona em desktop e mobile

### 🎨 **UX Melhorada**
- **Descobribilidade**: Botão destacado chama atenção
- **Affordance**: Ícone QR Code indica funcionalidade
- **Feedback imediato**: Header colorido e botão [X] claros
- **Reversibilidade**: Fácil fechar e reabrir

---

## 📈 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Versão** | 2.5 |
| **Linhas modificadas** | ~50 linhas |
| **Funções adicionadas** | 2 (togglePixForm, closePixFrame) |
| **Funções modificadas** | 2 (resetPixForm, generateStaticPix) |
| **IDs HTML novos** | 2 por subconta (btn-toggle, pix-frame) |
| **Arquivos alterados** | 2 (app.js, index.tsx) |
| **Tempo de implementação** | ~30 minutos |

---

## 🧪 Testes Realizados

### ✅ Validações
- [x] Botão aparece em subcontas aprovadas
- [x] Botão não aparece em subcontas pendentes
- [x] Iframe abre corretamente ao clicar
- [x] Formulário renderiza com campos corretos
- [x] Geração de QR Code funciona
- [x] Resultado exibe split 20/80 correto
- [x] Botão [X] fecha o iframe
- [x] Botão principal toggle funciona
- [x] Reset limpa campos e resultado
- [x] Foco automático no campo de valor ao abrir

### 🔍 Checklist de Funcionalidades
| Funcionalidade | Status |
|----------------|--------|
| Botão de abertura | ✅ |
| Iframe embutido | ✅ |
| Formulário de entrada | ✅ |
| Geração de QR Code | ✅ |
| Exibição de resultado | ✅ |
| Split 20/80 calculado | ✅ |
| Chave PIX copiável | ✅ |
| Botão fechar (X) | ✅ |
| Toggle open/close | ✅ |
| Reset de formulário | ✅ |
| Responsividade | ✅ |

---

## 🌐 Como Testar

1. **Acesse o dashboard**:
   ```
   https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
   ```

2. **Faça login**:
   - **Usuário**: admin
   - **Senha**: admin123

3. **Navegue para "Subcontas Cadastradas"** (menu lateral)

4. **Encontre uma subconta aprovada** (badge verde ✅)

5. **Clique no botão** "Gerar QR Code PIX com Valor Fixo (Split 20/80)"

6. **Preencha**:
   - Valor: `10` (R$ 10,00)
   - Descrição: `Pagamento via PIX` (padrão)

7. **Clique** "Gerar QR Code"

8. **Verifique**:
   - QR Code aparece (220x220px)
   - Valor exibido: **R$ 10.00**
   - Chave PIX exibida (000201...)
   - Split automático:
     - **R$ 2.00** (20% para você)
     - **R$ 8.00** (80% principal)

9. **Teste controles**:
   - Copiar chave PIX (botão azul com ícone de copiar)
   - Gerar outro QR Code (reseta e mostra formulário)
   - Fechar iframe (botão X ou "Fechar QR Code")

---

## 🚀 Próximos Passos Sugeridos

1. **Animações**:
   - Adicionar transição suave ao abrir/fechar iframe (CSS transition)
   - Fade-in ao exibir resultado do QR Code

2. **Validações avançadas**:
   - Limites de valor (min: R$ 1,00, max: R$ 10.000,00)
   - Validar formato de descrição (máx. 100 caracteres)

3. **Funcionalidades extras**:
   - Botão "Baixar QR Code" (PNG)
   - Botão "Compartilhar" (WhatsApp, Email)
   - Histórico de QR Codes gerados

4. **Acessibilidade**:
   - Adicionar ARIA labels (aria-label, aria-expanded)
   - Navegação por teclado (Tab, Enter, Esc)
   - Screen reader support

---

## 📝 Commits Relacionados

```bash
git log --oneline --grep="iframe" -5
```

**Commits importantes**:
- `80b72f3` - Adicionar busca e filtros de subcontas
- `d18387f` - Corrigir erro "Cannot read properties of null"
- `beb7b98` - Ajustar loadAccounts para nova estrutura API
- `195a973` - Melhorar visibilidade do campo de pesquisa
- **[NOVO]** - Implementar interface com iframe embutido (v2.5)

---

## ⚠️ IMPORTANTE: Cache do Navegador

Para ver as mudanças, **SEMPRE limpe o cache**:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- **Alternativa**: Abrir aba anônima / modo privado
- **DevTools**: Network → Desabilitar cache + Hard reload

**Verificar versão carregada**:
```javascript
// No console do navegador:
console.log(document.querySelector('script[src*="app.js"]').src);
// Deve mostrar: /static/app.js?v=2.5
```

---

## 🏁 Conclusão

✅ **Interface com iframe embutido implementada com sucesso!**

A nova interface proporciona:
- Melhor organização visual
- Interação mais intuitiva
- Experiência de usuário aprimorada
- Código modular e reutilizável

**Status**: 🟢 **100% Funcional** | **Pronto para Uso**

---

**Desenvolvido em**: 15/02/2026  
**Versão**: 2.5  
**Dashboard**: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
