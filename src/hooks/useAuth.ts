import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for changes to auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  };

  const signInWithGoogle = async () => {
    // Bestimmen Sie die tatsächliche URL basierend auf der aktuellen Domäne, nicht der Umgebung
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isLocalhost
      ? `${window.location.origin}/auth/callback`
      : 'https://mallofhookah.netlify.app/auth/callback';
      
    console.log('Current hostname:', window.location.hostname);
    console.log('Using redirect URL for Google OAuth:', redirectUrl);
    
    try {
      // Der redirectTo-Parameter muss sowohl in der Initialisierung als auch hier angegeben werden
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Spezifische Scopes für Google, falls benötigt
          scopes: 'email profile'
        }
      });
      
      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error during Google sign-in:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };
}

/**
 * Debug function to check email confirmation settings
 */
export async function checkEmailConfirmationSettings() {
  try {
    console.log('Checking email settings in Supabase...');
    
    // Get current auth settings
    const { data, error } = await supabase.rpc('get_auth_settings');
    
    if (error) {
      console.error('Error fetching auth settings:', error);
      return false;
    }
    
    console.log('Auth settings:', data);
    return data;
  } catch (e) {
    console.error('Error checking email settings:', e);
    return false;
  }
}

/**
 * Function to send test email for debugging
 */
export async function sendTestEmail(email: string) {
  try {
    console.log('Attempting to send test email...');
    
    // Try to send a password reset email as a test
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('Error sending test email:', error);
      return false;
    }
    
    console.log('Test email request sent:', data);
    return true;
  } catch (e) {
    console.error('Error in test email function:', e);
    return false;
  }
}
