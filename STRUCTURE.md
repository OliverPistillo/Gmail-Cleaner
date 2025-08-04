# 📁 Struttura Progetto Gmail Cleaner

```
gmail-cleaner-pro/
│
├── 📁 electron/                 # Codice Electron (desktop app)
│   ├── main.js                 # Processo principale
│   └── preload.js              # Bridge sicuro per le API
│
├── 📁 src/                     # Codice React (interfaccia)
│   ├── App.js                  # Componente principale
│   ├── App.css                 # Stili principali
│   ├── index.js                # Entry point React
│   └── index.css               # Stili globali
│
├── 📁 public/                  # Asset pubblici
│   ├── index.html              # Template HTML
│   ├── favicon.ico             # Icona browser
│   └── manifest.json           # Manifest PWA
│
├── 📁 scripts/                 # Script utilità
│   └── setup-credentials.js    # Setup automatico credenziali
│
├── 📁 assets/                  # Icone app (da creare)
│   ├── icon.png                # Icona Linux/generale
│   ├── icon.ico                # Icona Windows
│   └── icon.icns               # Icona macOS
│
├── 📁 dist/                    # Build finale (generata)
│   └── [File installer]        # .exe, .dmg, .AppImage
│
├── 📁 node_modules/            # Dipendenze (generata)
│
├── 📄 credentials.json          # Credenziali Google OAuth ✅
├── 📄 .env                     # Variabili ambiente ✅
├── 📄 .env.example             # Template variabili
├── 📄 package.json             # Configurazione progetto
├── 📄 package-lock.json        # Lock dipendenze
├── 📄 .gitignore               # File da ignorare in git
├── 📄 tailwind.config.js       # Config Tailwind CSS
├── 📄 postcss.config.js        # Config PostCSS
├── 📄 README.md                # Documentazione principale
├── 📄 QUICK_START.md           # Guida rapida
├── 📄 INSTALL.md               # Guida installazione
├── 📄 STRUCTURE.md             # Questo file
├── 📄 start.bat                # Script avvio Windows
└── 📄 start.sh                 # Script avvio macOS/Linux
```

## 🎯 File Importanti

### Configurazione
- **credentials.json** - Le tue credenziali Google (NON condividere!)
- **.env** - Variabili d'ambiente con client ID e secret
- **package.json** - Tutte le dipendenze e script

### Codice Principale
- **electron/main.js** - Gestisce finestre, API Gmail, autenticazione
- **src/App.js** - Interfaccia utente React
- **src/App.css** - Tutti gli stili dell'app

### Build e Distribuzione
- **dist/** - Contiene i file pronti per distribuzione
- **build/** - Build di React per produzione

## 🛠️ Workflow Sviluppo

1. **Modifica UI** → `src/App.js` e `src/App.css`
2. **Modifica logica Gmail** → `electron/main.js`
3. **Test** → `npm start` (hot reload attivo)
4. **Build** → `npm run dist`

## 📝 Note

- Non modificare `credentials.json` manualmente
- Il file `.env` viene generato automaticamente da `credentials.json`
- La cartella `dist/` non va committata su Git
- Le icone in `assets/` sono opzionali ma consigliate per build professionali