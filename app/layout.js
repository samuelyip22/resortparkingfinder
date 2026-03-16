// app/layout.js
// The root layout — wraps every page in the app.
// Adds the navbar, theme provider, and shared metadata.

import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "SkiSpot — Utah Resort Parking & Conditions",
  description:
    "Track parking availability, snow conditions, and get alerts when parking opens at Utah ski resorts.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ThemeProvider must wrap everything so all components can read the theme */}
        <ThemeProvider>
          <Navbar />
          {/* Main content area — each page fills this */}
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
