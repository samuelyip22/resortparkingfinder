"use client"
// components/DistanceBadge.js
// Compact distance display for resort cards on the home page.
// Shows "~X mi away" using browser GPS + Haversine formula. No API key needed.

import { useState, useEffect } from "react"

// Same Haversine formula as DistanceTracker — calculates straight-line miles
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function DistanceBadge({ coordinates }) {
  const [distance, setDistance] = useState(null)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!coordinates || !navigator.geolocation) {
      setTried(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const miles = haversineDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          coordinates.lat,
          coordinates.lng
        )
        setDistance(Math.round(miles))
        setTried(true)
      },
      () => setTried(true), // silently fail — don't clutter the card with errors
      { timeout: 6000, maximumAge: 300000 }
    )
  }, [coordinates])

  // Don't render anything if location failed or isn't ready yet
  if (!tried || distance === null) return null

  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
      📍 ~{distance} mi away
    </span>
  )
}
