"use client"

import { useRouter, usePathname, useParams } from "next/navigation"
import { useEffect } from "react"

export default function NextPage() {
  const pathname = usePathname()
  useEffect(() => {
    console.log("???", window.location.pathname)
  }, [])
  return (
    <div>
      <h1>Hello world</h1>
      <h2>{pathname}</h2>
    </div>
  )
}
