/*
  # Transaction Codes & Exchange Archives

  ## Summary
  Implements a secure parcel exchange validation system using 6-digit transaction codes.

  ## New Tables

  ### transaction_codes
  - Linked to an unlocked contact (sender/traveler pair already matched)
  - A unique 6-digit alphanumeric code is generated for each exchange
  - Expires after 48 hours or once validated
  - Created by the sender (expediteur) to share with the traveler
  - `listing_id` — the listing this exchange is for
  - `sender_id` — the user who created the code (expediteur)
  - `traveler_id` — the traveler (listing owner)
  - `code` — 6-character unique code (e.g. "DL-4829")
  - `status` — pending | validated | expired
  - `expires_at` — 48h from creation
  - `created_at`

  ### transaction_archives
  - Immutable record created when a traveler validates a code
  - Stores snapshot of exchange info: date, time, users, listing details
  - `id`
  - `transaction_code_id`
  - `listing_id`
  - `sender_id`
  - `traveler_id`
  - `code_used` — the 6-char code that was used
  - `listing_snapshot` — JSON snapshot of listing at time of validation
  - `validated_at` — timestamp of validation

  ## Security
  - RLS enabled on both tables
  - Sender can create and read their own codes
  - Traveler can read codes addressed to them
  - Only the traveler can validate (insert into archives)
  - Archives are readable by both parties involved
*/

CREATE TABLE IF NOT EXISTS transaction_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  traveler_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_codes_sender ON transaction_codes(sender_id);
CREATE INDEX IF NOT EXISTS idx_transaction_codes_traveler ON transaction_codes(traveler_id);
CREATE INDEX IF NOT EXISTS idx_transaction_codes_listing ON transaction_codes(listing_id);
CREATE INDEX IF NOT EXISTS idx_transaction_codes_code ON transaction_codes(code);

ALTER TABLE transaction_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender can create transaction codes"
  ON transaction_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender can view their own codes"
  ON transaction_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = traveler_id);

CREATE POLICY "Traveler can validate code (update status)"
  ON transaction_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = traveler_id AND status = 'pending')
  WITH CHECK (auth.uid() = traveler_id AND status = 'validated');

CREATE TABLE IF NOT EXISTS transaction_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code_id uuid NOT NULL REFERENCES transaction_codes(id) ON DELETE RESTRICT,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  traveler_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  code_used text NOT NULL,
  listing_snapshot jsonb NOT NULL DEFAULT '{}',
  validated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_archives_sender ON transaction_archives(sender_id);
CREATE INDEX IF NOT EXISTS idx_transaction_archives_traveler ON transaction_archives(traveler_id);
CREATE INDEX IF NOT EXISTS idx_transaction_archives_listing ON transaction_archives(listing_id);

ALTER TABLE transaction_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traveler can insert archive on validation"
  ON transaction_archives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Both parties can view their archives"
  ON transaction_archives FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = traveler_id);
