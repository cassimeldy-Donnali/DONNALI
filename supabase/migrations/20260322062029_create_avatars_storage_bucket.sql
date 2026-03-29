/*
  # Create avatars storage bucket

  ## Storage Setup
    - Bucket public `avatars` pour les photos de profil
    - Taille max par fichier : 2 Mo
    - Types acceptes : image/jpeg, image/png, image/webp

  ## Security
    - Lecture publique (tout le monde peut voir les avatars)
    - Upload uniquement pour les utilisateurs authentifies sur leur propre fichier
    - Suppression uniquement pour le proprietaire
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

CREATE POLICY "Public avatar read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'avatars'
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = split_part(storage.filename(name), '.', 1)
  );
