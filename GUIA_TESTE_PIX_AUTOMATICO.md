# 🧪 Guia de Teste - PIX Automático v6.0

## 🎯 Objetivo

Testar a funcionalidade de **PIX Automático** (débito recorrente) implementada na versão 6.0.

---

## 📋 Pré-requisitos

- ✅ Conta ativa no Asaas (API em produção ou sandbox)
- ✅ Acesso ao painel admin: https://admin.corretoracorporate.com.br
- ✅ Aplicativo do banco instalado no celular (para autorizar débito)
- ✅ Credenciais de login: `admin / admin123`

---

## 🔄 Fluxo de Teste Completo

### 1️⃣ Criar Link de Auto-Cadastro (Admin)

1. **Acesse o painel**:
   ```
   https://admin.corretoracorporate.com.br
   ```

2. **Faça login**:
   - Usuário: `admin`
   - Senha: `admin123`

3. **Navegue até**:
   ```
   Menu → Links de Auto-Cadastro → Gerar Link
   ```

4. **Preencha os campos**:
   - **Valor Mensal (R$)**: `100.00`
   - **Descrição**: `Teste PIX Automático v6.0`
   - **Tipo de Cobrança**: Selecione **"Assinatura Mensal"** (radio button)
   - **Validade**: `30 dias` (padrão)

5. **Clique em "Gerar Link"**

6. **Copie o link gerado** (formato):
   ```
   https://admin.corretoracorporate.com.br/subscription-signup/{UUID}
   ```

---

### 2️⃣ Abrir Link de Cadastro (Cliente)

1. **Abra o link** em uma aba anônima (ou outro navegador):
   ```
   https://admin.corretoracorporate.com.br/subscription-signup/{UUID}
   ```

2. **Verifique a página**:
   - ✅ Título: **"Assinatura Mensal PIX"**
   - ✅ Valor mensal: **R$ 100,00**
   - ✅ Descrição: **"Teste PIX Automático v6.0"**
   - ✅ Formulário de cadastro com 4 campos

---

### 3️⃣ Preencher Formulário (Cliente)

Preencha os dados do cliente:

```
Nome Completo: João da Silva Teste
E-mail: joao.teste@example.com
CPF: 123.456.789-00 (ou CPF válido de teste)
Data de Nascimento: 15/05/1990
```

**Clique em**: **"Confirmar e Gerar PIX"**

---

### 4️⃣ Verificar Tela de Autorização PIX

Após enviar o formulário, a página deve mostrar:

#### ✅ Elementos Esperados:

1. **Título da tela**:
   ```
   🔐 Autorização PIX Automático
   ```

2. **Subtítulo**:
   ```
   Autorize no seu banco para ativar débitos automáticos
   ```

3. **Alerta visual** (fundo roxo claro):
   ```
   🔐 PIX Automático Ativado!
   
   ✅ Após autorizar no seu banco, os pagamentos mensais serão automáticos
   💳 Não precisará pagar manualmente todo mês
   ```

4. **QR Code PIX**:
   - Imagem 256x256 px
   - Scanável pelo app do banco

5. **Campo "Pix Copia e Cola"**:
   - Payload EMV completo
   - Botão "Copiar" funcional

---

### 5️⃣ Autorizar no Banco (Cliente)

#### Opção A: Escanear QR Code

1. Abra o app do seu banco
2. Navegue até **PIX → Ler QR Code**
3. Escaneie o QR Code da tela
4. Verifique os dados:
   - Beneficiário: **Asaas** (ou nome da conta)
   - Valor: **R$ 100,00**
   - Tipo: **Autorização de Débito Recorrente**
5. **Autorize** o débito recorrente
6. Confirme com senha/biometria

#### Opção B: PIX Copia e Cola

1. Copie o payload PIX
2. Abra o app do banco → **PIX → Colar Código**
3. Cole o payload
4. Siga os mesmos passos da Opção A

---

### 6️⃣ Verificar Autorização no Backend

#### Console do Navegador (Cliente)

Abra o **DevTools** (F12) e verifique:

```javascript
// Console deve mostrar:
📥 Dados recebidos: {
  "customerName": "João da Silva Teste",
  "customerEmail": "joao.teste@example.com",
  "customerCpf": "12345678900",
  "customerBirthdate": "1990-05-15"
}

📝 Link Info: { 
  linkId: "...", 
  walletId: "...", 
  value: 100, 
  description: "Teste PIX Automático v6.0", 
  chargeType: "monthly" 
}

👤 Customer criado: cus_abc123xyz

🔄 Criando autorização PIX Automático...

📤 Criando autorização PIX: {
  "customer": "cus_abc123xyz",
  "value": 100,
  "description": "Teste PIX Automático v6.0",
  "format": "MONTHLY",
  "firstDueDate": "2026-04-05",
  "split": [...]
}

📥 Resposta Asaas: {
  ok: true,
  status: 200,
  data: {
    id: "auth_xyz123",
    payload: "00020126...",
    expirationDate: "2026-04-05",
    ...
  }
}

✅ Autorização PIX registrada no banco de dados
```

#### Logs do Wrangler (Desenvolvimento)

Se estiver rodando localmente:

```bash
pm2 logs corretoracorporate --nostream
```

Deve mostrar:
```
POST /api/pix/subscription-signup/{linkId} 200 OK
Customer criado: cus_abc123xyz
Autorização PIX criada: auth_xyz123
```

---

### 7️⃣ Verificar Banco de Dados

#### Tabela `pix_authorizations`

Execute no console D1 (local):

```bash
npx wrangler d1 execute corretoracorporate-production --local --command="SELECT * FROM pix_authorizations WHERE customer_cpf = '12345678900'"
```

