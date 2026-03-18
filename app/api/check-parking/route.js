// app/api/check-parking/route.js
// GET /api/check-parking
// Runs every 5 minutes via cron-job.org.
// Checks parking status only for resorts that have active alert subscriptions.
//
// What it does:
//   1. Finds all active alerts in Supabase
//   2. For each unique resort that has alerts, checks current parking status
//   3. Compares to the last known status stored in Supabase
//   4. If status changed from "full" → "open", sends email alerts via Resend
//      — but only if it's been at least 1 hour since the last email for that alert
//   5. Updates parking_snapshots and parking_calendar in Supabase

import { supabase } from "@/lib/supabase"
import { getParkingStatus } from "@/lib/parking"
import { getResort } from "@/lib/resorts"
import { sendParkingAlert } from "@/lib/email"
import { NextResponse } from "next/server"

export async function GET(request) {
  // Security check: the cron service passes our secret in the Authorization header.
  // This prevents anyone who guesses the URL from triggering it.
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // --- Step 1: Find which resorts have active alerts ---
  // Only check future dates — no point monitoring dates that have passed
  const today = new Date().toISOString().split("T")[0]

  const { data: activeAlerts, error: alertsError } = await supabase
    .from("alerts")
    .select("*")
    .eq("active", true)
    .gte("date", today)

  if (alertsError) {
    console.error("Failed to fetch alerts:", alertsError)
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }

  if (!activeAlerts || activeAlerts.length === 0) {
    // No active alerts — nothing to check
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

    // Normalize to a simple boolean: is there parking available right now?
    const isOpen = isStatusOpen(currentStatus)

    // --- Step 3: Get last known status from Supabase ---
    const { data: snapshot } = await supabase
      .from("parking_snapshots")
      .select("status, was_open")
      .eq("resort_id", resortId)
      .single()

    // Default: assume it was NOT open before (so first check can trigger an email if it is open)
    const wasOpen = snapshot?.was_open ?? false

    // --- Step 4: Check if status just changed from closed → open ---
    if (isOpen && !wasOpen) {
      // Parking just opened! Notify all subscribers for this resort
      const subscribers = activeAlerts.filter((a) => a.resort_id === resortId)

      for (const alert of subscribers) {
        try {
          // ── 1-hour throttle ──────────────────────────────────────────────
          // Don't send another email if we already sent one in the last hour.
          // This prevents re-spamming if parking flickers open/closed.
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
          const lastNotified = alert.notified_at

          if (lastNotified && lastNotified > oneHourAgo) {
            // Already sent an email within the last hour — skip this alert
            console.log(`Throttled email for alert ${alert.id} — last sent ${lastNotified}`)
            continue
          }
          // ────────────────────────────────────────────────────────────────

          await sendParkingAlert({
            email: alert.email,
            resortName: resort.name,
            date: alert.date,
            reservationUrl: resort.parking.reservationUrl || resort.links.website,
          })

          // Record that we sent the email (but keep alert active so we can notify again later)
          await supabase
            .from("alerts")
            .update({ notified_at: new Date().toISOString() })
            .eq("id", alert.id)

        } catch (emailErr) {
          console.error(`Failed to send email to ${alert.email}:`, emailErr.message)
        }
      }

      results.push({ resort: resortId, status: "opened", notified: subscribers.length })
    }

    // --- Step 5: Update parking_snapshots (last known overall status) ---
    await supabase.from("parking_snapshots").upsert({
      resort_id: resortId,
      status: String(currentStatus),
      was_open: isOpen,
      checked_at: new Date().toISOString(),
    }, { onConflict: "resort_id" })

    // --- Step 6: Update parking_calendar for each alerted date ---
    // This populates the calendar grid shown on resort pages.
    // We use the current overall status as a proxy for upcoming reserved dates.
    const alertedDates = [...new Set(
      activeAlerts
        .filter((a) => a.resort_id === resortId && a.date >= today)
        .map((a) => a.date)
    )]

    for (const date of alertedDates) {
      await supabase.from("parking_calendar").upsert({
        resort_id: resortId,
        date: date,
        status: isOpen ? "open" : "full",
        checked_at: new Date().toISOString(),
      }, { onConflict: "resort_id,date" })
    }
  }

  return NextResponse.json({
    checked: resortIdsToCheck.length,
    results,
    timestamp: new Date().toISOString(),
  })
}

// Helper: decide if a parking status counts as "open"
// Works for text statuses ("open") and percentage fill numbers (e.g. 65% full < 95% = still has spots)
function isStatusOpen(status) {
  if (status === "open") return true
  if (status === "full" || status === "unknown" || status === null) return false
  if (typeof status === "number") return status < 95 // under 95% full = still some spots left
  return false
}
