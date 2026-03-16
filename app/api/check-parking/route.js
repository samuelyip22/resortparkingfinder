// app/api/check-parking/route.js
// API route: GET /api/check-parking
// This is the parking checker — it runs every 5 minutes via Vercel Cron.
// It ONLY checks resorts that have active alert subscriptions (keeps server load light).
//
// What it does:
//   1. Finds all active alerts in Supabase
//   2. For each unique resort that has alerts, checks current parking status
//   3. Compares to the last known status stored in Supabase
//   4. If status changed from "full/unknown" → "open", sends email alerts via Resend
//   5. Updates the stored parking snapshot

import { supabase } from "@/lib/supabase"
import { getParkingStatus } from "@/lib/parking"
import { getResort } from "@/lib/resorts"
import { sendParkingAlert } from "@/lib/email"
import { NextResponse } from "next/server"

export async function GET(request) {
  // Security check: Vercel Cron passes a secret header to prevent unauthorized calls.
  // Anyone who knows the URL could trigger this without the check.
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // --- Step 1: Find which resorts have active alerts ---
  // Only fetch alerts for future dates (no point checking past dates)
  const today = new Date().toISOString().split("T")[0]

  const { data: activeAlerts, error: alertsError } = await supabase
    .from("alerts")
    .select("*")
    .eq("active", true)
    .gte("date", today) // only dates today or in the future

  if (alertsError) {
    console.error("Failed to fetch alerts:", alertsError)
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }

  if (!activeAlerts || activeAlerts.length === 0) {
    // No active alerts — nothing to check, keeps the server completely idle
    return NextResponse.json({ checked: 0, message: "No active alerts" })
  }

  // Build a unique list of resort IDs that need checking
  const resortIdsToCheck = [...new Set(activeAlerts.map((a) => a.resort_id))]

  const results = []

  for (const resortId of resortIdsToCheck) {
    const resort = getResort(resortId)
    if (!resort) continue

    // --- Step 2: Get current parking status ---
    let currentStatus
    try {
      currentStatus = await getParkingStatus(resort)
    } catch (err) {
      console.error(`Parking check failed for ${resortId}:`, err.message)
      continue
    }

    // Normalize status to "open" or "full/unknown" for comparison
    const isOpen = isStatusOpen(currentStatus)

    // --- Step 3: Get last known status from Supabase ---
    const { data: snapshot } = await supabase
      .from("parking_snapshots")
      .select("status, was_open")
      .eq("resort_id", resortId)
      .single()

    const wasOpen = snapshot?.was_open ?? false // default: assume it was NOT open before

    // --- Step 4: Check if status just changed from closed → open ---
    if (isOpen && !wasOpen) {
      // Parking just opened! Find all subscribers for this resort
      const subscribers = activeAlerts.filter((a) => a.resort_id === resortId)

      for (const alert of subscribers) {
        try {
          await sendParkingAlert({
            email: alert.email,
            resortName: resort.name,
            date: alert.date,
            reservationUrl: resort.parking.reservationUrl || resort.links.website,
          })

          // Mark this specific alert as notified (deactivate it so we don't spam)
          await supabase
            .from("alerts")
            .update({ active: false, notified_at: new Date().toISOString() })
            .eq("id", alert.id)

        } catch (emailErr) {
          console.error(`Failed to send email to ${alert.email}:`, emailErr.message)
        }
      }

      results.push({ resort: resortId, status: "opened", notified: subscribers.length })
    }

    // --- Step 5: Update the parking snapshot in Supabase ---
    await supabase.from("parking_snapshots").upsert({
      resort_id: resortId,
      status: String(currentStatus),
      was_open: isOpen,
      checked_at: new Date().toISOString(),
    }, { onConflict: "resort_id" }) // upsert = insert if new, update if exists
  }

  return NextResponse.json({
    checked: resortIdsToCheck.length,
    results,
    timestamp: new Date().toISOString(),
  })
}

// Helper: decide if a parking status counts as "open"
// Works for both text statuses ("open") and percentage numbers (e.g. 65% full < 95% = still has spots)
function isStatusOpen(status) {
  if (status === "open") return true
  if (status === "full" || status === "unknown" || status === null) return false
  if (typeof status === "number") return status < 95 // under 95% = still has spots
  return false
}
