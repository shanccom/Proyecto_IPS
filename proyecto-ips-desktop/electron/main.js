const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;
let frontendProcess;

// Configurar variables de entorno para Django
process.env.DJANGO_SETTINGS_MODULE = 'OP_SYSTEM.settings';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Configurar menú de la aplicación
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de',
          click: () => {
            shell.openExternal('https://tu-sitio-web.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    // En desarrollo, cargar desde el servidor de desarrollo
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar archivos locales
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Abrir enlaces externos en el navegador por defecto
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startBackend() {
  if (isDev) {
    return; // En desarrollo, el backend se inicia por separado
  }

  const backendPath = path.join(__dirname, '../backend');
  const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python3';
  
  backendProcess = spawn(pythonExecutable, ['manage.py', 'runserver', '127.0.0.1:8000'], {
    cwd: backendPath,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});