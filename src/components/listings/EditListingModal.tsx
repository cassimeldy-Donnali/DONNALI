import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Listing, City } from '../../types';
import { CITY_LABELS } from '../../types';

interface EditListingModalProps {
  listing: Listing;
  onClose: () => void;
  onSaved: (updated: Listing) => void;
}

const CITIES: City[] = ['reunion', 'mayotte', 'paris'];

const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white';
const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

export function EditListingModal({ listing, onClose, onSaved }: EditListingModalProps) {
  const [form, setForm] = useState({
    departure: listing.departure as City,
    destination: listing.destination as City,
    flight_date: listing.flight_date,
    flight_time: listing.flight_time || '',
    kilos_available: String(listing.kilos_available),
    price_per_kilo: String(listing.price_per_kilo),
    description: listing.description || '',
    phone: listing.phone,
    contact_email: listing.contact_email,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.departure === form.destination) {
      setError("La ville de départ et d'arrivée doivent être différentes.");
      return;
    }

    const cleanPhone = form.phone.replace(/[\s\-\.]/g, '');
    if (!cleanPhone.match(/^(\+\d{1,3})?0?\d{9,10}$/)) {
      setError('Numéro de téléphone invalide.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('listings')
        .update({
          departure: form.departure,
          destination: form.destination,
          flight_date: form.flight_date,
          flight_time: form.flight_time || null,
          kilos_available: parseInt(form.kilos_available),
          price_per_kilo: parseFloat(form.price_per_kilo) || 0,
          description: form.description || null,
          phone: cleanPhone,
          contact_email: form.contact_email,
        })
        .eq('id', listing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      onSaved(data as Listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-poppins font-bold text-xl">Modifier l'annonce</h2>
            <p className="text-ocean-200 text-sm mt-0.5">
              {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Départ</label>
              <select value={form.departure} onChange={(e) => set('departure', e.target.value)} className={inputClass} required>
                {CITIES.map((c) => <option key={c} value={c}>{CITY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Arrivée</label>
              <select value={form.destination} onChange={(e) => set('destination', e.target.value)} className={inputClass} required>
                {CITIES.map((c) => <option key={c} value={c}>{CITY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date du vol</label>
              <input
                type="date" value={form.flight_date}
                onChange={(e) => set('flight_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heure du vol</label>
              <input type="time" value={form.flight_time} onChange={(e) => set('flight_time', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kilos disponibles</label>
              <input
                type="number" value={form.kilos_available}
                onChange={(e) => set('kilos_available', e.target.value)}
                required min="1" max="30" className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Prix/kg (EUR)</label>
              <input
                type="number" value={form.price_per_kilo}
                onChange={(e) => set('price_per_kilo', e.target.value)}
                min="0" step="0.50" placeholder="0 = Gratuit" className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Message aux expéditeurs</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3} className={`${inputClass} resize-none`}
              placeholder="Ex : J'accepte vêtements, chaussures et cadeaux emballés."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                type="tel" value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                required className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email de contact</label>
              <input
                type="email" value={form.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                : <><CheckCircle className="w-4 h-4" /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
