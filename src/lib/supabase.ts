import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const DB_SCHEMA = 'mgl-365'

// Public client (anon key) — for public pages + client-side auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: DB_SCHEMA },
})

// Server-side client with service role — for admin API routes
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey, {
    db: { schema: DB_SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
