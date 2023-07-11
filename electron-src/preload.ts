import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  onTick: (callback: (...args: any[]) => void) => {
    ipcRenderer.on("tick", (e, ...args: any[]) => {
      callback(...args)
    })
  },
  onInitStrategies: (callback: (...args: any[]) => void) => {
    ipcRenderer.on("init-strategies", (e, ...args: any[]) => {
      console.log(args, "args")
      callback(...args)
    })
  },
  onInitDB: (callback: (...args: any[]) => void) => {
    ipcRenderer.on("init-db", (e, ...args: any[]) => {
      console.log(args, "args")
      callback(...args)
    })
  },
  getCache: () => ipcRenderer.invoke("get-cache"),
})
