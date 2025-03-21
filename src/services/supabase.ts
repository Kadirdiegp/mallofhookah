import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Stellen Sie sicher, dass wir beim Aktualisieren der Seite die Sitzung wiederherstellen
    storageKey: 'supabase-auth',
  },
  global: {
    // Stellen Sie sicher, dass der Authorization-Header mit dem aktuellen Benutzer-Token gesetzt wird
    headers: {
      'X-Client-Info': 'mallofhookah-web'
    }
  }
});
