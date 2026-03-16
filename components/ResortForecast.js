// components/ResortForecast.js
// Shows a 4-day mountain weather forecast for a resort.
// Uses Open-Meteo (free, no API key needed) with the resort's coordinates.
// This is a SERVER component — data fetches happen on the server before the page loads.

// Coordinates for each resort (latitude, longitude, elevation in meters)
const RESORT_COORDS = {
  snowbird:      { lat: 40.5883, lon: -111.6558, elev: 2365 },
  alta:          { lat: 40.5888, lon: -111.6377, elev: 2600 },
  brighton:      { lat: 40.5985, lon: -111.5832, elev: 2665 },
  solitude:      { lat: 40.6199, lon: -111.5921, elev: 2440 },
  "deer-valley": { lat: 40.6374, lon: -111.4783, elev: 2195 },
  snowbasin:     { lat: 41.2160, lon: -111.8566, elev: 2290 },
  "park-city":   { lat: 40.6514, lon: -111.5080, elev: 2100 },
}

// WMO weather code → readable description
function weatherDesc(code) {
  if (code === 0) return "Clear"
  if (code <= 3) return "Partly Cloudy"
  if (code <= 49) return "Foggy"
  if (code <= 55) return "Drizzle"
  if (code <= 67) return "Rain"
  if (code <= 77) return "Snow"
  if (code <= 82) return "Showers"
  return "Stormy"
}

// WMO weather code → emoji
function weatherEmoji(code) {
  if (code === 0) return "☀️"
  if (code <= 3) return "⛅"
  if (code <= 49) return "🌫️"
  if (code <= 55) return "🌦️"
  if (code <= 67) return "🌧️"
  if (code <= 77) return "🌨️"
  if (code <= 82) return "🌧️"
  return "⛈️"
}

export default async function ResortForecast({ resortSlug }) {
  const coords = RESORT_COORDS[resortSlug]

  if (!coords) {
    return <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Forecast unavailable.</p>
  }

  let days = null

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${coords.lat}&longitude=${coords.lon}` +
      `&daily=snowfall_sum,temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
      `&timezone=America/Denver&forecast_days=4`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    )
    const data = await res.json()

    // Build array of 4 forecast days
    days = data.daily.time.map((date, i) => ({
      label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      snowIn: parseFloat(data.daily.snowfall_sum[i] || 0).toFixed(1),
      highF: Math.round(data.daily.temperature_2m_max[i]),
      lowF: Math.round(data.daily.temperature_2m_min[i]),
      windMph: Math.round(data.daily.windspeed_10m_max[i]),
      code: data.daily.weathercode[i],
    }))
  } catch {
    return <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Forecast temporarily unavailable.</p>
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        4-Day Mountain Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {days.map((day, i) => (
          <div
            key={i}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
          >
            {/* Day label */}
            <div className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              {i === 0 ? "Today" : day.label}
            </div>
            {/* Weather icon */}
            <div className="text-3xl mb-2">{weatherEmoji(day.code)}</div>
            {/* Description */}
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
              {weatherDesc(day.code)}
            </div>
            {/* Snow expected */}
            <div className="text-sm font-bold mb-1" style={{ color: day.snowIn > 0 ? "var(--accent)" : "var(--text-secondary)" }}>
              ❄️ {day.snowIn}"
            </div>
            {/* High / Low */}
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {day.highF}° / {day.lowF}°
            </div>
            {/* Wind */}
            <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              💨 {day.windMph} mph
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
