// components/ResortCard.js
// A single resort card shown on the home page grid.
// Displays parking status, snow snapshot, and quick links.

import Link from "next/link"
import { Snowflake, Car, ExternalLink, ChevronRight } from "lucide-react"
import ParkingBadge from "./ParkingBadge"

export default function ResortCard({ resort, parkingStatus, snowData }) {
  // parkingStatus — live data from our scraper (may be null while loading)
  // snowData — current conditions from SnoCountry API (may be null while loading)

  return (
    <div
      className="card rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Hero image with gradient overlay showing resort name */}
      <div
        className="relative h-40 flex items-end p-4"
        style={{
          backgroundColor: resort.heroColor,
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)`,
        }}
      >
        {/* Pass badge: Ikon (blue) or Epic (red) */}
        <span
          className={`absolute top-3 right-3 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            resort.pass === "ikon" ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          {resort.pass} pass
        </span>

        <div>
          <h2 className="text-white text-xl font-bold leading-tight">{resort.name}</h2>
          <p className="text-white/70 text-sm">{resort.location}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Parking status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Car className="w-4 h-4" />
            <span>Parking</span>
          </div>
          <ParkingBadge type={resort.parking.type} status={parkingStatus} />
        </div>

        {/* Snow conditions row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Snowflake className="w-4 h-4" />
            <span>Snow</span>
          </div>
          {snowData ? (
            <div className="text-right">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {snowData.newSnow24}"
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>
                new · {snowData.baseDepth}" base
              </span>
            </div>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Unavailable</span>
          )}
        </div>

        {/* Lifts open row */}
        {snowData && (
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Lifts Open</span>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {snowData.liftsOpen} / {snowData.liftsTotal}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t" style={{ borderColor: "var(--border)" }} />

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          {/* Book parking link (if reservation needed) */}
          {resort.parking.requiresReservation && resort.parking.reservationUrl && (
            <a
              href={resort.parking.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}
            >
              <ExternalLink className="w-3 h-3" />
              Book Parking
            </a>
          )}

          {/* View full detail page */}
          <Link
            href={`/resort/${resort.slug}`}
            className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            Details
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
