import { supabase } from './supabase';
import type { Listing } from '../types';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface TransactionCode {
  id: string;
  listing_id: string;
  sender_id: string;
  traveler_id: string;
  code: string;
  status: 'pending' | 'validated' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface TransactionArchive {
  id: string;
  transaction_code_id: string;
  listing_id: string;
  sender_id: string;
  traveler_id: string;
  code_used: string;
  listing_snapshot: Record<string, unknown>;
  validated_at: string;
}

export async function createTransactionCode(
  listingId: string,
  senderId: string,
  travelerId: string
): Promise<{ data: TransactionCode | null; error: string | null }> {
  let attempts = 0;
  while (attempts < 5) {
    const code = generateCode();
    const { data, error } = await supabase
      .from('transaction_codes')
      .insert({
        listing_id: listingId,
        sender_id: senderId,
        traveler_id: travelerId,
        code,
      })
      .select()
      .single();

    if (!error && data) {
      return { data: data as TransactionCode, error: null };
    }

    if (error?.code !== '23505') {
      return { data: null, error: error?.message || 'Erreur lors de la création du code.' };
    }

    attempts++;
  }

  return { data: null, error: 'Impossible de générer un code unique. Réessayez.' };
}

export async function validateTransactionCode(
  code: string,
  travelerId: string,
  listing: Listing
): Promise<{ success: boolean; archive?: TransactionArchive; error?: string }> {
  const { data: tc, error: fetchError } = await supabase
    .from('transaction_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('traveler_id', travelerId)
    .eq('status', 'pending')
    .maybeSingle();

  if (fetchError || !tc) {
    return { success: false, error: 'Code invalide ou déjà utilisé.' };
  }

  const now = new Date();
  if (new Date(tc.expires_at) < now) {
    await supabase
      .from('transaction_codes')
      .update({ status: 'expired' })
      .eq('id', tc.id);
    return { success: false, error: 'Ce code a expiré. Demandez un nouveau code à l\'expéditeur.' };
  }

  const listingSnapshot = {
    departure: listing.departure,
    destination: listing.destination,
    flight_date: listing.flight_date,
    flight_time: listing.flight_time,
    kilos_available: listing.kilos_available,
    price_per_kilo: listing.price_per_kilo,
    description: listing.description,
  };

  const { data: archive, error: archiveError } = await supabase
    .from('transaction_archives')
    .insert({
      transaction_code_id: tc.id,
      listing_id: tc.listing_id,
      sender_id: tc.sender_id,
      traveler_id: travelerId,
      code_used: tc.code,
      listing_snapshot: listingSnapshot,
    })
    .select()
    .single();

  if (archiveError) {
    return { success: false, error: 'Erreur lors de l\'archivage. Réessayez.' };
  }

  await supabase
    .from('transaction_codes')
    .update({ status: 'validated' })
    .eq('id', tc.id);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  fetch(`${supabaseUrl}/functions/v1/notify-contact-unlocked`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'transaction_validated', archive_id: (archive as TransactionArchive).id }),
  }).catch(() => {});

  return { success: true, archive: archive as TransactionArchive };
}

export async function getSenderCodes(userId: string, listingId: string): Promise<TransactionCode[]> {
  const { data } = await supabase
    .from('transaction_codes')
    .select('*')
    .eq('sender_id', userId)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  return (data as TransactionCode[]) || [];
}

export async function getUserArchives(userId: string): Promise<TransactionArchive[]> {
  const { data } = await supabase
    .from('transaction_archives')
    .select('*')
    .or(`sender_id.eq.${userId},traveler_id.eq.${userId}`)
    .order('validated_at', { ascending: false });
  return (data as TransactionArchive[]) || [];
}
