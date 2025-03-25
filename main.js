const { app, BrowserWindow, screen, Menu, Notification, ipcMain } = require('electron');
const path = require('path');

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

app.whenReady().then(() => {
    // Créer un menu personnalisé pour macOS
    if (process.platform === 'darwin') {
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
                    { role: 'hide', label: 'Masquer Geswork' },
                    { type: 'separator' },
                    { role: 'quit', label: 'Quitter Geswork' }
                ]
            },
            // Autres menus si nécessaire
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

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
function sendNotification(title, body, icon) {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title,
            body: body,
            icon: icon || path.join(__dirname, 'assets/icon.png'),
            silent: false
        });
        
        notification.show();
        return true;
    }
    return false;
}

// Écouteur d'événement IPC pour les notifications
ipcMain.handle('send-notification', (event, args) => {
    const { title, body, icon } = args;
    return sendNotification(title, body, icon);
});
