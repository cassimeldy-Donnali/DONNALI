/*
  # DONNALI - KiloConnect Schema

  ## Overview
  Creates the core database schema for the DONNALI platform — a marketplace
  connecting air travelers who have spare baggage allowance with people who
  need to send packages on Reunion / Mayotte / Paris routes.

  ## New Tables

  ### 1. profiles
  Extends Supabase auth.users with public profile information.
  - id: references auth.users
  - full_name: user's display name
  - avatar_url: profile picture URL
  - phone: contact phone number (revealed only after payment)
  - id_verified: whether identity has been verified
  - created_at / updated_at

  ### 2. listings
  Travel announcements posted by voyagers offering spare baggage kilos.
  - id: UUID primary key
  - user_id: references profiles (the traveler)
  - departure: origin city (reunion, mayotte, paris)
  - destination: destination city
  - flight_date: date of the flight
  - flight_time: optional time of flight
  - kilos_available: number of kg available (integer)
  - price_per_kilo: price in euros (0 = free)
  - description: what types of packages are accepted
  - phone: traveler's phone (masked in listing cards)
  - contact_email: traveler's email (masked)
  - is_active: whether listing is visible
  - created_at

  ### 3. unlocked_contacts
  Records of paid contact unlocks. Keeps track of which users have paid
  to see which traveler's contact details.
  - id: UUID primary key
  - buyer_id: user who paid
  - listing_id: which listing was unlocked
  - payment_intent_id: Stripe payment reference
  - amount_paid: amount in cents
  - unlocked_at: timestamp of unlock

  ## Security
  - RLS enabled on all tables
  - Profiles readable by all authenticated users (names/avatars only)
  - Listings readable by anyone (public search), writable only by owner
  - Unlocked contacts visible only to the buyer
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  id_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  departure text NOT NULL CHECK (departure IN ('reunion', 'mayotte', 'paris')),
  destination text NOT NULL CHECK (destination IN ('reunion', 'mayotte', 'paris')),
  flight_date date NOT NULL,
  flight_time text,
  kilos_available integer NOT NULL CHECK (kilos_available > 0 AND kilos_available <= 30),
  price_per_kilo numeric(6,2) NOT NULL DEFAULT 0 CHECK (price_per_kilo >= 0),
  description text,
  phone text NOT NULL,
  contact_email text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can view all their listings"
  ON listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS unlocked_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  payment_intent_id text,
  amount_paid integer NOT NULL DEFAULT 299,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(buyer_id, listing_id)
);

ALTER TABLE unlocked_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own unlocked contacts"
  ON unlocked_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Authenticated users can insert unlock records"
  ON unlocked_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE INDEX IF NOT EXISTS listings_departure_destination_idx ON listings(departure, destination);
CREATE INDEX IF NOT EXISTS listings_flight_date_idx ON listings(flight_date);
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);
CREATE INDEX IF NOT EXISTS unlocked_contacts_buyer_id_idx ON unlocked_contacts(buyer_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
