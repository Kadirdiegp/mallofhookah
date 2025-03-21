# Supabase Email Confirmation Troubleshooting Guide

## Common Issues with Email Confirmations in Supabase

### 1. Free Tier Limitations
- The free tier of Supabase has limits on email sending capabilities.
- Emails may be delayed or rate-limited.

### 2. Email Configuration
- Make sure email provider settings are correctly configured in Supabase Dashboard:
  - Navigate to Authentication > Email Templates
  - Verify SMTP settings are correct (if using custom SMTP)

### 3. Email Templates
- Check that email templates are properly set up
- Verify custom templates have valid HTML

### 4. Spam/Junk Filters
- Ask users to check their spam/junk folders
- Add your sending domain to their address book

### 5. Row Level Security (RLS) Issues
- RLS policies may be blocking user creation or modification
- Ensure proper RLS policies are in place for public.users

## How to Fix Email Confirmation Issues

### Approach 1: Use Test Email Page
1. Navigate to `/test-email` in your application
2. Check email settings to verify configuration
3. Send a test email to confirm delivery

### Approach 2: Disable Email Confirmation Temporarily
1. In Supabase Dashboard, go to Authentication > Settings
2. In "Email Auth" section, you can disable "Enable email confirmations"
3. This is helpful for testing but not recommended for production

### Approach 3: Use a Custom SMTP Provider
1. Go to Authentication > Email Settings in Supabase dashboard
2. Configure a custom SMTP provider (SendGrid, Mailgun, etc.)
3. This generally improves deliverability over the default

### Approach 4: Allow Signing In Without Email Verification
1. In the "Email Auth" settings section
2. Enable "Allow users to sign in without verifying their email"
3. Good for testing, but has security implications in production

## Testing Email Deliverability

1. Use the built-in test page at `/test-email`
2. Monitor email delivery using your SMTP provider's dashboard
3. Check spam scores using tools like [Mail Tester](https://www.mail-tester.com/)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.io/docs/guides/auth)
- [Troubleshooting Supabase Auth](https://supabase.io/docs/guides/auth/auth-helpers/nextjs#troubleshooting)
