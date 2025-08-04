const fs = require('fs');
const path = require('path');

// Crea la cartella assets se non esiste
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

console.log('📌 Icona Gmail Cleaner');
console.log('====================');
console.log('');
console.log('✅ Hai già un\'icona perfetta per l\'app!');
console.log('');
console.log('🎨 Per utilizzarla nel progetto:');
console.log('');
console.log('1. Salva l\'immagine come "icon.png" nella cartella assets/');
console.log('');
console.log('2. Converti l\'icona nei formati necessari:');
console.log('   - icon.png → Immagine originale (256x256 o 512x512)');
console.log('   - icon.ico → Per Windows (multi-size)');
console.log('   - icon.icns → Per macOS');
console.log('');
console.log('3. Tool consigliati per la conversione:');
console.log('   🌐 Online:');
console.log('   - https://convertio.co/png-ico/');
console.log('   - https://cloudconvert.com/png-to-icns');
console.log('   - https://iconverticons.com/online/');
console.log('');
console.log('   💻 Software:');
console.log('   - GIMP (gratuito, tutti i formati)');
console.log('   - ImageMagick (command line)');
console.log('   - Iconizer (macOS)');
console.log('');
console.log('4. Dimensioni consigliate:');
console.log('   - PNG: 512x512px');
console.log('   - ICO: 16x16, 32x32, 48x48, 256x256');
console.log('   - ICNS: tutte le dimensioni macOS standard');
console.log('');

// Crea file README per le icone
const iconReadmePath = path.join(assetsDir, 'README.md');
const iconReadme = `# Icone Gmail Cleaner

## File necessari:
- \`icon.png\` - Icona principale (512x512)
- \`icon.ico\` - Icona Windows
- \`icon.icns\` - Icona macOS

## Come convertire l'icona:

### Metodo 1: Online
1. Vai su https://iconverticons.com/online/
2. Carica la tua immagine PNG
3. Scarica ICO e ICNS

### Metodo 2: Command line (ImageMagick)
\`\`\`bash
# Installa ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Converti in ICO
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Per ICNS su macOS
iconutil -c icns icon.iconset
\`\`\`

## L'icona rappresenta:
- 📧 Busta Gmail (con simbolo di divieto)
- 🧹 Scopa che pulisce
- ✨ Pixel che vengono spazzati via
- 🎨 Colori: Rosso Gmail + Blu scuro

Perfetta metafora visiva per un "cleaner" di Gmail!
`;

fs.writeFileSync(iconReadmePath, iconReadme);
console.log('✅ Creato assets/README.md con istruzioni dettagliate');

// Crea placeholder files
const files = ['icon.png', 'icon.ico', 'icon.icns'];
files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`📄 Creato placeholder: ${file}`);
  }
});