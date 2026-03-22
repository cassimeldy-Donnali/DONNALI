export type City = 'reunion' | 'mayotte' | 'paris';

export const CITY_LABELS: Record<City, string> = {
  reunion: 'La Réunion',
  mayotte: 'Mayotte',
  paris: 'Paris',
};

export interface Listing {
  id: string;
  user_id: string;
  departure: City;
  destination: City;
  flight_date: string;
  flight_time: string | null;
  kilos_available: number;
  price_per_kilo: number;
  description: string | null;
  phone: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    id_verified: boolean;
    identity_verified: boolean;
    flight_verified: boolean;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  id_verified: boolean;
  identity_verified: boolean;
  flight_verified: boolean;
  trust_score: number;
}

export interface SearchFilters {
  departure: City | '';
  destination: City | '';
  date: string;
  minKilos: number;
  maxPrice: number;
}
