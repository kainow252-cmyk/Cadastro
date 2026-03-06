# 📋 COLA PARA REUNIÃO WOOVI (1 PÁGINA)

**Data**: 05/03/2026 21:00  
**Duração**: 30-60 min  

---

## 🔴 PERGUNTAS CRÍTICAS (FAZER LOGO)

### 1️⃣ APP/PAINEL PARA CLIENTE (DECISIVA)
```
❓ Woovi tem APP MOBILE para CLIENTES consultarem saldo?
❓ Woovi tem PAINEL WEB para CLIENTES (não admin)?
❓ Cliente vê saldo e extrato da conta dele?

⚠️ SE NÃO: Focar 100% Asaas
```

### 2️⃣ ERRO 401
```
❓ Por que erro 401 em TODOS os AppIDs?
❓ Permissões ocultas não ativadas?
❓ Conta de Teste precisa ativação?
```

### 3️⃣ RECURSOS
```
❓ Split 20/80 funciona?
❓ PIX Automático ativo?
❓ Webhooks obrigatórios?
```

---

## 📊 INFORMAÇÕES PARA PASSAR

### AppIDs Testados
```
1. Client_Id_d4995bba-e392-47df-b58d-412746d4e53b ❌
2. Client_Id_2401721c-0279-4b33-98dd-ad218409a23b ❌
3. Client_Id_f7b5eaea-7c1b-4b51-bd37-25e12d5276d7 ❌

TODOS: erro 401 "appID inválido"
```

### Testes Realizados
```
✅ 3 AppIDs + 2 URLs + 4 formatos = 20+ combinações
✅ Aguardado 15+ min após regenerar
✅ Formato Base64 correto
✅ SSL OK (TLSv1.3)
```

---

## 💻 TESTE AO VIVO

### Se Resolverem
```bash
cd /home/user/webapp
./test-woovi-connection.sh
```

### Resultado Esperado
```
✅ Autenticação OK
✅ Cobrança criada: R$ 10
✅ PIX Copia e Cola: 00020126...
✅ QR Code + Link
```

---

## 🎯 DECISÃO PÓS-REUNIÃO

### ✅ Cenário A: Tem App + API OK
```
→ WOOVI (testar, validar, deploy)
```

### ❌ Cenário B: SEM App Cliente
```
→ ASAAS (app completo, split OK, PIX Auto 1-3 dias)
```

### ⚠️ Cenário C: Tem App + API Bloqueado
```
→ Definir prazo
→ Se >1 semana: Asaas temporariamente
```

---

## 📞 CONTATOS

### Woovi
```
Chat: painel após login
Email: [email protected]
```

### Asaas (Plano B)
```
Telefone: (16) 3347-8031
Email: [email protected]
WhatsApp: (16) 3347-8031
```

---

## 📝 CHECKLIST PÓS-REUNIÃO

```
[ ] Confirmei se tem app cliente?
[ ] Entendi erro 401?
[ ] Testei API (se resolveram)?
[ ] Defini próximos passos?
[ ] Tomei decisão: Woovi ou Asaas?
```

---

## 🚀 ASAAS (PLANO B)

### Se Woovi Não Funcionar
```
✅ App: iOS + Android + Web
✅ Split: 20/80 testado (R$ 350)
✅ PIX Auto: ligar (16) 3347-8031
✅ Código: 100% pronto
```

### Script Telefone Asaas
```
"Olá! Sou desenvolvedor da CORRETORA CORPORATE LTDA.
Preciso ativar /pix/automatic/authorizations.
Retorna 'insufficient_permission'.
Email: corretora@corretoracorporate.com.br
Ambiente: Sandbox
Chave: 071ade92-b57b-441f-bdf6-728fd7dab4ab
Split funcionando. Favor ativar. Obrigado!"
```

---

## 💡 DICAS

```
1. ✅ Perguntar sobre app cliente LOGO
2. ✅ Ser direto: 20+ testes feitos
3. ✅ Testar ao vivo se possível
4. ✅ Anotar tudo
5. ✅ Definir prazo
```

---

**BOA REUNIÃO! 🚀**

**Me conte o resultado depois!** 📞
