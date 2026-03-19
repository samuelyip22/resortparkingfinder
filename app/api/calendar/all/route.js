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

  // Always return resort metadata even if the DB query fails.
  // The calendar will render with gray (unchecked) cells until the table is set up.
  const resortMeta = honkResorts.map((r) => ({
    id: r.id,
    name: r.name,
    shortName: r.shortName,
    slug: r.slug,
  }))

  if (error) {
    console.error("Calendar/all fetch error:", error)
    // Return structure with empty entries so the calendar still renders (all gray)
    return NextResponse.json({ resorts: resortMeta, entries: [] })
  }

  return NextResponse.json({ resorts: resortMeta, entries: data || [] })
}
