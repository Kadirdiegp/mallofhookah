# Google OAuth Implementation Guide

## Overview

This document describes the implementation of Google OAuth authentication in the Mall of Hookah e-commerce platform. This feature allows users to sign in using their Google accounts, providing a seamless authentication experience.

## Key Components

### 1. Supabase Authentication

The authentication flow utilizes Supabase Auth with Google as the OAuth provider. Supabase handles the token exchange and session management.

### 2. Key Files

- **`src/hooks/useAuth.ts`**: Custom hook that manages authentication state and provides authentication methods including Google sign-in.
- **`src/pages/AuthCallbackPage.tsx`**: Handles the OAuth callback and processes the authorization code.
- **`src/pages/LoginPage.tsx`**: Contains the Google sign-in button.
- **`src/components/layout/Header.tsx`**: Displays user information after successful sign-in.
- **`src/pages/ProfilePage.tsx`**: Shows user profile information from Google account.

### 3. Environment Variables

The following environment variables are required:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## OAuth Flow

1. User clicks "Sign in with Google" button on the login page
2. User is redirected to Google's authentication page
3. After successful authentication, Google redirects back to our callback URL with an authorization code
4. The `AuthCallbackPage` component exchanges this code for a session via Supabase
5. User is redirected to the homepage, now authenticated
6. User profile information from Google is displayed in the UI

## Redirect URIs

The following redirect URIs must be configured in the Google Cloud Console:

- `https://vsljkgqyszhqrbbptldq.supabase.co/auth/v1/callback` (Supabase callback)
- `http://localhost:5173/auth/callback` (Development environment)
- `https://mallofhookah.com/auth/callback` (Production environment - add when deploying)

## Troubleshooting

If you encounter issues with Google OAuth, check:

1. That the correct redirect URIs are configured in Google Cloud Console
2. That the authorization code is being properly extracted in the callback page
3. Browser console logs for any errors during the authentication process
4. Supabase authentication logs in the Supabase dashboard

## Security Considerations

- The client secret is never exposed to the frontend
- Authentication tokens are stored securely by Supabase
- Session management follows security best practices

## User Experience Enhancements

- The header displays the user's Google profile picture when available
- The profile page populates user information from Google account data
- Clear error messages guide users if authentication issues occur
