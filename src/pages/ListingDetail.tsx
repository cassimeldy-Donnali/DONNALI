import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Package, Euro, User, Phone, Mail, Lock, PackageCheck, Flag, Share2, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { TransactionCodeCard } from '../components/transactions/TransactionCodeCard';
import { ValidateTransactionModal } from '../components/transactions/ValidateTransactionModal';
import { ReportModal } from '../components/reports/ReportModal';
import { useMetaTags } from '../hooks/useMetaTags';
import type { TransactionArchive } from '../lib/transactions';

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
  is_active: boolean;
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
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validatedArchive, setValidatedArchive] = useState<TransactionArchive | null>(null);
  const [travelerId, setTravelerId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && listing) {
      try {
        await navigator.share({ title: `Trajet ${listing.departure} → ${listing.destination}`, url });
        return;
      } catch { }
    }
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

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

  useEffect(() => {
    if (listing) {
      setTravelerId(listing.user_id);
    }
  }, [listing]);

  const PLACE_LABELS: Record<string, string> = {
    reunion: 'La Reunion',
    mayotte: 'Mayotte',
    paris: 'Paris',
  };

  useMetaTags(
    listing
      ? {
          title: `Trajet ${PLACE_LABELS[listing.departure] ?? listing.departure} → ${PLACE_LABELS[listing.destination] ?? listing.destination} - ${listing.kilos_available} kg disponibles`,
          description: `${listing.kilos_available} kg disponibles au prix de ${listing.price_per_kilo} €/kg. Vol le ${new Date(listing.flight_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.${listing.description ? ' ' + listing.description : ''}`,
          url: window.location.href,
          type: 'article',
        }
      : {}
  );

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
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg font-medium ${
                shareCopied
                  ? 'text-eco-600 bg-eco-50'
                  : 'text-gray-500 hover:text-ocean-600 hover:bg-ocean-50'
              }`}
            >
              {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {shareCopied ? 'Lien copié !' : 'Partager'}
            </button>
            {user && !isOwner && (
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <Flag className="w-3.5 h-3.5" />
                Signaler
              </button>
            )}
          </div>
        </div>

        {!listing.is_active && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Cette annonce est expiree. Le vol est passe, mais vous pouvez toujours retrouver les coordonnees ci-dessous car vous avez debloque ce contact.</span>
          </div>
        )}

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

                  {hasUnlockedContact && !isOwner && user && travelerId && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-xs text-gray-500 mb-3">
                        Générez un code et communiquez-le au voyageur lors de la remise du colis.
                      </p>
                      <TransactionCodeCard
                        listingId={listing.id}
                        senderId={user.id}
                        travelerId={travelerId}
                      />
                    </div>
                  )}

                  {isOwner && user && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      {validatedArchive ? (
                        <div className="flex items-center gap-2 p-3 bg-eco-50 rounded-xl border border-eco-100">
                          <PackageCheck className="w-5 h-5 text-eco-600" />
                          <div>
                            <p className="text-sm font-semibold text-eco-700">Remise confirmée</p>
                            <p className="text-xs text-eco-600">
                              Validée le {new Date(validatedArchive.validated_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowValidateModal(true)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
                        >
                          <PackageCheck className="w-4 h-4" />
                          Valider la remise du colis
                        </button>
                      )}
                    </div>
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

                  {user && !isOwner && !checkingUnlock && listing.is_active && (
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

                  {user && !isOwner && !checkingUnlock && !listing.is_active && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-amber-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Cette annonce est expiree et n'est plus disponible.
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

    {showValidateModal && isOwner && user && (
      <ValidateTransactionModal
        listing={{
          ...listing,
          profiles: undefined,
        }}
        travelerId={user.id}
        onClose={() => setShowValidateModal(false)}
        onValidated={(archive) => {
          setValidatedArchive(archive);
          setShowValidateModal(false);
        }}
      />
    )}

    {showReportModal && listing && (
      <ReportModal
        user={user}
        reportedUserId={listing.user_id}
        reportedListingId={listing.id}
        reportedUserName={listing.profiles?.full_name}
        onClose={() => setShowReportModal(false)}
        onAuthRequired={() => setShowReportModal(false)}
      />
    )}
    </>
  );
}
