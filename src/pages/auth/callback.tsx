import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Diese Funktion verarbeitet den OAuth Callback
    const handleAuthCallback = async () => {
      console.log('Auth callback page loaded');
      
      try {
        // Die URL enthält die OAuth-Daten, die Supabase verarbeiten muss
        // Supabase Session wird automatisch gesetzt, wenn die Authentifizierung erfolgreich ist
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing OAuth callback:', error);
          throw error;
        }
        
        if (data?.session) {
          console.log('Authentication successful, user logged in:', data.session.user.email);
          // Auf eine Startseite umleiten, nachdem der Benutzer erfolgreich eingeloggt ist
          navigate('/');
        } else {
          console.log('No session found in callback, redirecting to login');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 max-w-md w-full bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Authentication in progress...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Sie werden gleich weitergeleitet...
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
