/*
  # Add alert subscriptions for new listings

  1. New Tables
    - `listing_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `departure` (text, optional city filter)
      - `destination` (text, optional city filter)
      - `min_kilos` (int, optional minimum kg)
      - `max_price` (int, optional max price per kilo)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `last_notified_at` (timestamptz, tracks last email sent)

  2. Security
    - Enable RLS on `listing_alerts`
    - Users can only manage their own alerts
*/

CREATE TABLE IF NOT EXISTS listing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departure text,
  destination text,
  min_kilos int DEFAULT 0,
  max_price int DEFAULT 999,
  free_only boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_notified_at timestamptz
);

ALTER TABLE listing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON listing_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON listing_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON listing_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON listing_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_listing_alerts_user_id ON listing_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_alerts_active ON listing_alerts(is_active) WHERE is_active = true;
