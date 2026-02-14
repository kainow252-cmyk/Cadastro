# Gerenciador Asaas - Sistema de Contas e Subcontas

## 🎯 Visão Geral

Sistema completo para gerenciamento de contas e subcontas da API Asaas, com geração de links de cadastro personalizados.

**URL de Desenvolvimento**: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai

## ✨ Funcionalidades Implementadas

### 1. Dashboard
- ✅ Visão geral com estatísticas
- ✅ Total de subcontas criadas
- ✅ Contadores de links ativos e cadastros

### 2. Gerenciamento de Subcontas
- ✅ Listar todas as subcontas criadas
- ✅ Visualizar detalhes (ID, email, CPF/CNPJ, Wallet ID)
- ✅ Atualização em tempo real
- ✅ Interface intuitiva com cards

### 3. Criação de Contas
- ✅ Formulário completo para criar subcontas
- ✅ Validação de campos obrigatórios
- ✅ Campos suportados:
  - Nome *
  - Email *
  - CPF/CNPJ *
  - Data de Nascimento
  - Tipo de Empresa (MEI, Limitada, Individual, Associação)
  - Telefone e Celular
  - Endereço completo (CEP, Rua, Número, Complemento, Bairro)
- ✅ Retorno da API Key e Wallet ID após criação

### 4. Gerenciamento de Links de Cadastro
- ✅ Gerar links personalizados por subconta
- ✅ Definir prazo de expiração (7, 15, 30, 60 dias)
- ✅ Copiar link para área de transferência
- ✅ Visualizar data de criação e expiração
- ✅ Listar todos os links criados

## 📡 Endpoints da API

### Subcontas
- `GET /api/accounts` - Listar todas as subcontas
- `POST /api/accounts` - Criar nova subconta
- `GET /api/accounts/:id` - Obter detalhes de uma subconta

### Links de Cadastro
- `POST /api/signup-link` - Gerar link de cadastro
  - Body: `{ accountId: string, expirationDays: number }`

## 🏗️ Arquitetura

### Backend
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers
- **API Externa**: Asaas API (Sandbox)
- **Autenticação**: API Key via variáveis de ambiente

### Frontend
- **Styling**: TailwindCSS (via CDN)
- **Icons**: Font Awesome 6
- **HTTP Client**: Axios
- **UI**: Single Page Application (SPA) com navegação por seções

### Estrutura de Arquivos
```
webapp/
├── src/
│   └── index.tsx          # Backend Hono + HTML da aplicação
├── public/
│   └── static/
│       └── app.js         # JavaScript do frontend
├── .dev.vars              # Variáveis de ambiente (não commitado)
├── ecosystem.config.cjs   # Configuração PM2
├── wrangler.jsonc         # Configuração Cloudflare
└── package.json
```

## 🔐 Configuração

### Variáveis de Ambiente (.dev.vars)
```bash
ASAAS_API_KEY=sua_chave_api_aqui
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

### Instalação
```bash
# Instalar dependências
npm install

# Build
npm run build

# Desenvolvimento local
npm run dev:sandbox

# Ou com PM2
pm2 start ecosystem.config.cjs
```

## 🚀 Deployment

### Cloudflare Pages
```bash
# Build
npm run build

# Deploy
npm run deploy:prod
```

## 📝 Guia de Uso

### 1. Criar uma Subconta
1. Clique em "Nova Conta" no menu
2. Preencha os campos obrigatórios (Nome, Email, CPF/CNPJ)
3. Preencha os dados adicionais opcionais
4. Clique em "Criar Subconta"
5. Copie e guarde a API Key retornada (única vez que será exibida)

### 2. Listar Subcontas
1. Clique em "Subcontas" no menu
2. Visualize todas as contas criadas
3. Use os botões "Link" ou "Ver" para ações específicas

### 3. Gerar Link de Cadastro
1. Clique em "Links" no menu
2. Informe o ID da subconta
3. Escolha o prazo de expiração
4. Clique em "Gerar Link"
5. Use o botão "Copiar" para compartilhar o link

## 🔄 Próximos Passos Recomendados

### Funcionalidades Pendentes
- [ ] Persistência de links em banco de dados (D1 ou KV)
- [ ] Página de cadastro pública usando os links gerados
- [ ] Edição de subcontas existentes
- [ ] Exclusão de subcontas
- [ ] Webhooks para notificações
- [ ] Filtros e busca na lista de subcontas
- [ ] Paginação para grandes quantidades de subcontas
- [ ] Exportação de dados (CSV, Excel)
- [ ] Relatórios e analytics
- [ ] Sistema de permissões/usuários

### Melhorias Técnicas
- [ ] Testes unitários e de integração
- [ ] Cache de requisições
- [ ] Rate limiting
- [ ] Validação de CPF/CNPJ
- [ ] Máscara de inputs (telefone, CPF/CNPJ, CEP)
- [ ] Busca de endereço por CEP (ViaCEP API)
- [ ] Dark mode
- [ ] Responsividade mobile otimizada

## 🛠️ Stack Tecnológica

- **Backend**: Hono v4.11.9
- **Runtime**: Cloudflare Workers
- **Build**: Vite v6.4.1
- **Deploy**: Wrangler v4.4.0
- **Frontend**: TailwindCSS + Axios + Font Awesome
- **Process Manager**: PM2

## 📚 Documentação de Referência

- [Documentação Asaas API](https://docs.asaas.com/reference/comece-por-aqui)
- [Criação de Subcontas](https://docs.asaas.com/docs/criacao-de-subcontas)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## 📊 Status do Projeto

- **Ambiente**: Sandbox (desenvolvimento)
- **Status**: ✅ Funcional
- **Última Atualização**: 14/02/2026
- **Versão**: 1.0.0

## 🔗 URLs Importantes

- **App (Dev)**: https://3000-ic9zz4c3ti5f15rhhsmwu-dfc00ec5.sandbox.novita.ai
- **API Base**: /api
- **Documentação Asaas**: https://docs.asaas.com

## 👥 Suporte

Para dúvidas sobre a API Asaas, consulte a [documentação oficial](https://docs.asaas.com) ou entre em contato com o suporte Asaas.

---

**Nota**: Este projeto está configurado para usar o ambiente Sandbox da API Asaas. Para uso em produção, atualize as credenciais e URLs nas variáveis de ambiente.
