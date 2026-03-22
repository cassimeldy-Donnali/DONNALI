import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Package, Euro, User, Phone, Mail, Lock, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface Listing {
  id: string;
  departure: string;
  destination: string;
  flight_date: string;
  flight_time?: string;
  kilos_available: number;
  price_per_kilo: number;
  description?: string;
  phone: string;
  contact_email: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnlockedContact, setHasUnlockedContact] = useState(false);
  const [checkingUnlock, setCheckingUnlock] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`*, profiles!inner(full_name, avatar_url)`)
          .eq('id', id)
          .single();
        if (error) throw error;
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const checkUnlockedContact = async () => {
      if (!user || !id) return;
      setCheckingUnlock(true);
      try {
        const { data } = await supabase
          .from('unlocked_contacts')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('listing_id', id)
          .maybeSingle();
        if (data) setHasUnlockedContact(true);
      } catch {
      } finally {
        setCheckingUnlock(false);
      }
    };

    checkUnlockedContact();
  }, [user, id]);

  const handleCheckout = async () => {
    if (!user || !listing) return;
    setPaymentError('');
    setPaymentLoading(true);

    try {
      const { data: refreshData, error: sessionError } = await supabase.auth.refreshSession();
      let accessToken: string | undefined;
      if (!sessionError && refreshData.session) {
        accessToken = refreshData.session.access_token;
      } else {
        const { data: fallbackData } = await supabase.auth.getSession();
        accessToken = fallbackData.session?.access_token;
      }

      if (!accessToken) {
        setPaymentError('Vous devez être connecté pour effectuer un paiement.');
        return;
      }

      const successUrl = `${window.location.origin}/?payment=success&listing_id=${listing.id}`;
      const cancelUrl = window.location.href;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            price_id: STRIPE_PRODUCTS['contact'].priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode: STRIPE_PRODUCTS['contact'].mode,
            metadata: {
              listing_id: listing.id,
              buyer_id: user.id,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur Stripe (${response.status})`);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Annonce introuvable</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;
  const canViewContacts = isOwner || hasUnlockedContact;

  function formatPrivateName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return fullName.toUpperCase();
    const lastName = parts[0].toUpperCase();
    const firstInitial = parts[1][0].toUpperCase();
    return `${lastName} ${firstInitial}.`;
  }

  const displayName = listing.profiles.full_name
    ? formatPrivateName(listing.profiles.full_name)
    : 'Voyageur';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center gap-4">
              {listing.profiles.avatar_url ? (
                <img
                  src={listing.profiles.avatar_url}
                  alt={listing.profiles.full_name}
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{listing.departure}</span>
                  <span>→</span>
                  <span className="capitalize">{listing.destination}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails du voyage</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Date de vol</p>
                    <p className="text-gray-600">
                      {new Date(listing.flight_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {listing.flight_time && ` à ${listing.flight_time}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Kilos disponibles</p>
                    <p className="text-gray-600">{listing.kilos_available} kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Prix par kilo</p>
                    <p className="text-gray-600">
                      {listing.price_per_kilo === 0 ? 'Gratuit' : `${listing.price_per_kilo}€`}
                    </p>
                  </div>
                </div>
              </div>

              {listing.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{listing.description}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>

              {canViewContacts ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">{listing.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">{listing.contact_email}</span>
                  </div>
                  {hasUnlockedContact && (
                    <p className="text-sm text-green-600 font-medium">Contact débloqué</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">••• •• •• •• ••</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">•••••@••••••.•••</span>
                    </div>
                  </div>

                  {user && !isOwner && !checkingUnlock && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Débloquez les informations de contact pour contacter ce voyageur
                      </p>
                      {paymentError && (
                        <p className="text-red-600 text-xs mb-3">{paymentError}</p>
                      )}
                      <button
                        onClick={handleCheckout}
                        disabled={paymentLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Redirection vers Stripe...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Débloquer le contact — 2,99€
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Paiement sécurisé SSL · Propulsé par Stripe
                      </p>
                    </div>
                  )}

                  {!user && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">
                        Connectez-vous pour débloquer les informations de contact
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
