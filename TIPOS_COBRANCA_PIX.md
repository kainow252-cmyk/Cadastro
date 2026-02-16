# 🔄 Tipos de Cobrança PIX - Sistema Corretora Corporate

## 📊 Comparação entre QR Code Avulso e Assinatura Mensal

### 🟢 QR Code PIX Avulso (Pagamento Único)

**Quando usar:**
- Pagamentos únicos e esporádicos
- Vendas avulsas de produtos/serviços
- Doações
- Pagamentos sem recorrência

**Características:**
- ✅ Pagamento único
- ✅ Gera novo QR Code a cada solicitação
- ✅ Não requer dados do cliente (CPF, email)
- ✅ Valor fixo no QR Code
- ✅ Split 20/80 aplicado automaticamente
- ✅ QR Code válido por 7 dias

**Fluxo:**
1. Corretor clica em "QR Code Avulso (Split 20/80)"
2. Informa valor (ex: R$ 25,00) e descrição
3. Sistema gera QR Code PIX com valor fixo
4. Corretor compartilha QR Code (imagem, link, HTML)
5. Cliente escaneia e paga
6. Split 20/80 aplicado automaticamente
7. **FIM** - não há nova cobrança

**Exemplo:**
```
Valor: R$ 25,00
Descrição: "Venda de produto X"
Split: R$ 5,00 (corretor) + R$ 20,00 (empresa)
Validade: 7 dias
Recorrência: NÃO
```

---

### 🟣 Assinatura Mensal PIX (Pagamento Recorrente)

**Quando usar:**
- Mensalidades recorrentes
- Assinaturas de serviços
- Planos mensais
- Qualquer pagamento que se repete todo mês

**Características:**
- ✅ Pagamento mensal automático
- ✅ Cliente cadastrado no sistema (nome, CPF, email)
- ✅ Gera cobrança automaticamente todo mês
- ✅ Valor fixo mensal
- ✅ Split 20/80 aplicado em todos os pagamentos
- ✅ Cliente recebe notificação mensal com novo QR Code
- ✅ Pode ser cancelada a qualquer momento

**Fluxo:**
1. Corretor clica em "Assinatura Mensal (Split 20/80)"
2. Preenche dados do cliente:
   - Nome completo
   - Email
   - CPF (11 dígitos)
   - Valor mensal (ex: R$ 15,00)
   - Descrição (ex: "Mensalidade Corretora")
3. Sistema cria assinatura no Asaas
4. Primeiro pagamento gerado automaticamente
5. QR Code do primeiro mês exibido
6. Cliente paga o primeiro mês
7. **TODO MÊS** Asaas gera nova cobrança automaticamente
8. Cliente recebe email/notificação com novo QR Code
9. Split 20/80 aplicado em cada pagamento

**Exemplo:**
```
Cliente: Gelci Jose da Silva
CPF: 136.155.747-88
Email: gelci@example.com
Valor mensal: R$ 15,00
Descrição: "Mensalidade Corretora Corporate"
Split mensal: R$ 3,00 (corretor) + R$ 12,00 (empresa)
Próximo vencimento: 17/03/2026
Status: ATIVA
Recorrência: SIM (todo mês automaticamente)
```

---

## 🎯 Qual escolher?

### Use **QR Code Avulso** quando:
- ❌ Não há recorrência
- ❌ Cliente é anônimo
- ❌ Pagamento único
- ✅ Exemplo: venda de produto, doação, serviço pontual

### Use **Assinatura Mensal** quando:
- ✅ Há recorrência mensal
- ✅ Cliente tem cadastro (CPF, email)
- ✅ Pagamento todo mês
- ✅ Exemplo: mensalidade de plano, aluguel, assinatura de serviço

---

## 💰 Split 20/80 (Ambos os Tipos)

Tanto o QR Code Avulso quanto a Assinatura Mensal aplicam o **split 20/80 automaticamente**:

- **20% para o corretor** (subconta Franklin Madson)
- **80% para a empresa** (conta principal Corretora Corporate)

**Exemplo com R$ 15,00:**
- R$ 3,00 → Corretor
- R$ 12,00 → Empresa

**Exemplo com R$ 50,00:**
- R$ 10,00 → Corretor
- R$ 40,00 → Empresa

---

## 📝 Informações Importantes

### Assinatura Mensal:
1. **Geração automática**: Asaas gera nova cobrança todo mês
2. **Notificações**: Cliente recebe email com QR Code do mês
3. **Cancelamento**: Pode ser cancelada a qualquer momento pelo admin
4. **Status**: ACTIVE (ativa), INACTIVE (inativa)
5. **Histórico**: Todos os pagamentos ficam registrados

### QR Code Avulso:
1. **Validade**: 7 dias após geração
2. **Uso único**: Cada QR Code é para um pagamento específico
3. **Compartilhamento**: Pode ser enviado por WhatsApp, email, redes sociais
4. **Download**: Disponível em PNG, HTML, link

---

## 🚀 Como Acessar

1. Acesse: https://cadastro.corretoracorporate.com.br
2. Login: **admin** / Senha: **admin123**
3. Navegue até "Subcontas Cadastradas"
4. Selecione a subconta (ex: Franklin Madson Oliveira Soares)
5. Escolha o tipo de cobrança:
   - **QR Code Avulso** (verde/azul)
   - **Assinatura Mensal** (roxo/rosa)

---

## 📊 Resumo Visual

| Característica | QR Code Avulso | Assinatura Mensal |
|----------------|----------------|-------------------|
| **Recorrência** | ❌ NÃO | ✅ SIM (mensal) |
| **Dados Cliente** | ❌ Não obrigatório | ✅ Obrigatório (CPF, email) |
| **Split 20/80** | ✅ Sim | ✅ Sim |
| **Valor Fixo** | ✅ Sim | ✅ Sim |
| **Validade** | 7 dias | Mensal (automático) |
| **Notificações** | ❌ NÃO | ✅ Email mensal |
| **Cancelamento** | - | ✅ Pode cancelar |
| **Uso** | Pagamento único | Mensalidade |

---

## 🔧 Suporte Técnico

Dúvidas sobre o sistema? Entre em contato com o administrador.

**Versão do sistema:** 4.6  
**Data:** 16/02/2026  
**Deploy:** https://7e451ec6.project-839f9256.pages.dev
