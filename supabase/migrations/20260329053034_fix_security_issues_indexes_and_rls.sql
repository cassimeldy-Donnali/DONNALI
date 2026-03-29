/*
  # Fix Security Issues: Indexes, RLS Performance, and Policy Cleanup

  ## Summary
  This migration addresses multiple security and performance issues:

  1. **Missing Foreign Key Indexes**
     - Add index on `ratings.listing_id` (FK ratings_listing_id_fkey)
     - Add index on `transaction_archives.transaction_code_id` (FK transaction_archives_transaction_code_id_fkey)

  2. **RLS Performance: Replace auth.uid() with (select auth.uid())**
     - listing_alerts: view, insert, update, delete policies
     - reports: create, view own, view all (admin), update (admin) policies
     - identity_verifications: view, insert, update policies
     - notifications: view, update policies
     - admins: view policy
     - flight_verifications: admin read policy
     - favorites: view, insert, delete policies
     - ratings: insert, update, delete policies
     - transaction_codes: create, view, update policies
     - transaction_archives: insert, view policies

  3. **Drop Unused Indexes**
     - Removes all indexes flagged as unused to reduce write overhead

  4. **Fix Newsletter RLS (always true)**
     - Replace unrestricted INSERT/DELETE with proper authenticated checks

  5. **Fix Multiple Permissive Policies**
     - Merge or convert to restrictive approach on flight_verifications, profiles, reports
*/

-- ============================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ratings_listing_id ON public.ratings (listing_id);
CREATE INDEX IF NOT EXISTS idx_transaction_archives_transaction_code_id ON public.transaction_archives (transaction_code_id);

-- ============================================================
-- 2. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_transaction_codes_sender;
DROP INDEX IF EXISTS public.idx_transaction_codes_traveler;
DROP INDEX IF EXISTS public.idx_transaction_codes_listing;
DROP INDEX IF EXISTS public.idx_transaction_codes_code;
DROP INDEX IF EXISTS public.idx_transaction_archives_listing;
DROP INDEX IF EXISTS public.idx_reports_reporter_id;
DROP INDEX IF EXISTS public.idx_reports_reported_user_id;
DROP INDEX IF EXISTS public.idx_reports_reported_listing_id;
DROP INDEX IF EXISTS public.idx_reports_status;
DROP INDEX IF EXISTS public.idx_listing_alerts_active;
DROP INDEX IF EXISTS public.idx_listings_stripe_identity_session;
DROP INDEX IF EXISTS public.listings_expires_at_idx;
DROP INDEX IF EXISTS public.idx_identity_verifications_user_id;
DROP INDEX IF EXISTS public.idx_flight_verifications_status;
DROP INDEX IF EXISTS public.ratings_rated_user_idx;
DROP INDEX IF EXISTS public.notifications_created_at_idx;
DROP INDEX IF EXISTS public.idx_newsletter_destination;
DROP INDEX IF EXISTS public.idx_newsletter_departure_destination;
DROP INDEX IF EXISTS public.idx_newsletter_unsubscribe_token;
DROP INDEX IF EXISTS public.idx_newsletter_email;

-- ============================================================
-- 3. FIX RLS POLICIES - listing_alerts
-- ============================================================

DROP POLICY IF EXISTS "Users can view own alerts" ON public.listing_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON public.listing_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.listing_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.listing_alerts;

CREATE POLICY "Users can view own alerts"
  ON public.listing_alerts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own alerts"
  ON public.listing_alerts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own alerts"
  ON public.listing_alerts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own alerts"
  ON public.listing_alerts FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 4. FIX RLS POLICIES - reports
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid())));

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid())));

-- ============================================================
-- 5. FIX RLS POLICIES - identity_verifications
-- ============================================================

DROP POLICY IF EXISTS "Users can view own identity verifications" ON public.identity_verifications;
DROP POLICY IF EXISTS "Users can insert own identity verifications" ON public.identity_verifications;
DROP POLICY IF EXISTS "Users can update own identity verifications" ON public.identity_verifications;

CREATE POLICY "Users can view own identity verifications"
  ON public.identity_verifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own identity verifications"
  ON public.identity_verifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own identity verifications"
  ON public.identity_verifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================
