/*
  # Auto-update profile when flight verification is approved

  When a flight_verifications row has its status set to 'verified',
  automatically update the corresponding profile:
  - Set flight_verified = true
  - Update trust_score to at least 50 (100 if identity also verified)
*/

CREATE OR REPLACE FUNCTION sync_flight_verified_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS DISTINCT FROM 'verified') THEN
    UPDATE profiles
    SET
      flight_verified = true,
      trust_score = CASE
        WHEN identity_verified = true THEN 100
        ELSE 50
      END
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_flight_verification_approved ON flight_verifications;

CREATE TRIGGER on_flight_verification_approved
AFTER UPDATE ON flight_verifications
FOR EACH ROW
EXECUTE FUNCTION sync_flight_verified_to_profile();
