"use client"
// components/Navbar.js
// The top navigation bar shown on every page.
// Contains the SkiSpot logo, nav links, and dark/light mode toggle.

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, Mountain, Bell } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname() // tells us which page we're on

  // Helper to highlight the active nav link
  function navClass(href) {
    const isActive = pathname === href
    return isActive
      ? "text-[var(--accent)] font-semibold"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--bg-nav)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)" }}>
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Ski<span style={{ color: "var(--accent)" }}>Spot</span>
            </span>
          </Link>

          {/* Nav links + theme toggle */}
          <div className="flex items-center gap-6">
            <Link href="/" className={navClass("/")}>
              Resorts
            </Link>
            <Link href="/alerts" className={`flex items-center gap-1 ${navClass("/alerts")}`}>
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </Link>

            {/* Dark/light toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--accent-light)",
                color: "var(--accent)",
              }}
              aria-label="Toggle dark mode"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
