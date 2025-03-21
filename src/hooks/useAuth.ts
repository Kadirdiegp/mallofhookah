import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Hardcode the exact redirect URL that is configured in Google Cloud Console
    const redirectUrl = import.meta.env.DEV 
      ? 'http://localhost:5173/auth/callback' 
      : 'https://mallofhookah.netlify.app/auth/callback';
      
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
    debugDiv.innerHTML = `
      <p>Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}</p>
      <p>Hardcoded Redirect URL: ${redirectUrl}</p>
      <p>Dynamic Origin: ${window.location.origin}</p>
      <p>Client ID: ${import.meta.env.VITE_GOOGLE_CLIENT_ID ? import.meta.env.VITE_GOOGLE_CLIENT_ID.substring(0, 8) + '...' : 'Not set'}</p>
    `;
    document.body.appendChild(debugDiv);
    
    // Remove the debug element after 20 seconds
    setTimeout(() => {
      if (document.body.contains(debugDiv)) {
        document.body.removeChild(debugDiv);
      }
    }, 20000);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        setError(error.message);
        console.error('Google OAuth error:', error);
        
        // Show error in the UI
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '100px';
        errorDiv.style.right = '10px';
        errorDiv.style.backgroundColor = 'rgba(255,0,0,0.8)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `<p>OAuth Error: ${error.message}</p>`;
        document.body.appendChild(errorDiv);
        
        // Remove the error element after 30 seconds
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 30000);
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error during Google sign-in:', err);
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errMessage);
      
      // Show error in the UI
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '100px';
      errorDiv.style.right = '10px';
      errorDiv.style.backgroundColor = 'rgba(255,0,0,0.8)';
      errorDiv.style.color = 'white';
      errorDiv.style.padding = '10px';
      errorDiv.style.borderRadius = '5px';
      errorDiv.style.zIndex = '9999';
      errorDiv.innerHTML = `<p>Unexpected Error: ${errMessage}</p>`;
      document.body.appendChild(errorDiv);
      
      return null;
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
    error,
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
