// scripts/setup-db.js
// One-time setup script — creates the Supabase database tables for SkiSpot.
// Run with: node scripts/setup-db.js
//
// Requires SUPABASE_SERVICE_ROLE_KEY to be set in .env.local
// (Settings → API → "secret" key in Supabase dashboard)

import { readFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"

// Load env vars manually (this script runs outside Next.js)
const envFile = readFileSync(".env.local", "utf8")
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

// Use the service role key — this bypasses RLS and can create tables
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

const sql = readFileSync("supabase/schema.sql", "utf8")

// Split SQL into individual statements and run each one
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"))

console.log(`Running ${statements.length} SQL statements...`)

for (const statement of statements) {
  const { error } = await supabase.rpc("exec_sql", { sql: statement + ";" }).catch(() => ({}))

  // Fallback: use the REST API directly for DDL statements
  if (error) {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: statement + ";" }),
    })
    if (!res.ok) {
      const text = await res.text()
      // Ignore "already exists" errors — safe to re-run
      if (!text.includes("already exists")) {
        console.error(`❌  Statement failed:\n${statement}\nError: ${text}`)
      }
    }
  }
}

console.log("✅  Database setup complete!")
