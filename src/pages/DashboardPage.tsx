import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Unlock, Plane, Trash2, ToggleLeft, ToggleRight, PlusCircle, Phone, Mail, ShieldCheck, CheckCircle, User, AlertTriangle, X, Copy, MessageCircle, Pencil, Heart, Calendar, ExternalLink } from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Listing } from '../types';
import { CITY_LABELS } from '../types';
import { FlightVerificationForm } from '../components/verification/FlightVerificationForm';
import { TrustBadge } from '../components/verification/TrustBadge';
import { useToast } from '../components/ui/Toast';
import { EditListingModal } from '../components/listings/EditListingModal';

interface DashboardPageProps {
  user: SupaUser | null;
  onAuthRequired: () => void;
  onNavigate: (page: string) => void;
}

type Tab = 'listings' | 'unlocked' | 'favorites' | 'verification';

interface UnlockedContact {
  id: string;
  listing_id: string;
  unlocked_at: string;
  amount_paid: number;
  listing?: Listing;
}

interface FavoriteItem {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

interface VerificationProfile {
  identity_verified: boolean;
  flight_verified: boolean;
  trust_score: number;
}

export function DashboardPage({ user, onAuthRequired, onNavigate }: DashboardPageProps) {
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>('listings');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { }
  };

  const [listings, setListings] = useState<Listing[]>([]);
  const [unlocked, setUnlocked] = useState<UnlockedContact[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [verificationProfile, setVerificationProfile] = useState<VerificationProfile>({
    identity_verified: false,
    flight_verified: false,
    trust_score: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [listingsRes, unlockedRes, profileRes, favoritesRes] = await Promise.all([
      supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('unlocked_contacts')
        .select('*, listing:listings(*)')
        .eq('buyer_id', user.id)
        .order('unlocked_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('identity_verified, flight_verified, trust_score')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('favorites')
        .select('*, listing:listings(*, profiles(full_name, id_verified, identity_verified, flight_verified))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (listingsRes.data) setListings(listingsRes.data as unknown as Listing[]);
    if (unlockedRes.data) setUnlocked(unlockedRes.data as UnlockedContact[]);
    if (profileRes.data) setVerificationProfile(profileRes.data as VerificationProfile);
    if (favoritesRes.data) setFavorites(favoritesRes.data as FavoriteItem[]);
    setLoading(false);
  };

  const toggleActive = async (listing: Listing) => {
    const { error } = await supabase.from('listings').update({ is_active: !listing.is_active }).eq('id', listing.id);
    if (error) {
      toastError('Impossible de modifier le statut. Réessayez.');
      return;
    }
    setListings((prev) =>
      prev.map((l) => l.id === listing.id ? { ...l, is_active: !l.is_active } : l)
    );
    success(listing.is_active ? 'Annonce désactivée.' : 'Annonce activée et visible.');
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) {
      toastError('Impossible de supprimer cette annonce.');
      setDeleteConfirmId(null);
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirmId(null);
    success('Annonce supprimée.');
  };

  const removeFavorite = async (favoriteId: string, listingId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);
    if (error) {
      toastError('Impossible de retirer des favoris.');
      return;
    }
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    success('Retiré des favoris.');
  };

  const handleFlightVerified = () => {
    setVerificationProfile((prev) => ({
      ...prev,
      flight_verified: true,
      trust_score: prev.identity_verified ? 100 : 50,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <LayoutDashboard className="w-12 h-12 text-ocean-400 mx-auto mb-4" />
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">
            Accès restreint
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Connectez-vous pour accéder à votre tableau de bord.
          </p>
          <button
            onClick={onAuthRequired}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'listings' as Tab, label: 'Mes annonces', icon: Package, count: listings.length },
    { id: 'unlocked' as Tab, label: 'Contacts débloqués', icon: Unlock, count: unlocked.length },
    { id: 'favorites' as Tab, label: 'Favoris', icon: Heart, count: favorites.length },
    { id: 'verification' as Tab, label: 'Vérification', icon: ShieldCheck, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              {(verificationProfile.identity_verified || verificationProfile.flight_verified) && (
                <div className="mt-2">
                  <TrustBadge
                    identityVerified={verificationProfile.identity_verified}
                    flightVerified={verificationProfile.flight_verified}
                    trustScore={verificationProfile.trust_score}
                    compact
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('post')}
              className="flex items-center gap-2 px-4 py-2.5 bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle annonce
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-card border border-gray-100 w-fit mb-8 flex-wrap">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-ocean-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-ocean-600 hover:bg-ocean-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {t.count !== null && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'listings' && (
              <div>
                {listings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Aucune annonce publiée</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Publiez votre première annonce et proposez vos kilos disponibles.
                    </p>
                    <button
                      onClick={() => onNavigate('post')}
                      className="px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      Publier une annonce
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center shrink-0">
                            <Plane className="w-6 h-6 text-ocean-600 -rotate-45" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">
                              {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {new Date(listing.flight_date).toLocaleDateString('fr-FR', {
                                weekday: 'short', day: 'numeric', month: 'long',
                              })}
                              {' · '}
                              {listing.kilos_available} kg disponibles
                              {' · '}
                              {listing.price_per_kilo === 0 ? 'Gratuit' : `${listing.price_per_kilo}€/kg`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              listing.is_active
                                ? 'bg-eco-100 text-eco-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {listing.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => toggleActive(listing)}
                            className="p-2 text-gray-400 hover:text-ocean-600 transition-colors"
                            title={listing.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {listing.is_active
                              ? <ToggleRight className="w-5 h-5 text-eco-500" />
                              : <ToggleLeft className="w-5 h-5" />
                            }
                          </button>
                          <button
                            onClick={() => setEditListing(listing)}
                            className="p-2 text-gray-400 hover:text-ocean-600 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(listing.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'unlocked' && (
              <div>
                {unlocked.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
                    <Unlock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Aucun contact débloqué</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Parcourez les annonces pour trouver un voyageur et débloquer ses coordonnées.
                    </p>
                    <button
                      onClick={() => onNavigate('listings')}
                      className="px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      Voir les annonces
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unlocked.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-card border border-gray-100 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-eco-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <Unlock className="w-5 h-5 text-eco-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {item.listing ? (
                              <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                <Plane className="w-3.5 h-3.5 text-ocean-500 -rotate-45 shrink-0" />
                                {CITY_LABELS[item.listing.departure as keyof typeof CITY_LABELS]} → {CITY_LABELS[item.listing.destination as keyof typeof CITY_LABELS]}
                              </p>
                            ) : (
                              <p className="font-semibold text-gray-900 text-sm">Contact débloqué</p>
                            )}
                            {item.listing && (
                              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Vol le {new Date(item.listing.flight_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric',
                                })}
                              </p>
                            )}
                            <p className="text-gray-400 text-xs mt-0.5">
                              Débloqué le {new Date(item.unlocked_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </p>
                            {item.listing && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2 text-xs text-gray-700">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="font-mono font-medium">
                                      {item.listing.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <a
                                      href={`https://wa.me/${item.listing.phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg hover:bg-[#25D366]/10 transition-colors"
                                      title="WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                    </a>
                                    <button
                                      onClick={() => copyToClipboard(item.listing!.phone, `phone-${item.id}`)}
                                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                      title="Copier"
                                    >
                                      <Copy className={`w-3.5 h-3.5 ${copiedId === `phone-${item.id}` ? 'text-eco-600' : 'text-gray-400'}`} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2 text-xs text-gray-700">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="font-mono font-medium">{item.listing.contact_email}</span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(item.listing!.contact_email, `email-${item.id}`)}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Copier"
                                  >
                                    <Copy className={`w-3.5 h-3.5 ${copiedId === `email-${item.id}` ? 'text-eco-600' : 'text-gray-400'}`} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-eco-700 bg-eco-50 px-3 py-1 rounded-full">
                            {(item.amount_paid / 100).toFixed(2)}€ payé
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'favorites' && (
              <div>
                {favorites.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Aucun favori sauvegardé</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Cliquez sur le cœur d'une annonce pour la sauvegarder ici et la retrouver facilement.
                    </p>
                    <button
                      onClick={() => onNavigate('listings')}
                      className="px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      Parcourir les annonces
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((fav) => (
                      <div
                        key={fav.id}
                        className="bg-white rounded-2xl shadow-card border border-gray-100 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {fav.listing ? (
                              <>
                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                  <Plane className="w-3.5 h-3.5 text-ocean-500 -rotate-45 shrink-0" />
                                  {CITY_LABELS[fav.listing.departure as keyof typeof CITY_LABELS]} → {CITY_LABELS[fav.listing.destination as keyof typeof CITY_LABELS]}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Vol le {new Date(fav.listing.flight_date).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                  })}
                                  {' · '}
                                  {fav.listing.kilos_available} kg
                                  {' · '}
                                  {fav.listing.price_per_kilo === 0 ? 'Gratuit' : `${fav.listing.price_per_kilo}€/kg`}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {fav.listing.profiles?.identity_verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-xs font-semibold">
                                      <ShieldCheck className="w-3 h-3" />
                                      Vérifié
                                    </span>
                                  )}
                                  {fav.listing.profiles?.flight_verified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full text-xs font-semibold">
                                      <Plane className="w-3 h-3 -rotate-45" />
                                      Vol confirmé
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="font-semibold text-gray-900 text-sm">Annonce supprimée</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1.5">
                              Sauvegardé le {new Date(fav.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {fav.listing && (
                              <button
                                onClick={() => onNavigate('listings')}
                                className="p-2 text-gray-400 hover:text-ocean-600 transition-colors"
                                title="Voir l'annonce"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFavorite(fav.id, fav.listing_id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Retirer des favoris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'verification' && (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-1">Statut de vérification</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Un profil vérifié inspire confiance et augmente vos chances d'être contacté.
                  </p>
                  <TrustBadge
                    identityVerified={verificationProfile.identity_verified}
                    flightVerified={verificationProfile.flight_verified}
                    trustScore={verificationProfile.trust_score}
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Vérification d'identité</h3>
                      <p className="text-xs text-gray-500">Pièce d'identité + selfie</p>
                    </div>
                    {verificationProfile.identity_verified && (
                      <CheckCircle className="w-5 h-5 text-eco-500 ml-auto" />
                    )}
                  </div>
                  {verificationProfile.identity_verified ? (
                    <div className="flex items-center gap-2 p-3 bg-eco-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-eco-600" />
                      <p className="text-sm text-eco-700 font-medium">Identité vérifiée</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        La vérification d'identité nécessite votre pièce d'identité et un selfie. Disponible prochainement.
                      </p>
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 text-gray-400 font-semibold rounded-xl text-sm cursor-not-allowed"
                      >
                        Bientôt disponible
                      </button>
                    </div>
                  )}
                </div>

                {verificationProfile.flight_verified ? (
                  <div className="bg-white rounded-2xl shadow-card border border-eco-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-eco-100 rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-eco-600 -rotate-45" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Vol vérifié</h3>
                        <p className="text-xs text-eco-600 font-medium">Votre vol a été confirmé avec succès</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-eco-500 ml-auto" />
                    </div>
                  </div>
                ) : (
                  <FlightVerificationForm onVerified={handleFlightVerified} />
                )}

                <div className="bg-gradient-to-br from-ocean-50 to-eco-50 rounded-2xl p-6 border border-ocean-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-ocean-600" />
                    Pourquoi se vérifier ?
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 mt-1.5 shrink-0" />
                      Les voyageurs vérifiés reçoivent plus de demandes de contact
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 mt-1.5 shrink-0" />
                      Un badge de confiance est affiché sur votre annonce
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 mt-1.5 shrink-0" />
                      Les expéditeurs se sentent en sécurité pour confier leurs colis
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editListing && (
        <EditListingModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={(updated) => {
            setListings((prev) => prev.map((l) => l.id === updated.id ? updated : l));
            setEditListing(null);
            success('Annonce mise à jour.');
          }}
        />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Supprimer cette annonce ?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Cette action est définitive. L'annonce et toutes les informations associées seront supprimées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteListing(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
