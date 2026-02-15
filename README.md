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

### 4. Página Pública de Cadastro
- ✅ Interface moderna e responsiva para cadastro
- ✅ Formulário completo com validação
- ✅ Máscaras automáticas para CPF, CEP e telefones
- ✅ Design intuitivo com gradient e cards
- ✅ Feedback visual de sucesso/erro
- ✅ Processamento em tempo real
- ✅ Aceite de termos de uso

### 5. Sistema de Autenticação
- ✅ Login com usuário e senha
- ✅ Autenticação via JWT (JSON Web Tokens)
- ✅ Cookies HttpOnly seguros
- ✅ Proteção de todas as rotas administrativas
- ✅ Redirecionamento automático para login
- ✅ Botão de logout no dashboard
- ✅ Sessão válida por 24 horas

### 7. Email de Boas-Vindas Automático
- ✅ Envio automático via Mailersend
- ✅ Template HTML profissional e responsivo
- ✅ Informações da conta criada
- ✅ Instruções de próximos passos
- ✅ Links úteis e contato de suporte
- ✅ Enviado tanto para cadastro público quanto admin

### 8. Sistema de Cobranças PIX com Split de Pagamento
- ✅ Criar cobranças PIX com split automático (20% subconta, 80% conta principal)
- ✅ Interface intuitiva para gerar cobranças
- ✅ Seleção de subconta beneficiária
- ✅ Formulário completo de dados do pagador
- ✅ Configuração de valor, descrição e vencimento
- ✅ Geração automática de QR Code PIX
- ✅ Código PIX Copia e Cola
- ✅ Visualização de status de pagamento
- ✅ Histórico de cobranças recentes
- ✅ Consulta de detalhes da cobrança
- ✅ Máscaras automáticas para CPF/CNPJ e telefone

### 9. Geração e Gerenciamento de API Keys
- ✅ **Geração de API Keys**
  - Gerar API Keys diretamente pela interface (seção PIX)
  - Botão dedicado ao lado do seletor de subcontas
  - Validações e avisos de segurança
  - Exibição única da API Key gerada (não pode ser recuperada depois)
  - API Keys geradas **sem expiração** (tempo indeterminado)
  - Informações detalhadas (ID, data de criação, status)
  - Função de copiar para área de transferência
  
- ✅ **Dashboard de Gerenciamento**
  - Nova seção "API Keys" no menu principal
  - Visualização de todas as API Keys de todas as subcontas
  - Filtro por subconta específica
  - Status visual (ativa/desativada)
  - Botões de ação para cada chave:
    - ✅ Desativar/Ativar API Key
    - ✅ Excluir permanentemente
  - Informações completas de cada chave:
    - Nome da subconta proprietária
    - Email da subconta
    - Status (ativa/inativa)
    - Data de criação
    - Validade (sem expiração)
    - ID da chave
  
- ✅ **API Endpoints**
  - `POST /api/accounts/:id/api-key` - Criar nova API Key
  - `GET /api/accounts/:id/api-keys` - Listar API Keys da subconta
  - `DELETE /api/accounts/:id/api-keys/:keyId` - Excluir API Key

## 📡 Endpoints da API

### Subcontas
- `GET /api/accounts` - Listar todas as subcontas
- `POST /api/accounts` - Criar nova subconta
- `GET /api/accounts/:id` - Obter detalhes de uma subconta

### Links de Cadastro
- `POST /api/signup-link` - Gerar link de cadastro
  - Body: `{ accountId: string, expirationDays: number }`

### Páginas Públicas
- `GET /login` - Página de login do sistema
- `GET /cadastro/:linkId` - Página de cadastro público via link gerado

### Autenticação
- `POST /api/login` - Realizar login
  - Body: `{ username: string, password: string }`
- `POST /api/logout` - Realizar logout
- `GET /api/check-auth` - Verificar status de autenticação

### Gerenciamento de API Keys
- `POST /api/accounts/:id/api-key` - Gerar API Key para subconta
  - Body: `{ "name": "Nome da chave", "expiresAt": "2026-12-31" }`
  - Retorna a API Key (única vez)
- `GET /api/accounts/:id/api-keys` - Listar API Keys de uma subconta
- `DELETE /api/accounts/:id/api-keys/:keyId` - Excluir API Key

