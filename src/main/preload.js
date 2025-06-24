const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  
  // Menu navigation
  onNavigateTo: (callback) => {
    ipcRenderer.on('navigate-to', callback);
  },
  
  // File operations from menu
  onMenuNew: (callback) => {
    ipcRenderer.on('menu-new', callback);
  },
  
  onMenuOpen: (callback) => {
    ipcRenderer.on('menu-open', callback);
  },
  
  // Cleanup listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
}); 