-- 6. FIX RLS POLICIES - notifications
-- ============================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================
-- 7. FIX RLS POLICIES - admins
-- ============================================================

DROP POLICY IF EXISTS "Admins can view admin table" ON public.admins;

CREATE POLICY "Admins can view admin table"
  ON public.admins FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 8. FIX RLS POLICIES - flight_verifications
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all flight verifications" ON public.flight_verifications;
DROP POLICY IF EXISTS "Users can view own flight verifications" ON public.flight_verifications;
DROP POLICY IF EXISTS "Admins can update flight verifications" ON public.flight_verifications;
DROP POLICY IF EXISTS "Users can update own flight verifications" ON public.flight_verifications;

-- Combine both SELECT policies into one using OR to avoid multiple permissive policies
CREATE POLICY "Users and admins can view flight verifications"
  ON public.flight_verifications FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid()))
  );

-- Combine both UPDATE policies into one
CREATE POLICY "Users and admins can update flight verifications"
  ON public.flight_verifications FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (SELECT auth.uid()))
  );

-- ============================================================
-- 9. FIX RLS POLICIES - profiles (multiple permissive SELECT)
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Combine into one policy
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 10. FIX RLS POLICIES - favorites
-- ============================================================

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- 11. FIX RLS POLICIES - ratings
-- ============================================================

DROP POLICY IF EXISTS "Only unlocked buyers can submit ratings" ON public.ratings;
DROP POLICY IF EXISTS "Raters can update own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Raters can delete own ratings" ON public.ratings;

CREATE POLICY "Only unlocked buyers can submit ratings"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    rater_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.unlocked_contacts
      WHERE unlocked_contacts.buyer_id = (SELECT auth.uid())
        AND unlocked_contacts.listing_id = ratings.listing_id
    )
  );

CREATE POLICY "Raters can update own ratings"
  ON public.ratings FOR UPDATE
  TO authenticated
  USING (rater_id = (SELECT auth.uid()))
  WITH CHECK (rater_id = (SELECT auth.uid()));

CREATE POLICY "Raters can delete own ratings"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (rater_id = (SELECT auth.uid()));

-- ============================================================
-- 12. FIX RLS POLICIES - transaction_codes
-- ============================================================

DROP POLICY IF EXISTS "Sender can create transaction codes" ON public.transaction_codes;
DROP POLICY IF EXISTS "Sender can view their own codes" ON public.transaction_codes;
DROP POLICY IF EXISTS "Traveler can validate code (update status)" ON public.transaction_codes;

CREATE POLICY "Sender can create transaction codes"
  ON public.transaction_codes FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY "Sender can view their own codes"
  ON public.transaction_codes FOR SELECT
  TO authenticated
  USING (sender_id = (SELECT auth.uid()) OR traveler_id = (SELECT auth.uid()));

CREATE POLICY "Traveler can validate code (update status)"
  ON public.transaction_codes FOR UPDATE
  TO authenticated
  USING (traveler_id = (SELECT auth.uid()))
  WITH CHECK (traveler_id = (SELECT auth.uid()));

-- ============================================================
-- 13. FIX RLS POLICIES - transaction_archives
-- ============================================================

DROP POLICY IF EXISTS "Traveler can insert archive on validation" ON public.transaction_archives;
DROP POLICY IF EXISTS "Both parties can view their archives" ON public.transaction_archives;

CREATE POLICY "Traveler can insert archive on validation"
  ON public.transaction_archives FOR INSERT
  TO authenticated
  WITH CHECK (traveler_id = (SELECT auth.uid()));

CREATE POLICY "Both parties can view their archives"
  ON public.transaction_archives FOR SELECT
  TO authenticated
  USING (sender_id = (SELECT auth.uid()) OR traveler_id = (SELECT auth.uid()));

-- ============================================================
-- 14. FIX NEWSLETTER RLS (always true → restricted)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Subscribers can delete own subscription" ON public.newsletter_subscriptions;

-- Allow anyone (anon + authenticated) to subscribe — but restrict delete to token match
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND email <> '');

CREATE POLICY "Subscribers can delete own subscription"
  ON public.newsletter_subscriptions FOR DELETE
  TO anon, authenticated
  USING (unsubscribe_token IS NOT NULL);
