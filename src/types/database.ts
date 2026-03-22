export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          id_verified: boolean;
          identity_verified: boolean;
          flight_verified: boolean;
          trust_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          id_verified?: boolean;
          identity_verified?: boolean;
          flight_verified?: boolean;
          trust_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          id_verified?: boolean;
          identity_verified?: boolean;
          flight_verified?: boolean;
          trust_score?: number;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          departure: 'reunion' | 'mayotte' | 'paris';
          destination: 'reunion' | 'mayotte' | 'paris';
          flight_date: string;
          flight_time: string | null;
          kilos_available: number;
          price_per_kilo: number;
          description: string | null;
          phone: string;
          contact_email: string;
          is_active: boolean;
          is_published: boolean;
          stripe_identity_session_id: string | null;
          identity_verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          departure: 'reunion' | 'mayotte' | 'paris';
          destination: 'reunion' | 'mayotte' | 'paris';
          flight_date: string;
          flight_time?: string | null;
          kilos_available: number;
          price_per_kilo?: number;
          description?: string | null;
          phone: string;
          contact_email: string;
          is_active?: boolean;
          is_published?: boolean;
          stripe_identity_session_id?: string | null;
          identity_verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          departure?: 'reunion' | 'mayotte' | 'paris';
          destination?: 'reunion' | 'mayotte' | 'paris';
          flight_date?: string;
          flight_time?: string | null;
          kilos_available?: number;
          price_per_kilo?: number;
          description?: string | null;
          phone?: string;
          contact_email?: string;
          is_active?: boolean;
          is_published?: boolean;
          stripe_identity_session_id?: string | null;
          identity_verified_at?: string | null;
        };
      };
      unlocked_contacts: {
        Row: {
          id: string;
          buyer_id: string;
          listing_id: string;
          payment_intent_id: string | null;
          amount_paid: number;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          listing_id: string;
          payment_intent_id?: string | null;
          amount_paid?: number;
          unlocked_at?: string;
        };
        Update: Record<string, never>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
  };
}
