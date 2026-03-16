"use client"
// components/LocationCard.js
// Shows a "Your Location" weather card at the top of the home page.
// Uses the browser's geolocation API to get coordinates, then calls
// Open-Meteo (free, no API key) for a snow/weather forecast.

import { useEffect, useState } from "react"
import { MapPin, Thermometer, CloudSnow, Wind } from "lucide-react"

export default function LocationCard() {
  const [weather, setWeather] = useState(null)   // current conditions
  const [forecast, setForecast] = useState(null) // next 3 days
  const [locationName, setLocationName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Ask the browser for the user's location
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        try {
          // Reverse geocode: turn coordinates into a city name using a free API
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const geoData = await geoRes.json()
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            "Your Location"
          setLocationName(city)

          // Fetch current weather + 3-day hourly forecast from Open-Meteo (free, no key needed)
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,snowfall,windspeed_10m,weathercode` +
            `&daily=snowfall_sum,temperature_2m_max,temperature_2m_min,weathercode` +
            `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
            `&timezone=auto&forecast_days=4`
          )
          const wData = await weatherRes.json()

          // Pull out current conditions
          setWeather({
            tempF: Math.round(wData.current.temperature_2m),
            snowfall: wData.current.snowfall,          // inches in last hour
            windMph: Math.round(wData.current.windspeed_10m),
            code: wData.current.weathercode,
          })

          // Pull out the next 3 days of forecast
          const days = wData.daily
          const upcoming = [1, 2, 3].map((i) => ({
            date: new Date(days.time[i] + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            snowIn: days.snowfall_sum[i]?.toFixed(1) ?? "0.0",
            highF: Math.round(days.temperature_2m_max[i]),
            lowF: Math.round(days.temperature_2m_min[i]),
            code: days.weathercode[i],
          }))
          setForecast(upcoming)
        } catch (err) {
          setError("Couldn't load weather data.")
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setError("Location access denied. Enable location to see local forecast.")
        setLoading(false)
      }
    )
  }, [])

  // Simple function to convert WMO weather code to an emoji
  function weatherEmoji(code) {
    if (code === 0) return "☀️"
    if (code <= 3) return "⛅"
    if (code <= 67) return "🌨️"
    if (code <= 77) return "❄️"
    if (code <= 82) return "🌧️"
    return "🌩️"
  }

  if (loading) {
    return (
      <div className="card rounded-2xl p-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200 mb-3"></div>
        <div className="h-8 w-24 rounded bg-slate-200"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card rounded-2xl p-5 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-slate-400" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4" style={{ color: "var(--accent)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Your Location — {locationName}
        </span>
      </div>

      {/* Current conditions */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
            {weather.tempF}°F
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <CloudSnow className="w-4 h-4" />
              {weather.snowfall > 0 ? `${weather.snowfall}" snow/hr` : "No snow now"}
            </span>
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Wind className="w-4 h-4" />
              {weather.windMph} mph
            </span>
          </div>
        </div>
        <div className="text-5xl">{weatherEmoji(weather.code)}</div>
      </div>

      {/* 3-day forecast */}
      {forecast && (
        <div className="grid grid-cols-3 gap-3">
          {forecast.map((day) => (
            <div
              key={day.date}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {day.date}
              </div>
              <div className="text-xl mb-1">{weatherEmoji(day.code)}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                ❄️ {day.snowIn}"
              </div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {day.highF}° / {day.lowF}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
