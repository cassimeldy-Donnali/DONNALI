import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { Stats } from '../components/home/Stats';
import { Testimonials } from '../components/home/Testimonials';
import { NewsletterBanner } from '../components/newsletter/NewsletterBanner';
import type { SearchFilters } from '../types';

interface HomePageProps {
  onSearch: (filters: SearchFilters) => void;
  onNavigate: (page: string) => void;
}

export function HomePage({ onSearch, onNavigate }: HomePageProps) {
  return (
    <div>
      <Hero onSearch={onSearch} onNavigate={onNavigate} />
      <HowItWorks />
      <Stats />
      <Testimonials />

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Ne ratez plus aucune annonce
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Recevez une notification par email dès qu'un voyageur publie pour votre destination.
            </p>
          </div>
          <NewsletterBanner />
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-ocean-600 to-ocean-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-eco-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-ocean-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à partager vos kilos ?
          </h2>
          <p className="text-ocean-200 text-lg mb-8">
            Rejoignez des centaines de voyageurs et expéditeurs qui font confiance à DONNALI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('listings')}
              className="px-8 py-4 bg-white text-ocean-700 font-bold rounded-2xl hover:bg-ocean-50 transition-colors shadow-lg text-sm"
            >
              Voir les annonces
            </button>
            <button
              onClick={() => onNavigate('post')}
              className="px-8 py-4 bg-eco-500 hover:bg-eco-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-eco-500/30 text-sm"
            >
              Publier une annonce
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
