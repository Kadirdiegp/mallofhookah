import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Get directory name for current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the parent directory
const envPath = resolve(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

// Set environment variables
for (const key in envConfig) {
  process.env[key] = envConfig[key];
}

// Create a Supabase client with the credentials from the environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleOAuth() {
  try {
    // This will generate a URL that you can visit to test the OAuth flow
    const redirectUrl = 'http://localhost:5173/auth/callback';
    console.log('Using redirect URL:', redirectUrl);
    
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
      console.error('Error generating Google OAuth URL:', error);
      return;
    }

    console.log('\n===== GOOGLE OAUTH TEST =====');
    console.log('Success! Visit this URL to test the Google OAuth flow:');
    console.log(data.url);
    console.log('\n===== IMPORTANT =====');
    console.log('If you see "No authorization code found in URL" after authentication:');
    console.log('1. Verify your AuthCallbackPage.tsx is correctly handling the code parameter');
    console.log('2. Make sure your browser is allowing third-party cookies');
    console.log('3. Try the Sign In button directly from your app instead of this test script\n');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testGoogleOAuth();
