"use client"
// components/LiveParkingStatus.js
// Fetches parking status on the client side — only runs when a user
// is actually on the resort page, never in the background.
// Wraps ParkingBadge with a loading state and the data fetch.

import { useState, useEffect } from "react"
import ParkingBadge from "@/components/ParkingBadge"
import { Loader2 } from "lucide-react"

export default function LiveParkingStatus({ resort }) {
  const [status, setStatus] = useState(undefined) // undefined = loading
  const [error, setError] = useState(false)

  useEffect(() => {
    // "free" parking resorts don't need a live check
    if (resort.parking.type === "free") {
      setStatus("free")
      return
    }

    fetch(`/api/parking-status/${resort.slug}`)
      .then((r) => r.json())
      .then((data) => setStatus(data.status))
      .catch(() => {
        setError(true)
        setStatus(null)
      })
  }, [resort.slug, resort.parking.type])

  // Still loading
  if (status === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full"
        style={{ backgroundColor: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking...
      </span>
    )
  }

  return <ParkingBadge type={resort.parking.type} status={status} />
}
