/*
  # Change transaction code expiry to 15 minutes

  ## Summary
  Updates the default expiration of transaction codes from 48 hours to 15 minutes.

  ## Why
  Transaction codes are now designed to be generated ON-SITE at the moment of physical
  exchange between sender and traveler. The code must be entered immediately by the traveler
  on their phone. A 15-minute window is sufficient for the on-the-spot validation while
  preventing any pre-generation of codes in advance.

  ## Changes
  - Modified the `expires_at` default value on `transaction_codes` table from `now() + interval '48 hours'`
    to `now() + interval '15 minutes'`

  ## Notes
  - Existing pending codes are NOT affected (only new codes will use 15 min expiry)
  - This enforces the "proof of simultaneous presence" model
*/

ALTER TABLE transaction_codes
  ALTER COLUMN expires_at SET DEFAULT now() + interval '15 minutes';
