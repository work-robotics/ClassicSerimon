import { app, BrowserWindow } from "electron";
import { client } from "electron-connect";
const contextMenu = require("electron-context-menu");
const isDev = require("electron-is-dev");
const Store = require("electron-store");

contextMenu({
  prepend: (params, browserWindow) => [
    {
      role: "Copy",
    },
  ],
});

function createWindow() {
  Store.initRenderer();
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 500,
    minWidth: 800,
    useContentSize: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  // window.webContents.openDevTools();
  window.setMenu(null);
  window.loadFile("dist/contents/index.html");

  if (isDev) {
    client.create(window);
  }
}

app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
