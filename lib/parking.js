// lib/parking.js
// Fetches live parking status for each resort.
// Returns: "open", "full", a percentage number, or null.
//
// Snowbird + Snowbasin: scrape their public status pages via cheerio.
// HONK resorts (Brighton, Solitude, Park City): check their reservation portal
// for a specific date and return whether spots are available.

import * as cheerio from "cheerio"

// Pause execution for N milliseconds — used between scrape requests
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Main entry point ──────────────────────────────────────────────────────────
export async function getParkingStatus(resort, date) {
  const { id, parking } = resort

  try {
    switch (parking.type) {
      case "free":
        return "open"

      case "live-meter":
        return await scrapeSnowbasin()

      case "live-status":
        if (id === "snowbird") return await scrapeSnowbird()
        return null

      case "honk":
        // For HONK portals, check a specific date if provided.
        // The check-parking cron passes each alerted date in turn.
        if (date) return await scrapeHonk(parking.honkPortalUrl, date)
        return null

      default:
        return null
    }
  } catch (err) {
    console.error(`Parking scrape failed for ${id}:`, err.message)
    return null
  }
}

// ── HONK reservation portal scraper ──────────────────────────────────────────
// HONK portals (reserve.parkatbrighton.com etc.) are JavaScript-rendered.
// We fetch the raw HTML and look for availability data embedded in:
//   1. Inline <script> tags (React/Next initial state)
//   2. Page text (sold out / available copy)
//   3. Meta tags
// Falls back to null if the page can't be parsed.
async function scrapeHonk(portalUrl, date) {
  await sleep(2500)

  // Try a date-specific URL first — some HONK portals accept ?date= or /date/
  const dateUrl = `${portalUrl}?date=${date}`

  const res = await fetch(dateUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  })

  if (!res.ok) {
    console.warn(`HONK fetch returned ${res.status} for ${dateUrl}`)
    return null
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  // ── 1. Check visible page text for availability indicators ──────────────────
  const bodyText = $("body").text().toLowerCase().replace(/\s+/g, " ")

  const soldOutPhrases = [
    "sold out", "no availability", "fully booked", "no spaces",
    "unavailable", "0 spaces", "no spots", "lot is full",
  ]
  const openPhrases = [
    "spaces available", "spots available", "available spaces",
    "add to cart", "select space", "reserve now", "book now",
    "choose space", "select a space",
  ]

  for (const phrase of soldOutPhrases) {
    if (bodyText.includes(phrase)) return "full"
  }
  for (const phrase of openPhrases) {
    if (bodyText.includes(phrase)) return "open"
  }

  // ── 2. Look for availability count in embedded JavaScript ────────────────────
  // HONK portals often embed state as JSON in <script> tags
  const scriptText = $("script:not([src])")
    .map((_, el) => $(el).html())
    .get()
    .join("\n")

  // Look for patterns like: "available":5, "availableSpaces":3, "remainingSpots":0
  const availPatterns = [
    /"available"\s*:\s*(\d+)/,
    /"availableSpaces"\s*:\s*(\d+)/,
    /"remainingSpots"\s*:\s*(\d+)/,
    /"capacity"\s*:\s*\d+[^}]*"available"\s*:\s*(\d+)/,
    /availableCount['":\s]+(\d+)/i,
    /spaces_available['":\s]+(\d+)/i,
  ]

  for (const pattern of availPatterns) {
    const match = scriptText.match(pattern)
    if (match) {
      const count = parseInt(match[1], 10)
      console.log(`HONK scraped availability count: ${count} for ${dateUrl}`)
      return count > 0 ? "open" : "full"
    }
  }

  // ── 3. Look for a "0" next to space/spot/stall keywords ─────────────────────
  const zeroSpotsPattern = /\b0\s*(spaces?|spots?|stalls?|parking)\b/i
  const hasSpots = /\b([1-9]\d*)\s*(spaces?|spots?|stalls?|parking)\b/i
  if (zeroSpotsPattern.test(bodyText)) return "full"
  if (hasSpots.test(bodyText)) return "open"

  // Could not determine status from HTML — likely JavaScript-rendered content
  console.log(`HONK: could not parse status from ${dateUrl} (${html.length} bytes)`)
  return null
}

// ── Snowbasin live fill meter ─────────────────────────────────────────────────
async function scrapeSnowbasin() {
  await sleep(2000)

  const res = await fetch("https://www.snowbasin.com/the-mountain/mountain-report/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SkiSpot/1.0)" },
    next: { revalidate: 300 },
  })

  if (!res.ok) return null

  const html = await res.text()
  const $ = cheerio.load(html)

  let pct = null
  $("*").each((_, el) => {
    const text = $(el).text()
    const match = text.match(/(\d+)%\s*Full/i)
    if (match) {
      pct = parseInt(match[1], 10)
      return false
    }
  })

  return pct
}

// ── Snowbird parking status page ──────────────────────────────────────────────
async function scrapeSnowbird() {
  await sleep(2000)

  const res = await fetch(
    "https://www.snowbird.com/the-mountain/mountain-report/parking-status/",
    {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SkiSpot/1.0)" },
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) return null

  const html = await res.text()
  const $ = cheerio.load(html)
  const pageText = $("body").text().toLowerCase()

  if (pageText.includes("parking is full") || pageText.includes("lots are full")) {
    return "full"
  }
  if (pageText.includes("open") || pageText.includes("available")) {
    return "open"
  }

  return "unknown"
}
