import { pick } from "lodash"
import { Database } from "./data/data"
import { start } from "./data/task"
import { execute } from "./strategy"
import { StrategyConfig } from "./strategy/fetchStrategiesFromNotion"
import { monitor } from "./utils/monitor"

export async function run(options: {
  writeDB: (content: string) => any
  readDB: () => any
  getStrategies: (...args: any[]) => Promise<StrategyConfig[]>
  onTick?: (time: number, db: Database) => void
  onInit?: (db: Database) => void
  onMonitorWarn?: (warningInfo: { title: string; body: string; raw: any }) => void
  onStrategyAchieved?: (result: { title: string; body: string; raw: any }) => void
}) {
  const strategies = await options.getStrategies()
  const codes = strategies.map((strategy: any) => strategy.code)
  const tick = (time: number, db: Database) => {
    options.onTick?.(time, db)
    const warningInfo = monitor(time, pick(db, codes))
    if (warningInfo) {
      options.onMonitorWarn?.(warningInfo)
    }
    execute({
      time,
      db,
      strategies,
      onOk: (result) => {
        if (result) {
          options.onStrategyAchieved?.(result)
        }
      },
    })
  }
  start(codes, {
    onTick: tick,
    onInit: options.onInit,
    read: options.readDB,
    write: options.writeDB,
  })
  return strategies
}
