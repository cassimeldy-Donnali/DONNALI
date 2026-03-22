/*
  # Traveler Verification System

  ## Overview
  Adds a comprehensive verification system for travelers including:
  - Identity verification tracking (via Stripe Identity)
  - Flight verification tracking (via AviationStack API)
  - Overall trust score per user

  ## New Tables

  ### `identity_verifications`
  Tracks identity document verification status per user.
  - `id` - unique identifier
  - `user_id` - references auth.users
  - `status` - pending | processing | verified | rejected
  - `stripe_verification_session_id` - Stripe Identity session reference
  - `verified_at` - timestamp when verified
  - `created_at` / `updated_at`

  ### `flight_verifications`
  Tracks flight verification requests tied to listings/bookings.
  - `id` - unique identifier
  - `user_id` - the traveler
  - `flight_number` - e.g. "AF1234"
  - `flight_date` - date of the flight
  - `departure_airport` - IATA code e.g. "CDG"
  - `arrival_airport` - IATA code e.g. "YUL"
  - `status` - pending | verified | failed | manual_review
  - `aviationstack_response` - raw API response stored as JSONB
  - `verified_at`
  - `created_at`

  ## Modified Tables

  ### `profiles` (adding verification columns)
  - `identity_verified` - boolean, default false
  - `flight_verified` - boolean, default false
  - `trust_score` - integer 0-100

  ## Security
  - RLS enabled on all new tables
  - Users can only read/write their own verification records
  - Service role can update all records (for edge functions)
*/

-- Add verification fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'identity_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN identity_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'flight_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN flight_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trust_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trust_score integer DEFAULT 0;
  END IF;
END $$;

-- Identity verifications table
CREATE TABLE IF NOT EXISTS identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected')),
  stripe_verification_session_id text,
  rejection_reason text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identity verifications"
  ON identity_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identity verifications"
  ON identity_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identity verifications"
  ON identity_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Flight verifications table
CREATE TABLE IF NOT EXISTS flight_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_number text NOT NULL,
  flight_date date NOT NULL,
  departure_airport text,
  arrival_airport text,
  airline_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'manual_review')),
  aviationstack_response jsonb,
  failure_reason text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flight_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flight verifications"
  ON flight_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flight verifications"
  ON flight_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flight verifications"
  ON flight_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_verifications_user_id ON flight_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_verifications_status ON flight_verifications(status);

-- Function to auto-update trust_score on profiles
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET trust_score = (
    CASE WHEN identity_verified THEN 50 ELSE 0 END +
    CASE WHEN flight_verified THEN 40 ELSE 0 END +
    10
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
