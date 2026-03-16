// components/ParkingBadge.js
// Displays parking status as a color-coded badge.
// Used on resort cards and the detail page.

export default function ParkingBadge({ type, status }) {
  // status comes from our scraper: "open", "full", "unknown", or a percent like 65
  // type is the parking type from resorts.js: "honk", "live-meter", "live-status", "free"

  // If no reservation required, show a simple green badge
  if (type === "free") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        No Reservation Needed
      </span>
    )
  }

  // For live fill meter (Snowbasin), show the percentage
  if (type === "live-meter" && typeof status === "number") {
    const pct = status
    const color =
      pct < 50 ? "bg-green-100 text-green-800" :
      pct < 80 ? "bg-yellow-100 text-yellow-800" :
                 "bg-red-100 text-red-800"
    const dotColor =
      pct < 50 ? "bg-green-500" :
      pct < 80 ? "bg-yellow-500" :
                 "bg-red-500"
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {pct}% Full
      </span>
    )
  }

  // For text-based status (Snowbird) or HONK portals
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        Parking Open
      </span>
    )
  }

  if (status === "full") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Sold Out
      </span>
    )
  }

  // Default: no live data yet, show a neutral badge with link to reserve
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Reservation Required
    </span>
  )
}
