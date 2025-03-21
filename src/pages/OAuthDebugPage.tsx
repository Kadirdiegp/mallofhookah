import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface DebugInfo {
  supabaseUrl: string;
  supabaseRedirectUrl: string;
  windowLocationOrigin: string;
  supabaseAuthConfig: Record<string, unknown> | string;
}

const OAuthDebugPage = () => {
  const [clientId, setClientId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [redirectUrls, setRedirectUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [copying, setCopying] = useState(false);
  const [actualUsedRedirect, setActualUsedRedirect] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    // Get Supabase config
    const supabaseClient = supabase as SupabaseClient;
    // Explizite Typangabe für supabaseConfig mit potenzieller auth-Eigenschaft
    const supabaseConfig: { auth?: { redirectTo?: string } } = 
      (supabaseClient as unknown as { _config?: Record<string, unknown> })._config as { auth?: { redirectTo?: string } } || {};
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseRedirectUrl = supabaseConfig?.auth?.redirectTo || 'Nicht gefunden in Supabase-Konfiguration';
    
    // Log Supabase config for debugging
    console.log('Supabase Config:', supabaseConfig);
    
    // Get Google client ID from environment variables
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    setClientId(googleClientId || 'Nicht gefunden');

    // Generate all possible redirect URLs
    const urls = [
      'https://mallofhookah.netlify.app/auth/callback',
      `${supabaseUrl}/auth/v1/callback`,
      `http://localhost:5175/auth/callback`,
      `https://localhost:5175/auth/callback`,
      `http://localhost:5175/login`,
      `http://localhost:5175/oauth-debug`,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/login`,
      `${window.location.origin}/oauth-debug`,
      supabaseRedirectUrl
    ];
    
    // Filter out duplicates
    const uniqueUrls = [...new Set(urls)];
    setRedirectUrls(uniqueUrls);
    setSelectedUrl(uniqueUrls[0]);
    
    // Set debug info
    setDebugInfo({
      supabaseUrl,
      supabaseRedirectUrl,
      windowLocationOrigin: window.location.origin,
      supabaseAuthConfig: supabaseConfig?.auth || 'Nicht verfügbar'
    });
  }, []);

  const handleDirectTest = (redirectUrl: string) => {
    try {
      setActualUsedRedirect(redirectUrl);
      
      // Create a direct URL to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
      
      console.log('Redirecting directly to:', googleAuthUrl);
      console.log('Using redirect URI:', redirectUrl);
      
      // Open in a new tab for easier debugging
      window.open(googleAuthUrl, '_blank');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Error creating direct Google redirect:', err);
    }
  };

  const handleSupabaseTest = async (redirectUrl: string) => {
    try {
      setActualUsedRedirect(redirectUrl);
      
      console.log('Testing Supabase OAuth with redirect URL:', redirectUrl);
      const supabaseClient = supabase as SupabaseClient;
      console.log('Supabase configuration before OAuth:', 
        (supabaseClient as { _config?: Record<string, unknown> })._config);
      
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      console.log('Supabase OAuth response:', { error, data });
      
      if (error) {
        setError(error.message);
        console.error('Supabase OAuth error:', error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Unexpected error:', err);
    }
  };

  const copyAllUrls = () => {
    const content = `
Google OAuth Debug Information:

Client ID: ${clientId}

Alle diese URLs müssen in der Google Cloud Console unter "Autorisierte Weiterleitungs-URIs" konfiguriert sein:
${redirectUrls.map((url, index) => `${index + 1}. ${url}`).join('\n')}

Anleitung für die Google Cloud Console:
1. Gehen Sie zu https://console.cloud.google.com/
2. Wählen Sie Ihr Projekt
3. Navigieren Sie zu "APIs & Dienste" > "Anmeldedaten"
4. Bearbeiten Sie Ihre OAuth 2.0-Client-ID
5. Fügen Sie ALLE oben genannten URLs unter "Autorisierte Weiterleitungs-URIs" hinzu
6. Speichern Sie die Änderungen
7. Warten Sie einige Minuten, bis die Änderungen wirksam werden
`;

    navigator.clipboard.writeText(content)
      .then(() => {
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        setError('Fehler beim Kopieren in die Zwischenablage');
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">Google OAuth Debug-Tool (Erweitert)</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Fehler</p>
            <p>{error}</p>
            <button 
              className="mt-2 text-sm text-red-700 underline"
              onClick={() => setError(null)}
            >
              Schließen
            </button>
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Google Client ID</h2>
          <div className="p-4 bg-gray-100 rounded-md flex items-center justify-between">
            <code className="text-sm break-all">{clientId}</code>
          </div>
        </div>
        
        {actualUsedRedirect && (
          <div className="mb-8 p-4 bg-blue-100 border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">Zuletzt verwendete Weiterleitungs-URL</h2>
            <code className="text-sm block p-2 bg-white rounded break-all">{actualUsedRedirect}</code>
            <p className="mt-2 text-blue-700">Diese URL <strong>muss exakt so</strong> in der Google Cloud Console eingetragen sein.</p>
          </div>
        )}
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Debug-Informationen</h2>
          <div className="p-4 bg-gray-100 rounded-md overflow-auto max-h-60">
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Weiterleitungs-URLs</h2>
          <p className="mb-4 text-gray-700">
            Diese URLs müssen in der Google Cloud Console unter "Autorisierte Weiterleitungs-URIs" konfiguriert sein.
          </p>
          
          <div className="space-y-2">
            {redirectUrls.map((url, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <code className="text-sm break-all mb-2 sm:mb-0">{url}</code>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => setSelectedUrl(url)}
                    className={`px-3 py-1 text-xs rounded-md ${selectedUrl === url ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Auswählen
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={copyAllUrls}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
          >
            {copying ? 'Kopiert!' : 'Alle URLs in die Zwischenablage kopieren'}
          </button>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ausgewählte URL: <span className="text-blue-600">{selectedUrl}</span></h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleDirectTest(selectedUrl)}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Direkter Google Test
            </button>
            
            <button
              onClick={() => handleSupabaseTest(selectedUrl)}
              className="px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              Supabase Google Test
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="text-lg font-semibold text-yellow-800">Anleitung:</h3>
          <ol className="list-decimal ml-5 mt-2 space-y-2 text-yellow-800">
            <li>Kopieren Sie alle Weiterleitungs-URLs</li>
            <li>Fügen Sie diese in der Google Cloud Console unter "Autorisierte Weiterleitungs-URIs" ein</li>
            <li>Speichern Sie die Änderungen in der Google Cloud Console</li>
            <li>Warten Sie einige Minuten, bis die Änderungen wirksam werden</li>
            <li>Wählen Sie eine URL zum Testen aus und klicken Sie auf einen der Test-Buttons</li>
            <li>Beachten Sie die Konsole für weitere Informationen</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OAuthDebugPage;
