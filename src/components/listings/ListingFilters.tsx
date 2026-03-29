import { ShieldCheck, Plane, Star, SlidersHorizontal, RotateCcw, Gift } from 'lucide-react';
import type { City, SearchFilters } from '../../types';
import { CITY_LABELS } from '../../types';

const CITIES: City[] = ['reunion', 'mayotte', 'paris'];

interface ListingFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  total: number;
}

const DEFAULT_FILTERS: SearchFilters = {
  departure: '',
  destination: '',
  date: '',
  dateFrom: '',
  dateTo: '',
  minKilos: 0,
  maxPrice: 999,
  onlyVerified: false,
  onlyFlightVerified: false,
  minRating: 0,
  freeOnly: false,
};

export function ListingFilters({ filters, onChange, total }: ListingFiltersProps) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  const activeCount = [
    filters.departure,
    filters.destination,
    filters.dateFrom || filters.date,
    filters.dateTo,
    filters.minKilos > 0,
    filters.maxPrice < 999,
    filters.onlyVerified,
    filters.onlyFlightVerified,
    filters.minRating > 0,
    filters.freeOnly,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-4 h-4 text-ocean-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Filtres</h3>
        {activeCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-ocean-100 text-ocean-700 rounded-full text-xs font-bold">
            {activeCount}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500 font-medium">{total} annonce{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Départ
          </label>
          <select
            value={filters.departure}
            onChange={(e) => set({ departure: e.target.value as City | '' })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{CITY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Arrivée
          </label>
          <select
            value={filters.destination}
            onChange={(e) => set({ destination: e.target.value as City | '' })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{CITY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Plage de dates
          </label>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-400 mb-1 block">Du</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => set({ dateFrom: e.target.value, date: '' })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300"
              />
            </div>
            <div>
              <span className="text-xs text-gray-400 mb-1 block">Au</span>
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom}
                onChange={(e) => set({ dateTo: e.target.value, date: '' })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Kilos minimum
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="30"
              value={filters.minKilos}
              onChange={(e) => set({ minKilos: parseInt(e.target.value) })}
              className="flex-1 accent-ocean-500"
            />
            <span className="text-sm font-semibold text-ocean-600 w-12 text-right">
              {filters.minKilos} kg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Prix max / kilo
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="20"
              value={filters.maxPrice >= 999 ? 20 : filters.maxPrice}
              onChange={(e) => set({ maxPrice: parseInt(e.target.value) === 20 ? 999 : parseInt(e.target.value) })}
              className="flex-1 accent-ocean-500"
            />
            <span className="text-sm font-semibold text-ocean-600 w-12 text-right">
              {filters.maxPrice >= 999 ? '∞' : `${filters.maxPrice}€`}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Note minimale
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => set({ minRating: filters.minRating === star ? 0 : star })}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= filters.minRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {filters.minRating > 0 && (
              <span className="text-xs text-gray-500 ml-1">&amp; +</span>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Filtres rapides
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.onlyVerified}
              onChange={(e) => set({ onlyVerified: e.target.checked })}
              className="w-4 h-4 accent-ocean-500 rounded"
            />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-eco-600" />
              <span className="text-sm text-gray-700 font-medium">Identité vérifiée</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.onlyFlightVerified}
              onChange={(e) => set({ onlyFlightVerified: e.target.checked })}
              className="w-4 h-4 accent-ocean-500 rounded"
            />
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-ocean-600 -rotate-45" />
              <span className="text-sm text-gray-700 font-medium">Vol confirmé</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.freeOnly}
              onChange={(e) => set({ freeOnly: e.target.checked })}
              className="w-4 h-4 accent-ocean-500 rounded"
            />
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-700 font-medium">Gratuit seulement</span>
            </div>
          </label>
        </div>

        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-ocean-600 border border-gray-200 rounded-xl hover:border-ocean-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}
