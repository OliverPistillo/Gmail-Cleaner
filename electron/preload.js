const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  authenticate: () => ipcRenderer.invoke('authenticate'),
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  logout: () => ipcRenderer.invoke('logout'),
  getUserProfile: () => ipcRenderer.invoke('get-user-profile'),
  
  // Email fetching operations
  scanMailbox: () => ipcRenderer.invoke('scan-mailbox'),
  getNewsletters: (maxResults) => ipcRenderer.invoke('get-newsletters', maxResults),
  getSpamPromotions: () => ipcRenderer.invoke('get-spam-promotions'),
  getOldEmails: (days) => ipcRenderer.invoke('get-old-emails', days),
  getEmailsWithAttachments: (minSizeMB) => ipcRenderer.invoke('get-emails-with-attachments', minSizeMB),
  getEmailMetadata: (msgId) => ipcRenderer.invoke('get-email-metadata', msgId),
  
  // Email actions
  deleteMessages: (msgIds) => ipcRenderer.invoke('delete-messages', msgIds),
  archiveMessages: (msgIds) => ipcRenderer.invoke('archive-messages', msgIds),
  fetchUnsubscribe: (link) => ipcRenderer.invoke('fetch-unsubscribe', link),
  
  // Labels and organization
  createLabel: (labelName, color) => ipcRenderer.invoke('create-label', labelName, color),
  getLabels: () => ipcRenderer.invoke('get-labels'),
  applyLabel: (msgIds, labelId) => ipcRenderer.invoke('apply-label', msgIds, labelId),
  
  // Filters and rules
  createFilter: (criteria, action) => ipcRenderer.invoke('create-filter', criteria, action),
  
  // Utility
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Progress updates
  onProgress: (callback) => {
    ipcRenderer.on('cleaning-progress', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('cleaning-progress');
  }
});