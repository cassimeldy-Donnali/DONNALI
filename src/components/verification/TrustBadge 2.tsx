import { ShieldCheck, Plane, User } from 'lucide-react';

interface TrustBadgeProps {
  identityVerified: boolean;
  flightVerified: boolean;
  trustScore: number;
  compact?: boolean;
}

export function TrustBadge({ identityVerified, flightVerified, trustScore, compact = false }: TrustBadgeProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {trustScore >= 50 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-eco-100 text-eco-700 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3 h-3" />
            Vérifié
          </span>
        )}
        {flightVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full text-xs font-semibold">
            <Plane className="w-3 h-3 -rotate-45" />
            Vol confirmé
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
        identityVerified
          ? 'bg-eco-50 text-eco-700 border-eco-200'
          : 'bg-gray-50 text-gray-400 border-gray-200'
      }`}>
        <User className="w-3.5 h-3.5" />
        {identityVerified ? 'Identité vérifiée' : 'Identité non vérifiée'}
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
        flightVerified
          ? 'bg-ocean-50 text-ocean-700 border-ocean-200'
          : 'bg-gray-50 text-gray-400 border-gray-200'
      }`}>
        <Plane className="w-3.5 h-3.5 -rotate-45" />
        {flightVerified ? 'Vol confirmé' : 'Vol non confirmé'}
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
        trustScore >= 90
          ? 'bg-eco-50 text-eco-700 border-eco-200'
          : trustScore >= 50
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-gray-50 text-gray-400 border-gray-200'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        Score de confiance : {trustScore}/100
      </div>
    </div>
  );
}
