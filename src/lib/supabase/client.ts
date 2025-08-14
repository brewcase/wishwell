import { createClient } from '@supabase/supabase-js'

// 🔑 CONCEPT: Environment Variables
// These are secret keys stored in .env.local (never committed to git)
// NEXT_PUBLIC_ prefix makes them available in browser (safe for public keys)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🏗️ CONCEPT: Singleton Pattern
// We create ONE instance of Supabase client that's reused everywhere
// This prevents multiple connections and ensures consistent state
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 📖 WHAT THIS DOES:
// - Creates a connection to your Supabase project
// - Handles authentication automatically
// - Manages user sessions (login state)
// - Provides database access with user-level security