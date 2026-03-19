// app/api/parking-status/[slug]/route.js
// GET /api/parking-status/snowbird
// Fetches live parking status for a single resort on demand.
// Called client-side from the ParkingBadge component — only runs
// when a user is actively viewing the resort page.

import { getParkingStatus } from "@/lib/parking"
import { getResort } from "@/lib/resorts"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  const { slug } = await params
  const resort = getResort(slug)

  if (!resort) {
    return NextResponse.json({ error: "Resort not found" }, { status: 404 })
  }

  try {
    const status = await getParkingStatus(resort)
    return NextResponse.json({ status })
  } catch (err) {
    console.error(`Parking status error for ${slug}:`, err.message)
    return NextResponse.json({ status: null })
  }
}
