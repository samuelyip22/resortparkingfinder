// app/api/calendar/all/route.js
// GET /api/calendar/all
// Returns parking calendar data for all HONK (reservation) resorts at once.
// Used by the HomeCalendar component to show a unified availability overview.

import { supabase } from "@/lib/supabase"
import { resorts } from "@/lib/resorts"
import { NextResponse } from "next/server"

export async function GET() {
  // Only HONK resorts have date-specific reservation data
  const honkResorts = resorts.filter((r) => r.parking.type === "honk")
  const honkIds = honkResorts.map((r) => r.id)

  const today = new Date().toISOString().split("T")[0]
  const endOfSeason = "2026-04-30"

  const { data, error } = await supabase
    .from("parking_calendar")
    .select("resort_id, date, status, checked_at")
    .in("resort_id", honkIds)
    .gte("date", today)
    .lte("date", endOfSeason)
    .order("date", { ascending: true })

  if (error) {
    console.error("Calendar/all fetch error:", error)
    return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 })
  }

  // Return both the entries and the resort metadata so the UI can label columns
  return NextResponse.json({
    resorts: honkResorts.map((r) => ({
      id: r.id,
      name: r.name,
      shortName: r.shortName,
      slug: r.slug,
    })),
    entries: data || [],
  })
}
