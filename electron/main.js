import { app, BrowserWindow, ipcMain, shell } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Disable Google network location provider (requires API key we don't have)
app.commandLine.appendSwitch("disable-background-networking");

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#1a1b26",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const distPath = join(__dirname, "..", "dist", "index.html");
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL("http://localhost:1420");
  }

  // Clear Chromium cache on start
  const ses = mainWindow.webContents.session;
  ses.clearCache().catch(() => {});
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC Handlers ---

ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle("window:close", () => mainWindow?.close());

ipcMain.handle("shell:open-url", async (_event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle("pywal:get-colors", async () => {
  const home = os.homedir();
  const path = join(home, ".cache", "wal", "colors.json");
  try {
    const content = fs.readFileSync(path, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
});

ipcMain.handle("pywal:get-mtime", async () => {
  const home = os.homedir();
  const path = join(home, ".cache", "wal", "colors.json");
  try {
    const stat = fs.statSync(path);
    return Math.floor(stat.mtimeMs / 1000);
  } catch {
    return 0;
  }
});
