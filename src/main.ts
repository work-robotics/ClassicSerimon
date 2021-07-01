// Copyright 2021 Work Robotics Co., Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { app, BrowserWindow } from "electron";
import { client } from "electron-connect";
const contextMenu = require("electron-context-menu");
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
    height: 515,
    minHeight: 515,
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

  var isDev = process.env.NODE_ENV ? process.env.NODE_ENV.trim() == "development" : false;
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
