// app/api/calendar/[slug]/route.js
// GET /api/calendar/snowbird
// Returns all stored parking availability dates for a resort.
// Used by the ParkingCalendar component to color-code the calendar grid.

import { supabase } from "@/lib/supabase"
import { getResort } from "@/lib/resorts"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  const { slug } = await params
  const resort = getResort(slug)

  if (!resort) {
    return NextResponse.json({ error: "Resort not found" }, { status: 404 })
  }

  // Only return dates from today through end of ski season
  const today = new Date().toISOString().split("T")[0]
  const endOfSeason = "2026-04-30"

  const { data, error } = await supabase
    .from("parking_calendar")
    .select("date, status, checked_at")
    .eq("resort_id", resort.id)
    .gte("date", today)
    .lte("date", endOfSeason)
    .order("date", { ascending: true })

  if (error) {
    // Return empty entries so the calendar still renders (all gray) even if DB table missing
    console.error("Calendar fetch error:", error)
    return NextResponse.json({ entries: [] })
  }

  return NextResponse.json({ entries: data || [] })
}
