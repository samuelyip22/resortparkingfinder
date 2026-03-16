// app/resort/[slug]/page.js
// The resort detail page — e.g. /resort/snowbird
// Shows everything about one resort: webcam, parking, snow, forecast, trail map, resort info.

import { notFound } from "next/navigation"
import Link from "next/link"
import { getResort, resorts } from "@/lib/resorts"
import { getSnowData } from "@/lib/snow"
import { getParkingStatus } from "@/lib/parking"
import ParkingBadge from "@/components/ParkingBadge"
import WebcamSelector from "@/components/WebcamSelector"
import ResortForecast from "@/components/ResortForecast"
import {
  ArrowLeft, Car, Snowflake, ExternalLink, MapPin,
  Star, Clock, Users, Utensils, Mountain, Bell
} from "lucide-react"

// Tell Next.js which resort pages to pre-build at deploy time
export async function generateStaticParams() {
  return resorts.map((r) => ({ slug: r.slug }))
}

// Generate SEO metadata for each resort page
export async function generateMetadata({ params }) {
  const { slug } = await params  // Next.js 15+: params is a Promise, must be awaited
  const resort = getResort(slug)
  if (!resort) return {}
  return {
    title: `${resort.name} — Parking & Conditions | SkiSpot`,
    description: `Live parking status, snow conditions, webcams, and trail info for ${resort.name}.`,
  }
}

export const revalidate = 300 // refresh data every 5 minutes

