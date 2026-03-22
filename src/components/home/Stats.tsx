import { Package, Plane, Leaf, Users } from 'lucide-react';

const STATS = [
  {
    icon: Package,
    value: '2 847',
    label: 'Colis livrés',
    sublabel: 'depuis le lancement',
    color: 'ocean',
  },
  {
    icon: Leaf,
    value: '4,2 t',
    label: 'CO₂ économisé',
    sublabel: 'équivalent 23 vols Paris-Réunion',
    color: 'eco',
  },
  {
    icon: Plane,
    value: '1 230',
    label: 'Voyageurs inscrits',
    sublabel: 'sur les 3 destinations',
    color: 'ocean',
  },
  {
    icon: Users,
    value: '98%',
    label: 'Satisfaction',
    sublabel: 'avis vérifiés',
    color: 'eco',
  },
];

export function Stats() {
  return (
    <section className="py-16 bg-gradient-to-br from-ocean-50 to-eco-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            DONNALI en chiffres
          </h2>
          <p className="text-gray-500">Notre impact sur les échanges entre îles et métropole</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            const isOcean = stat.color === 'ocean';
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 text-center group"
              >
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    isOcean ? 'bg-ocean-100' : 'bg-eco-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isOcean ? 'text-ocean-600' : 'text-eco-600'}`} />
                </div>
                <div className={`text-3xl font-poppins font-bold mb-1 ${isOcean ? 'text-ocean-700' : 'text-eco-700'}`}>
                  {stat.value}
                </div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{stat.label}</div>
                <div className="text-gray-400 text-xs">{stat.sublabel}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
