# Google OAuth Setup for Mall of Hookah

## Overview

This repository includes Google OAuth integration for user authentication via Supabase. This allows users to sign up and log in using their Google accounts.

## Testing the OAuth Integration

A test script is provided to verify that your Google OAuth credentials are working correctly with Supabase:

```bash
# Install required dependencies
npm install --save-dev dotenv

# Run the test script
node scripts/test-google-oauth.js
```

This script will:

1. Load environment variables from your `.env` file
2. Check that your Google OAuth credentials are properly configured
3. Validate the connection to the Supabase authentication service

## Configuration

The OAuth credentials are stored in the `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

## Important Files

- `scripts/test-google-oauth.js` - Script to test the OAuth configuration
- `src/hooks/useAuth.ts` - Custom hook that handles authentication
- `src/pages/LoginPage.tsx` - Login page with Google OAuth button
- `src/pages/AuthCallbackPage.tsx` - Handles OAuth callback and redirects

## Configuring Google OAuth

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen
3. Create OAuth credentials (Web application type)
4. Add authorized JavaScript origins and redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
   - Redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://yourdomain.com/auth/callback`
5. Add the credentials to your `.env` file

## Configuring Supabase

1. Go to your Supabase dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Save the configuration

## Troubleshooting

If you encounter issues with the OAuth flow:

1. Verify that your redirect URIs are correctly configured in both Google Cloud Console and Supabase
2. Check the browser console for errors during the authentication process
3. Make sure your environment variables are loaded correctly
4. Use the `public/oauth-debug.html` page to test your configuration
