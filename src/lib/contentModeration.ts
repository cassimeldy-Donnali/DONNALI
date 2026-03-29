import { supabase } from './supabase';

export interface ModerationResult {
  allowed: boolean;
  message?: string;
}

export async function moderateContent(texts: string[]): Promise<ModerationResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { allowed: false, message: 'Session expirée.' };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/moderate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ texts }),
    });

    if (!res.ok) {
      return { allowed: true };
    }

    const result = await res.json() as { found: boolean; words: string[]; phoneDetected: boolean };

    if (result.found) {
      if (result.phoneDetected) {
        return {
          allowed: false,
          message:
            'Votre annonce contient des coordonnées de contact (numéro de téléphone, email ou lien de messagerie). ' +
            'Il est strictement interdit de partager vos coordonnées dans une annonce afin de contourner le système de mise en relation de DONNALI. ' +
            'Toute tentative de contournement est une violation grave des CGU et peut entraîner la suspension définitive de votre compte.',
        };
      }
      return {
        allowed: false,
        message:
          'Votre annonce contient des termes interdits qui ne respectent pas nos conditions d\'utilisation. ' +
          'Les contenus offensants, injurieux, discriminatoires, sexuels ou illicites sont strictement interdits. ' +
          'Veuillez modifier votre texte pour pouvoir publier votre annonce.',
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
