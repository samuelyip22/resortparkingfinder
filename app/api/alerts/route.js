// app/api/alerts/route.js
// API route: POST /api/alerts
// Saves a new parking alert subscription to Supabase.
// Called when a user submits the alerts form.

import { supabase } from "@/lib/supabase"
import { resorts } from "@/lib/resorts"
import { NextResponse } from "next/server"
import { getParkingStatus } from "@/lib/parking"
import { getResort } from "@/lib/resorts"

export async function POST(request) {
  // Parse the JSON body sent from the alerts form
  const body = await request.json()
  const { email, resortId, date } = body

  // --- Validate the input ---

  if (!email || !resortId || !date) {
    return NextResponse.json(
      { error: "Email, resort, and date are all required." },
      { status: 400 }
    )
  }

  // Make sure the email looks valid (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  // Make sure the resort exists in our data
  const resort = resorts.find((r) => r.id === resortId)
  if (!resort) {
    return NextResponse.json({ error: "Resort not found." }, { status: 400 })
  }

  // Only allow alerts for resorts we can actually monitor live.
  // HONK resorts use the calendar on the resort page instead.
  // Free parking (Deer Valley) and reservation-only (Alta) can't be tracked.
  if (!["live-meter", "live-status", "honk"].includes(resort.parking.type)) {
    return NextResponse.json(
      { error: `${resort.name} doesn't need a reservation — parking is ${resort.parking.type === "free" ? "always free" : "not trackable"}.` },
      { status: 400 }
    )
  }

  // Make sure the date is in the future
  const alertDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (alertDate < today) {
    return NextResponse.json({ error: "Please choose a future date." }, { status: 400 })
  }

  // --- Save to Supabase ---
  // Insert a row into the "alerts" table
  const { error } = await supabase.from("alerts").insert({
    email: email.toLowerCase().trim(),
    resort_id: resortId,
    resort_name: resort.name,
    date: date,                    // e.g. "2026-01-15"
    active: true,                  // alert is active until the date passes or spot opens
    created_at: new Date().toISOString(),
  })

  if (error) {
    // If it's a duplicate (same email + resort + date), give a friendly message
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already have an alert set for this resort and date." },
        { status: 409 }
      )
    }
    console.error("Supabase insert error:", error)
    return NextResponse.json({ error: "Failed to save alert. Please try again." }, { status: 500 })
  }

  // Immediately seed parking_calendar so the color shows before the cron runs.
  // We mark as "full" right away (user can only set alerts for full dates),
  // then kick off a live HONK check in the background to confirm.
  const fullResort = getResort(resortId)
  if (fullResort) {
    // Mark as full immediately for instant calendar feedback
    await supabase.from("parking_calendar").upsert({
      resort_id: resortId,
      date,
      status: "full",
      checked_at: new Date().toISOString(),
    }, { onConflict: "resort_id,date" })

    // For HONK resorts, also do a live check right now to get the real status.
    // We don't await this — it runs after the response is sent so the user
    // doesn't wait for the scrape. The calendar will update on next Refresh.
    if (fullResort.parking.type === "honk") {
      getParkingStatus(fullResort, date)
        .then((liveStatus) => {
          if (liveStatus !== null) {
            supabase.from("parking_calendar").upsert({
              resort_id: resortId,
              date,
              status: liveStatus,
              checked_at: new Date().toISOString(),
            }, { onConflict: "resort_id,date" }).catch(console.error)
          }
        })
        .catch(console.error)
    }
  }

  return NextResponse.json({ success: true })
}
