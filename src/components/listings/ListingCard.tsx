import { useState } from 'react';
import { ShieldCheck, Plane, Calendar, Package, Lock, Unlock, User, Heart } from 'lucide-react';
import type { Listing } from '../../types';
import { CITY_LABELS } from '../../types';

interface ListingCardProps {
  listing: Listing;
  isUnlocked: boolean;
  isFavorite?: boolean;
  onUnlock: (listing: Listing) => void;
  onToggleFavorite?: (listingId: string) => Promise<boolean>;
}

function maskPhone(phone: string): string {
  if (phone.length < 8) return '** ** ** ** **';
  return phone.slice(0, 2) + ' ** ** ** **';
}

function getDateStatus(flightDate: string, flightTime: string | null): 'past' | 'today' | 'soon' | 'ok' {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const flight = new Date(flightDate + 'T00:00:00');

  if (flight < today) return 'past';

  if (flight.getTime() === today.getTime()) {
    if (flightTime) {
      const departureDateTime = new Date(flightDate + `T${flightTime}`);
      const diffMinutes = (departureDateTime.getTime() - now.getTime()) / 60000;
      if (diffMinutes < 0) return 'past';
      if (diffMinutes < 180) return 'today';
    }
    return 'today';
  }

  const diffDays = (flight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 2) return 'soon';
  return 'ok';
}

const DATE_STATUS_CONFIG = {
  past: {
    cardClass: 'opacity-60',
    badgeClass: 'bg-gray-100 text-gray-500',
    badgeText: 'Vol passé',
    calendarClass: 'text-gray-400',
  },
  today: {
    cardClass: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700',
    badgeText: "Aujourd'hui",
    calendarClass: 'text-amber-500',
  },
  soon: {
    cardClass: 'border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-700',
    badgeText: 'Bientôt',
    calendarClass: 'text-orange-500',
  },
  ok: {
    cardClass: '',
    badgeClass: '',
    badgeText: '',
    calendarClass: 'text-ocean-500',
  },
};

function formatPrivateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return fullName.toUpperCase();
  const lastName = parts[0].toUpperCase();
  const firstInitial = parts[1][0].toUpperCase();
  return `${lastName} ${firstInitial}.`;
}

export function ListingCard({ listing, isUnlocked, isFavorite = false, onUnlock, onToggleFavorite }: ListingCardProps) {
  const [favActive, setFavActive] = useState(isFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const profile = listing.profiles;
  const rawName = profile?.full_name || 'Voyageur';
  const displayName = profile?.full_name ? formatPrivateName(profile.full_name) : 'Voyageur';
  const initials = rawName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const flightDate = new Date(listing.flight_date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isFree = listing.price_per_kilo === 0;
  const dateStatus = getDateStatus(listing.flight_date, listing.flight_time);
  const dateConfig = DATE_STATUS_CONFIG[dateStatus];

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || favLoading) return;
    setFavLoading(true);
    const newState = await onToggleFavorite(listing.id);
    setFavActive(newState);
    setFavLoading(false);
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${dateConfig.cardClass}`}>
      <div className="p-6">
        {dateStatus !== 'ok' && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${dateConfig.badgeClass}`}>
            <Calendar className="w-3 h-3" />
            {dateStatus === 'past' && 'Vol probablement terminé'}
            {dateStatus === 'today' && "Vol aujourd'hui — voyageur en route"}
            {dateStatus === 'soon' && 'Vol dans moins de 48h'}
          </div>
        )}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            {profile?.id_verified && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-eco-500 rounded-full flex items-center justify-center"
                title="Identité vérifiée"
              >
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base truncate">{displayName}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {onToggleFavorite && (
                  <button
                    onClick={handleFavorite}
                    disabled={favLoading}
                    className={`p-1.5 rounded-lg transition-all ${
                      favActive
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                    }`}
                    title={favActive ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`w-4 h-4 transition-transform ${favActive ? 'fill-current scale-110' : ''}`} />
                  </button>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isFree
                      ? 'bg-eco-100 text-eco-700'
                      : 'bg-ocean-50 text-ocean-700'
                  }`}
                >
                  {isFree ? 'Gratuit' : `${listing.price_per_kilo}€/kg`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-ocean-600 font-semibold text-sm">
              <Plane className="w-4 h-4 -rotate-45 shrink-0" />
              <span>{CITY_LABELS[listing.departure]}</span>
              <span className="text-gray-400">→</span>
              <span>{CITY_LABELS[listing.destination]}</span>
            </div>
          </div>
        </div>

        {(profile?.identity_verified || profile?.flight_verified) && (
          <div className="flex items-center gap-1.5 mb-4">
            {profile.identity_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Vérifié
              </span>
            )}
            {profile.flight_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full text-xs font-semibold">
                <Plane className="w-3 h-3 -rotate-45" />
                Vol confirmé
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <Calendar className={`w-4 h-4 shrink-0 ${dateConfig.calendarClass}`} />
            <span className="text-xs text-gray-600 font-medium">{flightDate}</span>
          </div>
          <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
            <Package className="w-4 h-4 text-eco-500 shrink-0" />
            <span className="text-xs text-gray-600 font-medium">
              <strong className="text-gray-900">{listing.kilos_available} kg</strong> disponibles
            </span>
          </div>
        </div>

        {listing.description && (
          <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="border-t border-gray-100 pt-4">
          {isUnlocked ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-eco-50 rounded-xl">
                <Unlock className="w-4 h-4 text-eco-600 shrink-0" />
                <div>
                  <p className="text-xs text-eco-700 font-semibold">
                    {listing.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}
                  </p>
                  <p className="text-xs text-eco-600">{listing.contact_email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-mono tracking-wider">
                    {maskPhone(listing.phone)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {listing.contact_email.split('@')[0].slice(0, 3)}***@***.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUnlock(listing)}
                disabled={dateStatus === 'past'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-ocean-200"
              >
                <User className="w-4 h-4" />
                {dateStatus === 'past' ? 'Vol terminé' : 'Voir les coordonnées — 2,99€'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
