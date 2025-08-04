# 📦 Guida Installazione - Gmail Cleaner

## 🚀 Installazione Super Veloce (1 minuto)

### Windows
```bash
# Doppio click su:
start.bat
```

### macOS/Linux
```bash
# Rendi eseguibile e avvia:
chmod +x start.sh
./start.sh
```

## 🛠️ Installazione Manuale

### 1. Prerequisiti
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** (opzionale) - [Download](https://git-scm.com/)

### 2. Download Progetto
Opzione A - Con Git:
```bash
git clone <repository-url>
cd gmail-cleaner-pro
```

Opzione B - Download ZIP:
- Scarica il progetto come ZIP
- Estrai nella cartella desiderata

### 3. Installazione
```bash
# Installa dipendenze
npm install

# Avvia l'app
npm start
```

## ✅ Credenziali già configurate!

Il progetto include già:
- ✅ `credentials.json` - Le tue credenziali Google OAuth
- ✅ `.env` - Variabili d'ambiente configurate
- ✅ Script di setup automatico
- 🎨 **Icona personalizzata** - Busta Gmail con scopa!

Non devi configurare nulla!

## 🎮 Primo Utilizzo

1. **Avvia l'app** con uno dei metodi sopra
2. **Clicca "Connetti Gmail"** nella schermata iniziale
3. **Autorizza l'accesso** nel browser che si apre
4. **Torna all'app** - sei pronto!
5. **Clicca "Avvia pulizia"** per iniziare

## 🏗️ Build per Distribuzione

### Build per la tua piattaforma
```bash
npm run dist
```

### Build per tutte le piattaforme
```bash
npm run dist -- -mwl
```

I file pronti saranno in `dist/`:
- **Windows**: `Gmail Cleaner Setup.exe`
- **macOS**: `Gmail Cleaner.dmg`
- **Linux**: `Gmail Cleaner.AppImage`

## ❓ Troubleshooting

### "npm non trovato"
➡️ Installa Node.js da https://nodejs.org/

### "Errore di autenticazione"
➡️ Verifica che `credentials.json` sia presente nella root

### "L'app non si avvia"
➡️ Prova:
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install
npm start
```

### Windows: "Script non autorizzato"
➡️ Apri PowerShell come amministratore:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📞 Supporto

Se hai problemi:
1. Controlla i requisiti minimi
2. Verifica la console per errori
3. Prova a reinstallare le dipendenze

---

**Pronto per pulire la tua Gmail! 🧹✨**