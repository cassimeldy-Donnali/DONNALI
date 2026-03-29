import { useState } from 'react';
import { X, Bell, Mail, CheckCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Location = 'reunion' | 'mayotte' | 'paris';

const LOCATIONS: { value: Location; label: string }[] = [
  { value: 'reunion', label: 'La Réunion' },
  { value: 'mayotte', label: 'Mayotte' },
  { value: 'paris', label: 'Paris / France métro' },
];

interface Props {
  onClose: () => void;
  defaultDestination?: Location;
}

export function NewsletterSubscribeModal({ onClose, defaultDestination }: Props) {
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState<Location>(defaultDestination ?? 'reunion');
  const [departure, setDeparture] = useState<Location | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !destination) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Adresse email invalide.');
      return;
    }

    if (departure && departure === destination) {
      setError('Le départ et la destination ne peuvent pas être identiques.');
      return;
    }

    setLoading(true);

    const { error: dbError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.trim().toLowerCase(),
        destination,
        departure: departure || null,
      });

    setLoading(false);

    if (dbError) {
      if (dbError.code === '23505') {
        setError('Vous êtes déjà abonné à cette alerte.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      return;
    }

    setSuccess(true);
  };

  const availableDepartures = LOCATIONS.filter((l) => l.value !== destination);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 px-6 pt-6 pb-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="font-poppins text-xl font-bold mb-1">Alerte voyage</h2>
          <p className="text-ocean-200 text-sm leading-relaxed">
            Recevez un email dès qu'un voyageur publie une annonce pour votre destination.
          </p>
        </div>

        <div className="px-6 py-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-eco-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-eco-500" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-gray-900 mb-2">Vous êtes abonné !</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Vous recevrez un email dès qu'un voyageur se dirige vers{' '}
                <strong className="text-ocean-600">
                  {LOCATIONS.find((l) => l.value === destination)?.label}
                </strong>
                .
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Votre email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Destination
                </label>
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as Location)}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Départ (optionnel)
                </label>
                <div className="relative">
                  <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value as Location | '')}
                    className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white"
                  >
                    <option value="">Tous les départs</option>
                    {availableDepartures.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Laissez vide pour être alerté de tous les départs vers {LOCATIONS.find((l) => l.value === destination)?.label}.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {loading ? 'Inscription...' : "M'abonner aux alertes"}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                En vous abonnant, vous acceptez de recevoir des emails de notification de Donnali. Désabonnement en un clic dans chaque email.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
