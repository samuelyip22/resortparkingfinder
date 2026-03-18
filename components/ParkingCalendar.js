"use client"
// components/ParkingCalendar.js
// Displays a 2-month calendar grid showing parking availability by date.
// Red = full/booked out, Green = available, Gray = not yet checked.
// Clicking a red date reveals an inline alert signup form.
// Only shown for resorts that use a reservation system (HONK).

import { useState, useEffect } from "react"
import { Bell, CheckCircle, Loader2 } from "lucide-react"

// Short day-of-week headers for the grid
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function ParkingCalendar({ resort }) {
  // Map of "YYYY-MM-DD" → "full" | "open" | "unknown"
  const [calendarData, setCalendarData] = useState({})
  const [loadingCalendar, setLoadingCalendar] = useState(true)

  // Which date the user clicked (null = none selected)
  const [selectedDate, setSelectedDate] = useState(null)

  // Alert form state
  const [alertEmail, setAlertEmail] = useState("")
  const [alertStatus, setAlertStatus] = useState("idle") // "idle" | "loading" | "success" | "error"
  const [alertError, setAlertError] = useState("")

  // Only show the calendar for HONK (reservation-based) resorts
  if (resort.parking.type !== "honk") return null

  // ── Fetch calendar data from our API on mount ──────────────────────────────
  useEffect(() => {
    fetch(`/api/calendar/${resort.slug}`)
      .then((r) => r.json())
      .then((data) => {
        // Convert the array of { date, status } into a lookup map
        const map = {}
        for (const entry of data.entries || []) {
          map[entry.date] = entry.status
        }
        setCalendarData(map)
      })
      .catch(() => {
        // Silently fail — calendar just shows all-gray if data unavailable
      })
      .finally(() => setLoadingCalendar(false))
  }, [resort.slug])

  // ── Date helpers ───────────────────────────────────────────────────────────

  // Format a year/month/day into "YYYY-MM-DD"
  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  // Returns today's date string "YYYY-MM-DD" for comparison
  const todayStr = new Date().toISOString().split("T")[0]

  // Build the two months to display (current + next)
  const now = new Date()
  const months = [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
  ]

  // ── Alert form submit ──────────────────────────────────────────────────────
  async function handleAlertSubmit(e) {
    e.preventDefault()
    setAlertStatus("loading")
    setAlertError("")

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail,
          resortId: resort.id,
          date: selectedDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to set alert")
      setAlertStatus("success")
    } catch (err) {
      setAlertStatus("error")
      setAlertError(err.message)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section header */}
      <h2
        className="text-lg font-semibold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Parking Calendar
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Click a{" "}
        <span className="font-medium text-red-600">red date</span> to get
        notified when a spot opens up.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-5 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block bg-red-100 border border-red-300" />
          <span style={{ color: "var(--text-secondary)" }}>Full — notifications available</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block bg-green-100 border border-green-300" />
          <span style={{ color: "var(--text-secondary)" }}>Available</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded inline-block"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
          />
          <span style={{ color: "var(--text-secondary)" }}>Not yet checked</span>
        </span>
      </div>

      {/* Calendar months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {months.map((monthDate) => {
          const year = monthDate.getFullYear()
          const month = monthDate.getMonth()
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const firstDayOfWeek = new Date(year, month, 1).getDay()
          const monthLabel = monthDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })

          return (
            <div key={`${year}-${month}`}>
              {/* Month title */}
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {monthLabel}
              </p>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs py-0.5 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {/* Empty padding cells before the 1st */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = formatDate(year, month, day)
                  const status = calendarData[dateStr] // "full" | "open" | "unknown" | undefined
                  const isPast = dateStr < todayStr
                  const isFull = status === "full"
                  const isOpen = status === "open"
                  const isSelected = selectedDate === dateStr

                  // Style each cell based on status
                  let bg, textColor, borderColor, cursor
                  if (isPast) {
                    bg = "transparent"
                    textColor = "var(--text-secondary)"
                    borderColor = "transparent"
                    cursor = "default"
                  } else if (isFull) {
                    bg = "#fef2f2"
                    textColor = "#dc2626"
                    borderColor = isSelected ? "#dc2626" : "#fecaca"
                    cursor = "pointer"
                  } else if (isOpen) {
                    bg = "#f0fdf4"
                    textColor = "#16a34a"
                    borderColor = "#bbf7d0"
                    cursor = "default"
                  } else {
                    // Unknown / not checked
                    bg = "var(--bg)"
                    textColor = "var(--text-secondary)"
                    borderColor = "var(--border)"
                    cursor = "default"
                  }

                  return (
                    <button
                      key={day}
                      disabled={!isFull || isPast}
                      onClick={() => {
                        if (!isFull || isPast) return
                        // Toggle the selected date — clicking the same date deselects it
                        setSelectedDate(selectedDate === dateStr ? null : dateStr)
                        setAlertStatus("idle")
                        setAlertEmail("")
                        setAlertError("")
                      }}
                      className="aspect-square rounded text-xs font-medium flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: bg,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        cursor,
                        opacity: isPast ? 0.3 : 1,
                        // Highlight ring when selected
                        outline: isSelected ? "2px solid #dc2626" : "none",
                        outlineOffset: "1px",
                      }}
                      title={
                        isFull
                          ? "Full — click to set an alert"
                          : isOpen
                          ? "Available"
                          : "Not yet checked"
                      }
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading spinner shown while fetching calendar data */}
      {loadingCalendar && (
        <div className="flex items-center justify-center py-4 mt-2">
          <Loader2
            className="w-4 h-4 animate-spin mr-2"
            style={{ color: "var(--text-secondary)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Loading availability...
          </span>
        </div>
      )}

      {/* Note about gray dates */}
      {!loadingCalendar && (
        <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
          Gray dates haven't been checked yet. Status updates automatically as alerts are set and checked.
        </p>
      )}

      {/* ── Inline alert form — slides in when a full date is selected ── */}
      {selectedDate && (
        <div
          className="mt-5 rounded-xl p-5"
          style={{ border: "1px solid #fecaca", backgroundColor: "#fff5f5" }}
        >
          {alertStatus === "success" ? (
            // ── Success state ──
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold" style={{ color: "#166534" }}>
                Alert set!
              </p>
              <p className="text-sm mt-1" style={{ color: "#15803d" }}>
                We'll email you the moment a spot opens on{" "}
                <strong>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}
                </strong>
                .
              </p>
              <button
                className="mt-3 text-xs underline"
                style={{ color: "#dc2626" }}
                onClick={() => {
                  setSelectedDate(null)
                  setAlertStatus("idle")
                  setAlertEmail("")
                }}
              >
                Set another alert
              </button>
            </div>
          ) : (
            // ── Form state ──
            <>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm font-semibold text-red-800">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}{" "}
                  is fully booked
                </p>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Enter your email and we'll notify you the moment a cancellation opens up.
              </p>

              <form
                onSubmit={handleAlertSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    border: "1px solid #fecaca",
                    backgroundColor: "white",
                    color: "#1a1a1a",
                  }}
                />
                <button
                  type="submit"
                  disabled={alertStatus === "loading"}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5 disabled:opacity-60 shrink-0"
                  style={{ backgroundColor: "#dc2626" }}
                >
                  {alertStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  Notify Me
                </button>
              </form>

              {alertStatus === "error" && (
                <p className="text-xs text-red-700 mt-2">{alertError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
