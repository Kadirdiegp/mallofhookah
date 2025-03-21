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
    // Use a hardcoded redirect URL for now to ensure it matches exactly what's configured in Google
    const redirectUrl = import.meta.env.DEV 
      ? 'http://localhost:5173/auth/callback' 
      : `${window.location.origin}/auth/callback`;
      
    console.log('Using redirect URL for Google OAuth:', redirectUrl);
    
    // Create a logging element to show the URL in the UI for debugging
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    debugDiv.style.borderRadius = '5px';
    debugDiv.style.zIndex = '9999';
    debugDiv.innerHTML = `<p>Redirect URL: ${redirectUrl}</p>`;
    document.body.appendChild(debugDiv);
    
    // Remove the debug element after 10 seconds
    setTimeout(() => {
      if (document.body.contains(debugDiv)) {
        document.body.removeChild(debugDiv);
      }
    }, 10000);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          // Note: We don't expose the client secret to the browser for security reasons
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
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
