import { useState } from 'react';
import { Search, ArrowRight, MapPin, Calendar } from 'lucide-react';
import type { City, SearchFilters } from '../../types';
import { CITY_LABELS } from '../../types';

const CITIES: City[] = ['reunion', 'mayotte', 'paris'];

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  variant?: 'hero' | 'inline';
  initialFilters?: Partial<SearchFilters>;
}

export function SearchBar({ onSearch, variant = 'inline', initialFilters }: SearchBarProps) {
  const [departure, setDeparture] = useState<City | ''>(initialFilters?.departure || '');
  const [destination, setDestination] = useState<City | ''>(initialFilters?.destination || '');
  const [date, setDate] = useState(initialFilters?.date || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ departure, destination, date, minKilos: 0, maxPrice: 999 });
  };

  const baseInput =
    'flex-1 min-w-0 bg-white text-gray-800 text-sm font-medium rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ocean-300 focus:border-transparent transition-all';

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-300 pointer-events-none z-10" />
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value as City | '')}
                className="w-full pl-9 pr-3 py-3.5 bg-white/95 text-gray-800 text-sm font-medium rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-eco-400 appearance-none cursor-pointer"
              >
                <option value="">Ville de départ</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{CITY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center">
              <ArrowRight className="w-5 h-5 text-ocean-200" />
            </div>

            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-400 pointer-events-none z-10" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as City | '')}
                className="w-full pl-9 pr-3 py-3.5 bg-white/95 text-gray-800 text-sm font-medium rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-eco-400 appearance-none cursor-pointer"
              >
                <option value="">Ville d'arrivée</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{CITY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-300 pointer-events-none z-10" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-3.5 bg-white/95 text-gray-800 text-sm font-medium rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-eco-400"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-eco-500 hover:bg-eco-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-eco-500/30 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400 pointer-events-none z-10" />
        <select
          value={departure}
          onChange={(e) => setDeparture(e.target.value as City | '')}
          className={`${baseInput} pl-9 pr-3 py-2.5`}
        >
          <option value="">Départ</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{CITY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-500 pointer-events-none z-10" />
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value as City | '')}
          className={`${baseInput} pl-9 pr-3 py-2.5`}
        >
          <option value="">Arrivée</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{CITY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400 pointer-events-none z-10" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${baseInput} pl-9 pr-3 py-2.5`}
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
      >
        <Search className="w-4 h-4" />
        Rechercher
      </button>
    </form>
  );
}
