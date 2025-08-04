# Icone Gmail Cleaner

## File necessari:
- `icon.png` - Icona principale (512x512)
- `icon.ico` - Icona Windows
- `icon.icns` - Icona macOS

## Come convertire l'icona:

### Metodo 1: Online
1. Vai su https://iconverticons.com/online/
2. Carica la tua immagine PNG
3. Scarica ICO e ICNS

### Metodo 2: Command line (ImageMagick)
```bash
# Installa ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Converti in ICO
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Per ICNS su macOS
iconutil -c icns icon.iconset
```

## L'icona rappresenta:
- 📧 Busta Gmail (con simbolo di divieto)
- 🧹 Scopa che pulisce
- ✨ Pixel che vengono spazzati via
- 🎨 Colori: Rosso Gmail + Blu scuro

Perfetta metafora visiva per un "cleaner" di Gmail!
