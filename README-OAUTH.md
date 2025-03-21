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

1. Generate a Google OAuth URL using your Supabase configuration
2. Output the URL to the console
3. You can visit this URL to test the authentication flow

If authentication is successful, you'll be redirected back to your application.

## Configuration

The OAuth credentials are stored in the `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=885966166489-ipgab9n5605el3ai1kj0m4lsmhp5b6r7.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
```

## Important Files

- `src/hooks/useAuth.ts` - Contains the authentication hook with Google OAuth integration
- `src/pages/AuthCallbackPage.tsx` - Handles the OAuth redirect callback
- `src/pages/LoginPage.tsx` and `src/pages/RegisterPage.tsx` - Include Google sign-in buttons
- `supabase-oauth-setup.md` - Detailed instructions for configuring Supabase

## Supabase Setup

Follow the instructions in `supabase-oauth-setup.md` to configure your Supabase project for Google OAuth.

## Security Notes

- The client secret should never be exposed in client-side code
- For production, consider setting up separate OAuth credentials for development and production environments
- Always use HTTPS in production environments
- Implement proper CSRF protection and validate OAuth states

## Troubleshooting

If you encounter issues with OAuth:

1. Check browser console errors
2. Verify redirect URLs in both Google Cloud Console and Supabase
3. Make sure the environment variables are loaded correctly
4. Check Supabase auth logs for errors
