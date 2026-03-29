/*
  # Add user suspension system

  1. Changes to `profiles`
    - Add `is_suspended` (boolean, default false) — whether the account is suspended
    - Add `suspended_at` (timestamptz) — when the suspension was applied
    - Add `suspended_until` (timestamptz, nullable) — null = permanent, date = temporary
    - Add `suspension_reason` (text) — reason code for the suspension

  2. Security
    - Existing RLS policies remain unchanged
    - Admins will set these via the service role (edge function)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_suspended boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_until'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspension_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspension_reason text;
  END IF;
END $$;
