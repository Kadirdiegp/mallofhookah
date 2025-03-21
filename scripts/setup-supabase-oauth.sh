#!/bin/bash

# Load environment variables
source ../.env

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Instructions for manual setup as automated setup requires Supabase service key
echo "=== Mall of Hookah: Google OAuth Setup ==="
echo ""
echo "To configure Google OAuth in your Supabase project:"
echo ""
echo "1. Log in to your Supabase dashboard at https://app.supabase.com"
echo "2. Select your 'Mall of Hookah' project"
echo "3. Navigate to 'Authentication' in the left sidebar"
echo "4. Click on 'Providers'"
echo "5. Find 'Google' and click on the toggle to enable it"
echo "6. Enter the following details:"
echo "   - Client ID: $VITE_GOOGLE_CLIENT_ID"
echo "   - Client Secret: $VITE_GOOGLE_CLIENT_SECRET"
echo ""
echo "7. Go to the Google Cloud Console (https://console.cloud.google.com)"
echo "8. Make sure the following redirect URLs are configured:"
echo "   - https://vsljkgqyszhqrbbptldq.supabase.co/auth/v1/callback"
echo "   - http://localhost:5173/auth/callback"
echo ""
echo "=== Verification ==="
echo "To verify your setup, run the test script:"
echo "node scripts/test-google-oauth.js"
echo ""
echo "This will generate a URL you can visit to test the authentication flow."
