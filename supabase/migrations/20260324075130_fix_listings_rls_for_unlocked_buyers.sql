/*
  # Fix listings RLS policy to allow buyers with unlocked contacts to view expired listings

  ## Problem
  When a buyer pays to unlock a contact and the listing is expired (is_active = false),
  clicking "Voir l'annonce" shows "Annonce introuvable" because the RLS policy only allows
  viewing active listings or listings owned by the user. Buyers who paid are blocked.

  ## Changes
  - Drop the existing SELECT policy on listings
  - Create a new SELECT policy that also allows buyers who have unlocked the contact
    to view the listing regardless of its active status

  ## Security
  - Only authenticated users who have a record in unlocked_contacts can bypass the is_active filter
  - Unauthenticated users and users who haven't paid can still only see active listings
*/

DROP POLICY IF EXISTS "Listings are viewable by public or owners" ON listings;

CREATE POLICY "Listings are viewable by active status, owners, or unlocked buyers"
  ON listings
  FOR SELECT
  USING (
    (is_active = true)
    OR (( SELECT auth.uid() AS uid) = user_id)
    OR (
      EXISTS (
        SELECT 1 FROM unlocked_contacts
        WHERE unlocked_contacts.listing_id = listings.id
        AND unlocked_contacts.buyer_id = ( SELECT auth.uid() AS uid)
      )
    )
  );
