const { app, BrowserWindow, screen, Menu } = require('electron');
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

app.whenReady().then(() => {
    // Créer un menu personnalisé pour macOS
    if (process.platform === 'darwin') {
        const template = [
            {
                label: 'Geswork',  // Ce label définit le nom du premier menu
                submenu: [
                    { label: 'À propos de Geswork', role: 'about' },
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
        icon: path.join(__dirname, 'assets/icon.ico'), // Windows
        frame: false,
        titleBarStyle: 'hidden',
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
            icon: path.join(__dirname, 'assets/icon.icns'), // macOS
            frame: false,
            titleBarStyle: 'hidden',
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
