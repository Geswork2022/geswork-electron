const { app, BrowserWindow, screen, Menu, Notification, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

if (process.platform === 'darwin') {
  // Ces deux lignes sont cruciales pour macOS
  app.setName('Geswork');
  // Force le changement de nom au niveau système
  app.setAboutPanelOptions({
    applicationName: 'Geswork',
    applicationVersion: app.getVersion(),
  });
}

let mainWindow;

function loadNotificationTest() {
    const notifWindow = new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    notifWindow.loadFile(path.join(__dirname, 'notification-test.html'));
}

// Configuration des mises à jour automatiques
function setupAutoUpdater() {
  // Logging pour le débogage
  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';
  
  // Vérifier les mises à jour au démarrage
  autoUpdater.checkForUpdatesAndNotify();
  
  // Vérifier périodiquement les mises à jour (toutes les 4 heures)
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);
  
  // Écouteurs d'événements pour les mises à jour
  autoUpdater.on('update-available', (info) => {
    // Informer l'utilisateur qu'une mise à jour est disponible
    const dialogOpts = {
      type: 'info',
      buttons: ['Ok'],
      title: 'Mise à jour disponible',
      message: `Une nouvelle version (${info.version}) de Geswork est disponible et sera téléchargée automatiquement.`
    };
    dialog.showMessageBox(dialogOpts);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    // Informer l'utilisateur que la mise à jour est prête à être installée
    const dialogOpts = {
      type: 'info',
      buttons: ['Redémarrer', 'Plus tard'],
      title: 'Mise à jour prête',
      message: 'Une mise à jour a été téléchargée. Redémarrez l\'application pour appliquer les changements.'
    };
    
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // Si l'utilisateur clique sur "Redémarrer"
        autoUpdater.quitAndInstall();
      }
    });
  });
  
  autoUpdater.on('error', (err) => {
    // En cas d'erreur lors de la mise à jour
    console.error('Erreur lors de la mise à jour:', err);
  });
}

