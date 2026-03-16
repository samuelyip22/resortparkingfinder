// lib/supabase.js
// Creates and exports a single Supabase client used throughout the app.
// Supabase is our database — it stores alert subscriptions and parking snapshots.
//
// We create the client once here and import it wherever we need database access,
// rather than creating a new connection every time.

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// createClient connects to your Supabase project using the URL and key from .env.local
export const supabase = createClient(supabaseUrl, supabaseKey)
