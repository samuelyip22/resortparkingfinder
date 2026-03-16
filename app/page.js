// app/page.js
// The home page — shows the location card and all resort cards in a clean grid.
// Snow data and parking status are fetched server-side so the page loads fast.

import { resorts } from "@/lib/resorts"
import ResortCard from "@/components/ResortCard"
import LocationCard from "@/components/LocationCard"
import { getSnowData } from "@/lib/snow"
import { getParkingStatus } from "@/lib/parking"

// Next.js will re-run this page every 5 minutes on the server (ISR = Incremental Static Regeneration)
// This keeps snow data reasonably fresh without hammering the APIs on every visit.
export const revalidate = 300 // seconds

export default async function HomePage() {
  // Fetch snow data for all resorts in parallel (at the same time)
  // Promise.allSettled means if one fails, the others still load fine
  const snowResults = await Promise.allSettled(
    resorts.map((r) => getSnowData(r.snoCountryId))
  )

  // Fetch parking status for all resorts in parallel
  const parkingResults = await Promise.allSettled(
    resorts.map((r) => getParkingStatus(r))
  )

  // Build lookup maps: { resortId -> data }
  const snowMap = {}
  const parkingMap = {}
  resorts.forEach((r, i) => {
    snowMap[r.id] = snowResults[i].status === "fulfilled" ? snowResults[i].value : null
    parkingMap[r.id] = parkingResults[i].status === "fulfilled" ? parkingResults[i].value : null
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Utah Ski Resorts
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Live parking status, snow conditions, and alerts for Ikon &amp; Epic resorts.
        </p>
      </div>

      {/* Location weather card — client component, loads after page */}
      <div className="mb-8">
        <LocationCard />
      </div>

      {/* Resort cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {resorts.map((resort) => (
          <ResortCard
            key={resort.id}
            resort={resort}
            parkingStatus={parkingMap[resort.id]}
            snowData={snowMap[resort.id]}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
        Parking data updated every 5 minutes. Snow data updated daily. Always verify at resort website before driving.
      </p>
    </div>
  )
}
