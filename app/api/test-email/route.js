// app/api/test-email/route.js
// POST /api/test-email
// Sends a test parking alert email immediately — used to verify Resend is working.
// Protected by CRON_SECRET so only you can trigger it.
//
// Usage: POST https://skispot.vercel.app/api/test-email
// Body:  { "email": "you@gmail.com" }
// Header: Authorization: Bearer <CRON_SECRET>

import { sendParkingAlert } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST(request) {
  // Require the same secret used by the cron job
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const email = body.email || "samuelyip2@gmail.com"

  // Pick the next Saturday as the test date
  const testDate = nextSaturday()

  try {
    await sendParkingAlert({
      email,
      resortName: "Brighton Resort",
      date: testDate,
      reservationUrl: "https://reserve.parkatbrighton.com",
    })

    return NextResponse.json({
      success: true,
      sentTo: email,
      testDate,
      message: "Test email sent — check your inbox (and spam folder).",
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      hint: "Check that RESEND_API_KEY is set in Vercel environment variables.",
    }, { status: 500 })
  }
}

function nextSaturday() {
  const d = new Date()
  const day = d.getDay() // 0=Sun, 6=Sat
  const daysUntilSat = day === 6 ? 7 : 6 - day
  d.setDate(d.getDate() + daysUntilSat)
  return d.toISOString().split("T")[0]
}
