import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true si el proyecto tiene las credenciales de Supabase configuradas en .env.local */
export const isCloudConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url as string, anonKey as string)
  : null
