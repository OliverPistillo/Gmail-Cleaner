const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  authenticate: () => ipcRenderer.invoke('authenticate'),
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  
  // Gmail operations
  getNewsletters: (maxResults) => ipcRenderer.invoke('get-newsletters', maxResults),
  getEmailMetadata: (msgId) => ipcRenderer.invoke('get-email-metadata', msgId),
  deleteMessages: (msgIds) => ipcRenderer.invoke('delete-messages', msgIds),
  fetchUnsubscribe: (link) => ipcRenderer.invoke('fetch-unsubscribe', link),
  
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