"use client"
// app/alerts/page.js
// The alerts page — users enter their email, pick a resort, pick a date,
// and we watch that resort's parking page for them.
//
// This is a "client component" (note "use client" at the top) because it has
// interactive form state. The actual alert saving is done via an API route
// we'll build when we wire up Supabase.

import { useState } from "react"
import Link from "next/link"
import { resorts } from "@/lib/resorts"
import { Bell, CheckCircle, ArrowLeft, Info, Car } from "lucide-react"

export default function AlertsPage() {
  // Form state — tracks what the user has typed/selected
  const [email, setEmail] = useState("")
  const [resortId, setResortId] = useState("")
  const [date, setDate] = useState("")
  const [status, setStatus] = useState("idle") // "idle" | "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("")

  // Only show resorts with live parking data that can actually be monitored.
  // HONK resorts (Brighton, Solitude, Park City) use the calendar on their own pages.
  // Free resorts (Deer Valley) and reservation-only (Alta) can't be tracked live.
  const trackableResorts = resorts.filter((r) =>
    ["live-meter", "live-status"].includes(r.parking.type)
  )

  // Get the selected resort object so we can show its info
  const selectedResort = resorts.find((r) => r.id === resortId)

  // Calculate the min date (today) and max date (end of ski season ~April 30)
  const today = new Date().toISOString().split("T")[0]
  const maxDate = "2026-04-30"

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      // POST to our API route (we'll build this when Supabase is connected)
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resortId, date }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Something went wrong. Please try again.")
      }

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err.message)
    }
  }

  // Success screen
  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--accent-light)" }}>
          <CheckCircle className="w-8 h-8" style={{ color: "var(--accent)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Alert Set!
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          We'll email <strong>{email}</strong> the moment parking opens at{" "}
          <strong>{selectedResort?.name}</strong> on <strong>{new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong>.
        </p>
        <p className="text-xs mb-8" style={{ color: "var(--text-secondary)" }}>
          We check every 5 minutes. Spots typically open due to cancellations 1–8 weeks before the date.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setStatus("idle"); setEmail(""); setDate("") }}
            className="py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            Set Another Alert
          </button>
          <Link href="/" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            ← Back to Resorts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="w-4 h-4" />
        All Resorts
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-light)" }}>
            <Bell className="w-5 h-5" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Parking Alerts
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Get an email the moment a parking spot opens for your date. We check every 5 minutes — you'll know before anyone else.
        </p>
      </div>

      {/* How it works banner */}
      <div className="rounded-xl p-4 mb-6 flex gap-3"
        style={{ backgroundColor: "var(--accent-light)", border: "1px solid var(--accent)" }}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
        <div className="text-sm" style={{ color: "var(--accent)" }}>
          <strong>How it works:</strong> Most resort parking fills 4–8 weeks in advance. When someone cancels, their spot briefly opens — we catch it and email you within 5 minutes.
        </div>
      </div>

      {/* Alert form */}
      <form onSubmit={handleSubmit} className="card rounded-2xl p-6 flex flex-col gap-5">

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
            Your email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              "--tw-ring-color": "var(--accent)",
            }}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            We only use this to send parking alerts. No spam, ever.
          </p>
        </div>

        {/* Resort selector */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
            Resort
          </label>
          <select
            required
            value={resortId}
            onChange={(e) => setResortId(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all appearance-none"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: resortId ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <option value="">Select a resort...</option>
            {trackableResorts.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.pass.toUpperCase()} Pass)
              </option>
            ))}
          </select>
        </div>

        {/* Show parking info for selected resort */}
        {selectedResort && (
          <div className="rounded-xl p-3 flex gap-2"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
            <Car className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--text-secondary)" }} />
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{selectedResort.name} parking:</strong>{" "}
              {selectedResort.parking.notes}
            </div>
          </div>
        )}

        {/* Date picker */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
            Date you want to park
          </label>
          <input
            type="date"
            required
            value={date}
            min={today}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="text-sm rounded-xl px-4 py-3 bg-red-50 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "var(--accent)", color: "white" }}
        >
          <Bell className="w-4 h-4" />
          {status === "loading" ? "Setting alert..." : "Notify Me When Parking Opens"}
        </button>

        <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          Alerts auto-cancel after your date passes. You can set alerts for multiple dates or resorts.
        </p>
      </form>
    </div>
  )
}
