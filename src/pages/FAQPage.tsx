import { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Plane, User, Lock, CheckCircle, AlertTriangle, Package, Star } from 'lucide-react';

const FAQS = [
  {
    category: 'Général',
    questions: [
      {
        q: "Comment fonctionne DONNALI ?",
        a: "DONNALI met en relation des voyageurs aériens ayant des kilos de bagages disponibles avec des expéditeurs souhaitant envoyer des colis. Vous trouvez un voyageur sur votre trajet, payez 2,99 EUR pour débloquer ses coordonnées, puis organisez directement la remise de votre colis.",
      },
      {
        q: "Sur quelles routes opère DONNALI ?",
        a: "DONNALI opère actuellement sur 3 routes : La Réunion ↔ Paris, La Réunion ↔ Mayotte et Mayotte ↔ Paris. Dans les deux sens pour chaque trajet.",
      },
      {
        q: "Est-ce légal de transporter des colis pour quelqu'un ?",
        a: "Oui, à condition de respecter les règles douanières et les conditions de votre compagnie aérienne. Il ne s'agit pas d'activité commerciale, mais d'entraide. Assurez-vous que le contenu est légal et déclarable si nécessaire. Le voyageur est responsable du contenu de ses bagages.",
      },
    ],
  },
  {
    category: 'Confiance & Sécurité',
    questions: [
      {
        q: "Comment DONNALI vérifie-t-il l'identité des voyageurs ?",
        a: "Chaque voyageur doit obligatoirement passer une vérification d'identité avant que son annonce soit publiée. Cela implique la prise en photo d'une pièce d'identité officielle et un selfie pour confirmer la correspondance. Aucune annonce n'est visible sans identité vérifiée. C'est le même niveau de sécurité utilisé par les banques et fintechs.",
      },
      {
        q: "Comment DONNALI vérifie-t-il que le voyageur a vraiment un billet d'avion ?",
        a: "Chaque voyageur soumet son numéro de vol et sa date de départ. Notre équipe vérifie manuellement les informations sous 24h. Un badge « Vol confirmé » est alors affiché sur l'annonce. Cette étape est requise en complément de la vérification d'identité.",
      },
      {
        q: "Que signifient les badges de vérification ?",
        a: "Les annonces affichent deux badges : « Vol confirmé » (numéro de vol vérifié par notre équipe) et « Identité vérifiée » (pièce d'identité contrôlée). Ces badges garantissent que DONNALI a effectué des vérifications sérieuses sur le voyageur.",
      },
      {
        q: "Comment puis-je vérifier que je peux faire confiance au voyageur ?",
        a: "Recherchez le badge « Identité vérifiée » sur les annonces — il signifie que notre équipe a contrôlé la pièce d'identité du voyageur. Consultez aussi son score de confiance. En cas de doute, rencontrez toujours le voyageur dans un lieu public avant la remise.",
      },
      {
        q: "Que se passe-t-il si un voyageur ment sur son vol ou son identité ?",
        a: "Notre système de vérification croise les informations avec des bases de données officielles. En cas de fraude avérée (fausse identité, faux billet), le compte est suspendu immédiatement. Vous pouvez signaler tout comportement suspect via contact@donnali.re.",
      },
      {
        q: "Comment sont protégées mes coordonnées personnelles ?",
        a: "Votre numéro de téléphone et votre e-mail sont chiffrés dans notre base de données et ne sont jamais accessibles publiquement. Ils ne sont révélés qu'après un paiement de 2,99 EUR, traçable et enregistré. Nous ne revendons jamais vos données à des tiers.",
      },
      {
        q: "Puis-je signaler un voyageur ou un expéditeur suspect ?",
        a: "Oui, contactez-nous à tout moment via contact@donnali.re. Tout signalement est traité sous 24h. En cas de fraude confirmée, le compte est banni.",
      },
    ],
  },
  {
    category: 'Précautions expéditeurs',
    questions: [
      {
        q: "Quelles précautions prendre avant de confier mon colis ?",
        a: "Avant toute remise : (1) Vérifiez que l'annonce porte le badge Identité vérifiée. (2) Rencontrez toujours le voyageur dans un lieu public (aéroport, gare, centre commercial). (3) Apportez une liste du contenu signée des deux parties. (4) Photographiez le colis scellé avant la remise. (5) Ne confiez jamais d'objets de valeur sans précautions supplémentaires.",
      },
      {
        q: "Que faire si le voyageur me semble suspect ?",
        a: "Ne remettez pas votre colis si vous avez le moindre doute. Votre sécurité prime sur tout. Signalez le profil à contact@donnali.re avec une description du problème. Cherchez un autre voyageur sur le même trajet.",
      },
      {
        q: "Est-ce que mon colis est assuré ?",
        a: "À ce jour, DONNALI ne propose pas d'assurance propre sur les colis. Nous recommandons : (1) N'envoyer que des objets dont la perte serait supportable. (2) Emballer soigneusement votre colis. (3) Vérifier si votre assurance habitation couvre les colis confiés à des tiers. Nous travaillons à des partenariats avec des assureurs pour une couverture optionnelle dans une prochaine version.",
      },
      {
        q: "Dois-je déclarer mon colis en douane ?",
        a: "Oui, si le contenu dépasse les seuils de franchise douanière (175 EUR pour les DOM-TOM), une déclaration peut être nécessaire. Renseignez-vous auprès des services des douanes si besoin. Le voyageur n'est pas votre mandataire douanier.",
      },
      {
        q: "Que faire si mon colis est perdu ou endommagé ?",
        a: "Contactez en premier lieu le voyageur directement. Si aucun accord n'est trouvé, contactez notre support à contact@donnali.re avec les preuves disponibles (photos, messages). DONNALI facilite la résolution du litige mais ne peut pas garantir de remboursement sans accord entre les parties.",
      },
    ],
  },
  {
    category: 'Paiement',
    questions: [
      {
        q: "Combien coûte l'accès aux coordonnées d'un voyageur ?",
        a: "L'accès aux coordonnées complètes (téléphone + e-mail) d'un voyageur coûte 2,99 EUR. C'est un paiement unique par contact, sans abonnement.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, CB) via notre partenaire de paiement sécurisé.",
      },
      {
        q: "Puis-je être remboursé si le voyage est annulé ?",
        a: "Le remboursement est étudié au cas par cas. Si le voyageur annule son voyage après que vous avez payé pour ses coordonnées, contactez notre support via contact@donnali.re.",
      },
    ],
  },
  {
    category: 'Pour les voyageurs',
    questions: [
      {
        q: "Comment publier une annonce ?",
        a: "Créez un compte gratuit, puis cliquez sur « Publier une annonce ». Suivez les 3 étapes : (1) Soumettez vos infos de vol pour vérification par l'équipe DONNALI. (2) Renseignez les détails de votre annonce. (3) Vérifiez votre identité. Votre annonce est publiée automatiquement dès validation.",
      },
      {
        q: "Mes coordonnées sont-elles protégées ?",
        a: "Oui, votre numéro de téléphone et votre e-mail sont masqués dans les annonces. Ils ne sont révélés qu'après un paiement de 2,99 EUR par l'expéditeur.",
      },
      {
        q: "Combien puis-je facturer par kilo ?",
        a: "C'est vous qui fixez votre prix, de 0 EUR (gratuit) à ce que vous souhaitez. Le marché tend entre 3 EUR et 8 EUR/kg selon les trajets.",
      },
      {
        q: "Pourquoi dois-je vérifier mon identité pour publier ?",
        a: "La vérification d'identité obligatoire est notre engagement envers la sécurité des expéditeurs. Elle garantit que chaque annonceur est une vraie personne avec une vraie pièce d'identité. La vérification est rapide (2-3 minutes), sécurisée et confidentielle.",
      },
    ],
  },
  {
    category: 'Pour les expéditeurs',
    questions: [
      {
        q: "Que puis-je envoyer ?",
        a: "Tout ce qui est légal et autorisé en soute aérienne : vêtements, nourriture non périssable, médicaments, documents, petits appareils électroniques. Il est strictement interdit d'envoyer : stupéfiants, armes, explosifs, contrefaçons, espèces animales protégées, ou tout objet prohibé par la loi.",
      },
      {
        q: "Comment se passe la remise du colis ?",
        a: "Après avoir débloqué le contact, coordonnez-vous directement avec le voyageur. Rencontrez-vous dans un lieu public avant son départ. Apportez une liste du contenu signée et photographiez le colis scellé.",
      },
      {
        q: "Que faire si le voyageur ne répond pas ?",
        a: "Vous conservez l'accès à ses coordonnées dans votre tableau de bord. Si votre colis est urgent, cherchez un autre voyageur sur le même trajet. Signalez le problème à contact@donnali.re.",
      },
    ],
  },
];

