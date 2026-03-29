import { SlidersHorizontal } from 'lucide-react';
import type { City, SearchFilters } from '../../types';
import { CITY_LABELS } from '../../types';

const CITIES: City[] = ['reunion', 'mayotte', 'paris'];

interface ListingFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  total: number;
}

export function ListingFilters({ filters, onChange, total }: ListingFiltersProps) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-4 h-4 text-ocean-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Filtres</h3>
        <span className="ml-auto text-xs text-gray-500 font-medium">{total} annonce{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Départ
          </label>
          <select
            value={filters.departure}
            onChange={(e) => set({ departure: e.target.value as City | '' })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300 bg-white"
          >
            <option value="">Toutes</option>
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
            <option value="">Toutes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{CITY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Date de vol
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => set({ date: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-300"
          />
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
              value={filters.maxPrice}
              onChange={(e) => set({ maxPrice: parseInt(e.target.value) })}
              className="flex-1 accent-ocean-500"
            />
            <span className="text-sm font-semibold text-ocean-600 w-12 text-right">
              {filters.maxPrice >= 20 ? '∞' : `${filters.maxPrice}€`}
            </span>
          </div>
        </div>

        <button
          onClick={() => onChange({ departure: '', destination: '', date: '', minKilos: 0, maxPrice: 999 })}
          className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-ocean-600 border border-gray-200 rounded-xl hover:border-ocean-200 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}
