import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Bestimmen Sie die tatsächliche URL basierend auf der aktuellen Domäne, nicht der Umgebung
// Vermeidet das Problem mit import.meta.env.DEV, das möglicherweise nicht korrekt auf Netlify erkannt wird
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectUrl = isLocalhost
  ? `${window.location.origin}/auth/callback`
  : 'https://mallofhookah.netlify.app/auth/callback';

console.log('Current hostname:', window.location.hostname);
console.log('Using redirect URL for Supabase OAuth:', redirectUrl);

// Verwende 'any' als Platzhalter für Database-Typ
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
      // In neueren Versionen von Supabase gibt es keinen redirectTo-Parameter in den Auth-Optionen
      // Dieser wird nur bei den spezifischen Auth-Methoden verwendet
    },
    global: {
      // Stellen Sie sicher, dass der Authorization-Header mit dem aktuellen Benutzer-Token gesetzt wird
      headers: {
        'X-Client-Info': 'mallofhookah-web'
      }
    }
  }
);
