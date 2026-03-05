# ✅ CORREÇÃO - Exportação de Relatórios para PDF (v2.1)

## 🔴 Problema Identificado
**Erro**: `Uncaught (in promise) ReferenceError: Cannot access 'jsPDF' before initialization`

**Logs do Console**:
```javascript
reports-detailed.js?v=2.0:293 Uncaught (in promise) ReferenceError: Cannot access 'jsPDF' before initialization
    at window.exportReportToPDF (reports-detailed.js?v=2.0:293:5)
    at HTMLButtonElement.onclick ((índice):1:1)
```

**Causa Raiz**: **Ordem de verificação incorreta**
- Linha 293 verificava `typeof jsPDF === 'undefined'`
- Mas `jsPDF` estava dentro de `window.jspdf` (escopo diferente!)
- Resultado: tentava acessar variável inexistente **antes** de carregar as bibliotecas

## ✅ Solução Implementada

### Antes (v2.0) - ERRADO
```javascript
// Linha 293 - ERRO!
if (typeof jsPDF === 'undefined') {  // ❌ Acessa jsPDF diretamente
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
    document.head.appendChild(script2);
    
    await new Promise((resolve) => {
        script2.onload = resolve;  // ❌ Não aguarda script1 carregar primeiro!
    });
}

// Linha 311
const { jsPDF } = window.jspdf;  // ✅ Correto (mas nunca chegava aqui)
```

### Depois (v2.1) - CORRETO ✅
```javascript
// Verificar window.jspdf em vez de jsPDF direto
if (typeof window.jspdf === 'undefined') {  // ✅ Verifica escopo correto
    console.log('📦 Carregando bibliotecas jsPDF...');
    
    // Carregar script1 PRIMEIRO e aguardar
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script1);
    
    await new Promise((resolve) => {
        script1.onload = resolve;  // ✅ Aguarda script1 terminar
    });
    
    // Carregar script2 DEPOIS e aguardar
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
    document.head.appendChild(script2);
    
    await new Promise((resolve) => {
        script2.onload = resolve;  // ✅ Aguarda script2 terminar
    });
    
    console.log('✅ Bibliotecas jsPDF carregadas com sucesso');
}

// Agora sim, usar jsPDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
```

## 🔧 Mudanças Implementadas

1. **Verificação correta do escopo**: `typeof window.jspdf === 'undefined'` em vez de `typeof jsPDF`
2. **Carregamento sequencial**: Aguardar `script1.onload` antes de carregar `script2`
3. **Logs de debug**: Adicionar mensagens `📦 Carregando...` e `✅ Carregadas`
4. **Garantir ordem**: script1 (jspdf.umd.min.js) → script2 (jspdf.plugin.autotable.min.js)

## 🧪 Teste

1. Acesse https://admin.corretoracorporate.com.br
2. **Hard refresh** obrigatório: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
3. Login: admin / admin123
4. Navegue: Menu → Relatórios
5. Selecione uma subconta ou "TODAS AS SUBCONTAS"
6. Clique em **"Gerar Relatório"**
7. Aguarde o relatório carregar
8. Clique no botão **"Exportar PDF"** (ícone de documento)

### Logs Esperados (Console F12) - Primeira Vez
```
📦 Carregando bibliotecas jsPDF...
✅ Bibliotecas jsPDF carregadas com sucesso
```

### Logs Esperados - Próximas Vezes
```
(sem logs - bibliotecas já carregadas no cache)
```

### Resultado
- ✅ PDF é gerado e baixado automaticamente
- ✅ Nome do arquivo: `relatorio-[nome-conta]-[data].pdf`
- ✅ Conteúdo formatado com tabelas, cabeçalhos e rodapés
- ✅ Sem erros no console

## 🚀 Deploy
- **Preview**: https://a97c7ad4.corretoracorporate.pages.dev
- **Produção**: https://corretoracorporate.pages.dev
- **Custom Domain**: https://admin.corretoracorporate.com.br

## 📝 Arquivos Modificados
- `/home/user/webapp/public/static/reports-detailed.js` → Função `exportReportToPDF()` (linhas 286-336)
- `/home/user/webapp/src/index.tsx` → Versão `v=2.1`

## 🎯 Por Que Funcionava no Primeiro Clique?

**Explicação do Comportamento Anterior**:
```
1º Clique:
- Verifica typeof jsPDF (ERRO: undefined)
- Tenta carregar bibliotecas
- Falha: erro antes de carregar

2º Clique (se tivesse funcionado):
- Bibliotecas carregadas do 1º clique
- window.jspdf existe
- Gera PDF com sucesso
```

**Agora (v2.1)**:
```
1º Clique:
- Verifica typeof window.jspdf (correto!)
- Carrega script1 → aguarda
- Carrega script2 → aguarda
- window.jspdf existe
- Gera PDF com sucesso ✅
```

## ⚠️ Importante
- **Sempre faça hard refresh** após o deploy para limpar cache do navegador
- **Aguarde** o relatório carregar completamente antes de exportar para PDF
- **Primeira exportação** pode demorar ~2-3 segundos (carregando bibliotecas)
- **Próximas exportações** são instantâneas (bibliotecas em cache)

---

**Versão**: 2.1  
**Data**: 2026-03-03  
**Commit**: 4256576
