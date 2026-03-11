# 🚀 Sistema Corretora Corporate

Sistema completo de pagamentos PIX, bilhetes de loteria e gestão de subcontas.

---

## ⚡ INÍCIO RÁPIDO

### 1. Setup (primeira vez):
```bash
./setup.sh
# ou
npm install
```

### 2. Desenvolvimento:
```bash
npm run build
pm2 start ecosystem.config.cjs
```

### 3. Deploy:
```bash
npm run build
npm run deploy
```

---

## 📊 PROJETO OTIMIZADO

**Tamanho:** 5.4MB (código fonte apenas)  
**Arquivos:** 231 essenciais  
**node_modules:** Instalado sob demanda  

---

## ✨ FUNCIONALIDADES

- ✅ Pagamentos PIX (QR Code + Copia e Cola)
- ✅ Bilhetes de loteria automáticos
- ✅ Integração ASAAS v3 API (42+ endpoints)
- ✅ E-mail MailerSend
- ✅ Subcontas e relatórios
- ✅ Banners personalizados
- ✅ DeltaPag integration
- ✅ Banco D1 SQLite

---

## 🌐 PRODUÇÃO

**URL:** https://corretoracorporate.pages.dev  
**Login:** admin / admin123

---

## 📝 ESTRUTURA

```
webapp/
├── src/index.tsx           # Backend (677KB)
├── public/static/          # Frontend (530KB)
├── migrations/             # Banco D1
├── package.json            # Dependências
└── README.md               # Esta documentação
```

---

## 🚀 PERFORMANCE

- Build: 4 segundos
- Deploy: ~30 segundos
- Worker: 709KB

---

**Status:** ✅ 100% Funcional e Otimizado
