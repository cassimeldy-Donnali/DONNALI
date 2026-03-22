/*
  # Fix RLS Performance and Index Issues

  ## Summary
  This migration addresses all security and performance warnings:

  1. **RLS Initialization Plan fixes** — Replace `auth.uid()` with `(select auth.uid())` in all
     policies on: profiles, listings, unlocked_contacts, stripe_customers, stripe_subscriptions, stripe_orders.
     This prevents per-row re-evaluation of auth functions and significantly improves query performance at scale.

  2. **Unindexed foreign key** — Add index on `unlocked_contacts.listing_id` to cover the
     foreign key `unlocked_contacts_listing_id_fkey`.

  3. **Multiple permissive SELECT policies on listings** — Merge into a single policy covering both
     public active listings and owner-visible listings, eliminating dual-policy overhead.

  4. **Unused indexes** — Drop `listings_departure_destination_idx` and `listings_flight_date_idx`
     since they are unused and waste storage/write overhead.

  ## Tables affected
  - public.profiles (INSERT, UPDATE policies)
  - public.listings (SELECT, INSERT, UPDATE, DELETE policies)
  - public.unlocked_contacts (SELECT, INSERT policies + new index)
  - public.stripe_customers (SELECT policy)
  - public.stripe_subscriptions (SELECT policy)
  - public.stripe_orders (SELECT policy)
*/

-- ============================================================
-- 1. profiles — fix INSERT and UPDATE policies
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 2. listings — fix all policies + merge dual SELECT policies
-- ============================================================
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Owners can view all their listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can delete own listings" ON public.listings;

-- Single merged SELECT policy: public active listings OR owner's own listings
CREATE POLICY "Listings are viewable by public or owners"
  ON public.listings FOR SELECT
  USING (
    (is_active = true)
    OR ((select auth.uid()) = user_id)
  );

CREATE POLICY "Authenticated users can insert listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Owners can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 3. unlocked_contacts — fix policies + add index on listing_id
-- ============================================================
DROP POLICY IF EXISTS "Buyers can view own unlocked contacts" ON public.unlocked_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert unlock records" ON public.unlocked_contacts;

CREATE POLICY "Buyers can view own unlocked contacts"
  ON public.unlocked_contacts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = buyer_id);

CREATE POLICY "Authenticated users can insert unlock records"
  ON public.unlocked_contacts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = buyer_id);

-- Add covering index for the unindexed foreign key
CREATE INDEX IF NOT EXISTS unlocked_contacts_listing_id_idx
  ON public.unlocked_contacts (listing_id);

-- ============================================================
-- 4. stripe_customers — fix SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

-- ============================================================
-- 5. stripe_subscriptions — fix SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON public.stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================
-- 6. stripe_orders — fix SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON public.stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================
-- 7. Drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS public.listings_departure_destination_idx;
DROP INDEX IF EXISTS public.listings_flight_date_idx;
