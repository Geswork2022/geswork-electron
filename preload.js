const { contextBridge, ipcRenderer } = require('electron');

// Exposez des fonctionnalités de l'API Electron au navigateur
contextBridge.exposeInMainWorld('electron', {
  // Autres fonctions que vous pourriez avoir...
  
  // Fonction pour créer une région de drag
  createDragRegion: (selector) => {
    document.addEventListener('DOMContentLoaded', () => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.webkitAppRegion = 'drag';
      }
    });
  },

  // Exposer les fonctions de notification dans un sous-objet
  notification: {
    sendNotification: async (title, body, icon, url) => {
      return await ipcRenderer.invoke('send-notification', { title, body, icon, url });
    }
  },
  clipboard: {
    readText: () => clipboard.readText(),
    writeText: (text) => clipboard.writeText(text)
  },
  
  // Ajouter les fonctions de mise à jour
  updater: {
    checkForUpdates: async () => {
      return await ipcRenderer.invoke('check-for-updates');
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
    const applyPadding = () => {
        const targetDiv = document.querySelector('.h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr');
        if (targetDiv) {
            targetDiv.style.paddingTop = '20px';
        }
    };

    // Exécute immédiatement après le chargement initial
    applyPadding();

    // Observe les changements dans le DOM au cas où la div est chargée plus tard
    const observer = new MutationObserver(() => applyPadding());
    observer.observe(document.body, { childList: true, subtree: true });
});