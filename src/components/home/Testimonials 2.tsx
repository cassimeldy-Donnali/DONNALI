import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Valérie T.',
    role: 'Expéditrice, La Réunion',
    avatar: 'VT',
    rating: 5,
    text: 'J\'ai envoyé des produits locaux réunionnais à ma sœur à Paris en 24h. C\'était 3x moins cher qu\'un colis Colissimo et beaucoup plus rapide. Je recommande à 100% !',
    route: 'Réunion → Paris',
  },
  {
    name: 'Karim B.',
    role: 'Voyageur, Paris',
    avatar: 'KB',
    rating: 5,
    text: 'Lors de mon voyage à Mayotte, j\'avais 12 kilos libres. Grâce à DONNALI, j\'ai gagné 48€ en transportant un petit colis. Parfait pour rentabiliser un voyage !',
    route: 'Paris → Mayotte',
  },
  {
    name: 'Nassima A.',
    role: 'Expéditrice, Mayotte',
    avatar: 'NA',
    rating: 5,
    text: 'Mon fils à Paris avait besoin de documents urgents. En 10 minutes j\'ai trouvé un voyageur, et les papiers sont arrivés en main propre le lendemain. Incroyable service.',
    route: 'Mayotte → Paris',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 bg-eco-50 text-eco-600 text-xs font-semibold rounded-full tracking-wide uppercase mb-3">
            Ils nous font confiance
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Des centaines de personnes ont déjà fait confiance à DONNALI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-ocean-50 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-ocean-100 relative group"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-ocean-100 group-hover:text-ocean-200 transition-colors" />
              <div className="flex items-center gap-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ocean-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-ocean-100 text-ocean-700 rounded-lg text-xs font-medium">
                    {t.route}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
