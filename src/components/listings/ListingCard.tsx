import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Plane, Calendar, Package, Lock, Unlock, User, Heart, MessageSquare, Share2, Check } from 'lucide-react';
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
    calendarClass: 'text-gray-400',
  },
  today: {
    cardClass: 'border-amber-200 shadow-amber-100',
    badgeClass: 'bg-amber-100 text-amber-700',
    calendarClass: 'text-amber-500',
  },
  soon: {
    cardClass: 'border-orange-200 shadow-orange-50',
    badgeClass: 'bg-orange-100 text-orange-700',
    calendarClass: 'text-orange-500',
  },
  ok: {
    cardClass: '',
    badgeClass: '',
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

function DescriptionTooltip({ description }: { description: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<'above' | 'below'>('above');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos(rect.top > 260 ? 'above' : 'below');
    }
    setVisible(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setVisible(false), 120);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isLong = description.length > 80;
  if (!isLong) {
    return <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{description}</p>;
  }

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-default"
      >
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{description}</p>
        <div className="flex items-center gap-1 mt-1">
          <MessageSquare className="w-3 h-3 text-ocean-400" />
          <span className="text-xs text-ocean-500 font-medium">Voir la description complète</span>
        </div>
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-72 pointer-events-auto
            ${pos === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 relative">
            <div className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-white/10">
              <MessageSquare className="w-3.5 h-3.5 text-ocean-300 shrink-0" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Description du voyageur</span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{description}</p>
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45
                ${pos === 'above' ? '-bottom-1.5' : '-top-1.5'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ListingCard({ listing, isUnlocked, isFavorite = false, onUnlock, onToggleFavorite }: ListingCardProps) {
  const [favActive, setFavActive] = useState(isFavorite);
  const [favLoading, setFavLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${listing.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Trajet ${CITY_LABELS[listing.departure]} → ${CITY_LABELS[listing.destination]}`, url }); } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const isIdentVerified = profile?.identity_verified;
  const isFlightVerified = profile?.flight_verified;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 overflow-hidden
      ${dateConfig.cardClass || 'border-gray-100'}
      shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]`}
    >
      <div className="p-5">

        {dateStatus !== 'ok' && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${dateConfig.badgeClass}`}>
            <Calendar className="w-3 h-3 shrink-0" />
            <span>
              {dateStatus === 'past' && 'Vol probablement terminé'}
              {dateStatus === 'today' && "Vol aujourd'hui"}
              {dateStatus === 'soon' && 'Vol dans moins de 48h'}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base">{initials}</span>
            </div>
            {(isIdentVerified || (!isIdentVerified && isFlightVerified)) && (
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm
                  ${isIdentVerified ? 'bg-eco-500' : 'bg-ocean-500'}`}
                title={isIdentVerified ? 'Identité vérifiée' : 'Vol confirmé'}
              >
                {isIdentVerified
                  ? <ShieldCheck className="w-3 h-3 text-white" />
                  : <Plane className="w-2.5 h-2.5 text-white -rotate-45" />
                }
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{displayName}</h3>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={handleShare}
                  className={`p-1.5 rounded-lg transition-colors ${copied ? 'text-eco-600 bg-eco-50' : 'text-gray-300 hover:text-ocean-500 hover:bg-ocean-50'}`}
                  title="Partager"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
                {onToggleFavorite && (
                  <button
                    onClick={handleFavorite}
                    disabled={favLoading}
                    className={`p-1.5 rounded-lg transition-colors ${
                      favActive ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                    }`}
                    title={favActive ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favActive ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-ocean-600 font-semibold text-xs">
                <Plane className="w-3.5 h-3.5 -rotate-45 shrink-0" />
                <span className="whitespace-nowrap">{CITY_LABELS[listing.departure]}</span>
                <span className="text-gray-300 px-0.5">→</span>
                <span className="whitespace-nowrap">{CITY_LABELS[listing.destination]}</span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${isFree ? 'bg-eco-100 text-eco-700' : 'bg-ocean-50 text-ocean-700'}`}>
                {isFree ? 'Gratuit' : `${listing.price_per_kilo}€/kg`}
              </span>
            </div>
          </div>
        </div>

        {(isIdentVerified || isFlightVerified) && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {isIdentVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-eco-500 text-white rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                Identité vérifiée
              </span>
            )}
            {isFlightVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ocean-500 text-white rounded-full text-xs font-semibold">
                <Plane className="w-3 h-3 -rotate-45 shrink-0" />
                Vol confirmé
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Calendar className={`w-4 h-4 shrink-0 ${dateConfig.calendarClass}`} />
            <span className="text-xs text-gray-600 font-medium leading-snug">{flightDate}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Package className="w-4 h-4 text-eco-500 shrink-0" />
            <span className="text-xs text-gray-600 font-medium">
              <strong className="text-gray-900 font-bold">{listing.kilos_available} kg</strong>
              {' '}dispo
            </span>
          </div>
        </div>

        {listing.description && (
          <div className="mb-3">
            <DescriptionTooltip description={listing.description} />
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          {isUnlocked ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-eco-50 rounded-xl">
              <Unlock className="w-4 h-4 text-eco-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-eco-700 font-semibold truncate">
                  {listing.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}
                </p>
                <p className="text-xs text-eco-600 truncate">{listing.contact_email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                <Lock className="w-4 h-4 text-gray-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-mono tracking-wider truncate">{maskPhone(listing.phone)}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {listing.contact_email.split('@')[0].slice(0, 3)}***@***.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => onUnlock(listing)}
                disabled={dateStatus === 'past'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 active:bg-ocean-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>{dateStatus === 'past' ? 'Vol terminé' : 'Voir les coordonnées — 2,99€'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
