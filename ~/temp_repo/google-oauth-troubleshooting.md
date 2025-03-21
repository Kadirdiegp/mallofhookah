# Google OAuth Troubleshooting Guide

## Common Error: `redirect_uri_mismatch` (Error 400)

If you see an error like:

```text
Sie können sich nicht anmelden, weil diese App eine ungültige Anfrage gesendet hat. 
Error 400: redirect_uri_mismatch
```

This means the redirect URL in your OAuth request doesn't match any that are authorized in your Google Cloud Console.

## How to Fix

### 1. Check the Exact Redirect URL Your App is Using

- Your app is using: `http://localhost:5173/auth/callback` in development mode
- Supabase needs: `https://vsljkgqyszhqrbbptldq.supabase.co/auth/v1/callback`

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add ALL these URLs:

```text
https://vsljkgqyszhqrbbptldq.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
```

After adding the URLs:

1. Click "SAVE" at the bottom
2. **Wait 5-10 minutes** for Google to update their systems

### 3. Check Google Cloud Console Settings

Make sure:

- Your app is in "Testing" or "Production" status (not "Draft")
- You've added your test users if the app is in "Testing" status
- The OAuth consent screen is properly configured
- The correct APIs are enabled (usually Google OAuth API)

### 4. Clear Browser Cookies and Cache

Sometimes old OAuth cookies can cause issues. Clear your browser cookies/cache before testing again.

### 5. Verify the Correct Client ID and Secret

Make sure you're using the same Client ID and Secret in both:

- Your Supabase Auth settings
- Your application code

### 6. Test with the Provided Script

Run the test script from the project root:

```bash
node scripts/test-google-oauth.js
```

This will generate a test URL and print the exact redirect URL being used.

## Important Notes

- Changes to Google Cloud Console can take several minutes to propagate
- The redirect URL must match EXACTLY (including protocol, domain, path, etc.)
- Port numbers matter (localhost:5173 vs localhost:3000)
- You can have multiple redirect URLs configured in Google Console
