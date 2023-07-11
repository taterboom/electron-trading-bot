// import fs from "node:fs/promises"
import { Database } from "./data/data"
import { run as runService } from "./service"
import { StrategyConfig, getStrategies } from "./strategy/fetchStrategiesFromNotion"
import { mailer } from "./utils/mailer"
import { displayNotificationOnMac } from "./utils/notify"

export function run(options: {
  writeDB: (content: string) => any
  readDB: () => any
  getStrategies?: (...args: any[]) => Promise<StrategyConfig[]>
  onTick?: (time: number, db: Database) => void
  onInit?: (db: Database) => void
  onMonitorWarn?: (warningInfo: { title: string; body: string; raw: any }) => void
  onStrategyAchieved?: (result: { title: string; body: string; raw: any }) => void
}) {
  return runService({
    writeDB: options.writeDB, // ((content: string) => fs.writeFile("./db.json", content, "utf-8")),
    readDB: options.readDB, // (() => fs.readFile("./db.json", "utf-8")),
    onInit: options.onInit,
    onTick: options.onTick,
    onMonitorWarn: (result) => {
      displayNotificationOnMac(result.title, result.body)
      options.onMonitorWarn?.(result)
    },
    onStrategyAchieved: (result) => {
      mailer(result.title, result.body)
      options.onStrategyAchieved?.(result)
    },
    getStrategies: options.getStrategies || getStrategies,
  })
}
