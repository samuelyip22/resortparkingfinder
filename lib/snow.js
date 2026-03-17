// lib/snow.js
// Fetches snow depth and temperature from the SNOTEL network.
// SNOTEL = SNOpack TELemetry — a US government (USDA) network of mountain weather stations.
// It's free, requires no API key, and is the most accurate source for mountain snow data.
// Docs: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html

// Each resort is mapped to the nearest SNOTEL station on or near the mountain.
// Format: "stationId:STATE:SNTL"
const SNOTEL_STATIONS = {
  snowbird:             "766:UT:SNTL",  // Snowbird station — sits at 9,170 ft on the mountain
  alta:                 "1308:UT:SNTL", // Atwater station, 8,750 ft (closest to Alta)
  brighton:             "1308:UT:SNTL", // Atwater (no dedicated Brighton station)
  solitude:             "1308:UT:SNTL", // Atwater (no dedicated Solitude station)
  "deer-valley":        "856:UT:SNTL",  // Parleys Upper, 8,330 ft
  snowbasin:            "332:UT:SNTL",  // Ben Lomond Peak, 7,690 ft
  "park-city-mountain": "856:UT:SNTL",  // Parleys Upper, 8,330 ft
}

// Returns a date string in YYYY-MM-DD format, offset by `daysAgo` from today.
function dateString(daysAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export async function getSnowData(resortKey) {
  const triplet = SNOTEL_STATIONS[resortKey]
  if (!triplet) return null

  try {
    // Fetch snow depth (SNWD), snow water equivalent (WTEQ), and temperature (TOBS)
    // for the last 3 days so we can compute 24h and 48h new snow via depth difference.
    // Build the URL manually — URLSearchParams would encode the colons in the triplet
    // (e.g. "766:UT:SNTL" → "766%3AUT%3ASNTL") which the SNOTEL API doesn't accept.
    // Fetch 3 days back so we always have at least 2 data points (today's data
    // may not be posted yet early in the morning).
    const url =
      `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data` +
      `?stationTriplets=${triplet}` +
      `&elements=SNWD,WTEQ,TOBS` +
      `&beginDate=${dateString(3)}&endDate=${dateString(0)}` +
      `&duration=DAILY&getFlags=false`

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache response for 1 hour
    })

    if (!res.ok) return null

    const json = await res.json()

    // The API returns an array — one object per station requested
    const station = json?.[0]
    if (!station) return null

    // Build a lookup: elementCode → array of { date, value } objects (oldest first)
    const lookup = {}
    for (const el of station.data ?? []) {
      lookup[el.stationElement.elementCode] = el.values ?? []
    }

    const depthValues = lookup["SNWD"] ?? []
    const wteqValues  = lookup["WTEQ"] ?? []
    const tempValues  = lookup["TOBS"] ?? []

    // Latest value is at the end of the array (each item is { date, value })
    const baseDepth       = depthValues.at(-1)?.value ?? 0
    const depthYesterday  = depthValues.at(-2)?.value ?? baseDepth
    const depthTwoDaysAgo = depthValues.at(-3)?.value ?? baseDepth
    const wteq  = wteqValues.at(-1)?.value ?? 0
    const tempF = tempValues.at(-1)?.value ?? null

    // New snow = how much depth increased vs prior day (can't go below 0)
    const newSnow24 = Math.max(0, baseDepth - depthYesterday)
    const newSnow48 = Math.max(0, baseDepth - depthTwoDaysAgo)

    return {
      baseDepth:  Math.round(baseDepth),           // total snow depth in inches
      newSnow24:  Math.round(newSnow24 * 10) / 10, // new snow last 24h
      newSnow48:  Math.round(newSnow48 * 10) / 10, // new snow last 48h
      wteq:       Math.round(wteq * 10) / 10,      // snow water equivalent
      tempF:      isNaN(tempF) ? null : Math.round(tempF), // summit temp in °F
      // Lifts/trails: no free public API exists for Utah resorts yet
      liftsOpen:  null,
      liftsTotal: null,
      trailsOpen: null,
      trailsTotal: null,
      conditions: null,
      source:     "SNOTEL", // US government data
    }
  } catch (err) {
    console.error(`SNOTEL fetch failed for ${resortKey}:`, err.message)
    return null
  }
}
