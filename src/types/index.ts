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
  is_published: boolean;
  expires_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    id_verified: boolean;
    identity_verified: boolean;
    flight_verified: boolean;
    rating_avg?: number;
    rating_count?: number;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  id_verified: boolean;
  identity_verified: boolean;
  flight_verified: boolean;
  trust_score: number;
  is_admin: boolean;
  rating_avg: number;
  rating_count: number;
}

export interface Rating {
  id: string;
  rater_id: string;
  rated_user_id: string;
  listing_id: string;
  score: number;
  comment: string;
  created_at: string;
}

export interface SearchFilters {
  departure: City | '';
  destination: City | '';
  date: string;
  dateFrom: string;
  dateTo: string;
  minKilos: number;
  maxPrice: number;
  onlyVerified: boolean;
  onlyFlightVerified: boolean;
  minRating: number;
  freeOnly: boolean;
}
