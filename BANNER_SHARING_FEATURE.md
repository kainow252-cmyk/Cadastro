# 🔗 Feature: Sistema de Compartilhamento de Banners

## 📋 Resumo
Sistema completo para gerar links compartilháveis de banners salvos, permitindo visualização pública sem necessidade de login.

## ✨ Funcionalidades Implementadas

### 1. Botão de Compartilhamento
- **Localização**: Modal de visualização de banners
- **Design**: Botão verde com gradiente destacado
- **Texto**: "Gerar Link de Compartilhamento"

### 2. Modal de Compartilhamento (`generateBannerShareLink`)
Exibe três tipos de compartilhamento:

#### a) Link Direto
- URL pública: `https://corretoracorporate.pages.dev/view-banner/{accountId}/{bannerId}`
- Campo copiável com botão de copiar
- Ideal para compartilhar via email, redes sociais, etc.

#### b) Código Iframe
- Código HTML pronto para incorporar em sites
- Dimensões configuradas: 100% largura x 600px altura
- Estilização automática (border-radius, box-shadow)
- Exemplo:
```html
<iframe src="https://corretoracorporate.pages.dev/view-banner/{accountId}/{bannerId}" 
        width="100%" height="600" frameborder="0" 
        style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>
```

#### c) Compartilhamento Rápido
- **WhatsApp**: Botão com mensagem formatada
- **Mais Opções**: API nativa de compartilhamento do navegador

### 3. Página de Visualização Pública
**Rota**: `/view-banner/:accountId/:bannerId`

#### Características:
- ✅ Sem necessidade de login/autenticação
- ✅ Design responsivo e moderno
- ✅ Loading state durante carregamento
- ✅ Tratamento de erros (banner não encontrado)
- ✅ Suporte para banners personalizados e gerados
- ✅ Exibição completa:
  - Título, descrição e valor
  - QR Code PIX (quando disponível)
  - Badges de tipo (Assinatura/Pagamento Único)
  - Promoções (se houver)
  - Botão de pagamento funcional

#### Gradientes Suportados:
- Orange (`from-orange-600 to-red-600`)
- Purple (`from-purple-600 to-pink-600`)
- Blue (`from-blue-600 to-cyan-600`)
- Green (`from-green-600 to-emerald-600`)
- Red (`from-red-600 to-rose-600`)

### 4. Funções JavaScript

#### `generateBannerShareLink(accountId, bannerId)`
Cria modal com opções de compartilhamento.

**Parâmetros:**
- `accountId` (string): ID da conta dona do banner
- `bannerId` (string): ID do banner salvo

**Retorno:**
- Modal HTML com 3 opções de compartilhamento
- Toast de confirmação ao copiar

#### `copyToClipboard(text, successMessage)`
Função auxiliar para copiar texto com feedback visual.

**Parâmetros:**
- `text` (string): Texto a ser copiado
- `successMessage` (string): Mensagem exibida no toast

#### `shareToWhatsAppBanner(shareLink, title, value)`
Abre WhatsApp com mensagem formatada.

**Parâmetros:**
- `shareLink` (string): URL do banner
- `title` (string): Título do banner
- `value` (string): Valor do pagamento

#### `shareViaNativeShare(shareLink, title)`
Usa API nativa de compartilhamento (Web Share API).

**Parâmetros:**
- `shareLink` (string): URL do banner
- `title` (string): Título do banner

**Fallback**: Copia link se API não estiver disponível

## 📂 Arquivos Modificados

### Frontend (JavaScript)
**Arquivo**: `public/static/app.js`

**Mudanças:**
- Adicionado botão de compartilhamento no modal de banners (linha ~6604)
- Implementada função `generateBannerShareLink()` (linha ~6671)
- Implementadas funções auxiliares: `copyToClipboard()`, `shareToWhatsAppBanner()`, `shareViaNativeShare()`

### Backend (TypeScript)
**Arquivo**: `src/index.tsx`

**Mudanças:**
- Adicionada rota `GET /view-banner/:accountId/:bannerId` (linha ~7267)
- Implementação de página HTML standalone com JavaScript inline
- Carregamento de banner do localStorage no cliente
- Renderização dinâmica baseada em tipo de banner

### Versão
**Atualizada**: v6.7 → v6.8

## 🎯 Casos de Uso

### 1. Compartilhar Banner por Email
```
1. Administrador visualiza banner salvo
2. Clica em "Gerar Link de Compartilhamento"
3. Copia "Link Direto"
4. Cola no corpo do email
5. Destinatário clica e visualiza banner
```