app.whenReady().then(() => {
    // Créer un menu personnalisé pour macOS
    const template = [
        {
            label: 'Geswork',  // Ce label définit le nom du premier menu
            submenu: [
                { label: 'À propos de Geswork', role: 'about' },
                { type: 'separator' },
                { 
                    label: 'Tester les notifications', 
                    click: () => loadNotificationTest() 
                },
                { type: 'separator' },
                {
                    label: 'Vérifier les mises à jour',
                    click: () => {
                        autoUpdater.checkForUpdatesAndNotify();
                    }
                },
                { type: 'separator' },
                { role: 'hide', label: 'Masquer Geswork' },
                { type: 'separator' },
                { role: 'quit', label: 'Quitter Geswork' }
            ]
        },
        {
            label: 'Édition',
            submenu: [
                { role: 'undo', label: 'Annuler' },
                { role: 'redo', label: 'Rétablir' },
                { type: 'separator' },
                { role: 'cut', label: 'Couper' },
                { role: 'copy', label: 'Copier' },
                { role: 'paste', label: 'Coller' },
                { role: 'pasteAndMatchStyle', label: 'Coller et adapter le style' },
                { role: 'delete', label: 'Supprimer' },
                { role: 'selectAll', label: 'Tout sélectionner' }
            ]
        },
        // Autres menus si nécessaire
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        icon: process.platform === 'darwin' ? path.join(__dirname, 'assets/icon.icns') : path.join(__dirname, 'assets/icon.ico'),
        frame: process.platform === 'darwin' ? false : true,
        titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
        autoHideMenuBar: process.platform === 'darwin' ? false : true,
        menuBarVisible: process.platform === 'darwin' ? true : false,
        webPreferences: {
            spellcheck: true,
            additionalArguments: ['--enable-features=SharedArrayBuffer', '--enable-features=Clipboard'],
            enableRemoteModule: false,
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL('https://pro.geswork.fr');

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS(`
            .header, #header, .app-header { 
                -webkit-app-region: drag;
            }
            /* Les éléments interactifs dans la barre d'en-tête ne doivent pas être draggable */
            .header button, .header input, #header button, #header input, .app-header button, .app-header input {
                -webkit-app-region: no-drag;
            }
            /* Rendre la sidebar dragable */
            .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr {
                -webkit-app-region: drag;
            }
            /* Empêcher les éléments interactifs dans la sidebar d'être dragable */
            .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr a,
            .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr button,
            .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr input,
            .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr div {
                -webkit-app-region: no-drag;
            }
        `).catch(err => console.error('Failed to insert CSS', err));
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Configurer les mises à jour automatiques
    setupAutoUpdater();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        
        mainWindow = new BrowserWindow({
            width: width,
            height: height,
            icon: process.platform === 'darwin' ? path.join(__dirname, 'assets/icon.icns') : path.join(__dirname, 'assets/icon.ico'),
            frame: process.platform === 'darwin' ? false : true,
            titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
            autoHideMenuBar: true,
            menuBarVisible: false,
            webPreferences: {
                spellcheck: true,
                additionalArguments: ['--enable-features=SharedArrayBuffer', '--enable-features=Clipboard'],
                enableRemoteModule: false,
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        mainWindow.loadURL('https://pro.geswork.fr');
        
        // Réappliquer le CSS pour masquer la barre de titre et rendre la sidebar dragable
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.insertCSS(`
                .header, #header, .app-header { 
                    -webkit-app-region: drag;
                }
                /* Les éléments interactifs dans la barre d'en-tête ne doivent pas être draggable */
                .header button, .header input, #header button, #header input, .app-header button, .app-header input {
                    -webkit-app-region: no-drag;
                }
                /* Rendre la sidebar dragable */
                .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr {
                    -webkit-app-region: drag;
                }
                /* Empêcher les éléments interactifs dans la sidebar d'être dragable */
                .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr a,
                .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr button,
                .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr input,
                .h-screen.overflow-y-auto.scrollbar.Sidebar_scrollbar__RcHWr div {
                    -webkit-app-region: no-drag;
                }
            `).catch(err => console.error('Failed to insert CSS', err));
        });
        
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    }
});

// Fonction pour envoyer une notification
function sendNotification(title, body, icon, url) {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title,
            body: body,
            icon: icon || path.join(__dirname, 'assets/icon.png'),
            silent: false
        });
        
        // Ajouter un gestionnaire d'événement pour le clic sur la notification
        if (url) {
            notification.on('click', () => {
                // Vérifier si la fenêtre principale existe
                if (mainWindow) {
                    // Si l'URL est absolue (commence par http ou https)
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        mainWindow.loadURL(url);
                    } 
                    // Si c'est une URL relative au site déjà chargé
                    else {
                        // Obtenir l'URL actuelle
                        const currentURL = mainWindow.webContents.getURL();
                        // Extraire la base de l'URL (domaine)
                        const baseURL = new URL(currentURL).origin;
                        // Construire l'URL complète
                        const fullURL = `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
                        mainWindow.loadURL(fullURL);
                    }
                    
                    // Remettre le focus sur la fenêtre principale
                    mainWindow.focus();
                }
            });
        }
        
        notification.show();
        return true;
    }
    return false;
}

// Écouteur d'événement IPC pour les notifications
ipcMain.handle('send-notification', (event, args) => {
    const { title, body, icon, url } = args;
    return sendNotification(title, body, icon, url);
});

// Ajoutez également un écouteur IPC pour permettre à l'interface utilisateur de vérifier les mises à jour
ipcMain.handle('check-for-updates', async () => {
  if (process.env.NODE_ENV === 'development') {
    return { updateAvailable: false, message: 'Mises à jour désactivées en mode développement' };
  }
  
  try {
    return await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    return { updateAvailable: false, error: error.message };
  }
});