**Resultado esperado**:

```
| id       | link_id | customer_id    | authorization_id | customer_name         | customer_email          | customer_cpf | value | frequency | first_due_date | status                 |
|----------|---------|----------------|------------------|-----------------------|-------------------------|--------------|-------|-----------|----------------|------------------------|
| auth_... | uuid... | cus_abc123xyz  | auth_xyz123      | João da Silva Teste   | joao.teste@example.com  | 12345678900  | 100   | MONTHLY   | 2026-04-05     | PENDING_AUTHORIZATION  |
```

**Status esperado**:
- Inicial: `PENDING_AUTHORIZATION`
- Após autorização no banco: `AUTHORIZED` (atualizado via webhook Asaas)

---

## 🧪 Cenários de Teste

### ✅ Teste 1: Autorização Bem-Sucedida

| Etapa | Ação | Resultado Esperado |
|-------|------|-------------------|
| 1 | Criar link "Assinatura Mensal" | Link gerado com sucesso |
| 2 | Abrir link | Página carrega com formulário |
| 3 | Preencher dados | Campos aceitos, validação OK |
| 4 | Enviar formulário | QR Code gerado, alerta PIX Automático visível |
| 5 | Autorizar no banco | Status → AUTHORIZED |
| 6 | Verificar DB | Registro em `pix_authorizations` |

### ✅ Teste 2: Cobrança Única (Comparação)

| Campo | Valor |
|-------|-------|
| Tipo de Cobrança | **"Cobrança Única"** |
| Resultado esperado | Título: "💰 PIX Único Gerado!" |
| Alerta PIX Automático | **Não deve aparecer** |
| Tabela DB | `subscription_conversions` (não `pix_authorizations`) |

### ✅ Teste 3: Validações de Erro

| Cenário | Input | Resultado Esperado |
|---------|-------|-------------------|
| CPF inválido | `123` | Máscara CPF aplicada |
| Email inválido | `teste@` | Validação HTML5 bloqueia |
| Data futura | `2030-01-01` | (Sem validação, aceita) |
| Link expirado | Link antigo | Erro: "Link expirado" (410) |
| Link inativo | Link deletado | Erro: "Link não encontrado" (404) |

---

## 📊 Checklist de Sucesso

Marque os itens testados:

- [ ] Link de auto-cadastro gerado com tipo "Assinatura Mensal"
- [ ] Página de signup carrega corretamente
- [ ] Formulário valida campos obrigatórios
- [ ] QR Code é gerado e exibido
- [ ] Alerta "PIX Automático Ativado!" aparece
- [ ] Título correto: "🔐 Autorização PIX Automático"
- [ ] Payload PIX copia corretamente
- [ ] Console do navegador mostra logs esperados
- [ ] Registro salvo em `pix_authorizations`
- [ ] Campo `status` = `PENDING_AUTHORIZATION`
- [ ] Split 20/80 configurado no payload

---

## 🐛 Troubleshooting

### Problema: Erro 400 ao enviar formulário

**Causa**: Campo `customerBirthdate` não aceito

**Solução**: Atualizar para v6.0 (ou v5.7+)

```bash
git pull origin main
npm run build
npx wrangler pages deploy dist --project-name corretoracorporate
```

---

### Problema: QR Code não aparece

**Causa**: Biblioteca QRCode não carregou

**Solução**: Verificar console do navegador

```javascript
// Deve mostrar:
QRCode library loaded: function QRCode() { ... }
✅ QR Code gerado com sucesso!
```

Se não aparecer, force refresh (Ctrl+Shift+R).

---

### Problema: Título errado ("Assinatura Mensal PIX" em vez de "Autorização PIX Automático")

**Causa**: Frontend não detectou `isAuthorization = true`

**Solução**: Verificar resposta da API:

```javascript
console.log(response.data.firstPayment.pix.isAuthorization)
// Deve ser: true
```

Se for `undefined`, backend não retornou a flag. Atualizar para v6.0.

---

### Problema: Registro não salvou em `pix_authorizations`

**Causa**: Tabela não existe

**Solução**: Aplicar migration:

```bash
npx wrangler d1 migrations apply corretoracorporate-production --local
```

Ou manualmente:

```sql
CREATE TABLE IF NOT EXISTS pix_authorizations (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  authorization_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT NOT NULL,
  customer_birthdate TEXT,
  value REAL NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MONTHLY',
  first_due_date TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING_AUTHORIZATION',
  authorization_date TEXT,
  payload TEXT,
  expiration_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 Relatório de Teste

Após concluir os testes, preencha:

```
Data do Teste: ___/___/2026
Versão testada: v6.0
Ambiente: [ ] Produção [ ] Sandbox [ ] Local

Resultados:
✅ Link gerado: [ ] SIM [ ] NÃO
✅ Formulário funcional: [ ] SIM [ ] NÃO
✅ QR Code gerado: [ ] SIM [ ] NÃO
✅ Alerta PIX Automático: [ ] SIM [ ] NÃO
✅ Registro no DB: [ ] SIM [ ] NÃO
✅ Status correto: [ ] SIM [ ] NÃO

Bugs encontrados:
_________________________________________________
_________________________________________________

Observações:
_________________________________________________
_________________________________________________
```

---

## 🚀 Próximos Passos

Após validar o teste:

1. **Produção**: Deploy para `https://corretoracorporate.pages.dev`
2. **Monitoramento**: Configurar webhook Asaas para atualizar status
3. **Dashboard**: Criar painel admin para listar autorizações
4. **Relatórios**: Adicionar métricas de conversão PIX Automático

---

**Versão do Guia**: 1.0  
**Última atualização**: 2026-03-05  
**Status**: ✅ Pronto para uso
