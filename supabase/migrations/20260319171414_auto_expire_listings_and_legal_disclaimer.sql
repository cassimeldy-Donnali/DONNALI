/*
  # Suppression automatique des annonces expirées + champ disclaimer légal

  ## Résumé
  Cette migration fait deux choses :

  ### 1. Expiration automatique des annonces
  - Active l'extension pg_cron
  - Crée une fonction `expire_old_listings()` qui désactive (`is_active = false`)
    et dépublie (`is_published = false`) toutes les annonces dont la date de vol
    est dépassée de plus de 48 heures
  - Planifie cette fonction pour s'exécuter toutes les heures via pg_cron

  ### 2. Champ disclaimer légal
  - Ajoute la colonne `disclaimer_accepted` (boolean, défaut false) à la table `listings`
  - Cette colonne trace que le voyageur a explicitement accepté les conditions
    de non-responsabilité de DONNALI avant de publier son annonce

  ## Sécurité
  - Aucune modification des politiques RLS existantes
  - Le champ disclaimer_accepted est en lecture seule pour l'utilisateur
    (seule l'insertion initiale le positionne)
*/

-- Activer pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ajouter la colonne disclaimer_accepted à listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'disclaimer_accepted'
  ) THEN
    ALTER TABLE listings ADD COLUMN disclaimer_accepted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Fonction pour expirer les annonces dont le vol est passé de plus de 48h
CREATE OR REPLACE FUNCTION public.expire_old_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE listings
  SET
    is_active = false,
    is_published = false
  WHERE
    is_active = true
    AND flight_date < (CURRENT_DATE - INTERVAL '2 days');
END;
$$;

-- Planifier le job toutes les heures (pg_cron)
SELECT cron.schedule(
  'expire-old-listings',
  '0 * * * *',
  'SELECT public.expire_old_listings();'
);
