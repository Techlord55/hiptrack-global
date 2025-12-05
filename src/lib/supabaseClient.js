import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate ENV
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase URL or Key missing in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
