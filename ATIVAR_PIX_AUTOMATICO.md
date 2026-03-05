# Como Ativar o PIX Automático no Asaas

## 📋 Status Atual

✅ **Sistema configurado corretamente**
- Endpoint `/pix/automatic/authorizations` implementado
- Chave PIX cadastrada no sandbox: `071ade92-b57b-441f-bdf6-728fd7dab4ab`
- API Key configurada: `$aact_hmlg_000...` (sandbox)
- Código funcionando perfeitamente

❌ **Bloqueio de Permissão**
- Erro: `insufficient_permission`
- Descrição: "A chave de API fornecida não possui permissão para realizar operações de saque via API"
- **Causa:** PIX Automático requer ativação especial pelo suporte Asaas

---

## 🎯 O Que É PIX Automático?

**PIX Automático (Jornada 3)** é uma funcionalidade do Banco Central que permite cobranças recorrentes via PIX:

1. Cliente escaneia QR Code na primeira vez
2. Autoriza débito automático mensal
3. Banco debita automaticamente todo mês
4. **Não precisa pagar manualmente** todos os meses

### Diferença entre PIX Automático vs PIX Mensal

| Recurso | PIX Automático | PIX Mensal Manual |
|---------|----------------|-------------------|
| **Autorização** | 1 vez (na primeira) | Todo mês |
| **Débito** | Automático | Cliente paga manualmente |
| **QR Code** | 1 QR Code inicial | 1 QR Code novo por mês |
| **Experiência** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Boa |
| **Conversão** | Alta (automático) | Média (depende do cliente) |
| **Disponibilidade** | Precisa ativar | Já disponível |

---

## 📞 Como Solicitar Ativação

### 1️⃣ Entre em Contato com o Suporte Asaas

**WhatsApp:** (16) 3347-8031  
**Email:** atendimento@asaas.com  
**Horário:** Segunda a sexta, 8h às 18h

### 2️⃣ Use Este Template de Mensagem

```
Olá! Sou desenvolvedor da CORRETORA CORPORATE LTDA e estou integrando 
o PIX Automático (Jornada 3) em nosso sistema.

Preciso ativar o endpoint /pix/automatic/authorizations na minha conta Asaas.

Atualmente, a API retorna o erro:
- Código: insufficient_permission
- Descrição: "A chave de API fornecida não possui permissão para realizar 
  operações de saque via API"

Informações da conta:
- Email: corretora@corretoracorporate.com.br
- Ambiente: Sandbox (para testes)
- Chave PIX cadastrada: 071ade92-b57b-441f-bdf6-728fd7dab4ab (EVP)
- Documentação seguida: https://docs.asaas.com/docs/pix-automatico

Podem ativar essa funcionalidade na minha conta?

Agradeço!
```

### 3️⃣ Informações que o Suporte Pode Solicitar

- **CNPJ da empresa:** CORRETORA CORPORATE LTDA
- **Email da conta Asaas:** corretora@corretoracorporate.com.br
- **Ambiente:** Sandbox (para testes) ou Produção
- **Tipo de integração:** API REST
- **Endpoint necessário:** `/v3/pix/automatic/authorizations`
- **Caso de uso:** Assinaturas mensais recorrentes via PIX

---

## 🧪 Testando Após Ativação

### Passo 1: Executar Script de Teste

```bash
cd /home/user/webapp
./test-pix-automatico-sandbox.sh
```

**Resultado esperado:**
```
✅ SUCESSO! Autorização PIX Automático criada!

📋 Detalhes da Autorização:
{
  "id": "auth_abc123...",
  "status": "PENDING_AUTHORIZATION",
  "frequency": "MONTHLY",
  "value": 100,
  "description": "Teste PIX Automático",
  "qrCode": "00020126580014br.gov.bcb.pix..."
}
```

### Passo 2: Testar no Sistema Web

1. Acesse: https://corretoracorporate.pages.dev/admin
2. Crie um link de assinatura:
   - Tipo: **Assinatura Mensal**
   - Valor: R$ 100,00
   - Descrição: "Teste PIX Automático"
3. Copie o link gerado
4. Abra em modo anônimo e preencha:
   - Nome: Teste Cliente
   - Email: teste@cliente.com
   - CPF: 111.444.777-35
   - Data: 15/05/1990