### Pagamentos PIX
- `POST /api/payments` - Criar cobrança PIX com split
  - Body: 
    ```json
    {
      "customer": {
        "name": "Nome do Cliente",
        "email": "cliente@email.com",
        "cpfCnpj": "12345678900",
        "phone": "11999999999"
      },
      "value": 100.00,
      "description": "Descrição do pagamento",
      "dueDate": "2026-02-20",
      "subAccountId": "id-da-subconta",
      "subAccountWalletId": "wallet-id-da-subconta"
    }
    ```
- `GET /api/payments/:id` - Consultar status de uma cobrança
- `GET /api/payments` - Listar cobranças com filtros
  - Query params: `status`, `customer`, `dateFrom`, `dateTo`, `offset`, `limit`
- `GET /api/payments/:id/pix-qrcode` - Obter QR Code PIX de uma cobrança

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

## 🔐 Segurança e Configuração

### Variáveis de Ambiente (.dev.vars)
```bash
ASAAS_API_KEY=sua_chave_api_aqui
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao
MAILERSEND_API_KEY=seu_token_mailersend
MAILERSEND_FROM_EMAIL=noreply@seu-dominio.com
MAILERSEND_FROM_NAME=Gerenciador Asaas
```

**IMPORTANTE**: Altere estas credenciais em produção!

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

### 0. Fazer Login no Sistema
1. Acesse a URL do sistema
2. Você será redirecionado para `/login`
3. Use as credenciais padrão:
   - **Usuário**: `admin`
   - **Senha**: `admin123`
4. Clique em "Entrar"
5. Você será redirecionado para o dashboard

**IMPORTANTE**: Em produção, altere estas credenciais nas variáveis de ambiente:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

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

### 4. Gerar API Key para Subconta
1. Acesse a seção "PIX" no menu
2. Selecione a subconta desejada no dropdown
3. Clique no botão 🔑 "Gerar API Key" ao lado do dropdown
4. Aguarde 2-3 segundos (carregamento automático)
5. **IMPORTANTE**: Copie a API Key imediatamente - ela só é exibida uma vez!
6. Guarde a chave em local seguro (.env, gerenciador de senhas)

**Observações:**
- API Keys são geradas **sem expiração** (tempo indeterminado)
- Só podem ser desativadas/excluídas pelo administrador no dashboard
- O gerenciamento de API Keys no Asaas precisa estar habilitado (dura 2h)

### 5. Gerenciar API Keys (Dashboard)
1. Clique em "API Keys" no menu principal
2. **Visualizar todas**: Clique em "Buscar" sem filtro para ver todas as chaves
3. **Filtrar por subconta**: Selecione uma subconta e clique em "Buscar"
4. **Desativar chave**: Clique no botão "Desativar" (amarelo) ao lado da chave
5. **Excluir chave**: Clique no botão "Excluir" (vermelho) para remover permanentemente

**Informações exibidas:**
- Nome e email da subconta proprietária
- Status da chave (ativa/desativada)
- Data de criação
- Validade (sem expiração)
- ID da chave

### 6. Usar o Link de Cadastro Público
1. Compartilhe o link gerado com o cliente/parceiro
2. Eles acessam o link e preenchem o formulário de cadastro
3. Os dados são validados e máscaras aplicadas automaticamente (CPF, CEP, telefones)
4. Após submissão, a conta é criada no Asaas
5. Cliente recebe email de boas-vindas com instruções para definir senha

**Exemplo de link:**
```
https://seu-dominio.com/cadastro/62118294-2d2b-4df7-b4a1-af31fa80e065-1771102043405-8dh2tnxbu
```

## 🔄 Próximos Passos Recomendados

### Funcionalidades Pendentes
- [ ] Persistência de links em banco de dados (D1 ou KV)
- [ ] Validação de expiração de links
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

## 💰 Usando o Sistema de PIX

### Como Funciona o Split de Pagamento

Quando você cria uma cobrança PIX, o sistema automaticamente divide o valor recebido:
- **20%** vai para a subconta selecionada
- **80%** fica com a conta principal (emissor)

**Exemplo**: 
- Cobrança de R$ 100,00
- Subconta recebe: R$ 20,00 (20%)
- Conta principal recebe: R$ 80,00 (80%)

### Dados Necessários

