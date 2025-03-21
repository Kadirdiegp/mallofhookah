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
    const redirectUrl = 'https://mallofhookah.netlify.app/auth/callback';
    const supabaseRedirectUrl = 'https://vsljkgqyszphqrbbptldq.supabase.co/auth/v1/callback';
      
    console.log('Using redirect URL for Google OAuth:', redirectUrl);
    
    // Create an advanced debug div with more information
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.width = 'calc(100% - 20px)';
    debugDiv.style.maxHeight = '80vh';
    debugDiv.style.overflowY = 'auto';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '15px';
    debugDiv.style.borderRadius = '5px';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.fontSize = '14px';
    debugDiv.style.fontFamily = 'monospace';
    
    debugDiv.innerHTML = `
      <h2 style="color: #4CAF50; margin-top: 0;">OAuth Debug Informationen</h2>
      <p><strong>Environment:</strong> ${import.meta.env.DEV ? 'Development' : 'Production'}</p>
      <p><strong>App-Weiterleitungs-URL:</strong> ${redirectUrl}</p>
      <p><strong>Supabase-Weiterleitungs-URL:</strong> ${supabaseRedirectUrl}</p>
      <p><strong>Dynamische Origin:</strong> ${window.location.origin}</p>
      <p><strong>Client ID:</strong> ${import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'Nicht gesetzt'}</p>
      <h3 style="color: #4CAF50;">Tipps zur Fehlerbehebung:</h3>
      <ol>
        <li>Stellen Sie sicher, dass die folgenden URLs in der Google Cloud Console unter "Authorized redirect URIs" konfiguriert sind:
          <ul style="margin-left: 20px;">
            <li>${redirectUrl}</li>
            <li>${supabaseRedirectUrl}</li>
          </ul>
        </li>
        <li>Überprüfen Sie, ob die URLs exakt übereinstimmen (kein zusätzlicher Schrägstrich am Ende, keine Leerzeichen).</li>
        <li>Eventuell gibt es eine Latenz in der Google Cloud Console - Änderungen können bis zu 5 Minuten dauern, bis sie wirksam werden.</li>
        <li>Löschen Sie Browser-Cookies für Google und versuchen Sie es erneut.</li>
      </ol>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button id="closeDebug" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Schließen</button>
        <button id="copyDebug" style="background-color: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">In Zwischenablage kopieren</button>
      </div>
    `;
    document.body.appendChild(debugDiv);
    
    // Add event listeners for the buttons
    document.getElementById('closeDebug')?.addEventListener('click', () => {
      if (document.body.contains(debugDiv)) {
        document.body.removeChild(debugDiv);
      }
    });
    
    document.getElementById('copyDebug')?.addEventListener('click', () => {
      const debugInfo = `
OAuth Debug Informationen:
- Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}
- App-Weiterleitungs-URL: ${redirectUrl}
- Supabase-Weiterleitungs-URL: ${supabaseRedirectUrl}
- Dynamische Origin: ${window.location.origin}
- Client ID: ${import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'Nicht gesetzt'}

Fügen Sie diese Weiterleitungs-URLs in die Google Cloud Console ein:
1. ${redirectUrl}
2. ${supabaseRedirectUrl}
      `;
      navigator.clipboard.writeText(debugInfo).then(() => {
        alert('Debug-Informationen wurden in die Zwischenablage kopiert!');
      });
    });
    
    // Add buttons for direct testing
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '20px';
    buttonContainer.style.right = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.zIndex = '9999';
    document.body.appendChild(buttonContainer);
    
    // Test Supabase OAuth
    const supabaseButton = document.createElement('button');
    supabaseButton.style.backgroundColor = '#3ECF8E';
    supabaseButton.style.color = 'white';
    supabaseButton.style.padding = '12px 20px';
    supabaseButton.style.border = 'none';
    supabaseButton.style.borderRadius = '5px';
    supabaseButton.style.cursor = 'pointer';
    supabaseButton.style.fontWeight = 'bold';
    supabaseButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    supabaseButton.innerText = 'Supabase OAuth testen';
    supabaseButton.onclick = async () => {
      try {
        console.log('Testing Supabase OAuth...');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        if (error) {
          console.error('Supabase OAuth error:', error);
          alert(`Supabase OAuth Error: ${error.message}`);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert(`Unexpected Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    buttonContainer.appendChild(supabaseButton);
    
    // Direct Google OAuth
    const googleButton = document.createElement('button');
    googleButton.style.backgroundColor = '#4285F4';
    googleButton.style.color = 'white';
    googleButton.style.padding = '12px 20px';
    googleButton.style.border = 'none';
    googleButton.style.borderRadius = '5px';
    googleButton.style.cursor = 'pointer';
    googleButton.style.fontWeight = 'bold';
    googleButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    googleButton.innerText = 'Direkter Google Redirect';
    googleButton.onclick = () => {
      try {
        // Create a manual redirect URL to Google OAuth
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(import.meta.env.VITE_GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(supabaseRedirectUrl)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
        
        console.log('Redirecting directly to:', googleAuthUrl);
        window.location.href = googleAuthUrl;
      } catch (err) {
        console.error('Error creating direct Google redirect:', err);
        alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    buttonContainer.appendChild(googleButton);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
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
