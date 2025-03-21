# Setting up Google OAuth with Supabase

To configure Google OAuth in your Supabase project, follow these steps:

## 1. Supabase Configuration

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your "Mall of Hookah" project
3. Navigate to "Authentication" in the left sidebar
4. Click on "Providers"
5. Find "Google" and click on the toggle to enable it
6. Enter the following details:
   - **Client ID**: `885966166489-ipgab9n5605el3ai1kj0m4lsmhp5b6r7.apps.googleusercontent.com`
   - **Client Secret**: `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`
   - **Authorized Redirect URLs**: These are preconfigured by Supabase, no action needed

## 2. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project ("mallofhookah")
3. Navigate to "APIs & Services" > "Credentials"
4. Select your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   - `https://vsljkgqyszhqrbbptldq.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://yourlivesite.com/auth/callback` (for production when deployed)

## 3. Testing the OAuth Flow

1. Make sure your application is running
2. Navigate to the login page
3. Click on the "Sign in with Google" button
4. Complete the Google authentication
5. You should be redirected back to your application and logged in

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the redirect URLs are correctly configured in both Supabase and Google Cloud Console
3. Ensure environment variables are loaded correctly
4. Check Supabase logs for authentication errors in the "Authentication" > "Logs" section

## Security Notes

- Never expose your Client Secret in client-side code
- The Client ID is safe to use in the browser
- For production, consider setting up separate OAuth credentials for development and production environments
