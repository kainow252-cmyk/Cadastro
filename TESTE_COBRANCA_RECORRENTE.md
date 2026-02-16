# 🧪 Teste Rápido - Cobrança Recorrente via PIX

## ⏱️ Tempo Estimado: 3 minutos

---

## 📋 Pré-requisitos

- ✅ Sistema deployado: https://cadastro.corretoracorporate.com.br
- ✅ Login: `admin` / `admin123`
- ✅ Link recorrente criado: "cobrança1" (R$ 15,00 mensal via PIX)

---

## 🎯 Teste 1: Ver Pagamentos do Link Recorrente

### Passos:

1. **Abrir navegador (aba anônima)**
   ```
   Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)
   ```

2. **Acessar sistema**
   ```
   https://cadastro.corretoracorporate.com.br
   ```

3. **Fazer login**
   - Usuário: `admin`
   - Senha: `admin123`

4. **Navegar para Links de Pagamento**
   - Clicar no 4º botão azul: **"Links de Pagamento"**

5. **Verificar link "cobrança1"**
   - ✅ Nome: `cobrança1`
   - ✅ Tipo: `Assinatura/Recorrente`
   - ✅ Pagamento: `PIX`
   - ✅ Valor: `R$ 15,00`
   - ✅ Status: `Ativo`

6. **Clicar no botão verde "Pagamentos"**

### Resultado Esperado:

**Cabeçalho:**
```
💰 Pagamentos: cobrança1
[Excel] [PDF] [Voltar]
```

**Cards de Resumo:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ✅ Recebidos │  │ ⏳ Pendentes │  │ ⚠️ Vencidos  │  │ 📊 Total     │
│ 1 pagamento  │  │ 0 pagamentos │  │ 0 pagamentos │  │ 1 pagamento  │
│ R$ 15,00     │  │ R$ 0,00      │  │ R$ 0,00      │  │ R$ 15,00     │
└──────────────┘  └──────────────┘  └──────────────┘  │ R$ 14,01 líq │
                                                       └──────────────┘
