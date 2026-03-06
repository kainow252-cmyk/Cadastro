# ⚠️ PIX AUTOMÁTICO NÃO HABILITADO

## 🔍 Problema Identificado

**Erro 403 ao tentar criar assinatura mensal:**
```json
{
  "error": "PIX Automático não está habilitado nesta conta",
  "code": "insufficient_permission",
  "description": "A chave de API fornecida não possui permissão para realizar operações de saque via API."
}
```

## 📊 Situação Atual

### ✅ O Que Está Funcionando
- 💰 **Cobranças PIX únicas** → ✅ 100% funcionando
- 💳 **Cartão de crédito** → ✅ Funcionando
- 🧾 **Boleto** → ✅ Funcionando
- 👥 **4 Subcontas** → ✅ Ativas
- 📊 **Split 20/80** → ✅ Funcionando

### ❌ O Que NÃO Está Funcionando
- 🔄 **Assinaturas mensais via PIX Automático** → ❌ Precisa ativação Asaas
- 🔄 **Débito automático** → ❌ Precisa ativação Asaas

## 🎯 Diferença Entre os Tipos

### 1. Cobrança PIX Única (✅ FUNCIONANDO)
**Link Type**: `"chargeType": "single"`

**Como funciona:**
1. Cliente preenche formulário
2. Sistema gera **QR Code PIX**
3. Cliente paga **UMA VEZ**
4. Split 20/80 aplicado
5. ✅ Pronto!

**Exemplo:**
- Valor: R$ 10,00
- Cliente escaneia QR Code
- Paga R$ 10,00 UMA VEZ
- Subconta recebe R$ 2,00
- Principal recebe R$ 8,00

### 2. Assinatura Mensal PIX (❌ NÃO FUNCIONANDO)
**Link Type**: `"chargeType": "monthly"`

**Como deveria funcionar:**
1. Cliente autoriza débito automático
2. Sistema cobra **TODO MÊS**
3. Cliente não precisa pagar manualmente
4. Split 20/80 aplicado todo mês

**Por que não funciona:**
- Requer **PIX Automático (Jornada 3)**
- API precisa de **permissão especial** da Asaas
- Precisa contatar suporte Asaas

## 📞 Como Habilitar PIX Automático

### Contato Asaas
📞 **WhatsApp**: (16) 3347-8031  
📧 **Email**: atendimento@asaas.com  
⏰ **Horário**: Seg-Sex, 8h-18h

### Mensagem Sugerida
```
Assunto: Ativar PIX Automático (Jornada 3) - API

Olá equipe Asaas!

Preciso ativar o PIX AUTOMÁTICO (Jornada 3) na minha conta.

DADOS:
- Nome: CORRETORA CORPORATE
- Email: corretora@corretoracorporate.com.br
- CNPJ: 63300111000133
- Ambiente: PRODUÇÃO

ERRO ATUAL:
Ao tentar criar autorizações via endpoint /pix/automatic/authorizations, 
recebo o erro "insufficient_permission".

PRECISO:
Ativar permissão para usar PIX Automático via API.

ENDPOINT NECESSÁRIO:
POST /v3/pix/automatic/authorizations

USO:
Sistema de assinaturas com cobranças mensais automáticas via PIX.

Podem ativar essa funcionalidade?

Obrigado!
```

## 🔄 Solução Temporária

### Usar Cobranças PIX Únicas

**Em vez de:**
- Assinatura mensal automática

**Use:**
- Gerar novo QR Code todo mês
- Cliente paga manualmente
- Mesma funcionalidade de split 20/80

### Como Criar Link de Cobrança Única

**No Admin Dashboard:**
1. Acesse **"Links de Pagamento"**
2. Clique em **"Criar Novo Link"**
3. **Tipo**: Selecione **"Cobrança Única"** (não "Assinatura Mensal")
4. **Valor**: R$ 10,00 (ou qualquer valor)
5. **Descrição**: "Sorteio"
6. **Subconta**: Escolha Franklin, Saulo, Tanara ou Roberto
7. Clique em **"Criar Link"**
8. **Compartilhe o link** com o cliente

