import { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle, Plane, AlertCircle, Copy, MessageCircle } from 'lucide-react';
import type { Listing } from '../../types';
import { CITY_LABELS } from '../../types';
import { supabase } from '../../lib/supabase';
import { STRIPE_PRODUCTS } from '../../stripe-config';
import type { User } from '@supabase/supabase-js';

interface ContactModalProps {
  listing: Listing;
  user: User | null;
  onClose: () => void;
  onSuccess: (listingId: string) => void;
  onAuthRequired: () => void;
}

type Step = 'preview' | 'payment' | 'success';

export function ContactModal({ listing, user, onClose, onSuccess, onAuthRequired }: ContactModalProps) {
  const [step, setStep] = useState<Step>('preview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'phone') { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
      else { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    } catch { }
  };

  const formatPhone = (phone: string) => phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');

  const whatsappUrl = listing.phone
    ? `https://wa.me/${listing.phone.replace(/\D/g, '')}`
    : null;

  const profile = listing.profiles;

  function formatPrivateName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return fullName.toUpperCase();
    const lastName = parts[0].toUpperCase();
    const firstInitial = parts[1][0].toUpperCase();
    return `${lastName} ${firstInitial}.`;
  }

  const displayName = profile?.full_name ? formatPrivateName(profile.full_name) : 'Voyageur';

  const handleCheckout = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setError('');
    setLoading(true);

    try {
      let accessToken: string | undefined;

      const { data: refreshData, error: sessionError } = await supabase.auth.refreshSession();
      if (!sessionError && refreshData.session) {
        accessToken = refreshData.session.access_token;
      } else {
        const { data: fallbackData } = await supabase.auth.getSession();
        accessToken = fallbackData.session?.access_token;
      }

      if (!accessToken) {
        setError('Vous devez être connecté pour effectuer un paiement.');
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
        throw new Error(data.error || `Erreur Stripe (${response.status}). Veuillez réessayer.`);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-poppins font-bold text-xl">
              {step === 'success' ? 'Contact débloqué !' : 'Débloquer le contact'}
            </h2>
            <p className="text-ocean-200 text-sm mt-0.5">
              {step === 'success' ? 'Coordonnées disponibles' : `${displayName} — ${CITY_LABELS[listing.departure]} → ${CITY_LABELS[listing.destination]}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {step === 'preview' && (
            <div className="space-y-5">
              <div className="bg-ocean-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-ocean-600 -rotate-45" />
                  <span className="text-sm font-semibold text-gray-900">
                    {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Date de vol</p>
                    <p className="font-medium text-gray-900">
                      {new Date(listing.flight_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Kilos disponibles</p>
                    <p className="font-medium text-gray-900">{listing.kilos_available} kg</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <Lock className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Coordonnées masquées</p>
                  <p className="text-xs text-gray-500">Téléphone + Email du voyageur</p>
                </div>
                <span className="px-3 py-1 bg-ocean-500 text-white text-sm font-bold rounded-full">
                  2,99€
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-eco-500" />
                  Paiement sécurisé par Stripe
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-eco-500" />
                  Accès immédiat après validation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-eco-500" />
                  Coordonnées disponibles dans votre tableau de bord
                </div>
              </div>

              {!user && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Vous devez être connecté pour débloquer un contact.{' '}
                    <button onClick={onAuthRequired} className="font-semibold underline">
                      Se connecter
                    </button>
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <button
                onClick={() => user ? setStep('payment') : onAuthRequired()}
                className="w-full py-4 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" />
                Payer 2,99€ et voir les coordonnées
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-7 h-7 text-ocean-600" />
                </div>
                <p className="text-gray-600 text-sm">Montant : <strong className="text-gray-900">2,99€</strong></p>
                <p className="text-gray-400 text-xs mt-1">
                  Vous allez être redirigé vers notre page de paiement sécurisée.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2 text-xs text-blue-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  Paiement traité directement par Stripe
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  Vos coordonnées bancaires ne transitent pas par nos serveurs
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  Retour automatique après paiement
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirection en cours...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Payer — 2,99€
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                Paiement sécurisé SSL
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-eco-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Contact débloqué !</h3>
                <p className="text-gray-500 text-sm">
                  Les coordonnées de {displayName} sont maintenant accessibles.
                </p>
              </div>
              <div className="bg-eco-50 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">{formatPhone(listing.phone)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(listing.phone, 'phone')}
                    className="p-2 rounded-lg hover:bg-eco-100 transition-colors"
                    title="Copier"
                  >
                    <Copy className={`w-4 h-4 ${copiedPhone ? 'text-eco-600' : 'text-gray-400'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">{listing.contact_email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(listing.contact_email, 'email')}
                    className="p-2 rounded-lg hover:bg-eco-100 transition-colors"
                    title="Copier"
                  >
                    <Copy className={`w-4 h-4 ${copiedEmail ? 'text-eco-600' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-2xl transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter sur WhatsApp
                </a>
              )}
              <p className="text-xs text-gray-400">
                Ces coordonnées sont aussi disponibles dans votre tableau de bord.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-2xl transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
