#!/bin/bash

echo ""
echo "===================================="
echo "  Gmail Cleaner - Avvio"
echo "===================================="
echo ""

# Controlla se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "Installazione dipendenze in corso..."
    npm install
    echo ""
fi

# Avvia l'applicazione
echo "Avvio Gmail Cleaner..."
echo ""
npm start