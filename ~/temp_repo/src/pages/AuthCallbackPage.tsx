import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Let Supabase handle the session automatically from the URL
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          return;
        }
        
        if (!data.session) {
          // If no session, try to exchange the code for a session
          // Get the auth code from the URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const queryParams = new URLSearchParams(window.location.search);
          
          // Try to get code from different possible locations
          const code = 
            queryParams.get('code') || 
            hashParams.get('code') || 
            window.location.href.match(/code=([^&]*)/)?.[1];
          
          console.log('Auth code found:', !!code);
          
          if (!code) {
            setError('No authorization code found in URL');
            return;
          }

          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Exchange error:', error);
            setError(error.message);
            return;
          }
        }

        // Redirect to the homepage on success
        navigate('/');
      } catch (err) {
        console.error('Error handling auth callback:', err);
        setError('An unexpected error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white shadow-md rounded-md p-8 max-w-md w-full">
        {error ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center text-red-600">Authentication Error</h2>
            <p className="text-center text-gray-700 mb-4">{error}</p>
            <div className="flex justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Return to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">Processing Authentication</h2>
            <p className="text-center text-gray-700 mb-4">Please wait while we complete your sign-in...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