### Fluxo do Cliente
1. Acessa o link
2. Preenche: Nome, Email, CPF
3. Clica em "Gerar PIX"
4. **QR Code aparece instantaneamente** ✅
5. Paga com celular
6. Split 20/80 aplicado automaticamente

## 📊 Comparação

| Recurso | PIX Único | PIX Automático |
|---------|-----------|----------------|
| **Status** | ✅ Funcionando | ❌ Precisa ativação |
| **Pagamento** | Manual (cliente escaneia) | Automático (débito mensal) |
| **QR Code** | ✅ Gera imediatamente | ⏳ Após autorização |
| **Split 20/80** | ✅ Sim | ✅ Sim (quando ativo) |
| **Permissão API** | ✅ Já habilitado | ❌ Precisa solicitar |
| **Contato Asaas** | Não necessário | **Obrigatório** |

## ✅ Teste Imediato

### Criar um Link de Cobrança Única

**Você pode testar AGORA:**

1. **Acesse**: https://admin.corretoracorporate.com.br
2. **Login** com suas credenciais
3. **Navegue**: "Links de Pagamento" → "Criar Novo"
4. **Preencha**:
   - Tipo: **Cobrança Única**
   - Valor: R$ 10,00
   - Descrição: Teste PIX Único
   - Subconta: Saulo Salvador
5. **Crie e compartilhe** o link
6. **Teste**: Preencha o formulário
7. **Resultado**: QR Code PIX aparece instantaneamente! ✅

## 🎯 Status do Sistema

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| **Cobranças PIX Únicas** | ✅ 100% | QR Code instantâneo |
| **Assinaturas Mensais** | ❌ 0% | Precisa ativar Jornada 3 |
| **Cartão** | ✅ 100% | Funcionando |
| **Boleto** | ✅ 100% | Funcionando |
| **Split 20/80** | ✅ 100% | Funcionando |
| **4 Subcontas** | ✅ 100% | Ativas |

## 📝 Documentação

### Links Úteis
- **Docs PIX Automático**: https://docs.asaas.com/docs/pix-automatico
- **Sistema**: https://admin.corretoracorporate.com.br
- **Suporte Asaas**: (16) 3347-8031

### Arquivos do Projeto
- `PIX_LIBERADO_SUCESSO.md` - PIX único funcionando
- `TESTE_COMPLETO_FUNCIONALIDADES.md` - Todos os testes
- `PIX_AUTOMATICO_PENDENTE.md` - Este documento

## 🚀 Próximos Passos

### Imediato (Hoje)
1. ✅ Usar **cobranças PIX únicas**
2. ✅ Gerar QR Codes instantâneos
3. ✅ Split 20/80 funcionando

### Curto Prazo (1-2 dias)
1. 📞 Ligar para Asaas: (16) 3347-8031
2. ⏳ Solicitar ativação PIX Automático (Jornada 3)
3. ⏳ Aguardar aprovação

### Após Ativação
1. ✅ Criar assinaturas mensais
2. ✅ Débito automático funcionando
3. ✅ Sistema 100% completo

## 🎉 Conclusão

**Sistema está 95% operacional!**

**✅ FUNCIONANDO AGORA:**
- Cobranças PIX únicas
- QR Code instantâneo
- Split 20/80 automático
- Cartão e Boleto

**⏳ AGUARDANDO ASAAS:**
- PIX Automático (assinaturas mensais)

**Use cobranças únicas enquanto aguarda a ativação!** 🚀

---

**Última atualização**: 06/03/2026 17:30  
**Status**: ✅ 95% Operacional  
**Ação pendente**: Contatar Asaas para ativar PIX Automático
