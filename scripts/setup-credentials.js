const fs = require('fs');
const path = require('path');

// Leggi il file credentials.json se esiste
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(credentialsPath)) {
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    if (credentials.installed) {
      const { client_id, client_secret } = credentials.installed;
      
      // Crea o aggiorna il file .env
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Aggiorna le credenziali esistenti
        envContent = envContent.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${client_id}`);
        envContent = envContent.replace(/GOOGLE_CLIENT_SECRET=.*/g, `GOOGLE_CLIENT_SECRET=${client_secret}`);
        
        // Se non esistono, aggiungile
        if (!envContent.includes('GOOGLE_CLIENT_ID=')) {
          envContent += `\nGOOGLE_CLIENT_ID=${client_id}`;
        }
        if (!envContent.includes('GOOGLE_CLIENT_SECRET=')) {
          envContent += `\nGOOGLE_CLIENT_SECRET=${client_secret}`;
        }
      } else {
        // Crea nuovo file .env
        envContent = `# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=${client_id}
GOOGLE_CLIENT_SECRET=${client_secret}

# Development settings
NODE_ENV=development
BROWSER=none
`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Credenziali configurate con successo!');
      console.log(`   Client ID: ${client_id.substring(0, 20)}...`);
      console.log(`   File .env creato/aggiornato`);
    } else {
      console.error('❌ Formato credentials.json non valido');
    }
  } catch (error) {
    console.error('❌ Errore nella lettura di credentials.json:', error.message);
  }
} else {
  console.log('⚠️  File credentials.json non trovato');
  console.log('   Assicurati che il file sia nella root del progetto');
}