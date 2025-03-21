import { supabase } from '../services/supabase';

/**
 * Funktion, um die Benutzer-ID zu verifizieren und das Format zu überprüfen
 */
export async function verifyAuthUserId() {
  try {
    // Aktuelle Sitzung abrufen
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (!session) {
      console.error('Keine aktive Sitzung gefunden');
      return { userId: null, authUid: null, isMatch: false, sessionData: null };
    }
    
    // Benutzer-ID aus der Sitzung
    const userId = session.user.id;
    
    // Direkten RPC-Aufruf an die Supabase-Funktion machen, um auth.uid() zu erhalten
    const { data: authUidData, error: authUidError } = await supabase.rpc('get_auth_uid');
    
    if (authUidError) {
      console.error('Fehler beim Abrufen von auth.uid():', authUidError);
      return { userId, authUid: null, isMatch: false, sessionData };
    }
    
    const authUid = authUidData;
    const isMatch = userId === authUid;
    
    console.log('Benutzer-ID Vergleich:', {
      userId,
      authUid,
      isMatch
    });
    
    return { userId, authUid, isMatch, sessionData };
    
  } catch (error) {
    console.error('Fehler bei der Auth-Überprüfung:', error);
    return { userId: null, authUid: null, isMatch: false, sessionData: null };
  }
}
