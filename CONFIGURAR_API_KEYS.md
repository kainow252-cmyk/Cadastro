# 🔧 Como Configurar o Gerenciamento de API Keys no Asaas

## ⚠️ Erro Comum

Se você está vendo a mensagem:

```
❌ Para utilizar este recurso é necessário ter uma configuração de whitelist de IPs configurada
```

Isso significa que o **Gerenciamento de Chaves de API de Subcontas** não está habilitado no Asaas.

## 📋 Passo a Passo para Resolver

### 1️⃣ Acessar o Asaas
- Acesse: **https://www.asaas.com**
- Faça login com a **conta principal** (não a subconta)

### 2️⃣ Navegar para Integrações
1. No menu lateral, clique em **"Integrações"**
2. Depois clique em **"Chaves de API"**

### 3️⃣ Habilitar Gerenciamento
1. Procure pela seção **"Gerenciamento de Chaves de API de Subcontas"**
2. Clique no botão **"Habilitar acesso"**
3. Uma janela de confirmação será exibida

### 4️⃣ Configurar Whitelist de IPs (se necessário)
- Se solicitado, adicione os IPs permitidos
- Para sandbox local, você pode adicionar seu IP público
- Para produção, adicione os IPs dos servidores Cloudflare

**Dica**: Você pode encontrar seu IP público em https://whatismyipaddress.com

### 5️⃣ Confirmar Habilitação
- Clique em **"Confirmar"** ou **"Salvar"**
- Aguarde alguns segundos para a configuração ser aplicada

### 6️⃣ Testar no Dashboard
1. Volte para o dashboard do sistema
2. Acesse **Menu → API Keys**
3. Clique em **"Buscar"**
4. As API Keys deverão ser carregadas

## ⏰ Importante: Expiração

**O acesso habilitado expira após 2 horas!**

Você precisará repetir o processo de habilitação sempre que:
- Passar mais de 2 horas desde a última habilitação
- Ver novamente o erro de whitelist

## 🔐 Segurança

### Recomendações de Whitelist

**Ambiente de Desenvolvimento (Sandbox):**
```
- Seu IP público atual
- IPs dos desenvolvedores
```

**Ambiente de Produção:**
```
- IPs dos Workers da Cloudflare
- IPs dos servidores de produção
```

### Obter IPs da Cloudflare

Para produção, você pode adicionar os seguintes ranges de IPs da Cloudflare:
- Consulte: https://www.cloudflare.com/ips/

## 🆘 Troubleshooting

### Erro persiste após habilitar
1. **Aguarde 30-60 segundos** após habilitar
2. **Limpe o cache** do navegador (Ctrl+Shift+Del)
3. **Faça logout e login** novamente no sistema
4. **Verifique o IP** configurado no whitelist

### Erro depois de 2 horas
- Isso é normal! O acesso expira automaticamente
- Basta **habilitar novamente** seguindo os mesmos passos

### Não encontro a opção no Asaas
- Verifique se você está usando a **conta principal** (não subconta)
- Certifique-se de que sua conta tem **permissões de administrador**
- Entre em contato com o suporte do Asaas se não encontrar

## 📞 Suporte

### Documentação Oficial
- https://docs.asaas.com/docs/gerenciamento-de-chaves-de-api-de-subcontas

### Suporte Asaas
- Email: atendimento@asaas.com
- Telefone: (48) 3053-0100
- Chat: Disponível no painel do Asaas

## 🎯 Checklist Rápido

Antes de usar o gerenciamento de API Keys, verifique:

- [ ] Estou logado com a conta principal no Asaas
- [ ] Habilitei "Gerenciamento de Chaves de API de Subcontas"
- [ ] Configurei o whitelist de IPs (se necessário)
- [ ] Aguardei pelo menos 30 segundos após habilitar
- [ ] A habilitação foi feita há menos de 2 horas
- [ ] Testei com o botão "Buscar" no dashboard

## 💡 Dicas

### Automação Futura
Em versões futuras, podemos implementar:
- Renovação automática da habilitação
- Alertas quando estiver próximo de expirar
- Verificação automática de status

### Alternativa
Se você não quer lidar com a expiração de 2 horas:
- Gere as API Keys manualmente via painel do Asaas
- Copie e distribua para as subcontas
- Use o dashboard apenas para visualização

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────┐
│ 1. Acesse asaas.com (conta principal)  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 2. Integrações → Chaves de API         │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 3. Habilitar Gerenciamento (2h)        │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ 4. Dashboard → API Keys → Buscar       │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│ ✅ API Keys carregadas com sucesso!    │
└─────────────────────────────────────────┘
```

---

**Última atualização**: 15/02/2026  
**Versão do documento**: 1.0.0
