// Utilidad compartida — Inicializa cliente Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://dbzvglcrtsrmijacaquf.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
