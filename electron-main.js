const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  if (autoUpdater) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
  }
} catch (e) {
  console.warn('[AutoUpdater] Módulo autoUpdater não carregado:', e.message);
}

// Otimizações de Desempenho do Chromium / Electron Executável (Estilo Discord / Notion)
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('num-raster-threads', '4');

// Iniciar o servidor local se estiver em produção (empacotado)
if (app.isPackaged) {
  try {
    const { start: startServer } = require('./server.js');
    startServer().catch(err => {
      console.error('Falha ao iniciar o servidor Express local:', err);
    });
  } catch (err) {
    console.error('Erro ao carregar o servidor local:', err);
  }
}

// URL Principal do Aplicativo (Sempre local na Opção 1 autônoma)
const TARGET_URL = process.env.APP_URL || 'http://localhost:3000';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 768,
    title: "Tomada Planner",
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    show: false,
    backgroundColor: '#FAF8F5',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.maximize();

  // Tratamento de Janelas e Links Externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Permitir janelas de autenticação do Google Identity / OAuth nativamente no Chromium
    if (url.includes('accounts.google.com') || url.includes('google.com/gsi')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        }
      };
    }
    // Para autenticação do YouTube ou links externos genéricos, abrir no navegador padrão
    if (url.includes('/api/youtube/auth') || (url.startsWith('http') && !url.includes('localhost:3000') && !url.includes('tomada-seven.vercel.app'))) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Exibir janela suavemente quando pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Ocultar menu padrão para um visual limpo estilo Discord
  Menu.setApplicationMenu(null);

  // Carregar a URL da aplicação
  mainWindow.loadURL(TARGET_URL);

  // Reconexão automática em caso de queda de rede
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log(`Falha ao carregar URL (${errorDescription}). Tentando reconectar...`);
    setTimeout(() => {
      if (mainWindow) mainWindow.loadURL(TARGET_URL);
    }, 2000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  if (autoUpdater) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify().catch(err => {
        console.warn('[AutoUpdater] Erro ao buscar atualizações:', err.message);
      });
    }, 6000);
  }
});

// Eventos de IPC
ipcMain.on('app-restart-install', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.on('open-external-url', (event, url) => {
  shell.openExternal(url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
