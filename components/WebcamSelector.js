"use client"
// components/WebcamSelector.js
// Lets users pick between multiple webcams at a resort.
// Shows the selected webcam in an iframe embed.

import { useState } from "react"
import { Camera } from "lucide-react"

export default function WebcamSelector({ webcams }) {
  // Track which webcam the user has selected (default: first one)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = webcams[selectedIndex]

  if (!webcams || webcams.length === 0) {
    return (
      <div className="rounded-2xl flex items-center justify-center h-48"
        style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No webcams available</p>
      </div>
    )
  }

  return (
    <div>
      {/* Webcam selector tabs */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Camera className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
        <span className="text-sm font-medium mr-2" style={{ color: "var(--text-secondary)" }}>
          Webcam:
        </span>
        {webcams.map((cam, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="text-sm px-3 py-1 rounded-full transition-colors"
            style={
              i === selectedIndex
                ? { backgroundColor: "var(--accent)", color: "white" }
                : { backgroundColor: "var(--bg)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            {cam.name}
          </button>
        ))}
      </div>

      {/* Webcam embed — opens the resort's webcam page in an iframe */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <iframe
          src={selected.url}
          title={selected.name}
          className="w-full"
          style={{ height: "320px", border: "none" }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Fallback link if iframe blocks */}
      <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
        Webcam not loading?{" "}
        <a
          href={selected.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)" }}
          className="underline"
        >
          Open {selected.name} webcam directly ↗
        </a>
      </p>
    </div>
  )
}
