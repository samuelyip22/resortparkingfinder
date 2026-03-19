"use client"
// components/HomeCalendar.js
// Shows a compact reservation calendar on the home page.
// Displays the next 8 weekends (Sat + Sun) for Brighton, Solitude, and Park City.
// Each cell is color-coded: red = full, green = available, gray = not checked.
// Clicking a full cell takes you to that resort's page to set an alert.

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, Calendar } from "lucide-react"

export default function HomeCalendar() {
  const [data, setData] = useState(null) // { resorts: [...], entries: [...] }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/calendar/all")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  // Build a list of upcoming weekend dates (Sat + Sun) for the next 8 weekends
  function getUpcomingWeekendDates(count = 8) {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cursor = new Date(today)

    while (dates.length < count * 2) {
      const day = cursor.getDay()
      if (day === 6 || day === 0) {
        // Format as YYYY-MM-DD
        const str = cursor.toISOString().split("T")[0]
        if (str >= today.toISOString().split("T")[0]) {
          dates.push(str)
        }
      }
      cursor.setDate(cursor.getDate() + 1)
      if (cursor > new Date(today.getFullYear(), today.getMonth() + 2, 28)) break
    }
    return dates
  }

  if (loading) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Reservation Calendar
          </h2>
        </div>
        <div className="flex items-center justify-center py-8 gap-2" style={{ color: "var(--text-secondary)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading availability...</span>
        </div>
      </div>
    )
  }

  // If data failed to load or API returned an error, silently hide the section
  if (!data || !data.resorts || data.error) return null

  const weekendDates = getUpcomingWeekendDates(8)

  // Build a lookup map: { "resortId_YYYY-MM-DD": "full" | "open" | "unknown" }
  const statusMap = {}
  for (const entry of data.entries || []) {
    statusMap[`${entry.resort_id}_${entry.date}`] = entry.status
  }

  // Group weekend dates into pairs (Sat + Sun per weekend)
  const weekends = []
  for (let i = 0; i < weekendDates.length - 1; i += 2) {
    weekends.push([weekendDates[i], weekendDates[i + 1]])
  }

  function formatShortDate(dateStr) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  function getDayName(dateStr) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Reservation Calendar
          </h2>
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Brighton · Solitude · Park City
        </p>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Upcoming weekend availability for reserved parking. Click a{" "}
        <span className="text-red-600 font-medium">red cell</span> to get notified when a spot opens.
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block bg-red-100 border border-red-300" />
          <span style={{ color: "var(--text-secondary)" }}>Full</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block bg-green-100 border border-green-300" />
          <span style={{ color: "var(--text-secondary)" }}>Available</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }} />
          <span style={{ color: "var(--text-secondary)" }}>Not yet checked</span>
        </span>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ minWidth: "420px" }}>
          <thead>
            <tr>
              {/* Weekend date column headers */}
              <th className="text-left py-2 pr-3 font-medium w-20" style={{ color: "var(--text-secondary)" }}>
                Weekend
              </th>
              {/* Resort column headers */}
              {data.resorts.map((resort) => (
                <th key={resort.id} className="py-2 px-2 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                  <Link href={`/resort/${resort.slug}`} className="hover:underline">
                    {resort.shortName}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekends.map(([satDate, sunDate]) => (
              // Each weekend = two rows (Sat + Sun)
              [satDate, sunDate].map((dateStr, di) => {
                const isSat = di === 0
                return (
                  <tr
                    key={dateStr}
                    style={{ borderTop: isSat ? "1px solid var(--border)" : "none" }}
                  >
                    {/* Date label */}
                    <td
                      className="py-1.5 pr-3 font-medium whitespace-nowrap"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {getDayName(dateStr)}
                      </span>{" "}
                      {formatShortDate(dateStr)}
                    </td>

                    {/* One cell per resort */}
                    {data.resorts.map((resort) => {
                      const status = statusMap[`${resort.id}_${dateStr}`]
                      const isFull = status === "full"
                      const isOpen = status === "open"

                      let bg, textColor, borderColor
                      if (isFull) {
                        bg = "#fef2f2"; textColor = "#dc2626"; borderColor = "#fecaca"
                      } else if (isOpen) {
                        bg = "#f0fdf4"; textColor = "#16a34a"; borderColor = "#bbf7d0"
                      } else {
                        bg = "var(--bg)"; textColor = "var(--text-secondary)"; borderColor = "var(--border)"
                      }

                      const cell = (
                        <td key={resort.id} className="py-1.5 px-2 text-center">
                          <span
                            className="inline-block rounded px-2 py-0.5 font-medium w-full text-center"
                            style={{ backgroundColor: bg, color: textColor, border: `1px solid ${borderColor}` }}
                          >
                            {isFull ? "Full" : isOpen ? "Open" : "—"}
                          </span>
                        </td>
                      )

                      // Wrap full cells in a link to the resort page calendar
                      if (isFull) {
                        return (
                          <td key={resort.id} className="py-1.5 px-2 text-center">
                            <Link href={`/resort/${resort.slug}#parking-calendar`}>
                              <span
                                className="inline-block rounded px-2 py-0.5 font-medium w-full text-center cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: bg, color: textColor, border: `1px solid ${borderColor}` }}
                                title="Click to set an alert on the resort page"
                              >
                                Full
                              </span>
                            </Link>
                          </td>
                        )
                      }

                      return cell
                    })}
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
        Gray cells haven't been checked yet — status populates as alerts are set and the checker runs.
      </p>
    </div>
  )
}
