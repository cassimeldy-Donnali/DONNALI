/*
  # Add notifications table

  ## Summary
  Creates an in-app notification system for users.

  ## New Tables
  - `notifications`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `type` (text) - 'contact_unlocked' | 'listing_validated' | 'rating_received' | 'listing_expiring' | 'transaction_validated'
    - `title` (text)
    - `message` (text)
    - `link` (text, nullable) - optional deep link
    - `is_read` (boolean, default false)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read/update their own notifications
  - Service role inserts notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);
