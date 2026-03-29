/*
  # Add Reports System and Avatar Storage

  ## New Tables
    - `reports` — Signalements utilisateurs/annonces
      - `id` (uuid, pk)
      - `reporter_id` (uuid) — qui signale
      - `reported_user_id` (uuid, nullable) — utilisateur signalé
      - `reported_listing_id` (uuid, nullable) — annonce signalée
      - `reason` (text) — catégorie du signalement
      - `description` (text) — description libre
      - `status` (text) — pending / reviewed / resolved / dismissed
      - `created_at`, `updated_at`

  ## Security
    - RLS activé sur reports
    - Authentifiés peuvent créer un signalement
    - Chacun voit uniquement ses propres signalements
    - Admins voient tout via policy séparée
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (reason IN ('fraude', 'arnaque', 'contenu_inapproprie', 'faux_profil', 'comportement_abusif', 'autre')),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_listing_id ON reports(reported_listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