```

**Filtros:**
```
┌─────────────────────────────────────────────────────────┐
│ Buscar (Nome/ID): [_______________]                     │
│ Status: [Todos ▼] Data Início: [__/__/____]            │
│ Data Fim: [__/__/____] Mês/Ano: [--------- de ----▼]   │
│ [Limpar Filtros]                                        │
│                                                          │
│ Mostrando 1 de 1 pagamentos                             │
└─────────────────────────────────────────────────────────┘
```

**Tabela:**
```
┌────────────────────────────────┬──────────┬──────────┬────────────┬─────────────┬──────────────┬─────────┐
│ Cliente                        │ Status   │ Valor    │ Valor Líq. │ Criado em   │ Vencimento   │ Ações   │
├────────────────────────────────┼──────────┼──────────┼────────────┼─────────────┼──────────────┼─────────┤
│ GELCI JOSE DA SILVA            │ Recebido │ R$ 15,00 │ R$ 14,01   │ 16/02/2026  │ 31/03/2026   │ 📄 Ver  │
│ gelci.silva252@gmail.com       │          │          │            │             │              │         │
│ ID: pay_hpvc24ms1d1peetr       │          │          │            │             │              │         │
└────────────────────────────────┴──────────┴──────────┴────────────┴─────────────┴──────────────┴─────────┘
```

---

## 🧪 Teste 2: Filtrar por Nome do Cliente

### Passos:

1. **No campo "Buscar (Nome/ID)"**, digitar: `gelci`

2. **Verificar resultado**:
   - ✅ 1 pagamento encontrado
   - ✅ Cliente: GELCI JOSE DA SILVA
   - ✅ Contador: "Mostrando 1 de 1 pagamentos"

3. **Limpar filtro**:
   - Clicar em **"Limpar Filtros"**
   - ✅ Volta a mostrar todos os pagamentos

---

## 🧪 Teste 3: Filtrar por Status

### Passos:

1. **No campo "Status"**, selecionar: `Recebido`

2. **Verificar resultado**:
   - ✅ 1 pagamento (status "Recebido")
   - ✅ Card "Recebidos": 1 pagamento, R$ 15,00

3. **Trocar para "Pendente"**:
   - ✅ Nenhum pagamento (mensagem: "Nenhum pagamento encontrado")
   - ✅ Card "Pendentes": 0 pagamentos, R$ 0,00

---

## 🧪 Teste 4: Exportar Excel

### Passos:

1. **Clicar no botão verde "Excel"**

2. **Verificar download**:
   - ✅ Arquivo baixado: `pagamentos_cobrança1_2026-02-16.xlsx`
   - ✅ Abrir no Excel/LibreOffice

3. **Verificar conteúdo**:
   ```
   | Cliente                 | Email                      | ID Pagamento          | Status   | Valor | Valor Líquido | Data Criação      | Data Vencimento   |
   |-------------------------|----------------------------|------------------------|----------|-------|---------------|-------------------|-------------------|
   | GELCI JOSE DA SILVA     | gelci.silva252@gmail.com   | pay_hpvc24ms1d1peetr  | Recebido | 15    | 14.01         | 16/02/2026 09:38  | 31/03/2026 00:00  |
   ```

---

## 🧪 Teste 5: Exportar PDF

### Passos:

1. **Clicar no botão vermelho "PDF"**

2. **Verificar download**:
   - ✅ Arquivo baixado: `pagamentos_cobrança1_2026-02-16.pdf`
   - ✅ Abrir no Adobe Reader/Chrome

3. **Verificar conteúdo**:
   ```
   Relatório de Pagamentos
   Link: cobrança1
   Data: 16/02/2026
   
   ┌─────────────────────┬──────────┬──────────┬─────────────┐
   │ Cliente             │ Status   │ Valor    │ Data        │
   ├─────────────────────┼──────────┼──────────┼─────────────┤
   │ GELCI JOSE DA SILVA │ Recebido │ R$ 15,00 │ 16/02/2026  │
   └─────────────────────┴──────────┴──────────┴─────────────┘
   
   Total: 1 pagamento(s)
   Valor Total: R$ 15,00
   Valor Líquido: R$ 14,01
   ```

---

## ✅ Checklist de Validação

Marque cada item testado:

### Interface
- [ ] Login realizado com sucesso
- [ ] Dashboard exibido corretamente
- [ ] Botão "Links de Pagamento" funciona
- [ ] Link "cobrança1" aparece na lista
- [ ] Botão "Pagamentos" funciona

### Dados
- [ ] Nome do cliente aparece: "GELCI JOSE DA SILVA"
- [ ] Email do cliente aparece: "gelci.silva252@gmail.com"
- [ ] ID do pagamento aparece: "pay_hpvc24ms1d1peetr"
- [ ] Valor correto: R$ 15,00
- [ ] Valor líquido correto: R$ 14,01
- [ ] Status correto: "Recebido" (badge verde)

### Cards de Resumo
- [ ] Card "Recebidos": 1 pagamento, R$ 15,00 (verde)
- [ ] Card "Pendentes": 0 pagamentos, R$ 0,00 (amarelo)
- [ ] Card "Vencidos": 0 pagamentos, R$ 0,00 (vermelho)
- [ ] Card "Total": 1 pagamento, R$ 15,00 bruto, R$ 14,01 líquido (azul)

### Filtros
- [ ] Busca por nome funciona ("gelci")
- [ ] Filtro por status funciona (Recebido/Pendente)
- [ ] Contador "Mostrando X de Y" correto
- [ ] Botão "Limpar Filtros" funciona

### Exportação
- [ ] Excel exporta com dados corretos
- [ ] PDF gera com layout correto
- [ ] Arquivos baixam com nome correto (data atual)

---

## 🚨 Problemas Conhecidos e Soluções

### Problema 1: "Pagamentos: null"
**Causa**: Cache do navegador  
**Solução**: Ctrl+Shift+R para limpar cache

### Problema 2: Contador mostra "0 de 0"
**Causa**: Filtro da API Asaas retornando pagamentos extras  
**Solução**: ✅ Já corrigido no backend (v3.7)

### Problema 3: Cliente aparece como ID
**Causa**: Dados não enriquecidos  
**Solução**: ✅ Já corrigido no frontend (v3.8)

### Problema 4: Erro 401 Unauthorized
**Causa**: Cookie não enviado  
**Solução**: ✅ Já corrigido (axios.withCredentials)

---

## 📊 Estatísticas Esperadas

Para o link "cobrança1" (jojbl0j4fr7a93b6):

| Métrica                | Valor Atual | Esperado |
|------------------------|-------------|----------|
| Total de Pagamentos    | 1           | ✅       |
| Pagamentos Recebidos   | 1           | ✅       |
| Pagamentos Pendentes   | 0           | ✅       |
| Pagamentos Vencidos    | 0           | ✅       |
| Valor Total (bruto)    | R$ 15,00    | ✅       |
| Valor Total (líquido)  | R$ 14,01    | ✅       |
| Taxa Asaas             | R$ 0,99     | ✅       |
| Taxa percentual        | 6,6%        | ✅       |

---

## 🎉 Resultado Final

Se **TODOS** os testes passaram:

```
✅ SISTEMA FUNCIONANDO PERFEITAMENTE!

🎯 Funcionalidades validadas:
  ✅ Cobrança recorrente via PIX
  ✅ Visualização de pagamentos
  ✅ Dados enriquecidos (nome + email)
  ✅ Filtros avançados
  ✅ Exportação Excel e PDF
  ✅ Contadores precisos
  ✅ Cards de resumo

🚀 Próximos passos:
  1. Aguardar próxima cobrança mensal (16/03/2026)
  2. Verificar se novo pagamento aparece automaticamente
  3. Testar notificações de cobrança
```

---

## 📞 Suporte

**Em caso de erro:**

1. **Abrir Console do Navegador**: F12 → aba Console
2. **Copiar mensagem de erro**
3. **Verificar endpoints**:
   - `GET /api/payment-links` → deve retornar 7 links
   - `GET /api/payment-links/jojbl0j4fr7a93b6/payments` → deve retornar 1 pagamento
   - `GET /api/customers/cus_000161797547` → deve retornar nome do cliente

4. **Reportar com detalhes**:
   - URL acessada
   - Mensagem de erro
   - Screenshot da tela
   - Dados do console (F12)

---

**Sistema**: Gerenciador Asaas  
**Versão**: 3.8  
**Data**: 16/02/2026  
**Deploy**: https://bfa5c2a2.project-839f9256.pages.dev  
**Produção**: https://cadastro.corretoracorporate.com.br
