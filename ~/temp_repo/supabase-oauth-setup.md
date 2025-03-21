# Supabase OAuth Setup Guide

This guide provides instructions for setting up OAuth with Google in your Supabase project.

## Prerequisites

- A Supabase project
- A Google Cloud Platform account
- Basic knowledge of OAuth 2.0

## Setting Up Google OAuth

### Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Enter a name for your OAuth client
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - `http://localhost:3000` (for Supabase CLI)
   - Your production URL
8. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (local development)
   - `http://localhost:3000/auth/v1/callback` (Supabase CLI)
   - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback` (Supabase)
   - Your production callback URL
9. Click "Create"

### Step 2: Configure Supabase Auth

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" and click "Enable"
5. Enter your Client ID and Client Secret
6. Save the configuration

### Step 3: Update Environment Variables

Add your Google OAuth credentials to your `.env` file:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
```

## Testing the Integration

You can test your OAuth integration with:

```bash
node scripts/test-google-oauth.js
```

## Common Issues

- **Redirect URI Mismatch**: Ensure the redirect URIs in Google Cloud Console match exactly with what Supabase expects
- **Credentials Not Working**: Verify the client ID and secret are correctly copied
- **Callback Errors**: Check browser console and Supabase logs for detailed error messages

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
