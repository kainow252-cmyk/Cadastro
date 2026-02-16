# Comparação dos Tipos de Cobrança PIX - Sistema Corretora Corporate

## 📊 Tabela Comparativa Completa

| Característica | 🟢 QR Code Avulso | 🟣 Assinatura PIX | 🔵 PIX Automático |
|----------------|-------------------|-------------------|-------------------|
| **Botão** | Verde/Azul | Roxo/Rosa | Indigo/Cyan |
| **Icona** | `fa-qrcode` | `fa-calendar-check` | `fa-robot` |
| **Autorização** | Não precisa | Não precisa | **Uma vez** |
| **Pagamento** | Manual (uma vez) | Manual (todo mês) | **Automático** |
| **Recorrência** | ❌ Não | ✅ Sim (mensal) | ✅ Sim (mensal) |
| **Cliente age?** | ✅ Uma vez | ✅ Todo mês | **❌ Após 1ª** |
| **Cadastro** | ❌ Não precisa | ✅ Nome, CPF, Email | ✅ Nome, CPF, Email |
| **Split 20/80** | ✅ Automático | ✅ Automático | ✅ Automático |
| **QR Code** | Fixo (7 dias) | Novo todo mês | **Autorização única** |
| **Notificação** | ❌ Não | ✅ Email/SMS mensal | **✅ Só 1ª vez** |
| **Inadimplência** | Baixa (pagamento único) | Alta (requer ação mensal) | **Baixa (automático)** |
| **Status Asaas** | ✅ Liberado | ✅ Liberado | ⏳ **Aguardando permissão** |

## 🎯 Quando Usar Cada Tipo?

### 🟢 QR Code Avulso
**Use quando:**
- Pagamento único, sem recorrência
- Não precisa de cadastro do cliente
- Cliente quer pagar rapidamente
- Exemplo: taxa de cadastro, consulta única

**Vantagens:**
- ✅ Rápido (sem formulário)
- ✅ Anônimo
- ✅ QR válido por 7 dias

**Desvantagens:**
- ❌ Não recorre
- ❌ Não envia notificações

---

### 🟣 Assinatura PIX (Atual)
**Use quando:**
- Pagamento mensal recorrente
- Cliente prefere PIX ao cartão
- Não quer autorizar débito automático
- Exemplo: mensalidade, plano recorrente

**Vantagens:**
- ✅ Sistema gera cobrança automática
- ✅ Notificação mensal (email/SMS)
- ✅ Histórico consolidado
- ✅ Gestão centralizada

**Desvantagens:**
- ❌ Cliente precisa pagar manualmente todo mês
- ❌ Maior risco de inadimplência
- ❌ Requer intervenção mensal do cliente

---

### 🔵 PIX Automático (Novo - Aguardando Asaas)
**Use quando:**
- Pagamento mensal recorrente
- Cliente quer débito automático
- Reduzir inadimplência
- Automatizar 100% do processo
- Exemplo: assinatura premium, mensalidade

**Vantagens:**
- ✅ **Cliente paga uma vez e autoriza**
- ✅ **Débito automático mensal**
- ✅ **Zero intervenção após 1ª**
- ✅ **Inadimplência mínima**
- ✅ Split 20/80 automático
- ✅ Fluxo de caixa previsível

**Desvantagens:**
- ⏳ **Aguardando permissão Asaas**
- ❌ Cliente precisa ter saldo na conta
- ❌ Autorização pode ser cancelada pelo cliente

## 💰 Exemplos Práticos

### Exemplo 1: Mensalidade R$50,00

#### 🟢 QR Code Avulso
```
Cliente: Não identificado
Ação: Escaneia QR Code
Paga: R$50,00 uma vez
Split: R$10,00 (corretor) + R$40,00 (empresa)
Próximo mês: Precisa gerar novo QR Code
```

#### 🟣 Assinatura PIX
```
Cliente: João Silva (CPF 123.456.789-00)
Ação mês 1: Escaneia QR Code → paga R$50,00
Ação mês 2: Recebe email → escaneia QR → paga R$50,00
Ação mês 3: Recebe email → escaneia QR → paga R$50,00
...
Split: R$10,00 (corretor) + R$40,00 (empresa) todo mês
Próximo mês: Cliente precisa pagar manualmente
```

#### 🔵 PIX Automático (após liberação)
```
Cliente: Maria Santos (CPF 987.654.321-00)
Mês 1: 
  • Escaneia QR de autorização
  • Autoriza débito automático no banco
  • Paga R$50,00 imediatamente
  • Status: ACTIVE

Mês 2: 
  • Banco debita R$50,00 automaticamente
  • Cliente não precisa fazer nada
  • Split aplicado automaticamente

Mês 3-12: 
  • Débito automático todo dia 17
  • Zero intervenção do cliente
  • Inadimplência zero (se tiver saldo)

Split: R$10,00 (corretor) + R$40,00 (empresa) todo mês
Próximo mês: AUTOMÁTICO (cliente não age)
```

## 📈 Recomendações por Cenário

### Cenário A: Empresa quer reduzir inadimplência
**Recomendação**: 🔵 **PIX Automático** (após liberação)
- Débito automático garante pagamento
- Cliente não esquece de pagar
- Fluxo de caixa previsível

### Cenário B: Cliente não quer autorizar débito
**Recomendação**: 🟣 **Assinatura PIX**
- Cliente mantém controle
- Paga manualmente quando quiser
- Recebe notificação mensal

### Cenário C: Pagamento único
**Recomendação**: 🟢 **QR Code Avulso**
- Rápido e prático
- Não precisa cadastro
- Pagamento imediato

## 🚀 Status de Implementação

| Tipo | Backend | Frontend | Banco | Status |
|------|---------|----------|-------|--------|
| 🟢 QR Code Avulso | ✅ | ✅ | ✅ | **✅ ATIVO** |
| 🟣 Assinatura PIX | ✅ | ✅ | ✅ | **✅ ATIVO** |
| 🔵 PIX Automático | ✅ | ✅ | ✅ | **⏳ Aguardando Asaas** |

## 🔐 Como Testar

### Acessar Sistema
- **URL**: https://cadastro.corretoracorporate.com.br
- **Login**: admin / admin123

### Criar Cobrança
1. **QR Avulso**: Botão verde → valor → gerar
2. **Assinatura**: Botão roxo → formulário completo → criar
3. **PIX Automático**: Botão azul → formulário + autorização → criar (após liberação)

## 📝 Próximos Passos

1. ✅ ~~Implementar QR Code Avulso~~ (v4.0 - ATIVO)
2. ✅ ~~Implementar Assinatura PIX~~ (v4.6 - ATIVO)
3. ✅ ~~Implementar PIX Automático~~ (v4.7 - IMPLEMENTADO)
4. ⏳ **Habilitar permissão PIX_AUTOMATIC:WRITE no Asaas**
5. ⏳ Testar fluxo completo PIX Automático
6. ⏳ Deploy em produção
7. ⏳ Documentar para clientes finais

## 🎉 Conclusão

O sistema Corretora Corporate oferece **3 formas de cobrança PIX**, cada uma otimizada para um cenário específico:

- **QR Avulso**: pagamento único rápido
- **Assinatura PIX**: recorrência com controle do cliente
- **PIX Automático**: débito automático (melhor UX, menor inadimplência)

Todas as 3 formas aplicam **split 20/80 automaticamente**, garantindo a distribuição correta dos valores entre corretor e empresa.

**Versão**: 4.7  
**Data**: 16/02/2026  
**Status**: 2 ativos + 1 aguardando Asaas
