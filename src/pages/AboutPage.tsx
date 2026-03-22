import { Leaf, Plane, Heart, Globe, Shield, Users, ShieldCheck, UserCheck, Lock, Star } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const values = [
    {
      icon: Leaf,
      title: 'Écologie',
      description: 'Chaque kilo partagé réduit l\'empreinte carbone des livraisons. Nous optimisons les capacités déjà allouées aux vols.',
      color: 'eco',
    },
    {
      icon: Heart,
      title: 'Solidarité',
      description: 'Relier les communautés réunionnaise, mahoraise et de la diaspora en France métropolitaine.',
      color: 'ocean',
    },
    {
      icon: Shield,
      title: 'Confiance',
      description: 'Système de vérification d\'identité, avis vérifiés et paiements sécurisés pour des échanges sûrs.',
      color: 'eco',
    },
    {
      icon: Globe,
      title: 'Accessibilité',
      description: 'Des tarifs bien en dessous des envois postaux classiques, accessibles à tous.',
      color: 'ocean',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <section className="relative bg-gradient-to-br from-ocean-800 to-ocean-600 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 right-16 opacity-10">
            <Plane className="w-40 h-40 text-white -rotate-45" />
          </div>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-eco-500/20 border border-eco-400/30 rounded-full mb-5">
            <Leaf className="w-3.5 h-3.5 text-eco-400 fill-eco-400" />
            <span className="text-eco-300 text-xs font-semibold uppercase tracking-wide">Notre mission</span>
          </div>
          <h1 className="font-poppins text-4xl sm:text-5xl font-bold text-white mb-6">
            Connecter les îles et la métropole, autrement
          </h1>
          <p className="text-ocean-200 text-lg leading-relaxed">
            DONNALI est née d'un constat simple : chaque jour, des tonnes de capacité de soute partent vides entre La Réunion, Mayotte et Paris, pendant que des familles paient des fortunes pour envoyer des colis.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-6">
                L'histoire de DONNALI
              </h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  Tout a commencé avec une frustration partagée par des milliers de Réunionnais et Mahorais : envoyer un simple colis à sa famille coûte cher, prend du temps et génère beaucoup de carbone.
                </p>
                <p>
                  En même temps, les voyageurs rentrant chez eux ont souvent des kilos de bagages inutilisés. Une ressource précieuse qui part à vide sur chaque vol.
                </p>
                <p>
                  DONNALI signifie "donne-lui" en créole réunionnais. C'est cette générosité naturelle, ce geste simple de donner à l'autre, qui est au cœur de notre plateforme — mettre en relation voyageurs et expéditeurs de manière simple, rapide et sécurisée.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-ocean-50 to-eco-50 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Fondée en', value: '2025' },
                  { label: 'Routes', value: '3' },
                  { label: 'Colis livrés', value: '2 847' },
                  { label: 'CO₂ évité', value: '4,2t' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-2xl p-5 text-center shadow-sm">
                    <div className="font-poppins text-2xl font-bold text-ocean-700">{item.value}</div>
                    <div className="text-gray-500 text-xs mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-3">Nos valeurs</h2>
            <p className="text-gray-500">Ce qui guide chacune de nos décisions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              const isOcean = v.color === 'ocean';
              return (
                <div key={v.title} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${isOcean ? 'bg-ocean-100' : 'bg-eco-100'}`}>
                    <Icon className={`w-6 h-6 ${isOcean ? 'text-ocean-600' : 'text-eco-600'}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ocean-100 text-ocean-700 text-xs font-semibold rounded-full uppercase tracking-wide mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sécurité & Confiance
            </span>
            <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-3">
              Pourquoi DONNALI est différent
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Nous sommes la seule plateforme de la région à imposer une vérification d'identité obligatoire pour chaque voyageur avant publication. Aucune annonce sans identité vérifiée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              {
                icon: UserCheck,
                title: "Identité vérifiée",
                desc: "Chaque voyageur passe une vérification pièce d'identité + selfie avant publication.",
                color: "ocean",
              },
              {
                icon: Plane,
                title: "Vol vérifié par l'équipe",
                desc: "Le numéro de vol est soumis à l'équipe DONNALI qui vérifie manuellement sous 24h.",
                color: "eco",
              },
              {
                icon: Lock,
                title: "Données protégées",
                desc: "Coordonnées masquées et chiffrées. Accessibles uniquement après paiement traçable de 2,99 EUR.",
                color: "ocean",
              },
              {
                icon: Star,
                title: "Score de confiance",
                desc: "Chaque profil affiche un score basé sur les vérifications effectuées pour des échanges plus sûrs.",
                color: "eco",
              },
            ].map((item) => {
              const Icon = item.icon;
              const isOcean = item.color === 'ocean';
              return (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${isOcean ? 'bg-ocean-100' : 'bg-eco-100'}`}>
                    <Icon className={`w-6 h-6 ${isOcean ? 'text-ocean-600' : 'text-eco-600'}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-ocean-50 to-eco-50 rounded-2xl p-6 border border-ocean-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notre comparaison avec d'autres plateformes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-gray-600">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 font-semibold text-gray-700">Fonctionnalité</th>
                        <th className="py-2 px-3 font-semibold text-ocean-700">DONNALI</th>
                        <th className="py-2 px-3 font-semibold text-gray-500">Autres plateformes</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {[
                        ["Vérification d'identité obligatoire", true, false],
                        ["Vérification du vol", true, "Partiel"],
                        ["Coordonnées masquées", true, "Partiel"],
                        ["Signalement & modération", true, true],
                        ["Routes DOM-TOM spécialisées", true, false],
                      ].map(([feature, donnali, others], i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2 pr-4">{feature}</td>
                          <td className="py-2 px-3 text-center">
                            {donnali === true ? <span className="text-eco-600 font-bold">Oui</span> : donnali}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {others === false ? <span className="text-red-400">Non</span> : others === true ? <span className="text-eco-600">Oui</span> : <span className="text-amber-500">{others}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-ocean-600 to-ocean-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-12 h-12 text-ocean-300 mx-auto mb-5" />
          <h2 className="font-poppins text-3xl font-bold text-white mb-4">
            Rejoignez la communauté
          </h2>
          <p className="text-ocean-200 text-sm mb-8 max-w-lg mx-auto">
            Que vous soyez voyageur avec des kilos à partager ou expéditeur cherchant une solution rapide et sécurisée, DONNALI est fait pour vous.
          </p>
          <button
            onClick={() => onNavigate('listings')}
            className="px-8 py-4 bg-white text-ocean-700 font-bold rounded-2xl hover:bg-ocean-50 transition-colors shadow-lg text-sm"
          >
            Découvrir les annonces
          </button>
        </div>
      </section>
    </div>
  );
}
