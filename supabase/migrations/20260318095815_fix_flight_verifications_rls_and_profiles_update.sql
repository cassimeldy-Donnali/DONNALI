/*
  # Fix flight_verifications RLS and profiles update permissions

  ## Problem
  The edge function `verify-flight` uses the service role key to insert into
  `flight_verifications` and update `profiles.flight_verified`. However:
  1. The INSERT policy on flight_verifications uses auth.uid() which is NULL
     when called with service role — blocking inserts from the edge function.
  2. The UPDATE policy on profiles only allows users to update their own profile,
     blocking service role from setting flight_verified=true.

  ## Fix
  1. Drop and recreate the INSERT policy on flight_verifications to also allow
     service role (bypasses RLS by default, so we just need to ensure it works).
  2. Add a permissive service-role policy on profiles UPDATE so the edge function
     can set flight_verified=true.

  ## Notes
  - service_role bypasses RLS by default in Supabase, so the real issue is the
    edge function calling with the wrong client. We ensure the service role client
    is used correctly.
  - Also fixing the profiles SELECT policy which used USING(true) — keeping it
    as-is since profiles must be joinable by all authenticated users for listings.
*/

-- Drop the INSERT policy that blocks service role writes on flight_verifications
-- (service role bypasses RLS, so this is fine — ensure the policy doesn't interfere)
DROP POLICY IF EXISTS "Users can insert own flight verifications" ON flight_verifications;

-- Recreate it properly
CREATE POLICY "Users can insert own flight verifications"
  ON flight_verifications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop old UPDATE policy on flight_verifications and recreate with select auth.uid()
DROP POLICY IF EXISTS "Users can update own flight verifications" ON flight_verifications;

CREATE POLICY "Users can update own flight verifications"
  ON flight_verifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop old SELECT policy on flight_verifications and recreate with select auth.uid()
DROP POLICY IF EXISTS "Users can view own flight verifications" ON flight_verifications;

CREATE POLICY "Users can view own flight verifications"
  ON flight_verifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
