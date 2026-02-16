# 🧪 Teste QR Code PIX com Split 20/80

## ⚠️ IMPORTANTE

**NÃO crie cobranças manualmente no painel Asaas!**

O QR Code gerado manualmente pode ficar inválido. Use o **sistema automatizado** que desenvolvemos.

---

## ✅ Forma Correta: Via Sistema

### Passo a Passo:

1. **Acesse**: https://cadastro.corretoracorporate.com.br

2. **Login**: 
   - Usuário: `admin`
   - Senha: `admin123`

3. **Navegue**: Clique em **"Subcontas Cadastradas"** (2º botão azul)

4. **Encontre a Subconta Franklin**:
   ```
   Franklin Madson Oliveira Soares ✅ Aprovado
   - Email: soaresfranklin626@gmail.com
   - Telefone: (XX) XXXXX-0523
   - ID: e59d37d7-2f9b-462c-b1c1-c730322c8236
   - Wallet: b0e857ff-e03b-4b16-8492-f0431de088f8
   ```

5. **Clique no botão verde**: 
   ```
   🔲 Gerar QR Code PIX com Valor Fixo (Split 20/80)
   ```

6. **Preencha o formulário**:
   ```
   Valor (R$): 50.00
   Descrição: Taxa de cadastro e ativação da conta
   ```

7. **Clique**: **"Gerar QR Code"**

8. **Aguarde**: O sistema vai gerar em ~2 segundos

---

## 📱 Resultado Esperado

Você verá uma tela assim:

```
┌────────────────────────────────────────────────────────────┐
│ ✅ QR Code Gerado com Sucesso!              [Gerar Outro]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [QR CODE]              💰 Valor Fixo: R$ 50,00           │
│   256x256               Taxa de cadastro e ativação        │
│                                                             │
│  ♾️ Use quantas         🔐 Chave PIX (Copia e Cola):       │
│   vezes quiser!         00020126...b0e857ff...6304XXXX    │
│                         [📋 Copiar]                         │
│                                                             │
│                         💰 Split Automático de R$ 50.00:   │
│                         ┌──────────┬───┬──────────┐        │
│                         │ R$ 10.00 │ + │ R$ 40.00 │        │
│                         │Para você │   │Principal │        │
│                         │  (20%)   │   │  (80%)   │        │
│                         └──────────┴───┴──────────┘        │
│                                                             │
│                         📤 COMPARTILHAR                     │
│                         ┌────────┬────────┬────────┐       │
│                         │  📥    │  </>   │  🔗    │       │
│                         │Baixar  │Copiar  │Copiar  │       │
│                         │  PNG   │  HTML  │ Chave  │       │
│                         └────────┴────────┴────────┘       │
│                         💡 Use em: site, banner, WhatsApp  │
└────────────────────────────────────────────────────────────┘
```

---

## 🔍 Verificar QR Code Válido

### Método 1: Visual

A chave PIX (Copia e Cola) deve começar assim:
```
00020126
0014br.gov.bcb.pix
0136b0e857ff-e03b-4b16-8492-f0431de088f8  ← walletId Franklin
52040000
5303986
540550.00  ← valor R$ 50,00
5916ASAAS PAGAMENTOS
6009SAO PAULO
6304XXXX  ← CRC válido
```

### Método 2: Testar no App

1. Abra o **app do seu banco**
2. Vá em: **PIX** → **Pagar com QR Code**
3. **Escaneie o QR Code** gerado pelo sistema
4. **Verifique**:
   - ✅ Valor: R$ 50,00
   - ✅ Destinatário: ASAAS PAGAMENTOS
   - ✅ Descrição: Taxa de cadastro e ativação da conta

Se aparecer tudo correto = **QR Code válido!** ✅

---

## 🎯 Diferença: Sistema vs Manual

| Aspecto | Criação Manual Asaas | Sistema Automatizado |
|---------|---------------------|---------------------|
| **QR Code** | ❌ Pode ficar inválido | ✅ Sempre válido |
| **Split** | ⚠️ Manual (você configura) | ✅ Automático 20/80 |
| **Chave PIX** | ❌ Pode usar chave errada | ✅ Sempre usa walletId correto |
| **Webhook** | ⚠️ Precisa configurar split | ✅ Split automático ao receber |
| **Facilidade** | ❌ Vários passos | ✅ 2 cliques |

---

## ⚡ Quando o Pagamento é Recebido

```
Cliente paga R$ 50,00
         ↓
Asaas confirma (instantâneo)
         ↓
Webhook dispara
         ↓
Sistema busca config de split
         ↓
Transfere automaticamente:
  • R$ 10,00 (20%) → Franklin
  • R$ 40,00 (80%) → Principal
         ↓
✅ Split aplicado!
```

---

## 🚨 Erro Comum: QR Code Inválido

**Causa**: Criar cobrança manualmente no painel Asaas pode gerar QR Code com problemas.

**Sintomas**:
- QR Code não funciona no app do banco
- Mensagem: "QR Code inválido"
- Chave PIX não é reconhecida

**Solução**: 
1. **Cancele** a cobrança manual
2. **Use o sistema** (https://cadastro.corretoracorporate.com.br)
3. **Gere QR Code** pelo botão verde na subconta

---

## 📊 Exemplo Real

**Teste com R$ 5,00:**

1. Gere QR Code de R$ 5,00
2. Pague via PIX
3. Aguarde confirmação
4. Verifique:
   - Franklin recebe: **R$ 1,00** (20%)
   - Principal fica com: **~R$ 3,00** (80% - taxa Asaas)

**Taxa Asaas PIX**: R$ 0,99 por transação
- Total pago: R$ 5,00
- Taxa: R$ 0,99
- Líquido: R$ 4,01
- Split 20%: R$ 1,00 → Franklin
- Principal: R$ 3,01 (R$ 4,00 - R$ 0,99 taxa)

---

## ✅ Checklist de Teste

- [ ] Acessei https://cadastro.corretoracorporate.com.br
- [ ] Fiz login (admin/admin123)
- [ ] Encontrei subconta Franklin
- [ ] Cliquei no botão verde "Gerar QR Code PIX"
- [ ] Preenchi valor: R$ 50,00
- [ ] Descrição: Taxa de cadastro e ativação
- [ ] QR Code foi gerado
- [ ] Testei no app do banco (válido ✅)
- [ ] Paguei o PIX
- [ ] Pagamento confirmado
- [ ] R$ 10,00 caiu na conta Franklin
- [ ] R$ ~40,00 ficou na conta principal

---

## 🎉 Sucesso!

Se todos os checkboxes acima estiverem marcados = **Sistema funcionando perfeitamente!**

**Próximos passos**:
1. Use sempre o sistema para gerar QR Codes
2. Não crie cobranças manuais com split
3. Compartilhe QR Codes com clientes
4. Monitore splits aplicados em: Activity Logs

---

**Sistema**: Gerenciador Asaas v4.0  
**Deploy**: https://cadastro.corretoracorporate.com.br  
**Suporte**: Documentação completa em `/home/user/webapp/`