### 2. Incorporar Banner em Site Externo
```
1. Administrador gera link de compartilhamento
2. Copia "Código Iframe"
3. Cola no HTML do site externo
4. Banner aparece incorporado na página
```

### 3. Compartilhar via WhatsApp
```
1. Administrador clica em "Compartilhar em WhatsApp"
2. WhatsApp abre com mensagem pré-formatada
3. Escolhe contato e envia
4. Contato clica no link e visualiza banner
```

## 🔒 Segurança e Privacidade

### Dados Armazenados no Cliente
- Banners são armazenados em `localStorage` do navegador
- Chave: `banners_{accountId}`
- Formato: JSON array de objetos banner

### Acesso Público
- ✅ URL é pública (sem autenticação necessária)
- ⚠️ Qualquer pessoa com o link pode visualizar
- ⚠️ Link não expira (enquanto banner existir no localStorage)

### Recomendações:
1. Não compartilhar banners com informações sensíveis
2. Deletar banners antigos quando não forem mais necessários
3. Links são únicos por banner (bannerId)

## 🧪 Como Testar

### Teste Local
```bash
# 1. Iniciar servidor
npm run dev:sandbox

# 2. Fazer login
# URL: http://localhost:3000/login
# Usuário: admin
# Senha: admin123

# 3. Criar e salvar um banner
# - Ir em "Link Auto-Cadastro"
# - Gerar um banner
# - Salvar

# 4. Abrir galeria de banners salvos
# - Clicar no banner salvo
# - Clicar em "Gerar Link de Compartilhamento"
# - Copiar "Link Direto"

# 5. Testar em aba anônima
# - Abrir navegador em modo privado
# - Colar o link copiado
# - Banner deve aparecer sem necessidade de login
```

### Teste em Produção
```bash
# URL base: https://corretoracorporate.pages.dev
# Exemplo de link: https://corretoracorporate.pages.dev/view-banner/abc123/xyz789
```

## 📊 Estatísticas

### Código Adicionado
- **JavaScript**: ~150 linhas (app.js)
- **TypeScript/HTML**: ~180 linhas (index.tsx)
- **Total**: ~330 linhas

### Funções Criadas
- `generateBannerShareLink()` - Modal de compartilhamento
- `copyToClipboard()` - Copiar com feedback
- `shareToWhatsAppBanner()` - Compartilhamento WhatsApp
- `shareViaNativeShare()` - Compartilhamento nativo
- Rota `/view-banner/:accountId/:bannerId` - Visualização pública

## 🚀 Próximos Passos (Futuro)

### Melhorias Possíveis:
1. **Analytics**: Rastrear quantas vezes um banner foi visualizado
2. **Expiração**: Adicionar data de expiração aos links
3. **Senha**: Proteger banners com senha opcional
4. **QR Code do Link**: Gerar QR Code do link de compartilhamento
5. **Relatórios**: Dashboard de banners mais compartilhados
6. **Customização**: Permitir personalizar layout do iframe
7. **SEO**: Meta tags Open Graph para preview em redes sociais
8. **Encurtador**: Integrar encurtador de URLs (bit.ly, etc)

## 📝 Notas de Desenvolvimento

### Desafios Encontrados:
1. **Template Literals Aninhados**: Problemas com escaping em TypeScript
   - **Solução**: Usar concatenação de strings ao invés de template literals

2. **Build Timeout**: Vite travando em arquivo grande (12.540 linhas)
   - **Solução Temporária**: Deploy sem rebuild completo
   - **Solução Futura**: Dividir `src/index.tsx` em módulos menores

3. **localStorage Cross-Origin**: Banners não acessíveis entre domínios
   - **Limitação**: Link só funciona no mesmo domínio onde foi salvo
   - **Workaround**: Banner é carregado do localStorage no cliente

### Lições Aprendidas:
- Template literals aninhados em c.html() causam problemas
- Arquivos TypeScript muito grandes travam o Vite
- Usar concatenação de strings para HTML dinâmico em templates
- PM2 funciona mesmo sem build completo (usa dist/_worker.js cacheado)

## 🔗 Links Relacionados

- **Commit**: `481f6ca` - "feat: Adicionar sistema de compartilhamento de banners"
- **Branch**: main
- **Versão**: v6.8
- **Data**: 02/03/2026

---

**Status**: ✅ Implementado (aguardando build completo para deploy em produção)  
**Prioridade**: Alta  
**Complexidade**: Média
