# Implementação PIX Automático - Plano de Ação

## 📋 Situação Atual

- **DeltaPag** (gateway separado) = Cartão de crédito recorrente ✅ FUNCIONANDO
- **Asaas** (conta principal) = PIX único ✅ FUNCIONANDO
- **Faltando**: PIX Automático recorrente para Asaas

## 🎯 Objetivo

Quando usuário criar link com **"Assinatura Mensal"**, o sistema deve:
1. Cliente paga 1º PIX via QR Code
2. Cliente autoriza débitos futuros automáticos
3. Cobranças mensais são automáticas (sem precisar pagar novo PIX)

## 🔧 Implementação Necessária

### 1. Banco de Dados
Criar tabela `asaas_pix_authorizations`:
```sql
CREATE TABLE asaas_pix_authorizations (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  customer_cpf TEXT,
  customer_name TEXT,
  customer_email TEXT,
  asaas_authorization_id TEXT,
  pix_payload TEXT,
  status TEXT DEFAULT 'PENDING',
  value REAL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Endpoints API

#### POST /api/asaas/pix-authorization
Cria autorização PIX Automático no Asaas
```json
{
  "linkId": "uuid",
  "customerName": "João Silva",
  "customerEmail": "joao@example.com",
  "customerCpf": "12345678900"
}
```

#### GET /api/asaas/check-pix-authorization/:authId
Verifica se PIX foi pago e autorização concedida

### 3. Página de Cadastro

Modificar `/subscription-signup/:linkId` para:
- Ler `charge_type` do banco
- Se `charge_type === 'monthly'` → Fluxo PIX Automático
- Se `charge_type === 'single'` → Fluxo PIX único (atual)

## 📝 Conclusão

Sistema ficará com 3 fluxos:
1. **PIX Único** (Asaas) - Cobrança Única ✅
2. **PIX Automático** (Asaas) - Assinatura Mensal 🆕
3. **Cartão Recorrente** (DeltaPag) - Links DeltaPag ✅

Deseja que eu implemente isso agora?
