const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const store = new Store();
const isDev = process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development';

// Gmail API configuration
const SCOPES = ['https://mail.google.com/'];
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1006088229370-j6ofqdbtbdbtpif7jahvekean4v8os9j.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost';

let mainWindow;
let authWindow;
let oauth2Client;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 }
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize OAuth2 client
function initOAuth2Client() {
  oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  const tokens = store.get('tokens');
  if (tokens) {
    oauth2Client.setCredentials(tokens);
  }
}

// Handle authentication
ipcMain.handle('authenticate', async () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  authWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  authWindow.loadURL(authUrl);

  const authCode = await new Promise((resolve, reject) => {
    authWindow.webContents.on('will-redirect', async (event, url) => {
      if (url.startsWith('http://localhost')) {
        event.preventDefault();
        const urlParams = new URL(url).searchParams;
        const code = urlParams.get('code');
        if (code) {
          authWindow.close();
          resolve(code);
        }
      }
    });

    // Gestisce anche il caso in cui il codice venga mostrato nel titolo
    authWindow.on('page-title-updated', (event, title) => {
      const match = title.match(/[?&]code=([^&]+)/);
      if (match) {
        const code = match[1];
        authWindow.close();
        resolve(code);
      }
    });

    authWindow.on('closed', () => {
      reject(new Error('Auth window closed'));
    });
  });

  const { tokens } = await oauth2Client.getToken(authCode);
  oauth2Client.setCredentials(tokens);
  store.set('tokens', tokens);
  
  return { success: true };
});

// Check authentication status
ipcMain.handle('check-auth', async () => {
  const tokens = store.get('tokens');
  return !!tokens;
});

// Get newsletter emails
ipcMain.handle('get-newsletters', async (event, maxResults = null) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const query = 'unsubscribe OR list-unsubscribe';
  const emails = [];
  let pageToken = null;

  try {
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500,
        pageToken
      });

      if (response.data.messages) {
        emails.push(...response.data.messages.map(m => m.id));
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken && (!maxResults || emails.length < maxResults));

    return emails.slice(0, maxResults || emails.length);
  } catch (error) {
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
});

// Get email metadata
ipcMain.handle('get-email-metadata', async (event, msgId) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: msgId,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'List-Unsubscribe']
    });

    const headers = response.data.payload.headers || [];
    const metadata = {};
    
    headers.forEach(header => {
      metadata[header.name.toLowerCase()] = header.value;
    });

    return {
      id: msgId,
      from: metadata.from || '',
      subject: metadata.subject || '',
      'list-unsubscribe': metadata['list-unsubscribe'] || ''
    };
  } catch (error) {
    throw new Error(`Failed to get email metadata: ${error.message}`);
  }
});

// Delete messages
ipcMain.handle('delete-messages', async (event, msgIds) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    // Gmail API limits batch delete to 1000 messages
    for (let i = 0; i < msgIds.length; i += 1000) {
      const batch = msgIds.slice(i, i + 1000);
      await gmail.users.messages.batchDelete({
        userId: 'me',
        requestBody: { ids: batch }
      });
    }
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete messages: ${error.message}`);
  }
});

// Fetch unsubscribe link
ipcMain.handle('fetch-unsubscribe', async (event, link) => {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch(link, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GmailCleaner/2.0)'
      }
    });
    
    return {
      success: response.status < 400,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Open external link
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

// Window controls
ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});

// App events
app.whenReady().then(() => {
  initOAuth2Client();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});