// app/page.js
// The home page — shows the location card, resort cards, and a unified reservation calendar.
// Snow data is fetched server-side (no API key, fast). Parking status is fetched client-side
// per resort (only runs when someone actually visits the page).

import { resorts } from "@/lib/resorts"
import ResortCard from "@/components/ResortCard"
import LocationCard from "@/components/LocationCard"
import HomeCalendar from "@/components/HomeCalendar"
import { getSnowData } from "@/lib/snow"

// Next.js re-runs this page every 5 minutes on the server (ISR).
// Snow data is the only server-side fetch here — parking is loaded client-side.
export const revalidate = 300 // seconds

export default async function HomePage() {
  // Fetch snow data for all resorts in parallel
  // Promise.allSettled means if one fails, the others still load fine
  const snowResults = await Promise.allSettled(
    resorts.map((r) => getSnowData(r.snoCountryId))
  )

  // Build a lookup map: { resortId -> snowData }
  const snowMap = {}
  resorts.forEach((r, i) => {
    snowMap[r.id] = snowResults[i].status === "fulfilled" ? snowResults[i].value : null
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        {resorts.map((resort) => (
          <ResortCard
            key={resort.id}
            resort={resort}
            snowData={snowMap[resort.id]}
          />
        ))}
      </div>

      {/* Reservation calendar — shows upcoming weekends for Brighton, Solitude, Park City */}
      <div className="mb-10">
        <HomeCalendar />
      </div>

      {/* Footer note */}
      <p className="mt-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
        Parking data updated every 5 minutes. Snow data updated daily. Always verify at resort website before driving.
      </p>
    </div>
  )
}
