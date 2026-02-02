import { createBrowserClient } from '@supabase/ssr'

// Singleton instance - ensures all hooks share the same auth state
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  console.log('[Supabase] Created singleton client instance')

  return supabaseInstance
}

// Backwards compatibility - same function, new name internally
export function createClient() {
  return getSupabaseClient()
}