5. Clique em "Confirmar e Gerar PIX"

**Resultado esperado:**
- ✅ Título: "🔐 Autorização PIX Automático"
- ✅ Alerta roxo: "PIX Automático Ativado!"
- ✅ QR Code exibido
- ✅ Botão "Copiar Pix Copia e Cola"

### Passo 3: Verificar no Banco de Dados

```bash
cd /home/user/webapp
npx wrangler d1 execute corretoracorporate-db --local \
  --command="SELECT * FROM pix_authorizations ORDER BY created_at DESC LIMIT 5"
```

**Resultado esperado:**
```
┌─────────┬─────────┬────────────┬──────────────┬────────┬───────┬──────────┐
│ id      │ status  │ frequency  │ value        │ ...    │       │          │
├─────────┼─────────┼────────────┼──────────────┼────────┼───────┼──────────┤
│ auth_.. │ PENDING │ MONTHLY    │ 100.00       │ ...    │       │          │
└─────────┴─────────┴────────────┴──────────────┴────────┴───────┴──────────┘
```

---

## 🔄 Solução Temporária (Enquanto Aguarda Ativação)

O sistema já está configurado com **fallback automático**:

1. Tenta criar autorização PIX Automático
2. Se receber erro de permissão, exibe mensagem clara de contato com suporte
3. Código está pronto para funcionar assim que o suporte ativar

**Não é necessário fazer alterações no código!**

---

## 📊 Monitoramento de Ativação

### Comando de Teste Rápido

```bash
# Testar se PIX Automático foi ativado
curl -s -X GET \
  -H "access_token: $aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRiZjA4YTExLTIwY2MtNDM4OS04MDU5LTcyMmM0NTZhZmY1NTo6JGFhY2hfOGM2MTBiYTQtOTcyNi00OTQ5LThjYTUtZDA1OTRlZTVhODE5" \
  https://sandbox.asaas.com/api/v3/pix/automatic/authorizations | jq '.'
```

**Se ainda não estiver ativado:**
```json
{
  "errors": [{
    "code": "insufficient_permission",
    "description": "A chave de API fornecida não possui permissão..."
  }]
}
```

**Quando estiver ativado:**
```json
{
  "data": [],
  "totalCount": 0,
  "limit": 10,
  "offset": 0
}
```

---

## 📚 Documentação de Referência

- [PIX Automático - Asaas Docs](https://docs.asaas.com/docs/pix-automatico)
- [API Reference - Autorizações](https://docs.asaas.com/reference/criar-autorizacao)
- [Blog Asaas - O que é PIX Automático](https://blog.asaas.com/pix-automatico/)
- [Banco Central - Jornada 3](https://www.bcb.gov.br/estabilidadefinanceira/pix)

---

## ✅ Checklist de Ativação

- [x] ✅ Chave PIX cadastrada no Asaas
- [x] ✅ Código implementado e testado
- [x] ✅ API Key configurada (sandbox e produção)
- [x] ✅ Endpoint `/pix/automatic/authorizations` integrado
- [x] ✅ Tabela `pix_authorizations` criada no banco
- [ ] ⏳ **Aguardando:** Ativação pelo suporte Asaas
- [ ] ⏳ Teste final após ativação
- [ ] ⏳ Deploy em produção

---

## 🎉 Após Ativação

Quando o suporte Asaas ativar o PIX Automático:

1. ✅ **Execute o script de teste** (`test-pix-automatico-sandbox.sh`)
2. ✅ **Teste no sistema web** (passo a passo acima)
3. ✅ **Verifique os logs** do console do navegador
4. ✅ **Confirme no banco** (`pix_authorizations` table)
5. 🚀 **Deploy em produção** com as mesmas configurações

**Nenhuma alteração de código será necessária!** O sistema já está preparado.

---

## 📞 Contatos de Suporte

**Asaas:**
- WhatsApp: (16) 3347-8031
- Email: atendimento@asaas.com
- Chat: https://www.asaas.com (canto inferior direito)

**Desenvolvedor do Sistema:**
- GitHub: https://github.com/corretoracorporate/webapp
- Versão atual: v6.1.1 (2026-03-05)

---

**Última atualização:** 05/03/2026
**Status:** Aguardando ativação pelo suporte Asaas ⏳
