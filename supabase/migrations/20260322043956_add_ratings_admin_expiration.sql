/*
  # Ratings, Admin Roles & Listing Expiration

  ## Changes

  ### 1. New Tables
  - `ratings`: User ratings after a contact has been unlocked
    - `id`: UUID primary key
    - `rater_id`: User who gives the rating
    - `rated_user_id`: User being rated
    - `listing_id`: Related listing
    - `score`: 1-5 stars
    - `comment`: Optional comment
    - `created_at`: Timestamp

  ### 2. Modified Tables
  - `profiles`:
    - Add `is_admin` boolean column (default false)
    - Add `bio` text column
    - Add `rating_avg` numeric for computed average rating
    - Add `rating_count` integer

  - `listings`:
    - Add `expires_at` timestamptz (auto set to flight_date + 1 day)
    - Add `expiry_notified` boolean to track if user was notified

  ### 3. Security
  - RLS on ratings table
  - Only buyers who unlocked a contact can rate that listing's owner

  ### 4. Functions
  - Trigger to update profile rating_avg and rating_count after new rating
*/

-- Add columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating_avg') THEN
    ALTER TABLE profiles ADD COLUMN rating_avg numeric(3,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating_count') THEN
    ALTER TABLE profiles ADD COLUMN rating_count integer DEFAULT 0;
  END IF;
END $$;

-- Add columns to listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'expires_at') THEN
    ALTER TABLE listings ADD COLUMN expires_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'expiry_notified') THEN
    ALTER TABLE listings ADD COLUMN expiry_notified boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'is_published') THEN
    ALTER TABLE listings ADD COLUMN is_published boolean DEFAULT true;
  END IF;
END $$;

-- Set expires_at for existing listings that don't have it yet
UPDATE listings
SET expires_at = (flight_date::timestamptz + interval '1 day')
WHERE expires_at IS NULL;

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(rater_id, listing_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by authenticated users"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only unlocked buyers can submit ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = rater_id
    AND EXISTS (
      SELECT 1 FROM unlocked_contacts
      WHERE unlocked_contacts.buyer_id = auth.uid()
      AND unlocked_contacts.listing_id = ratings.listing_id
    )
  );

CREATE POLICY "Raters can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = rater_id)
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Raters can delete own ratings"
  ON ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = rater_id);

-- Function to update profile rating stats when a rating is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.rated_user_id;
  ELSE
    target_user_id := NEW.rated_user_id;
  END IF;

  UPDATE profiles
  SET
    rating_avg = COALESCE((
      SELECT AVG(score)::numeric(3,2)
      FROM ratings
      WHERE rated_user_id = target_user_id
    ), 0),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE rated_user_id = target_user_id
    )
  WHERE id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- Index for fast rating lookups
CREATE INDEX IF NOT EXISTS ratings_rated_user_idx ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS ratings_rater_listing_idx ON ratings(rater_id, listing_id);
CREATE INDEX IF NOT EXISTS listings_expires_at_idx ON listings(expires_at);
