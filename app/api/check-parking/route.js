// app/api/check-parking/route.js
// GET /api/check-parking
// Runs every 5 minutes via cron-job.org.
// Checks parking status only for resorts that have active alert subscriptions.
//
// For HONK resorts (Brighton, Solitude, Park City):
//   Checks EACH alerted date individually by scraping the reservation portal.
//
// For live resorts (Snowbird, Snowbasin):
//   Checks overall status and applies it to all alerted dates for that resort.
//
// Email throttle: at least 1 hour between emails per alert.

import { supabase } from "@/lib/supabase"
import { getParkingStatus } from "@/lib/parking"
import { getResort } from "@/lib/resorts"
import { sendParkingAlert } from "@/lib/email"
import { NextResponse } from "next/server"

export async function GET(request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date().toISOString().split("T")[0]

  // Step 1: Load all active future alerts
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
    return NextResponse.json({ checked: 0, message: "No active alerts" })
  }

  const resortIdsToCheck = [...new Set(activeAlerts.map((a) => a.resort_id))]
  const results = []

  for (const resortId of resortIdsToCheck) {
    const resort = getResort(resortId)
    if (!resort) continue

    const isHonk = resort.parking.type === "honk"

    if (isHonk) {
      // ── HONK resorts: check each alerted date separately ───────────────────
      // We scrape the reservation portal for each specific date so the calendar
      // shows accurate per-date availability instead of a global proxy status.

      const alertedDates = [...new Set(
        activeAlerts
          .filter((a) => a.resort_id === resortId && a.date >= today)
          .map((a) => a.date)
      )]

      for (const date of alertedDates) {
        // Fetch availability for this specific date from the HONK portal
        let dateStatus = null
        try {
          dateStatus = await getParkingStatus(resort, date)
        } catch (err) {
          console.error(`HONK scrape failed for ${resortId} on ${date}:`, err.message)
        }

        // Update the calendar with the real date-specific status
        if (dateStatus !== null) {
          await supabase.from("parking_calendar").upsert({
            resort_id: resortId,
            date,
            status: dateStatus,
            checked_at: new Date().toISOString(),
          }, { onConflict: "resort_id,date" })
        }

        // Check each subscriber for this date
        if (dateStatus === "open") {
          const subscribers = activeAlerts.filter(
            (a) => a.resort_id === resortId && a.date === date
          )

          for (const alert of subscribers) {
            await maybeNotify(alert, resort, date, results)
          }
        }
      }

    } else {
      // ── Live-status resorts (Snowbird, Snowbasin): check overall status ──────
      let currentStatus = null
      try {
        currentStatus = await getParkingStatus(resort)
      } catch (err) {
        console.error(`Parking check failed for ${resortId}:`, err.message)
      }

      const isOpen = isStatusOpen(currentStatus)

      // Scraper health-check: track consecutive null returns
      const { data: snapshot } = await supabase
        .from("parking_snapshots")
        .select("status, was_open, consecutive_failures")
        .eq("resort_id", resortId)
        .single()

      const prevFailures = snapshot?.consecutive_failures ?? 0
      const newFailureCount = currentStatus === null ? prevFailures + 1 : 0

      if (newFailureCount >= 3) {
        console.error(
          `[SCRAPER HEALTH] ⚠️  ${resort.name} has returned null ${newFailureCount} times in a row. ` +
          `Check: ${resort.parking.statusUrl || resort.links.conditions}`
        )
        results.push({ resort: resortId, status: "scraper_failing", consecutiveFailures: newFailureCount })
      }

      const wasOpen = snapshot?.was_open ?? false

      // If just flipped open, notify all subscribers
      if (isOpen && !wasOpen) {
        const subscribers = activeAlerts.filter((a) => a.resort_id === resortId)
        for (const alert of subscribers) {
          await maybeNotify(alert, resort, alert.date, results)
        }
      }

      // Update snapshot
      await supabase.from("parking_snapshots").upsert({
        resort_id: resortId,
        status: String(currentStatus),
        was_open: isOpen,
        checked_at: new Date().toISOString(),
        consecutive_failures: newFailureCount,
      }, { onConflict: "resort_id" })

      // Update calendar for all alerted dates using general status as proxy
      const alertedDates = [...new Set(
        activeAlerts
          .filter((a) => a.resort_id === resortId && a.date >= today)
          .map((a) => a.date)
      )]

      for (const date of alertedDates) {
        await supabase.from("parking_calendar").upsert({
          resort_id: resortId,
          date,
          status: isOpen ? "open" : "full",
          checked_at: new Date().toISOString(),
        }, { onConflict: "resort_id,date" })
      }
    }
  }

  return NextResponse.json({
    checked: resortIdsToCheck.length,
    results,
    timestamp: new Date().toISOString(),
  })
}

// Send an email alert with a 1-hour throttle.
// Keeps the alert active so we can notify again if parking closes and reopens.
async function maybeNotify(alert, resort, date, results) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    if (alert.notified_at && alert.notified_at > oneHourAgo) {
      console.log(`Throttled email for alert ${alert.id} — last sent ${alert.notified_at}`)
      return
    }

    await sendParkingAlert({
      email: alert.email,
      resortName: resort.name,
      date,
      reservationUrl: resort.parking.reservationUrl || resort.links.website,
    })

    await supabase
      .from("alerts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", alert.id)

    results.push({ resort: resort.id, date, status: "notified", email: alert.email })
  } catch (err) {
    console.error(`Failed to send email to ${alert.email}:`, err.message)
  }
}

function isStatusOpen(status) {
  if (status === "open") return true
  if (status === "full" || status === "unknown" || status === null) return false
  if (typeof status === "number") return status < 95
  return false
}
