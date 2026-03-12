import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase Error: Missing environment variables.')
  throw new Error('Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
}

if (supabaseUrl.includes('YOUR_SUPABASE') || supabaseAnonKey.includes('YOUR_SUPABASE')) {
  console.error('❌ Supabase Error: Placeholder values detected.')
  throw new Error('Las variables de Supabase tienen valores de ejemplo (placeholders). Por favor configura las reales.')
}

// Debugging (safe)
console.log('✅ Supabase Client Initializing...')
console.log('URL:', supabaseUrl.substring(0, 20) + '...')
console.log('Key starts with:', supabaseAnonKey.substring(0, 10) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
