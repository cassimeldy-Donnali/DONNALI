import { ShieldCheck, Search, MessageCircle, Package, UserCheck, PlusCircle, BadgeCheck, MapPin, AlertOctagon, PhoneCall } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

const TRAVELER_STEPS = [
  {
    icon: PlusCircle,
    step: '01',
    title: 'Publiez votre trajet',
    description: 'Indiquez votre vol, la date de départ, le nombre de kilos disponibles et votre prix par kilo.',
  },
  {
    icon: UserCheck,
    step: '02',
    title: 'Vérifiez votre identité',
    description: "Soumettez une pièce d'identité officielle. Votre annonce est publiée automatiquement dès validation par notre équipe.",
  },
  {
    icon: PhoneCall,
    step: '03',
    title: 'Être contacté',
    description: "Si votre annonce correspond aux critères d'un expéditeur (destination, prix, date, kilos), il débloquera vos coordonnées et vous organiserez le transfert directement ensemble.",
  },
  {
    icon: Package,
    step: '04',
    title: 'Récupérez le colis',
    description: "Récupérez le colis avant votre départ dans un lieu public. Simple, rapide et en toute sécurité.",
  },
];

const SENDER_STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Cherchez un voyageur',
    description: 'Parcourez les annonces par trajet, date et kilos disponibles. Tous les voyageurs sont vérifiés par notre équipe.',
  },
  {
    icon: BadgeCheck,
    step: '02',
    title: 'Vérifiez les badges',
    description: "Privilégiez les annonces avec le badge Identité vérifiée. Cela signifie que notre équipe a contrôlé leur identité.",
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Débloquez le contact',
    description: "Pour seulement 2,99 EUR, accédez au numéro et à l'e-mail du voyageur. Coordonnez-vous directement.",
  },
  {
    icon: Package,
    step: '04',
    title: 'Remettez votre colis',
    description: "Rencontrez le voyageur dans un lieu public avant son départ. Rapide, simple, écologique et bien moins cher.",
  },
];

const SAFETY_TIPS = [
  {
    icon: BadgeCheck,
    color: 'eco',
    title: 'Privilégiez les profils vérifiés',
    description: "Cherchez toujours le badge Identité vérifiée sur les annonces — notre équipe a contrôlé la pièce d'identité du voyageur.",
  },
  {
    icon: MapPin,
    color: 'ocean',
    title: 'Lieu public uniquement',
    description: "Rencontrez le voyageur dans un endroit neutre et visible : hall d'aéroport, centre commercial, gare. Jamais à domicile.",
  },
  {
    icon: Package,
    color: 'eco',
    title: 'Documentez la remise',
    description: "Apportez une liste du contenu, faites-la signer par le voyageur. Photographiez le colis scellé avant de le confier.",
  },
  {
    icon: AlertOctagon,
    color: 'ocean',
    title: 'Contenu interdit',
    description: "Ne confiez jamais d'objets illégaux. Vous êtes légalement responsable du contenu de votre colis en toutes circonstances.",
  },
];

export function HowItWorks() {
  const { ref: headRef, inView: headIn } = useInView({ threshold: 0.2 });
  const { ref: leftRef, inView: leftIn } = useInView({ threshold: 0.15 });
  const { ref: rightRef, inView: rightIn } = useInView({ threshold: 0.15 });
  const { ref: bottomRef, inView: bottomIn } = useInView({ threshold: 0.1 });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          ref={headRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${headIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="inline-block px-3 py-1 bg-ocean-50 text-ocean-600 text-xs font-semibold rounded-full tracking-wide uppercase mb-3">
            Simple et sécurisé
          </span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Deux parcours simples — que vous soyez voyageur ou expéditeur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          <div
            ref={leftRef as React.RefObject<HTMLDivElement>}
            className={`bg-gradient-to-br from-ocean-50 to-ocean-100/50 rounded-3xl p-8 border border-ocean-100
              transition-all duration-700 ${leftIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-ocean-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-ocean-500 font-semibold uppercase tracking-wide">Vous voyagez ?</p>
                <h3 className="font-poppins font-bold text-lg text-gray-900">Je suis un voyageur</h3>
              </div>
            </div>

            <div className="space-y-5">
              {TRAVELER_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === TRAVELER_STEPS.length - 1;
                return (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 bg-ocean-500 rounded-2xl flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ocean-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {step.step}
                        </span>
                        {!isLast && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-ocean-200" />
                        )}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h4>
                        <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-ocean-200">
              <p className="text-xs text-ocean-600 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Publication gratuite — Identité vérifiée obligatoire avant mise en ligne
              </p>
            </div>
          </div>

          <div
            ref={rightRef as React.RefObject<HTMLDivElement>}
            className={`bg-gradient-to-br from-eco-50 to-eco-100/50 rounded-3xl p-8 border border-eco-100
              transition-all duration-700 ${rightIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-eco-500 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-eco-600 font-semibold uppercase tracking-wide">Vous envoyez un colis ?</p>
                <h3 className="font-poppins font-bold text-lg text-gray-900">Je suis un expéditeur</h3>
              </div>
            </div>

            <div className="space-y-5">
              {SENDER_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === SENDER_STEPS.length - 1;
                return (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 bg-eco-500 rounded-2xl flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-eco-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                          {step.step}
                        </span>
                        {!isLast && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-eco-200" />
                        )}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h4>
                        <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-eco-200">
              <p className="text-xs text-eco-700 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                2,99 EUR pour débloquer un contact — paiement sécurisé
              </p>
            </div>
          </div>
        </div>

        <div
          ref={bottomRef as React.RefObject<HTMLDivElement>}
          className={`bg-gray-900 rounded-3xl p-8 sm:p-10 transition-all duration-700 ${bottomIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-white text-xl">
                Conseils de sécurité pour les expéditeurs
              </h3>
              <p className="text-gray-400 text-sm mt-0.5">
                DONNALI met en relation des particuliers. Ces bonnes pratiques protègent votre envoi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 border border-white/10 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color === 'eco' ? 'bg-eco-500/20' : 'bg-ocean-400/20'}`}>
                  <Icon className={`w-5 h-5 ${color === 'eco' ? 'text-eco-400' : 'text-ocean-300'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              <span className="font-semibold text-red-200">Objets strictement interdits :</span>{' '}
              Stupéfiants, armes, explosifs, contrefaçons, espèces animales protégées, médicaments en grande quantité sans ordonnance, espèces monétaires non déclarées ou tout objet prohibé par la loi.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs">
            <MessageCircle className="w-3.5 h-3.5" />
            Un doute ? Signalez tout comportement suspect à{' '}
            <a href="mailto:contact@donnali.re" className="text-ocean-300 hover:text-ocean-200 underline transition-colors">
              contact@donnali.re
            </a>
            {' '}— notre équipe répond sous 24h.
          </div>
        </div>

      </div>
    </section>
  );
}
