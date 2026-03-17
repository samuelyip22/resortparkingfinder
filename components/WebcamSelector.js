"use client"
// components/WebcamSelector.js
// Lets users pick between multiple webcams at a resort.
// Each webcam has a url (direct link) and optionally an embedUrl (iframe-safe).
// Most resort websites block iframing — if no embedUrl, we show a link button instead.

import { useState } from "react"
import { Camera, ExternalLink } from "lucide-react"

export default function WebcamSelector({ webcams }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = webcams?.[selectedIndex]

  if (!webcams || webcams.length === 0) {
    return (
      <div className="rounded-xl flex items-center justify-center h-32"
        style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No webcams available</p>
      </div>
    )
  }

  // embedUrl is a URL that can actually be iframed (e.g. CamStreamer embed).
  // url is always the direct link to the webcam page on the resort site.
  const canEmbed = Boolean(selected?.embedUrl)

  return (
    <div>
      {/* Selector tabs — one button per webcam */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Camera className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
        <span className="text-sm font-medium mr-1" style={{ color: "var(--text-secondary)" }}>
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

      {canEmbed ? (
        /* --- Resort has a working embed URL --- */
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <iframe
            key={selected.embedUrl} /* key forces re-render when camera changes */
            src={selected.embedUrl}
            title={selected.name}
            className="w-full"
            style={{ height: "320px", border: "none" }}
            loading="lazy"
            allow="autoplay; fullscreen"
          />
        </div>
      ) : (
        /* --- No embeddable URL — resort blocks iframing --- */
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 py-10"
          style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <Camera className="w-8 h-8" style={{ color: "var(--text-secondary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Live embed unavailable for {selected.name}
          </p>
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View {selected.name} webcam ↗
          </a>
        </div>
      )}
    </div>
  )
}
