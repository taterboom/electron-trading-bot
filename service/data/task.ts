import dayjs, { Dayjs } from "dayjs"
import bt from "dayjs/plugin/isBetween"
import { startCron } from "../utils/cron"
import { log } from "../utils/log"
import { Database, fetchAndSave, initDB, saveDB } from "./data"

dayjs.extend(bt)

const BASE_INTERVAL = 60 * 1000

type Options = {
  onTick?: (minutes: number, db: Database) => void
  onInit?: (db: Database) => void
  write: (content: string) => any
  read: () => any
}

async function run(codes: string[], options: Options) {
  const now = dayjs()
  log("run")
  const start1 = now.startOf("minute").set("hour", 9).set("minute", 30)
  const end1 = now.startOf("minute").set("hour", 11).set("minute", 30)
  const start2 = now.startOf("minute").set("hour", 13).set("minute", 0)
  const end2 = now.startOf("minute").set("hour", 19).set("minute", 0)

  const inTradingTime = (time: Dayjs) =>
    time.isBetween(start1, end1) || time.isBetween(start2, end2)

  if (inTradingTime(now)) {
    log("running")
    // TODO init db based on strategies codes
    initDB(options).then((db) => {
      options.onInit?.(db)
    })

    const id = setInterval(() => {
      const now = dayjs()
      if (inTradingTime(now)) {
        const minutes = now.minute()
        fetchAndSave(minutes, codes).then((db) => {
          if (db) {
            options.onTick?.(minutes, db)
            saveDB(options)
          }
        })
      } else {
        log("stop")
        clearInterval(id)
      }
    }, BASE_INTERVAL)
  }
}

export function start(codes: string[], options: Options) {
  // now
  run(codes, options)
  // cron
  startCron(() => run(codes, options))
}
