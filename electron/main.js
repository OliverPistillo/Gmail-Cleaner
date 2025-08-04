const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const store = new Store();
const isDev = process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development';

// Gmail API configuration
const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
];
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

// Logout
ipcMain.handle('logout', async () => {
  store.delete('tokens');
  oauth2Client = null;
  initOAuth2Client();
  return { success: true };
});

// Check authentication status
ipcMain.handle('check-auth', async () => {
  const tokens = store.get('tokens');
  return !!tokens;
});

// Get user profile
ipcMain.handle('get-user-profile', async () => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    const response = await gmail.users.getProfile({ userId: 'me' });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
});

// Scan mailbox - comprehensive scan
ipcMain.handle('scan-mailbox', async () => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    // Get total messages count
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const totalMessages = profile.data.messagesTotal || 0;
    const totalThreads = profile.data.threadsTotal || 0;
    
    // Count different types of emails
    const categories = {
      newsletters: 0,
      spam: 0,
      promotions: 0,
      social: 0,
      old: 0,
      withAttachments: 0,
      unread: 0
    };
    
    // Scan newsletters
    try {
      const newsletterResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'unsubscribe OR list-unsubscribe',
        maxResults: 500
      });
      categories.newsletters = newsletterResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning newsletters:', e);
    }
    
    // Scan spam
    try {
      const spamResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:spam',
        maxResults: 100
      });
      categories.spam = spamResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning spam:', e);
    }
    
    // Scan promotions
    try {
      const promotionsResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'category:promotions',
        maxResults: 500
      });
      categories.promotions = promotionsResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning promotions:', e);
    }
    
    // Scan social
    try {
      const socialResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'category:social',
        maxResults: 500
      });
      categories.social = socialResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning social:', e);
    }
    
    // Scan old emails (older than 90 days)
    try {
      const oldResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'older_than:90d',
        maxResults: 500
      });
      categories.old = oldResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning old emails:', e);
    }
    
    // Scan emails with attachments
    try {
      const attachmentResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'has:attachment larger:5M',
        maxResults: 100
      });
      categories.withAttachments = attachmentResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning attachments:', e);
    }
    
    // Scan unread
    try {
      const unreadResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 500
      });
      categories.unread = unreadResponse.data.resultSizeEstimate || 0;
    } catch (e) {
      console.error('Error scanning unread:', e);
    }
    
    return {
      totalMessages,
      totalThreads,
      categories,
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to scan mailbox: ${error.message}`);
  }
});

// Get newsletter emails with proper metadata
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
        // Get metadata for each email
        for (const msg of response.data.messages) {
          try {
            const metadata = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
              format: 'metadata',
              metadataHeaders: ['From', 'Subject', 'List-Unsubscribe', 'Date']
            });
            
            const headers = metadata.data.payload.headers || [];
            const emailData = {
              id: msg.id,
              threadId: msg.threadId
            };
            
            headers.forEach(header => {
              emailData[header.name.toLowerCase()] = header.value;
            });
            
            emails.push(emailData);
          } catch (e) {
            console.error(`Error getting metadata for ${msg.id}:`, e);
          }
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken && (!maxResults || emails.length < maxResults));

    return emails.slice(0, maxResults || emails.length);
  } catch (error) {
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
});

// Get spam and promotional emails
ipcMain.handle('get-spam-promotions', async () => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const queries = [
    'category:promotions',
    'category:social',
    'in:spam',
    'older_than:6m'
  ];
  
  const allEmails = [];
  
  for (const query of queries) {
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500
      });
      
      if (response.data.messages) {
        allEmails.push(...response.data.messages);
      }
    } catch (error) {
      console.error(`Error fetching ${query}:`, error);
    }
  }
  
  return allEmails;
});

// Get old emails for archiving
ipcMain.handle('get-old-emails', async (event, days = 90) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const query = `is:read older_than:${days}d -in:trash -in:spam`;
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 500
    });
    
    return response.data.messages || [];
  } catch (error) {
    throw new Error(`Failed to fetch old emails: ${error.message}`);
  }
});

// Get emails with attachments
ipcMain.handle('get-emails-with-attachments', async (event, minSizeMB = 5) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const query = `has:attachment larger:${minSizeMB}M`;
  
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100
    });
    
    if (!response.data.messages) return [];
    
    // Get details for each email
    const emailsWithDetails = [];
    for (const message of response.data.messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });
      
      const attachmentInfo = await getAttachmentInfo(details.data);
      emailsWithDetails.push({
        ...message,
        ...attachmentInfo,
        headers: details.data.payload.headers
      });
    }
    
    return emailsWithDetails;
  } catch (error) {
    throw new Error(`Failed to fetch emails with attachments: ${error.message}`);
  }
});

// Helper function to get attachment info
async function getAttachmentInfo(message) {
  let totalSize = 0;
  const attachments = [];
  
  function processPayload(payload) {
    if (payload.filename && payload.body.size > 0) {
      attachments.push({
        filename: payload.filename,
        size: payload.body.size,
        mimeType: payload.mimeType
      });
      totalSize += payload.body.size;
    }
    
    if (payload.parts) {
      payload.parts.forEach(processPayload);
    }
  }
  
  processPayload(message.payload);
  
  return {
    attachmentCount: attachments.length,
    totalSize,
    attachments
  };
}

// Get email metadata
ipcMain.handle('get-email-metadata', async (event, msgId) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: msgId,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'List-Unsubscribe', 'Date']
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
      date: metadata.date || '',
      'list-unsubscribe': metadata['list-unsubscribe'] || ''
    };
  } catch (error) {
    throw new Error(`Failed to get email metadata: ${error.message}`);
  }
});

// Archive messages
ipcMain.handle('archive-messages', async (event, msgIds) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    for (const msgId of msgIds) {
      await gmail.users.messages.modify({
        userId: 'me',
        id: msgId,
        requestBody: {
          removeLabelIds: ['INBOX']
        }
      });
    }
    return { success: true, count: msgIds.length };
  } catch (error) {
    throw new Error(`Failed to archive messages: ${error.message}`);
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

// Create label
ipcMain.handle('create-label', async (event, labelName, color = null) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const requestBody = {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    };
    
    if (color) {
      requestBody.color = color;
    }
    
    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody
    });
    
    return response.data;
  } catch (error) {
    // If label already exists, return null
    if (error.message.includes('already exists')) {
      return null;
    }
    throw new Error(`Failed to create label: ${error.message}`);
  }
});

// Get all labels
ipcMain.handle('get-labels', async () => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await gmail.users.labels.list({
      userId: 'me'
    });
    
    return response.data.labels || [];
  } catch (error) {
    throw new Error(`Failed to get labels: ${error.message}`);
  }
});

// Apply label to messages
ipcMain.handle('apply-label', async (event, msgIds, labelId) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    for (const msgId of msgIds) {
      await gmail.users.messages.modify({
        userId: 'me',
        id: msgId,
        requestBody: {
          addLabelIds: [labelId]
        }
      });
    }
    return { success: true, count: msgIds.length };
  } catch (error) {
    throw new Error(`Failed to apply label: ${error.message}`);
  }
});

// Create filter rule
ipcMain.handle('create-filter', async (event, criteria, action) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  try {
    const response = await gmail.users.settings.filters.create({
      userId: 'me',
      requestBody: {
        criteria,
        action
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create filter: ${error.message}`);
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