// components/ResortStatusBar.js
// A compact, full-width stat strip shown below the hero on each resort page.
// Highlights the 3 numbers visitors care about most: base depth, 48h new snow,
// and open lifts. Server-rendered — data comes from SNOTEL via the resort page.

import { Snowflake, Mountain, TrendingUp } from "lucide-react"

export default function ResortStatusBar({ snowData }) {
  // Nothing to show if snow data is unavailable
  if (!snowData) return null

  const stats = [
    {
      icon: <Mountain className="w-5 h-5" />,
      label: "Base Depth",
      value: snowData.baseDepth != null ? `${snowData.baseDepth}"` : "—",
      highlight: snowData.baseDepth >= 60, // highlight good base depth
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "New Snow (48h)",
      // Show in inches — bold green if there's fresh snow
      value: snowData.newSnow48 != null ? `${snowData.newSnow48}"` : "—",
      highlight: snowData.newSnow48 > 0,
    },
    {
      icon: <Snowflake className="w-5 h-5" />,
      label: "Lifts Open",
      // Only render if we have lift data (SNOTEL doesn't provide this, but future sources might)
      value:
        snowData.liftsOpen != null
          ? `${snowData.liftsOpen} / ${snowData.liftsTotal ?? "?"}`
          : "—",
      highlight: snowData.liftsOpen > 0,
    },
  ]

  return (
    <div
      className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden mb-8"
      style={{ border: "1px solid var(--border)", backgroundColor: "var(--border)" }}
    >
      {stats.map(({ icon, label, value, highlight }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center py-5 px-3 text-center"
          style={{ backgroundColor: "var(--card)" }}
        >
          {/* Icon */}
          <span
            className="mb-2"
            style={{ color: highlight ? "var(--accent)" : "var(--text-secondary)" }}
          >
            {icon}
          </span>

          {/* Big stat number */}
          <span
            className="text-2xl font-bold leading-none mb-1"
            style={{ color: highlight ? "var(--accent)" : "var(--text-primary)" }}
          >
            {value}
          </span>

          {/* Label */}
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
