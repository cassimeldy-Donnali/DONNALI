/*
  # Fix Function Search Path Mutable Warnings

  Sets an immutable search_path on all affected functions to prevent
  search_path injection attacks.

  Functions fixed:
    - public.update_trust_score()
    - public.sync_flight_verified_to_profile()
    - public.is_admin()
*/

ALTER FUNCTION public.update_trust_score() SET search_path = public;

ALTER FUNCTION public.sync_flight_verified_to_profile() SET search_path = public;

ALTER FUNCTION public.is_admin() SET search_path = public;
