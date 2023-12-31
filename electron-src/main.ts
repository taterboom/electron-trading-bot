// main.js

// Modules to control application life and create native browser window
require("dotenv").config()
import { app, BrowserWindow, ipcMain } from "electron"
import fs from "node:fs/promises"
import path from "path"
import { run } from "../service"

console.log("---", app.getPath("appData"), "---", app.getPath("userData"), "---", app.getAppPath())
const CACHE_FILE_PATH = "./db.json"
// /Users/xueyong/Library/Application Support/Electron/db.json
const cacheFilePath = path.join(app.getPath("userData"), CACHE_FILE_PATH)

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:3000")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const cache = {
    strategies: null as any,
    db: null as any,
  }

  ipcMain.handle("get-cache", () => cache)

  const mainWindow = createWindow()

  run({
    writeDB: (content) => fs.writeFile(cacheFilePath, content, "utf-8"),
    readDB: () => fs.readFile(cacheFilePath, "utf-8"),
    onTick: (time, db) => {
      mainWindow.webContents.send("tick", time, db)
    },
    onInit: (db) => {
      cache.db = db
      mainWindow.webContents.send("init-db", db)
    },
  }).then((result) => {
    cache.strategies = result
    mainWindow.webContents.send("init-strategies", result)
  })

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
