// lib/snow.js
// Fetches snow conditions from the SnoCountry API.
// Returns a clean, normalized object for each resort.
// API docs: http://feeds.snocountry.net/
//
// For now we use the public demo key (SnoCountry.example) which works for testing.
// When ready for production, get a real key from snocountry.com and add it to .env.local.

const SNOCOUNTRY_KEY = process.env.SNOCOUNTRY_API_KEY || "SnoCountry.example"
const BASE_URL = "http://feeds.snocountry.net/getSnowReport.php"

// Map our internal resort IDs to their SnoCountry API IDs
// These IDs come from the SnoCountry resort list endpoint
const SNOCOUNTRY_IDS = {
  snowbird: "2074",
  alta: "2073",
  brighton: "2081",
  solitude: "2082",
  "deer-valley": "2078",
  snowbasin: "2080",
  "park-city-mountain": "2079",
}

export async function getSnowData(resortKey) {
  const apiId = SNOCOUNTRY_IDS[resortKey]

  // If we don't have an ID mapping yet, return null gracefully
  if (!apiId) return null

  try {
    const res = await fetch(
      `${BASE_URL}?apiKey=${SNOCOUNTRY_KEY}&skiAreaIds=${apiId}`,
      {
        // Cache this for 1 hour — snow doesn't change that fast
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) return null

    const data = await res.json()
    const report = data.items?.[0]

    if (!report) return null

    // Normalize the API response into a clean shape our components expect
    return {
      baseDepth: report.baseDepth || 0,         // inches of snow at base
      newSnow24: report.freshSnow || 0,          // inches in last 24 hours
      newSnow48: report.fortyEightHourSnowfall || 0,
      liftsOpen: report.liftsOpen || 0,
      liftsTotal: report.liftsTotal || 0,
      trailsOpen: report.trailsOpen || 0,
      trailsTotal: report.trailsTotal || 0,
      conditions: report.snowConditions || "Unknown",  // e.g. "Packed Powder"
      updatedAt: report.reportDate || null,
    }
  } catch (err) {
    // If the API fails for any reason, return null — the UI handles this gracefully
    console.error(`SnoCountry fetch failed for ${resortKey}:`, err.message)
    return null
  }
}
