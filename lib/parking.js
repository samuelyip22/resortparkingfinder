// lib/parking.js
// Fetches live parking status for each resort by scraping their public pages.
// Returns a simple status value: "open", "full", a percentage number, or null.
//
// We use cheerio (a lightweight HTML parser) to extract the relevant data.
// Delays between requests are built in to be respectful to resort servers.

import * as cheerio from "cheerio"

// Pause execution for a given number of milliseconds
// Used to add a delay between scraping requests
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getParkingStatus(resort) {
  const { id, parking } = resort

  try {
    // Route to the right scraper based on parking type
    switch (parking.type) {
      case "free":
        // No reservation needed — always "open" conceptually
        return "open"

      case "live-meter":
        // Snowbasin — scrape their mountain report for the % fill meter
        return await scrapeSnowbasin()

      case "live-status":
        // Snowbird — scrape their parking-status page for open/full text
        if (id === "snowbird") return await scrapeSnowbird()
        return null

      case "honk":
        // HONK portal (Park City, Solitude, Brighton) — check if dates are available
        // For now return null — the full HONK scraper is built in the alerts system
        // to avoid unnecessary checks when no one has set an alert
        return null

      default:
        return null
    }
  } catch (err) {
    console.error(`Parking scrape failed for ${id}:`, err.message)
    return null
  }
}

// Scrape Snowbasin's mountain report page for their % fill meter
async function scrapeSnowbasin() {
  await sleep(2000) // 2-second delay to be respectful

  const res = await fetch("https://www.snowbasin.com/the-mountain/mountain-report/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SkiSpot/1.0)" },
    next: { revalidate: 300 }, // cache for 5 minutes
  })

  if (!res.ok) return null

  const html = await res.text()
  const $ = cheerio.load(html)

  // Look for a percentage number in the parking section of the page
  // The selector may need adjustment after inspecting the live page
  let pct = null

  $("*").each((_, el) => {
    const text = $(el).text()
    const match = text.match(/(\d+)%\s*Full/i)
    if (match) {
      pct = parseInt(match[1], 10)
      return false // stop looping once found
    }
  })

  return pct // returns a number like 65, or null if not found
}

// Scrape Snowbird's parking status page for open/full status per lot
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

  // Get all text on the page and check for "FULL" keyword
  const pageText = $("body").text().toLowerCase()

  if (pageText.includes("parking is full") || pageText.includes("lots are full")) {
    return "full"
  }

  if (pageText.includes("open") || pageText.includes("available")) {
    return "open"
  }

  return "unknown"
}
