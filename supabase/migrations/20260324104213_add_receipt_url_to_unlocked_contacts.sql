/*
  # Add receipt_url to unlocked_contacts

  ## Summary
  Adds a `receipt_url` column to the `unlocked_contacts` table to store the Stripe
  hosted receipt URL at payment time. This allows users to download their receipt
  directly from their dashboard without any email or edge function required.

  ## Changes
  - `unlocked_contacts`: new column `receipt_url` (text, nullable)
    Stores the Stripe receipt URL returned from the checkout session.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'unlocked_contacts' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE unlocked_contacts ADD COLUMN receipt_url text;
  END IF;
END $$;
