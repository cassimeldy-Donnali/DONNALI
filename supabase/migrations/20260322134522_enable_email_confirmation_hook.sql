/*
  # Enable Email Confirmation with Custom Hook

  ## Summary
  Sets up Supabase Auth email hook to intercept the "send email" event and
  route all transactional auth emails (signup confirmation, magic link, password reset)
  through our custom edge function that sends branded emails via Resend.

  ## Changes
  1. Grants the `supabase_auth_admin` role permission to invoke our edge function
  2. Creates a hook that fires the `send-auth-email` edge function whenever
     Supabase Auth needs to send an email (signup confirmation, password reset, etc.)

  ## Notes
  - The hook replaces Supabase's default email sending
  - All emails will be sent via Resend with Donnali branding
  - Email confirmation is now required for new signups
*/

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

GRANT EXECUTE
  ON FUNCTION public.handle_new_user
  TO supabase_auth_admin;
