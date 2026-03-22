import { useState } from 'react';
import { Plane, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FlightVerificationFormProps {
  onVerified: () => void;
}

type VerifStatus = 'idle' | 'loading' | 'verified' | 'failed' | 'manual_review' | 'error';

const AIRPORT_OPTIONS = [
  { value: 'RUN', label: 'La Réunion (RUN)' },
  { value: 'DZA', label: 'Mayotte (DZA)' },
  { value: 'CDG', label: 'Paris CDG (CDG)' },
  { value: 'ORY', label: 'Paris Orly (ORY)' },
];

export function FlightVerificationForm({ onVerified }: FlightVerificationFormProps) {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [status, setStatus] = useState<VerifStatus>('idle');
  const [message, setMessage] = useState('');
  const [airlineName, setAirlineName] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus('error');
      setMessage('Vous devez être connecté.');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const res = await fetch(`${supabaseUrl}/functions/v1/verify-flight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        flight_number: flightNumber,
        flight_date: flightDate,
        departure_airport: departureAirport || undefined,
        arrival_airport: arrivalAirport || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setMessage(data.error || 'Une erreur est survenue.');
      return;
    }

    setStatus(data.status);
    setAirlineName(data.airline_name || '');

    if (data.status === 'verified') {
      setMessage('Vol confirmé ! Votre profil est maintenant vérifié.');
      onVerified();
    } else if (data.status === 'manual_review') {
      setMessage('Votre vol est en cours de vérification manuelle. Votre profil sera mis à jour sous 24h.');
      onVerified();
    } else if (data.status === 'failed') {
      setMessage(data.failure_reason || 'Impossible de confirmer ce vol. Vérifiez le numéro et la date.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
          <Plane className="w-5 h-5 text-ocean-600 -rotate-45" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Vérifier mon vol</h3>
          <p className="text-xs text-gray-500">Confirmez votre billet pour renforcer votre crédibilité</p>
        </div>
      </div>

      {status === 'verified' && (
        <div className="flex items-center gap-3 p-4 bg-eco-50 rounded-xl border border-eco-200 mb-4">
          <CheckCircle className="w-5 h-5 text-eco-600 shrink-0" />
          <p className="text-sm text-eco-800 font-medium">{message}</p>
        </div>
      )}

      {status === 'manual_review' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">{message}</p>
        </div>
      )}

      {(status === 'failed' || status === 'error') && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{message}</p>
        </div>
      )}

      {status !== 'verified' && status !== 'manual_review' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Numéro de vol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="ex: AF1234"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Date du vol <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Aéroport de départ
              </label>
              <select
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-transparent bg-white"
              >
                <option value="">Sélectionner...</option>
                {AIRPORT_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Aéroport d'arrivée
              </label>
              <select
                value={arrivalAirport}
                onChange={(e) => setArrivalAirport(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-transparent bg-white"
              >
                <option value="">Sélectionner...</option>
                {AIRPORT_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-ocean-50 rounded-xl">
            <AlertCircle className="w-4 h-4 text-ocean-500 shrink-0 mt-0.5" />
            <p className="text-xs text-ocean-700">
              Votre numéro de vol figure sur votre billet d'avion ou confirmation de réservation (ex: AF1234, XK90...).
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <Plane className="w-4 h-4 -rotate-45" />
                Vérifier mon vol
              </>
            )}
          </button>
        </form>
      )}

      {airlineName && status === 'verified' && (
        <p className="text-xs text-gray-500 mt-3 text-center">Compagnie aérienne : {airlineName}</p>
      )}
    </div>
  );
}