export default async function ResortPage({ params }) {
  const { slug } = await params  // Next.js 15+: params is a Promise, must be awaited
  const resort = getResort(slug)

  // If someone visits /resort/fake-name, show a 404 page
  if (!resort) notFound()

  // Fetch snow data and parking status for this resort
  const [snowData, parkingStatus] = await Promise.all([
    getSnowData(resort.snoCountryId).catch(() => null),
    getParkingStatus(resort).catch(() => null),
  ])

  const { details, parking, links } = resort

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        All Resorts
      </Link>

      {/* Hero header */}
      <div
        className="rounded-2xl p-8 mb-8 flex items-end"
        style={{
          backgroundColor: resort.heroColor,
          background: `linear-gradient(135deg, ${resort.heroColor} 0%, rgba(0,0,0,0.7) 100%)`,
          minHeight: "180px",
        }}
      >
        <div className="flex items-end justify-between w-full flex-wrap gap-4">
          <div>
            <span
              className={`inline-block text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mb-3 ${
                resort.pass === "ikon" ? "bg-blue-600" : "bg-red-600"
              }`}
            >
              {resort.pass} pass
            </span>
            <h1 className="text-4xl font-bold text-white">{resort.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{resort.location}</span>
            </div>
          </div>

          {/* Set alert CTA */}
          <Link
            href={`/alerts?resort=${resort.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            <Bell className="w-4 h-4" />
            Set Parking Alert
          </Link>
        </div>
      </div>

      {/* Main content grid — 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN (wider) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Snow Conditions card */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Snowflake className="w-5 h-5" style={{ color: "var(--accent)" }} />
              Snow Conditions
            </h2>

            {snowData ? (
              <>
                {/* Key stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: "Base Depth", value: `${snowData.baseDepth}"` },
                    { label: "24hr New", value: `${snowData.newSnow24}"` },
                    { label: "48hr New", value: `${snowData.newSnow48}"` },
                    { label: "Conditions", value: snowData.conditions },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</div>
                      <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Lifts & trails */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                      {snowData.liftsOpen}/{snowData.liftsTotal}
                    </span>
                    lifts open
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                      {snowData.trailsOpen}/{snowData.trailsTotal}
                    </span>
                    trails open
                  </div>
                  {snowData.updatedAt && (
                    <div className="ml-auto text-xs" style={{ color: "var(--text-secondary)" }}>
                      Updated {snowData.updatedAt}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Snow data unavailable. <a href={links.conditions} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }} className="underline">View on resort site ↗</a>
              </p>
            )}
          </div>

          {/* Forecast card */}
          <div className="card rounded-2xl p-6">
            <ResortForecast resortSlug={resort.slug} />
          </div>

          {/* Webcams card */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Live Webcams
            </h2>
            <WebcamSelector webcams={resort.webcams} />
          </div>

          {/* Trail Map card */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Trail Map
              </h2>
              <a
                href={links.trailMap}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center gap-1"
                style={{ color: "var(--accent)" }}
              >
                Full map ↗
              </a>
            </div>
            {/* Trail map image — placeholder until real images are added to /public/maps/ */}
            <div
              className="rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                minHeight: "280px",
              }}
            >
              <div className="text-center">
                <Mountain className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--text-secondary)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Trail map image</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Add image to /public/maps/{resort.slug}-trail-map.jpg
                </p>
                <a
                  href={links.trailMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm"
                  style={{ color: "var(--accent)" }}
                >
                  <ExternalLink className="w-3 h-3" />
                  View on {resort.shortName} website
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (sidebar) */}
        <div className="flex flex-col gap-6">

          {/* Parking card */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Car className="w-5 h-5" style={{ color: "var(--accent)" }} />
              Parking
            </h2>

            {/* Status badge */}
            <div className="mb-4">
              <ParkingBadge type={parking.type} status={parkingStatus} />
            </div>

            {/* Lots list */}
            <div className="mb-4">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>LOTS</p>
              <div className="flex flex-wrap gap-1">
                {parking.lots.map((lot) => (
                  <span key={lot} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    {lot}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {parking.pricing}
            </p>

            {/* Notes */}
            {parking.notes && (
              <p className="text-xs p-3 rounded-lg" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                {parking.notes}
              </p>
            )}

            {/* Reservation link */}
            {parking.reservationUrl && (
              <a
                href={parking.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--accent)", color: "white" }}
              >
                <ExternalLink className="w-4 h-4" />
                Book Parking
              </a>
            )}
          </div>

          {/* Resort info card */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Resort Info
            </h2>

            <div className="flex flex-col gap-3 text-sm">
              {/* Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Star className="w-4 h-4" />
                  <span>Rating</span>
                </div>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  ⭐ {details.googleRating} / 5
                </span>
              </div>

              {/* Vertical drop */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                  <Mountain className="w-4 h-4" />
                  <span>Vertical Drop</span>
                </div>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{details.verticalDrop}</span>
              </div>

              {/* Skiable acres */}
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Skiable Acres</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {details.skiableAcres?.toLocaleString()}
                </span>
              </div>

              {/* Annual snowfall */}
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Avg Snowfall</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {details.avgAnnualSnowfall}
                </span>
              </div>

              {/* Terrain breakdown */}
              <div>
                <span className="text-xs font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
                  TERRAIN
                </span>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    🟢 {details.terrain?.beginner} Beginner
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    🔵 {details.terrain?.intermediate} Intermediate
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-slate-700">
                    ⚫ {details.terrain?.advanced} Advanced
                  </span>
                </div>
              </div>

              <div className="border-t" style={{ borderColor: "var(--border)" }} />

              {/* Lodges */}
              <div>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-secondary)" }}>
                  <Users className="w-4 h-4" />
                  <span>Lodges ({details.lodges})</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {details.lodgeNames?.map((name) => (
                    <span key={name} className="text-xs" style={{ color: "var(--text-primary)" }}>• {name}</span>
                  ))}
                </div>
              </div>

              {/* Dining */}
              <div>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-secondary)" }}>
                  <Utensils className="w-4 h-4" />
                  <span>Dining</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {details.dining?.map((name) => (
                    <span key={name} className="text-xs" style={{ color: "var(--text-primary)" }}>• {name}</span>
                  ))}
                </div>
              </div>

              {/* Best time to visit */}
              <div>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--text-secondary)" }}>
                  <Clock className="w-4 h-4" />
                  <span>Best Time to Visit</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                  {details.bestTimeToVisit}
                </p>
              </div>

              {/* Special notes */}
              {details.specialNotes && (
                <div className="text-xs p-2 rounded-lg"
                  style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                  ⚠️ {details.specialNotes}
                </div>
              )}
            </div>
          </div>

          {/* Quick links card */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Quick Links</h2>
            <div className="flex flex-col gap-2">
              {Object.entries(links).map(([key, url]) => {
                if (!url) return null
                const label = {
                  website: "Resort Website",
                  conditions: "Conditions Report",
                  trailMap: "Trail Map",
                  reservations: "Parking Reservations",
                }[key] || key
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: "var(--bg)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {label}
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
