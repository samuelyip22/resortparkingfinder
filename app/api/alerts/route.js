// app/api/alerts/route.js
// API route: POST /api/alerts
// Saves a new parking alert subscription to Supabase.
// Called when a user submits the alerts form.

import { supabase } from "@/lib/supabase"
import { resorts } from "@/lib/resorts"
import { NextResponse } from "next/server"

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

  // Make sure the resort has a trackable parking system
  if (!["honk", "live-meter", "live-status"].includes(resort.parking.type)) {
    return NextResponse.json(
      { error: `${resort.name} doesn't have a trackable parking system.` },
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

  return NextResponse.json({ success: true })
}