**Para gerar uma cobrança, você precisa:**
1. **Subconta**: Selecione qual subconta receberá os 20%
2. **Cliente**: Nome, email, CPF/CNPJ do pagador
3. **Valor**: Quanto será cobrado
4. **Descrição**: Motivo da cobrança (opcional)
5. **Vencimento**: Data limite para pagamento (opcional)

### Exemplo de Uso Real

**Cenário**: Gelci José da Silva precisa gerar uma cobrança PIX

1. **Login**: Entre com admin/admin123
2. **PIX**: Clique no menu PIX
3. **Subconta**: Selecione "Gelci jose da silva - gelci.jose.grouptrig@gmail.com"
4. **Pagador**:
   - Nome: "João da Silva"
   - Email: "joao@email.com"
   - CPF: "123.456.789-00"
   - Telefone: "(11) 98765-4321"
5. **Cobrança**:
   - Valor: R$ 500,00
   - Descrição: "Pagamento de serviço"
   - Vencimento: 20/02/2026
6. **Gerar**: Clique em "Gerar PIX"

**Resultado**:
- ✅ Cobrança criada
- ✅ QR Code gerado
- ✅ Código Copia e Cola disponível
- ✅ Split configurado: R$ 100 para Gelci, R$ 400 para conta principal
- ✅ Aparece no histórico

### Status de Cobranças

- 🟡 **Pendente**: Aguardando pagamento
- 🟢 **Recebido**: Pagamento confirmado
- 🔴 **Vencido**: Prazo expirado
- ⚪ **Estornado**: Pagamento devolvido

## 🔗 Exemplo Prático Completo

```bash
# Dados da subconta (do exemplo fornecido)
Nome: Gelci jose da silva
Email: gelci.jose.grouptrig@gmail.com
CPF: 11013430794
ID: 62118294-2d2b-4df7-b4a1-af31fa80e065
Wallet: cb64c741-2c86-4466-ad31-7ba58cd698c0

# Criar cobrança PIX via API
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Cliente Teste",
      "email": "cliente@teste.com",
      "cpfCnpj": "12345678900"
    },
    "value": 100.00,
    "description": "Pagamento teste",
    "subAccountId": "62118294-2d2b-4df7-b4a1-af31fa80e065",
    "subAccountWalletId": "cb64c741-2c86-4466-ad31-7ba58cd698c0"
  }'

# Resposta esperada:
{
  "ok": true,
  "data": {
    "id": "pay_abc123",
    "value": 100.00,
    "netValue": 98.50,
    "status": "PENDING",
    "pixQrCode": {
      "qrCodeId": "qr_xyz789",
      "payload": "00020126580014br.gov.bcb.pix...",
      "expirationDate": "2026-02-15T23:59:59"
    },
    "split": [
      {
        "walletId": "cb64c741-2c86-4466-ad31-7ba58cd698c0",
        "percentualValue": 20.00
      }
    ]
  }
}
```

## 🔑 Gerando API Keys para Subcontas

### ⚠️ Configuração Necessária ANTES de Usar

**IMPORTANTE**: Antes de gerar API Keys, você DEVE habilitar o gerenciamento no Asaas:

1. Acesse https://www.asaas.com (conta principal)
2. Vá em **Integrações** → **Chaves de API**
3. Localize **"Gerenciamento de Chaves de API de Subcontas"**
4. Clique em **"Habilitar acesso"**

**Nota**: A habilitação dura **apenas 2 horas** e expira automaticamente por segurança.

### Como Gerar pela Interface

1. **Acesse a seção PIX** no dashboard
2. **Selecione a subconta** no dropdown
3. **Clique no botão azul com ícone de chave** (🔑)
4. **Confirme** a operação
5. **Copie a API Key** exibida (única vez!)
6. **Guarde em local seguro**

### Detalhes Exibidos

- ✅ API Key completa (formato: `$aact_...`)
- ✅ Nome da chave
- ✅ ID único
- ✅ Data de criação
- ✅ Data de expiração (se houver)
- ✅ Status (Ativa/Inativa)
- ✅ Botão de copiar

### Avisos de Segurança

⚠️ **A API Key só é exibida UMA VEZ**  
⚠️ **Não é possível recuperar depois**  
⚠️ **Gere uma nova se perder**

### Para Mais Informações

Consulte o guia completo: [`GUIA_API_KEY.md`](./GUIA_API_KEY.md)

