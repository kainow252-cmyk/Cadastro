# 🔍 Como Pegar o Database ID do D1

## 📍 Você Precisa do Database ID

O `database_id` do banco `corretoracorporate-db` está na URL do seu navegador!

---

## 🎯 Método 1: Copiar da URL (MAIS RÁPIDO)

Olhe para a URL do seu navegador onde você está vendo o Console D1:

```
https://dash.cloudflare.com/ef4dfafae6fc56ebf84a3b58aa7d8b45/workers/d1/databases/728ee55c-d607-4846-969a-741a4f0dfb82/console
                                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                                                         ESTE É O DATABASE ID!
```

**O Database ID é a parte depois de `/databases/` e antes de `/console`**

No seu caso, parece ser: `728ee55c-d607-4846-969a-741a4f0dfb82`

---

## 🎯 Método 2: Ver na Lista de Bancos D1

1. No menu lateral esquerdo do Cloudflare Dashboard
2. Clique em **"Banco de dados SQL D1"** (ou "Workers & Pages" → "D1")
3. Você verá uma lista de bancos
4. Clique em `corretoracorporate-db`
5. Na página que abrir, o **Database ID** estará visível no topo

---

## ✏️ Depois de Copiar o ID

Use o ID para atualizar o arquivo `wrangler.jsonc`:

**Eu vou fazer isso para você!** Só me diga:

**Qual é o Database ID que está na sua URL?**

Copie e cole a parte depois de `/databases/` 

Exemplo da URL:
```
.../databases/728ee55c-d607-4846-969a-741a4f0dfb82/console
```

O ID é: `728ee55c-d607-4846-969a-741a4f0dfb82`

---

## 📝 Alternativa: Uso da URL Completa

Se quiser, me envie a **URL completa** que está no seu navegador e eu extraio o ID para você!