const TRUST_PILLARS = [
  {
    icon: User,
    title: "Identité vérifiée",
    description: "Chaque voyageur passe obligatoirement une vérification pièce d'identité + selfie avant publication.",
    color: "ocean",
  },
  {
    icon: Plane,
    title: "Vol vérifié par l'équipe",
    description: "Le numéro de vol est vérifié manuellement par notre équipe sous 24h. Badge « Vol confirmé » affiché.",
    color: "eco",
  },
  {
    icon: Lock,
    title: "Données chiffrées",
    description: "Coordonnées chiffrées et protégées. Jamais revendues, accessibles uniquement après paiement traçable.",
    color: "ocean",
  },
  {
    icon: Star,
    title: "Score de confiance",
    description: "Chaque profil affiche un score de confiance basé sur les vérifications effectuées.",
    color: "eco",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-ocean-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

export function FAQPage({ onNavigate }: FAQPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex w-14 h-14 bg-ocean-100 rounded-2xl items-center justify-center mb-4">
            <HelpCircle className="w-7 h-7 text-ocean-600" />
          </div>
          <h1 className="font-poppins text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Questions fréquentes
          </h1>
          <p className="text-gray-500">
            Tout ce que vous devez savoir sur DONNALI — sécurité, précautions et fonctionnement
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              Notre engagement securite
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-white mb-3">
              La sécurité au cœur de chaque échange
            </h2>
            <p className="text-ocean-100 max-w-xl mx-auto">
              DONNALI est la seule plateforme de la région qui impose une vérification d'identité obligatoire pour chaque voyageur. Aucune annonce n'est visible sans identité vérifiée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2">{pillar.title}</h3>
                  <p className="text-ocean-100 text-xs leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-eco-300" />
              Le parcours de publication d'un voyageur
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: "Soumission du vol", desc: "Numéro de vol + date — vérifié manuellement par l'équipe DONNALI sous 24h" },
                { step: '2', title: "Détails de l'annonce", desc: "Kilos disponibles, prix, coordonnées masquées" },
                { step: '3', title: "Vérification d'identité", desc: "Photo pièce d'identité + selfie — annonce publiée automatiquement dès validation" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-white/20 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-ocean-100 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Conseils importants pour les expéditeurs</h3>
              <p className="text-amber-700 text-sm">
                DONNALI met en relation des particuliers. Ces précautions sont essentielles pour votre sécurité.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { icon: ShieldCheck, title: "Badge Identité vérifiée", desc: "Privilégiez toujours les annonces avec ce badge. La pièce d'identité a été contrôlée." },
              { icon: Package, title: "Lieu public uniquement", desc: "Rencontrez le voyageur en lieu public (aéroport, centre commercial). Jamais à domicile." },
              { icon: CheckCircle, title: "Liste de contenu signée", desc: "Apportez une liste du contenu, faites-la signer par le voyageur et photographiez le colis scellé." },
              { icon: AlertTriangle, title: "En cas de problème", desc: "Signalez tout incident à contact@donnali.re. Notre équipe répond sous 24h." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                <Icon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-xs mb-0.5">{title}</p>
                  <p className="text-amber-700 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs text-red-800 font-semibold mb-1.5">Objets strictement interdits (responsabilité pénale) :</p>
            <p className="text-xs text-red-700 leading-relaxed">
              Stupéfiants et drogues — Armes et munitions — Explosifs — Contrefaçons — Espèces animales protégées — Médicaments en grande quantité sans ordonnance — Espèces monétaires non déclarées — Tout objet prohibé par la loi.
            </p>
          </div>
        </div>

        <div className="bg-ocean-50 border border-ocean-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-ocean-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-ocean-900 mb-2">Assurance des colis — État actuel et perspectives</h3>
              <p className="text-ocean-700 text-sm leading-relaxed mb-4">
                À ce jour, DONNALI ne propose pas d'assurance propre sur les colis transportés. Les échanges sont basés sur la confiance entre particuliers, renforcée par nos vérifications d'identité obligatoires.
              </p>
              <div className="bg-white rounded-xl p-4 border border-ocean-100 mb-3">
                <p className="text-xs text-ocean-700 font-semibold mb-2">Nos recommandations en attendant :</p>
                <ul className="space-y-1.5">
                  {[
                    "Ne jamais envoyer d'objets irremplaçables ou de valeur élevée sans précautions supplémentaires",
                    "Vérifier si votre assurance habitation couvre les colis confiés à des tiers",
                    "Conserver une liste du contenu et des photos du colis scellé avant remise",
                    "Privilégier les voyageurs avec le badge Identité vérifiée et un score de confiance élevé",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ocean-700">
                      <CheckCircle className="w-3.5 h-3.5 text-ocean-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-ocean-500 italic">
                Nous travaillons à nouer des partenariats avec des assureurs pour offrir une couverture optionnelle dans une prochaine version de DONNALI.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-10">
        {FAQS.map((section) => (
          <div key={section.category}>
            <h2 className="font-poppins font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-ocean-500 rounded-full" />
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-ocean-50 to-eco-50 rounded-2xl p-8 text-center border border-ocean-100">
          <h3 className="font-semibold text-gray-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-500 text-sm mb-5">
            Notre équipe répond dans les 24h ouvrables.
          </p>
          <a
            href="mailto:contact@donnali.re"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
