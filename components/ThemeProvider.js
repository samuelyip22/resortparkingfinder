"use client"
// components/ThemeProvider.js
// Handles dark/light mode switching.
// Wraps the whole app so any child can use the theme.
// Saves the user's preference to localStorage so it persists between visits.

import { createContext, useContext, useEffect, useState } from "react"

// Create a "context" — a way to share the theme state with any component
const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Default to "light" until we read from localStorage
  const [theme, setTheme] = useState("light")

  // On first load, read saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("skispot-theme") || "light"
    setTheme(saved)
    document.documentElement.dataset.theme = saved
  }, [])

  // Toggle between light and dark, save the new value
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("skispot-theme", next)
    document.documentElement.dataset.theme = next
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook — any component can call useTheme() to get the current theme
// and the toggle function. Example: const { theme, toggleTheme } = useTheme()
export function useTheme() {
  return useContext(ThemeContext)
}
