import { ArrowRight, Plane, Leaf, Shield, UserCheck } from 'lucide-react';
import { SearchBar } from './SearchBar';
import type { SearchFilters } from '../../types';

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
  onNavigate: (page: string) => void;
}

export function Hero({ onSearch, onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-700 to-ocean-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-eco-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-ocean-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-eco-400/10 rounded-full blur-3xl" />

        <div className="absolute top-16 right-10 opacity-20 animate-pulse" style={{ animationDuration: '4s' }}>
          <Plane className="w-32 h-32 text-white -rotate-45" />
        </div>
        <div className="absolute bottom-24 left-10 opacity-10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}>
          <Plane className="w-20 h-20 text-eco-300 -rotate-45" />
        </div>

        <svg className="absolute bottom-0 left-0 right-0 text-white" viewBox="0 0 1440 80" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,80 C360,0 1080,80 1440,20 L1440,80 Z" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-eco-500/20 backdrop-blur-sm border border-eco-400/30 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5 text-eco-400 fill-eco-400" />
            <span className="text-eco-300 text-xs font-semibold tracking-wide uppercase">
              Voyager malin, voyager éco
            </span>
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Vos kilos non utilisés{' '}
            <span className="text-eco-400">valent de l'or</span>{' '}
            pour quelqu'un
          </h1>

          <p className="text-ocean-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
            Comme le covoiturage, mais pour les bagages aériens. Partagez vos kilos excédentaires
            avec des expéditeurs sur les routes{' '}
            <strong className="text-white">Réunion ↔ Mayotte ↔ Paris</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-5 mb-10">
            <div className="flex items-center gap-2 text-ocean-200 text-sm">
              <UserCheck className="w-4 h-4 text-eco-400" />
              Identité vérifiée
            </div>
            <div className="flex items-center gap-2 text-ocean-200 text-sm">
              <Shield className="w-4 h-4 text-eco-400" />
              Paiements securises
            </div>
            <div className="flex items-center gap-2 text-ocean-200 text-sm">
              <Leaf className="w-4 h-4 text-eco-400" />
              Reduction CO₂
            </div>
            <div className="flex items-center gap-2 text-ocean-200 text-sm">
              <Plane className="w-4 h-4 text-eco-400" />
              Livraison express
            </div>
          </div>

          <SearchBar onSearch={onSearch} variant="hero" />

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => onNavigate('listings')}
              className="inline-flex items-center gap-2 text-ocean-200 hover:text-white text-sm font-medium transition-all duration-200 group"
            >
              Voir toutes les annonces
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
