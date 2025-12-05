import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || !supabaseServiceRoleKey) {
  throw new Error("❌ Missing Supabase env variables")
}

// Public client (frontend-safe)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client (service role, can bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
