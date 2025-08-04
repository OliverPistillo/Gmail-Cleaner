@echo off
echo.
echo ====================================
echo   Gmail Cleaner - Avvio
echo ====================================
echo.

:: Controlla se node_modules esiste
if not exist "node_modules" (
    echo Installazione dipendenze in corso...
    call npm install
    echo.
)

:: Avvia l'applicazione
echo Avvio Gmail Cleaner...
echo.
call npm start