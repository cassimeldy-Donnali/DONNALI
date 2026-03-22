import { useState, useEffect } from 'react';
import {
  Plane, CheckCircle, AlertCircle, Info, ShieldAlert, CheckSquare, Square,
  ShieldCheck, Clock, User, ArrowRight, Loader2, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { City } from '../types';
import { CITY_LABELS } from '../types';

interface PostListingPageProps {
  user: SupabaseUser | null;
  onAuthRequired: () => void;
  onNavigate: (page: string) => void;
}

const CITIES: City[] = ['reunion', 'mayotte', 'paris'];

const AIRPORT_OPTIONS = [
  { value: 'RUN', label: 'La Reunion (RUN)' },
  { value: 'DZA', label: 'Mayotte (DZA)' },
  { value: 'CDG', label: 'Paris CDG (CDG)' },
  { value: 'ORY', label: 'Paris Orly (ORY)' },
  { value: 'MRS', label: 'Marseille (MRS)' },
  { value: 'NCE', label: 'Nice (NCE)' },
  { value: 'LYS', label: 'Lyon (LYS)' },
];

const INITIAL_FORM = {
  departure: '' as City | '',
  destination: '' as City | '',
  flight_date: '',
  flight_time: '',
  kilos_available: '',
  price_per_kilo: '',
  description: '',
  phone: '',
  contact_email: '',
};

type Step = 1 | 2 | 3;

const DEFAULT_DESCRIPTION = "Bonjour ! J'accepte tout ce qui est légal. N'hésitez pas à me contacter pour plus d'informations.";

export function PostListingPage({ user, onAuthRequired, onNavigate }: PostListingPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [flightSubmitting, setFlightSubmitting] = useState(false);
  const [flightSubmitted, setFlightSubmitted] = useState(false);
  const [flightError, setFlightError] = useState('');

  const [form, setForm] = useState(INITIAL_FORM);
  const [useDefaultDescription, setUseDefaultDescription] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState('');

  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');
  const [identitySessionId, setIdentitySessionId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [checkingVerif, setCheckingVerif] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckingVerif(false);
      return;
    }
    checkExistingVerification();
  }, [user]);

  useEffect(() => {
    if (!listingId || !identitySessionId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('listings')
        .select('is_published')
        .eq('id', listingId)
        .maybeSingle();
      if (data?.is_published) {
        setIsPublished(true);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [listingId, identitySessionId]);

  const checkExistingVerification = async () => {
    const { data } = await supabase
      .from('flight_verifications')
      .select('id')
      .eq('user_id', user!.id)
      .limit(1)
      .maybeSingle();
    if (data) {
      setFlightSubmitted(true);
      setCurrentStep(2);
    }
    setCheckingVerif(false);
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlightSubmitting(true);
    setFlightError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setFlightError('Vous devez être connecté.');
      setFlightSubmitting(false);
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-flight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          flight_number: flightNumber,
          flight_date: flightDate,
          departure_airport: departureAirport || undefined,
          arrival_airport: arrivalAirport || undefined,
        }),
      });

      let responseData: { error?: string; details?: string } = {};
      try { responseData = await res.json(); } catch { }

      if (!res.ok) {
        setFlightError(responseData.error || responseData.details || `Erreur ${res.status}. Veuillez réessayer.`);
      } else {
        setFlightSubmitted(true);
        setCurrentStep(2);
      }
    } catch {
      setFlightError('Erreur de connexion. Vérifiez votre connexion internet et réessayez.');
    } finally {
      setFlightSubmitting(false);
    }
  };

  const set = (key: keyof typeof INITIAL_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleDefaultDescriptionToggle = () => {
    if (!useDefaultDescription) {
      set('description', DEFAULT_DESCRIPTION);
    } else {
      set('description', '');
    }
    setUseDefaultDescription(!useDefaultDescription);
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingError('');

    if (!form.departure || !form.destination) {
      setListingError("Veuillez sélectionner une ville de départ et d'arrivée.");
      return;
    }
    if (form.departure === form.destination) {
      setListingError("La ville de départ et d'arrivée doivent être différentes.");
      return;
    }
    if (!disclaimerAccepted) {
      setListingError("Vous devez accepter les conditions de non-responsabilité pour continuer.");
      return;
    }
    const cleanPhone = form.phone.replace(/[\s\-\.]/g, '');
    if (!cleanPhone.match(/^(\+\d{1,3})?0?\d{9,10}$/)) {
      setListingError('Numéro de téléphone invalide (ex : 0692123456 ou +262692123456).');
      return;
    }

    setListingLoading(true);
    try {
      const { data, error: insertError } = await supabase.from('listings').insert({
        user_id: user!.id,
        departure: form.departure as City,
        destination: form.destination as City,
        flight_date: form.flight_date,
        flight_time: form.flight_time || null,
        kilos_available: parseInt(form.kilos_available),
        price_per_kilo: parseFloat(form.price_per_kilo) || 0,
        description: form.description || null,
        phone: form.phone.replace(/[\s\-\.]/g, ''),
        contact_email: form.contact_email || user!.email || '',
        is_active: true,
        is_published: false,
        disclaimer_accepted: true,
      }).select('id').single();

      if (insertError) throw insertError;
      setListingId(data.id);
      setCurrentStep(3);
    } catch (err: unknown) {
      setListingError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setListingLoading(false);
    }
  };

  const handleIdentityVerification = async () => {
    if (!listingId) return;
    setIdentityLoading(true);
    setIdentityError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIdentityError('Vous devez être connecté.');
      setIdentityLoading(false);
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const returnUrl = `${window.location.origin}${window.location.pathname}?listing_id=${listingId}&identity=done`;
      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ listing_id: listingId, return_url: returnUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIdentityError(data.error || 'Erreur lors de la création de la session de vérification.');
        return;
      }

      if (data.already_verified) {
        setIsPublished(true);
        return;
      }

      setIdentitySessionId(data.session_id);
      window.location.href = data.url;
    } catch {
      setIdentityError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!listingId) return;
    setCheckingStatus(true);
    const { data } = await supabase
      .from('listings')
      .select('is_published')
      .eq('id', listingId)
      .maybeSingle();
    if (data?.is_published) {
      setIsPublished(true);
    } else {
      setIdentityError("Votre identité n'a pas encore été validée. Réessayez dans quelques instants.");
    }
    setCheckingStatus(false);
  };

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Plane className="w-8 h-8 text-ocean-500 -rotate-45" />
          </div>
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">Connexion requise</h2>
          <p className="text-gray-500 text-sm mb-6">
            Vous devez être connecté pour publier une annonce de voyage.
          </p>
          <button
            onClick={onAuthRequired}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Se connecter ou s'inscrire
          </button>
        </div>
      </div>
    );
  }

  if (checkingVerif) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isPublished) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-9 h-9 text-eco-500" />
          </div>
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">Annonce publiée !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre identité a été vérifiée et votre annonce est maintenant visible sur DONNALI.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('listings')}
              className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Voir les annonces
            </button>
            <button
              onClick={() => {
                setIsPublished(false);
                setListingId(null);
                setCurrentStep(2);
                setForm(INITIAL_FORM);
                setIdentitySessionId(null);
              }}
              className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Publier une autre annonce
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-ocean-500 rounded-2xl items-center justify-center shadow-lg mb-4">
            <Plane className="w-7 h-7 text-white -rotate-45" />
          </div>
          <h1 className="font-poppins text-3xl font-bold text-gray-900 mb-2">Publier une annonce</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Indiquez les détails de votre voyage et proposez vos kilos disponibles à la communauté.
          </p>
        </div>

        <div className="flex items-center justify-center gap-0 mb-10">
          {([
            { step: 1, label: 'Infos de vol', Icon: Plane },
            { step: 2, label: 'Détails', Icon: CheckSquare },
            { step: 3, label: 'Vérification', Icon: User },
          ] as const).map(({ step, label, Icon }, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep > step
                    ? 'bg-eco-500 text-white'
                    : currentStep === step
                    ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-200'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${currentStep === step ? 'text-ocean-600' : currentStep > step ? 'text-eco-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`w-16 h-0.5 mx-1 mb-5 transition-all ${currentStep > step ? 'bg-eco-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {currentStep === 1 && !flightSubmitted && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-ocean-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Étape 1 — Infos de vol</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Soumis à l'équipe DONNALI pour vérification</p>
                </div>
                <span className="text-xs font-semibold text-ocean-700 bg-ocean-50 border border-ocean-200 rounded-full px-3 py-1">Requis</span>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-start gap-3 p-3.5 bg-ocean-50 rounded-xl border border-ocean-100 mb-5">
                  <Info className="w-4 h-4 text-ocean-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-ocean-700 leading-relaxed">
                    Renseignez votre numéro de vol. L'équipe DONNALI vérifiera votre billet sous 24h et activera votre badge de voyageur vérifié.
                  </p>
                </div>

                <form onSubmit={handleFlightSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Numéro de vol <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        placeholder="ex: AF1234"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Date du vol <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Aéroport de départ</label>
                      <select value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)} className={inputClass}>
                        <option value="">Sélectionner...</option>
                        {AIRPORT_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Aéroport d'arrivée</label>
                      <select value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value)} className={inputClass}>
                        <option value="">Sélectionner...</option>
                        {AIRPORT_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {flightError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-red-600 text-xs">{flightError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={flightSubmitting}
                    className="w-full py-3.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {flightSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Envoyer et continuer <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {currentStep === 1 && flightSubmitted && (
            <div className="bg-eco-50 border border-eco-200 rounded-2xl px-6 py-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-eco-600 shrink-0" />
              <p className="text-eco-800 text-sm font-medium">Informations de vol déjà soumises.</p>
              <button
                onClick={() => setCurrentStep(2)}
                className="ml-auto text-xs font-semibold text-eco-700 border border-eco-300 rounded-lg px-3 py-1.5 hover:bg-eco-100 transition-colors whitespace-nowrap"
              >
                Continuer
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div className="bg-eco-50 border border-eco-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-eco-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-eco-800 text-xs font-semibold">Étape 1 complète — Infos de vol envoyées</p>
                  <p className="text-eco-700 text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Vérification par l'équipe DONNALI sous 24h
                  </p>
                </div>
              </div>

              <div className="bg-ocean-50 border border-ocean-100 rounded-2xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-ocean-600 shrink-0 mt-0.5" />
                <p className="text-ocean-700 text-sm">
                  Vos coordonnées seront masquées et ne seront révélées qu'après un paiement de 2,99 EUR par l'expéditeur.
                </p>
              </div>

              <form onSubmit={handleListingSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-ocean-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Étape 2 — Détails de l'annonce</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Renseignez les informations de votre voyage</p>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Détails du vol</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Ville de départ *</label>
                        <select value={form.departure} onChange={(e) => set('departure', e.target.value)} required className={inputClass}>
                          <option value="">Sélectionnez</option>
                          {CITIES.map((c) => <option key={c} value={c}>{CITY_LABELS[c]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Ville d'arrivée *</label>
                        <select value={form.destination} onChange={(e) => set('destination', e.target.value)} required className={inputClass}>
                          <option value="">Sélectionnez</option>
                          {CITIES.map((c) => <option key={c} value={c}>{CITY_LABELS[c]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Date du vol *</label>
                        <input
                          type="date"
                          value={form.flight_date}
                          onChange={(e) => set('flight_date', e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Heure du vol</label>
                        <input type="time" value={form.flight_time} onChange={(e) => set('flight_time', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Disponibilité des kilos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Kilos disponibles *</label>
                        <input
                          type="number" placeholder="Ex: 10" value={form.kilos_available}
                          onChange={(e) => set('kilos_available', e.target.value)}
                          required min="1" max="30" className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Prix par kilo (EUR)</label>
                        <input
                          type="number" placeholder="0 = Gratuit" value={form.price_per_kilo}
                          onChange={(e) => set('price_per_kilo', e.target.value)}
                          min="0" step="0.50" className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelClass}>Votre message aux expéditeurs</label>
                      <button
                        type="button"
                        onClick={handleDefaultDescriptionToggle}
                        className="w-full flex items-center gap-3 px-4 py-3 mb-3 border-2 border-dashed border-ocean-200 rounded-xl bg-ocean-50 hover:border-ocean-400 hover:bg-ocean-100 transition-colors text-left"
                      >
                        {useDefaultDescription
                          ? <CheckSquare className="w-5 h-5 text-ocean-600 shrink-0" />
                          : <Square className="w-5 h-5 text-ocean-400 shrink-0" />}
                        <span className="text-sm text-ocean-700">
                          Utiliser le message par défaut : <em className="not-italic font-medium">"{DEFAULT_DESCRIPTION}"</em>
                        </span>
                      </button>
                      <textarea
                        placeholder={`Écrivez votre message ici...\nEx : "Bonjour ! J'accepte les vêtements, chaussures et cadeaux emballés. Contactez-moi !"`}
                        value={form.description}
                        onChange={(e) => { set('description', e.target.value); if (useDefaultDescription) setUseDefaultDescription(false); }}
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                      <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-800 mb-1">Objets strictement interdits en bagage</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            En tant que voyageur, vous êtes seul responsable du contenu de vos bagages.
                            Il est <strong>formellement interdit</strong> de transporter :{' '}
                            <strong>drogues et stupéfiants</strong>, armes et munitions, explosifs, liquides inflammables,
                            médicaments en grande quantité sans ordonnance, espèces animales protégées, contrefaçons et tout objet prohibé par la loi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Vos coordonnées (masquées)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Téléphone *</label>
                        <input
                          type="tel" placeholder="0692123456" value={form.phone}
                          onChange={(e) => set('phone', e.target.value.replace(/\s/g, ''))}
                          required className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>E-mail de contact</label>
                        <input
                          type="email" placeholder={user.email || 'votre@email.com'} value={form.contact_email}
                          onChange={(e) => set('contact_email', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDisclaimerAccepted(!disclaimerAccepted)}
                    className={`w-full flex items-start gap-3 px-4 py-4 rounded-xl border-2 text-left transition-colors ${
                      disclaimerAccepted
                        ? 'border-eco-400 bg-eco-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                      disclaimerAccepted ? 'bg-eco-500 border-eco-500' : 'border-gray-300 bg-white'
                    }`}>
                      {disclaimerAccepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 mb-1">Déclaration de non-responsabilité — à lire et accepter</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Je comprends et j'accepte que <strong>DONNALI est uniquement une plateforme de mise en relation</strong> entre voyageurs et expéditeurs.
                        DONNALI n'est ni transporteur, ni assureur, ni mandataire. DONNALI ne pourra être tenu responsable
                        en cas de <strong>litige, annulation de vol, perte, vol, dommage, retard ou tout autre incident</strong> lié à l'échange entre les parties.
                        Chaque utilisateur agit sous sa propre responsabilité et s'engage à respecter la législation en vigueur.
                      </p>
                    </div>
                  </button>

                  {listingError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-red-600 text-xs">{listingError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={listingLoading || !disclaimerAccepted}
                    className="w-full py-4 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {listingLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                      : <>Continuer vers la vérification <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="bg-eco-50 border border-eco-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-eco-600 shrink-0" />
                <p className="text-eco-800 text-xs font-semibold">Étapes 1 et 2 complètes — Annonce enregistrée</p>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-ocean-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Étape 3 — Vérification d'identité</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Obligatoire pour publier votre annonce</p>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">Bloquant</span>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-ocean-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Pourquoi cette vérification ?</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Pour garantir la sécurité de la communauté DONNALI, nous devons vérifier votre identité avant de publier votre annonce.
                        La vérification est rapide, sécurisée et confidentielle.{' '}
                        <strong className="text-gray-900">Votre annonce sera publiée automatiquement une fois validée.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Sécurisé', sub: 'Chiffrement de bout en bout' },
                      { label: 'Rapide', sub: '2-3 minutes' },
                      { label: 'Confidentiel', sub: 'Données protégées' },
                    ].map(({ label, sub }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {identityError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-red-600 text-xs">{identityError}</p>
                    </div>
                  )}

                  {identitySessionId ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Si vous avez déjà terminé la vérification, cliquez sur le bouton ci-dessous pour vérifier le statut de votre annonce.
                        </p>
                      </div>
                      <button
                        onClick={handleCheckStatus}
                        disabled={checkingStatus}
                        className="w-full py-3.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {checkingStatus
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                          : <><CheckCircle className="w-4 h-4" /> Vérifier le statut de mon annonce</>}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleIdentityVerification}
                      disabled={identityLoading}
                      className="w-full py-4 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {identityLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Préparation...</>
                        : <><ExternalLink className="w-4 h-4" /> Vérifier mon identité</>}
                    </button>
                  )}

                  <p className="text-center text-xs text-gray-400">
                    Votre annonce sera publiée automatiquement dès validation de votre identité.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
