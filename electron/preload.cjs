const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  openUrl: (url) => ipcRenderer.invoke("shell:open-url", url),
  getPywalColors: () => ipcRenderer.invoke("pywal:get-colors"),
  getPywalMtime: () => ipcRenderer.invoke("pywal:get-mtime"),
});
