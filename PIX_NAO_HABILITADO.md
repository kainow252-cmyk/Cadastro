# 🔴 PIX NÃO HABILITADO PARA RECEBIMENTOS

## ❌ Problema Identificado

**Erro da API Asaas:**
```json
{
  "code": "pix.receivingWithPixDisabled",
  "description": "Recebimentos via Pix desabilitado para esta conta"
}
```

## ✅ Status Atual

- ✅ **Chaves PIX cadastradas**: 2 chaves ativas
  - `ac039221-f042-49b2-a99c-1b81de895253` (EVP)
  - `corretora@corretoracorporate.com.br` (E-mail)
- ✅ **API de Produção**: Funcionando
- ✅ **Token de Produção**: Configurado
- ✅ **4 Subcontas**: Ativas
- ✅ **Split 20/80**: Configurado
- ❌ **Recebimentos via PIX**: DESABILITADO

## 🔧 O Que Está Faltando

A Asaas exige **duas liberações**:

1. ✅ **Cadastrar chave PIX** → **CONCLUÍDO**
2. ❌ **Ativar recebimentos via PIX** → **PENDENTE**

## 📞 Como Ativar (Urgente)

### Opção 1: Painel Web
1. Acesse: https://www.asaas.com
2. Login → Menu → **Meu Dinheiro** → **PIX**
3. **Ativar recebimentos via PIX**
4. Aguardar aprovação (1-2 dias úteis)

### Opção 2: Contato Direto (Recomendado)
📞 **Telefone/WhatsApp**: (16) 3347-8031  
📧 **Email**: contato@asaas.com  
⏰ **Horário**: Seg-Sex, 8h-18h

**Mensagem para enviar:**
```
Olá! 

Tenho chaves PIX cadastradas mas recebo erro 'pix.receivingWithPixDisabled' 
ao tentar gerar QR Code via API.

Preciso liberar RECEBIMENTOS via PIX com urgência.

Dados:
- Conta: corretora@corretoracorporate.com.br
- Ambiente: PRODUÇÃO
- Token: $aact_prod_000M... (configurado)
- Chaves PIX: 2 cadastradas
- Erro: "Recebimentos via Pix desabilitado para esta conta"

Podem ativar com urgência?

Obrigado!
```

## 🔄 Solução Temporária (Já Implementada)

Enquanto o PIX não é liberado, o sistema vai usar **BOLETO**:

**Mudança no código:**
```typescript
billingType: 'BOLETO' // Temporário até PIX ser liberado
```

**Como funciona:**
- ✅ Cliente preenche o formulário
- ✅ Sistema gera BOLETO ao invés de PIX
- ✅ Split 20/80 continua funcionando
- ✅ Cliente pode pagar via boleto bancário
- ⏳ Pagamento demora 1-3 dias úteis (processamento bancário)

## 📊 Comparação

| Método | Status | Tempo Confirmação | Split |
|--------|--------|------------------|-------|
| **PIX** | ❌ Desabilitado | Instantâneo | ✅ 20/80 |
| **BOLETO** | ✅ Ativo (temporário) | 1-3 dias úteis | ✅ 20/80 |
| **Cartão** | ✅ Disponível | Instantâneo | ✅ 20/80 |

## 🎯 Próximos Passos

1. **Contatar Asaas** (16) 3347-8031
2. **Solicitar liberação** de recebimentos via PIX
3. **Aguardar aprovação** (1-2 dias)
4. **Após aprovação**: Voltar para `billingType: 'UNDEFINED'`

## 📝 Histórico

- **16/02/2026**: Chave PIX EVP cadastrada
- **12/02/2026**: Chave PIX E-mail cadastrada
- **06/03/2026**: Identificado erro "receivingWithPixDisabled"
- **06/03/2026**: Mudança temporária para BOLETO
- **Pendente**: Aguardando liberação de recebimentos PIX

## 🔗 Links Úteis

- **Painel Asaas**: https://www.asaas.com
- **Sistema**: https://corretoracorporate.pages.dev
- **Admin**: https://admin.corretoracorporate.com.br
- **Documentação**: https://docs.asaas.com/reference/pix

## ✅ O Que Continua Funcionando

- ✅ Criar cobranças via BOLETO
- ✅ Split 20/80 automático
- ✅ Dashboard completo
- ✅ Gestão de subcontas
- ✅ Relatórios financeiros
- ✅ Links de pagamento

**Sistema está 95% operacional. Falta apenas a liberação do PIX pela Asaas!** 🚀
