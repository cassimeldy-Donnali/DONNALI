/*
  # Add Stripe Identity Verification to Listings

  ## Summary
  This migration adds the necessary columns to support a mandatory 3-step
  listing publication flow:
    1. Flight info submitted (manual admin review)
    2. Listing details filled
    3. Stripe Identity verification (BLOCKING - auto-publishes listing on success)

  ## Changes

  ### listings table
  - Add `is_published` (boolean, default false): listing only visible when Stripe Identity verified
  - Add `stripe_identity_session_id` (text, nullable): Stripe Identity session ID linked to this listing
  - Add `identity_verified_at` (timestamptz, nullable): timestamp when identity was verified

  ### Existing listings
  - All existing active listings are migrated to is_published = true to avoid breaking changes

  ## Notes
  - New listings start as is_published = false
  - The stripe-webhook function will set is_published = true when identity verification succeeds
  - RLS policies already exist on listings table; we only add columns here
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_published boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'stripe_identity_session_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN stripe_identity_session_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'identity_verified_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN identity_verified_at timestamptz;
  END IF;
END $$;

UPDATE listings SET is_published = true WHERE is_active = true AND is_published = false;

CREATE INDEX IF NOT EXISTS idx_listings_stripe_identity_session
  ON listings (stripe_identity_session_id)
  WHERE stripe_identity_session_id IS NOT NULL;
