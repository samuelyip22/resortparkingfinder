"use client"
// components/DistanceTracker.js
// Shows the driving distance from the user's current location to a resort.
// Uses the browser's built-in GPS (navigator.geolocation) — no API key needed.
// Distance is calculated as straight-line (as the crow flies) using the Haversine formula,
// then a "Get Directions" button links to Google Maps for actual driving directions.

import { useState, useEffect } from "react"

// --- Haversine formula ---
// Calculates straight-line distance between two GPS coordinates in miles.
// Think of it like measuring distance on a globe with a string.
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function DistanceTracker({ resort }) {
  const [distance, setDistance] = useState(null)   // miles from user to resort
  const [status, setStatus] = useState("idle")      // idle | loading | success | denied | unavailable

  // Ask the browser for the user's location when this component loads
  useEffect(() => {
    if (!resort?.coordinates) return
    if (!navigator.geolocation) {
      setStatus("unavailable")
      return
    }

    setStatus("loading")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success — calculate straight-line distance
        const miles = haversineDistance(
          position.coords.latitude,
          position.coords.longitude,
          resort.coordinates.lat,
          resort.coordinates.lng
        )
        setDistance(Math.round(miles))
        setStatus("success")
      },
      (error) => {
        // User denied location access, or another error
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied")
        } else {
          setStatus("unavailable")
        }
      },
      { timeout: 8000, maximumAge: 300000 } // cache location for 5 minutes
    )
  }, [resort])

  // Build a Google Maps directions URL from the user's location to the resort
  const directionsUrl = resort?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${resort.coordinates.lat},${resort.coordinates.lng}&travelmode=driving`
    : "#"

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Map pin icon */}
      <span className="text-lg">📍</span>

      <div className="flex-1">
        {status === "idle" && (
          <span style={{ color: "var(--text-secondary)" }}>Calculating distance...</span>
        )}
        {status === "loading" && (
          <span style={{ color: "var(--text-secondary)" }}>Getting your location...</span>
        )}
        {status === "success" && distance !== null && (
          <>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              ~{distance} miles away
            </span>
            <span className="ml-1" style={{ color: "var(--text-secondary)" }}>
              (straight-line from your location)
            </span>
          </>
        )}
        {status === "denied" && (
          <span style={{ color: "var(--text-secondary)" }}>
            Location access denied — enable in browser settings to see distance
          </span>
        )}
        {status === "unavailable" && (
          <span style={{ color: "var(--text-secondary)" }}>Distance unavailable</span>
        )}
      </div>

      {/* Google Maps directions button — always shown */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
      >
        Directions ↗
      </a>
    </div>
  )
}
