Ecco una versione sistemata e ben formattata del README.md, pronta da incollare nel tuo progetto! Ho mantenuto la struttura logica, gli spazi e la leggibilità, senza cambiare i contenuti.

---

# Gmail Cleaner Pro 🚀

Un'applicazione desktop moderna per pulire automaticamente la tua casella Gmail dalle newsletter indesiderate. Costruita con React + Electron per un'esperienza utente premium.

![Gmail Cleaner Pro](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Electron](https://img.shields.io/badge/electron-28.0.0-47848F.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)

---

## ✨ Caratteristiche

- 🎨 **Design Moderno**: Interfaccia elegante con effetti glassmorphism e animazioni fluide.
- 🔐 **Autenticazione Sicura**: OAuth2 con Google per accesso sicuro a Gmail.
- 🤖 **Disiscrizione Automatica**: Clicca automaticamente i link di disiscrizione.
- 🗑️ **Pulizia in Massa**: Elimina tutte le email da mittenti selezionati.
- 📊 **Statistiche in Tempo Reale**: Monitora il progresso della pulizia.
- 🔔 **Gestione Manuale**: Notifiche per i casi che richiedono intervento manuale.
- 📱 **Multi-piattaforma**: Funziona su Windows, macOS e Linux.

---

## 🛠️ Installazione

### Prerequisiti

- Node.js 18+
- npm o yarn
- Un progetto Google Cloud con le API Gmail abilitate

### Setup Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita la Gmail API:
   - Vai su "API e servizi" > "Libreria"
   - Cerca "Gmail API"
   - Clicca su "Abilita"
4. Crea le credenziali OAuth2:
   - Vai su "API e servizi" > "Credenziali"
   - Clicca su "Crea credenziali" > "ID client OAuth"
   - Tipo applicazione: "Applicazione desktop"
   - Scarica il file JSON delle credenziali

### Configurazione del Progetto

```bash
# Clona il repository
git clone https://github.com/tuousername/gmail-cleaner-pro.git
cd gmail-cleaner-pro

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
# Crea un file .env nella root del progetto
echo "GOOGLE_CLIENT_ID=your_client_id" >> .env
echo "GOOGLE_CLIENT_SECRET=your_client_secret" >> .env
```

---

## 🚀 Avvio

### Modalità Sviluppo

```bash
npm start
```
Questo avvierà sia React che Electron in modalità sviluppo con hot reload.

### Build per Produzione

```bash
# Build per la tua piattaforma corrente
npm run dist

# Build per tutte le piattaforme
npm run dist -- -mwl
```

I file compilati saranno nella cartella `dist/`.

---

## 📁 Struttura del Progetto

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

---

## 🎯 Come Usare

1. **Avvia l'applicazione**
   - Doppio click sull'app installata o `npm start` in sviluppo

2. **Connetti Gmail**
   - Clicca su "Connetti Gmail"
   - Autorizza l'accesso nella finestra del browser
   - L'app si autenticherà automaticamente

3. **Avvia la Pulizia**
   - Clicca su "Avvia pulizia newsletter"
   - L'app cercherà tutte le email con link di disiscrizione
   - Monitorerà il progresso in tempo reale

4. **Gestisci i Risultati**
   - ✅ **Verde**: Disiscrizione riuscita
   - ❌ **Rosso**: Disiscrizione fallita
   - ⚠️ **Giallo**: Richiede azione manuale
   - 📧 **Grigio**: Nessun link trovato

5. **Azioni Manuali**
   - Clicca sull'icona link per aprire i link di disiscrizione manuali
   - Segui le istruzioni sul sito del mittente

---

## ⚙️ Configurazione Avanzata

### Personalizzazione OAuth

Modifica `electron/main.js`:

```javascript
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
```

### Modifica Filtri Email

Per cambiare i criteri di ricerca, modifica in `electron/main.js`:

```javascript
const query = 'unsubscribe OR list-unsubscribe'; // Aggiungi altri termini
```

### Temi e Stili

Personalizza i colori in `src/App.css`:

```css
:root {
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  /* ... altri colori ... */
}
```

---

## 🐛 Troubleshooting

### L'autenticazione fallisce

- Verifica che le credenziali Google siano corrette
- Controlla che la Gmail API sia abilitata
- Assicurati che il redirect URI sia configurato correttamente

### Le email non vengono trovate

- Verifica i permessi dell'app in Google Account
- Controlla che ci siano effettivamente newsletter nella casella

### La disiscrizione fallisce

- Alcuni siti richiedono conferma manuale
- Alcuni link potrebbero essere scaduti
- Usa l'opzione manuale per questi casi

---

## 🤝 Contribuire

Le pull request sono benvenute! Per modifiche importanti:

1. Fork il progetto
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

---

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

---

## 🙏 Ringraziamenti

- [Electron](https://www.electronjs.org/) - Framework desktop
- [React](https://reactjs.org/) - UI Framework
- [Framer Motion](https://www.framer.com/motion/) - Animazioni
- [Google APIs](https://developers.google.com/gmail/api) - Gmail API

---

**Nota**: Questa app richiede l'accesso alla tua casella Gmail. Assicurati di comprendere i permessi richiesti prima di autorizzare l'accesso. L'app non memorizza né condivide i tuoi dati con terze parti.

---

Se vuoi altre modifiche (ad esempio aggiungere badge, ottimizzare l'inglese, rimuovere sezioni, ecc.) dimmelo pure!

