/*
  # Newsletter Subscriptions System

  ## Summary
  Creates the newsletter subscription system allowing senders to be notified
  when a traveler publishes an announcement matching their route of interest.

  ## New Tables

  ### newsletter_subscriptions
  - `id` (uuid, primary key)
  - `email` (text) — subscriber email address
  - `departure` (text, nullable) — optional departure filter (reunion/mayotte/paris)
  - `destination` (text, not null) — destination to watch (reunion/mayotte/paris)
  - `unsubscribe_token` (uuid) — unique token for one-click unsubscription
  - `confirmed` (boolean) — whether the subscription is active
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled with open policies for public newsletter access

  ## Notes
  - Unique constraint on (email, destination, departure) via partial indexes
  - Indexes for fast lookup when new listing is published
*/

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  departure text CHECK (departure IN ('reunion', 'mayotte', 'paris')),
  destination text NOT NULL CHECK (destination IN ('reunion', 'mayotte', 'paris')),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  confirmed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Subscribers can view subscriptions"
  ON newsletter_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Subscribers can delete own subscription"
  ON newsletter_subscriptions
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_unique_with_departure
  ON newsletter_subscriptions (email, destination, departure)
  WHERE departure IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_unique_without_departure
  ON newsletter_subscriptions (email, destination)
  WHERE departure IS NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_destination ON newsletter_subscriptions (destination);
CREATE INDEX IF NOT EXISTS idx_newsletter_departure_destination ON newsletter_subscriptions (departure, destination);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON newsletter_subscriptions (unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions (email);
