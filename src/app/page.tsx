"use client"

import { StrategyConfig } from "service/strategy/fetchStrategiesFromNotion"
import { useEffect, useState } from "react"
import { Database } from "service/data/data"

declare global {
  interface Window {
    electronAPI: {
      getCache: () => Promise<{ db: Database | null; strategies: StrategyConfig[] | null }>
      onInitDB: (cb: (db: Database) => void) => void
      onInitStrategies: (cb: (registries: StrategyConfig[]) => void) => void
      onTick: (cb: (time: number, db: Database) => void) => void
    }
  }
}

export default function Home() {
  const [db, setDB] = useState<Database | null>()
  const [strategies, setStrategies] = useState<StrategyConfig[] | null>()
  const [minutes, setMinutes] = useState(0)
  useEffect(() => {
    window.electronAPI.getCache().then((initCache) => {
      console.log(initCache)
      setDB(initCache.db)
      setStrategies(initCache.strategies)
    })
    window.electronAPI.onInitStrategies((result) => {
      console.log("strategies", result)
      setStrategies(result)
    })
    window.electronAPI.onInitDB((db) => {
      console.log("db", db)
      setDB(db)
    })
    window.electronAPI.onTick((time, db) => {
      setMinutes(time)
      setDB(db)
    })
  }, [])
  console.log(strategies, minutes, db)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {db && (
        <table className="table">
          <tbody>
            {Object.entries(db).map(([code, data]) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{data[1].at(-1)?.join(",")}</td>
                <td>{data[5].at(-1)?.join(",")}</td>
                <td>{data[30].at(-1)?.join(",")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
