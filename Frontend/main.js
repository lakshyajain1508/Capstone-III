const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_HEALTH_URL = 'http://127.0.0.1:5000/api/health';
const BACKEND_BOOT_RETRIES = 40;
const BACKEND_BOOT_RETRY_MS = 500;

let backendProcess = null;
let backendStartedByApp = false;

const localProfilePath = path.join(__dirname, '.electron-profile');
if (!fs.existsSync(localProfilePath)) {
  fs.mkdirSync(localProfilePath, { recursive: true });
}
app.setPath('userData', localProfilePath);
app.setPath('sessionData', path.join(localProfilePath, 'session'));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isBackendHealthy() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(BACKEND_HEALTH_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      return false;
    }
    const payload = await response.json();
    return payload?.status === 'ok';
  } catch {
    return false;
  }
}

function resolvePythonCommand() {
  const workspaceRoot = path.join(__dirname, '..');
  const venvPython = path.join(workspaceRoot, '.venv', 'Scripts', 'python.exe');

  if (process.platform === 'win32' && fs.existsSync(venvPython)) {
    return { command: venvPython, args: [path.join(workspaceRoot, 'Backend', 'app.py')] };
  }

  if (process.platform === 'win32') {
    const hasPython = spawnSync('where', ['python'], { shell: true }).status === 0;
    if (hasPython) {
      return {
        command: 'python',
        args: [path.join(workspaceRoot, 'Backend', 'app.py')]
      };
    }

    return {
      command: 'py',
      args: ['-3', path.join(workspaceRoot, 'Backend', 'app.py')]
    };
  }

  return {
    command: 'python3',
    args: [path.join(workspaceRoot, 'Backend', 'app.py')]
  };
}

function startBackendProcess() {
  const workspaceRoot = path.join(__dirname, '..');
  const backendCwd = path.join(workspaceRoot, 'Backend');
  const python = resolvePythonCommand();

  backendProcess = spawn(python.command, python.args, {
    cwd: backendCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  backendStartedByApp = true;

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${String(data).trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${String(data).trim()}`);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`[Backend] exited (code=${code}, signal=${signal})`);
    backendProcess = null;
  });
}

async function ensureBackendReady() {
  const alreadyHealthy = await isBackendHealthy();
  if (alreadyHealthy) {
    console.log('[Backend] Existing backend detected.');
    return;
  }

  console.log('[Backend] Not detected. Starting backend process...');
  startBackendProcess();

  for (let i = 0; i < BACKEND_BOOT_RETRIES; i += 1) {
    if (await isBackendHealthy()) {
      console.log('[Backend] Health check passed.');
      return;
    }
    await sleep(BACKEND_BOOT_RETRY_MS);
  }

  console.error('[Backend] Startup timed out. UI will still load and keep retrying from renderer.');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#f2f7ff',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // Keep debug access available even with hidden app menu.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  win.once('ready-to-show', () => {
    win.show();
    if (process.env.ELECTRON_DEBUG === '1') {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });
}

app.whenReady().then(async () => {
  await ensureBackendReady();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendStartedByApp && backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendStartedByApp && backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
