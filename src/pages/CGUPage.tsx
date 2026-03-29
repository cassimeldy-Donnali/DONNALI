import { FileText, Shield, AlertTriangle, ChevronRight, Ban, Phone } from 'lucide-react';

interface CGUPageProps {
  onNavigate: (page: string) => void;
}

export function CGUPage({ onNavigate }: CGUPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <p className="text-sm text-ocean-500 font-medium">Documents légaux</p>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026 — En utilisant DONNALI, vous acceptez ces conditions.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm mb-1">Interdictions absolues & désolidarisation</p>
              <p className="text-red-800 text-sm leading-relaxed">
                Il est strictement interdit d'utiliser DONNALI pour transporter des substances illicites, des marchandises prohibées, des contrefaçons, des espèces protégées, des armes ou tout article dont le transport est réglementé ou interdit par la loi. <strong>DONNALI se désolidarise formellement et sans réserve de tout acte frauduleux commis par ses utilisateurs.</strong> Les contrevenants s'exposent à des poursuites pénales et seront immédiatement exclus de la plateforme.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm mb-2">Interdiction absolue de partager ses coordonnées — Suspension définitive</p>
              <p className="text-amber-800 text-sm leading-relaxed mb-3">
                Il est <strong>formellement et strictement interdit</strong> de communiquer, sous quelque forme que ce soit, des informations de contact personnelles dans le contenu d'une annonce publiée sur DONNALI. Cette interdiction inclut, sans s'y limiter :
              </p>
              <ul className="text-amber-800 text-sm space-y-1.5 list-disc list-inside mb-3">
                <li>Tout numéro de téléphone, qu'il soit écrit en chiffres, en lettres, avec des séparateurs, des espaces, des tirets, des points, des parenthèses ou toute autre mise en forme destinée à tromper le système de modération</li>
                <li>Toute adresse email ou lien de messagerie électronique</li>
                <li>Tout nom d'utilisateur ou identifiant sur une application de messagerie (WhatsApp, Telegram, Signal, Messenger, Viber, etc.)</li>
                <li>Tout lien URL ou réseau social permettant un contact direct hors plateforme</li>
                <li>Toute information permettant de vous identifier et d'être contacté en dehors du système DONNALI</li>
              </ul>
              <p className="text-amber-900 text-sm font-semibold leading-relaxed">
                Toute tentative de contournement du système de mise en relation payant de DONNALI, y compris en dissimulant ses coordonnées de manière créative, constitue une violation grave et délibérée des présentes CGU. Elle entraînera la <span className="underline">suspension immédiate et définitive du compte</span>, sans préavis ni remboursement. DONNALI se réserve le droit d'engager des poursuites pour concurrence déloyale et détournement de service.
              </p>
            </div>
          </div>
        </div>

        <Section title="1. Objet">
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme DONNALI, service de mise en relation entre voyageurs aériens et personnes souhaitant faire transporter des colis dans l'espace Réunion – Mayotte – Paris.</p>
        </Section>

        <Section title="2. Acceptation des conditions">
          <p>L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser DONNALI. Ces CGU peuvent être modifiées à tout moment ; les utilisateurs seront informés des changements substantiels.</p>
        </Section>

        <Section title="3. Description du service">
          <p>DONNALI permet :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Aux <strong>voyageurs</strong> de publier des annonces proposant leurs kilos de bagages disponibles</li>
            <li>Aux <strong>expéditeurs</strong> de contacter ces voyageurs moyennant un paiement de mise en relation</li>
          </ul>
          <p className="mt-3">DONNALI est exclusivement un intermédiaire de mise en relation. La plateforme n'est pas partie au contrat entre voyageur et expéditeur et n'assume aucune responsabilité quant à l'exécution de leurs engagements mutuels.</p>
        </Section>

        <Section title="4. Inscription et compte utilisateur">
          <p>L'inscription est gratuite et nécessite une adresse email valide. L'utilisateur s'engage à :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Fournir des informations exactes et à jour</li>
            <li>Maintenir la confidentialité de ses identifiants</li>
            <li>Ne pas créer plusieurs comptes</li>
            <li>Ne pas usurper l'identité d'une autre personne</li>
            <li>Informer immédiatement DONNALI de tout accès non autorisé à son compte</li>
          </ul>
        </Section>

        <Section title="5. Règles de publication d'annonces">
          <p>Les voyageurs s'engagent à :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Publier uniquement des annonces pour des vols réellement prévus</li>
            <li>Indiquer des informations exactes (kilos disponibles, dates, prix)</li>
            <li>Mettre à jour ou supprimer leur annonce en cas de changement</li>
            <li>Ne pas accepter de transporter des objets dont ils ignorent le contenu</li>
            <li>Respecter les réglementations douanières et aéroportuaires en vigueur</li>
            <li><strong>Ne jamais inclure de coordonnées personnelles dans le texte d'une annonce</strong> (voir interdiction absolue ci-dessus)</li>
          </ul>
        </Section>

        <Section title="6. Objets interdits au transport">
          <p>Il est formellement interdit de transporter via la plateforme :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Drogues, stupéfiants et substances psychoactives illicites</li>
            <li>Armes, munitions et explosifs</li>
            <li>Contrefaçons et articles de contrebande</li>
            <li>Espèces animales ou végétales protégées</li>
            <li>Médicaments soumis à prescription non déclarés</li>
            <li>Devises en quantités dépassant les plafonds réglementaires</li>
            <li>Tout article dont l'importation ou l'exportation est réglementée ou interdite</li>
          </ul>
          <p className="mt-3 font-semibold text-gray-800">Le non-respect de cette règle constitue une infraction pénale grave. DONNALI coopérera avec toute autorité judiciaire dans ce cadre.</p>
        </Section>

        <Section title="7. Paiement et tarifs">
          <p>L'accès aux coordonnées d'un voyageur est payant (2,99€ par déblocage). Ce paiement couvre uniquement la mise en relation et ne constitue pas une garantie de service de la part du voyageur.</p>
          <p className="mt-2">Les paiements sont sécurisés par Stripe. DONNALI ne stocke aucune donnée bancaire.</p>
          <p className="mt-2">Les déblocages effectués ne sont pas remboursables, sauf en cas de dysfonctionnement technique avéré de la plateforme.</p>
        </Section>

        <Section title="8. Comportement interdit et sanctions">
          <p>Il est interdit :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>De harceler, menacer ou insulter d'autres utilisateurs</li>
            <li>De publier de fausses annonces ou des informations trompeuses</li>
            <li>D'utiliser la plateforme à des fins commerciales non autorisées</li>
            <li>De tenter de contourner le système de paiement de quelque manière que ce soit</li>
            <li>De partager des coordonnées personnelles dans une annonce, sous quelque forme ou dissimulation que ce soit</li>
            <li>De collecter des données personnelles d'autres utilisateurs</li>
            <li>D'utiliser des robots, scripts ou tout outil automatisé</li>
          </ul>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Sanctions applicables
            </p>
            <ul className="text-red-800 text-sm space-y-1 list-disc list-inside">
              <li>Avertissement formel pour une première infraction mineure</li>
              <li>Suspension temporaire du compte (7 à 30 jours) pour récidive ou infraction grave</li>
              <li><strong>Suspension définitive et irréversible du compte</strong> pour toute tentative de contournement du système de mise en relation (partage de coordonnées, quelle que soit la forme utilisée)</li>
              <li>Signalement aux autorités compétentes en cas d'infraction pénale</li>
            </ul>
          </div>
        </Section>

        <Section title="9. Modération automatique et humaine">
          <p>DONNALI met en place un système de modération automatisé analysant le contenu de chaque annonce avant publication. Ce système détecte notamment :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Les numéros de téléphone, quelle que soit leur forme (chiffres, lettres, séparateurs inhabituels, écriture en toutes lettres, substitutions visuelles comme "O" pour "0", etc.)</li>
            <li>Les adresses email et liens vers des services de messagerie</li>
            <li>Les termes offensants, discriminatoires ou illicites</li>
          </ul>
          <p className="mt-3">En complément, une équipe d'administration humaine surveille les annonces publiées et peut supprimer immédiatement tout contenu suspect. Tout utilisateur peut signaler une annonce via <a href="mailto:contact@donnali.re" className="text-ocean-600 hover:underline">contact@donnali.re</a>.</p>
          <p className="mt-3 font-semibold text-gray-800">DONNALI se réserve le droit de suspendre ou supprimer tout compte sans préavis en cas de violation des présentes CGU.</p>
        </Section>

        <Section title="10. Limitation de responsabilité">
          <p>DONNALI ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme, notamment :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Perte ou détérioration d'un colis</li>
            <li>Manquement d'un voyageur à ses engagements</li>
            <li>Retard ou annulation de vol</li>
            <li>Tout préjudice résultant d'une fraude commise par un utilisateur</li>
          </ul>
        </Section>

        <Section title="11. Droit applicable et juridiction">
          <p>Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents du ressort de La Réunion, sous réserve de dispositions contraires impératives.</p>
        </Section>

        <div className="bg-ocean-50 rounded-2xl p-6 border border-ocean-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-ocean-600" />
            Documents connexes
          </h3>
          <div className="space-y-2">
            {[
              { id: 'legal', label: 'Mentions légales' },
              { id: 'privacy', label: 'Politique de Confidentialité' },
              { id: 'contact', label: 'Nous contacter' },
            ].map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate(doc.id)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:bg-ocean-50 transition-colors text-sm font-medium text-gray-700 hover:text-ocean-600 border border-gray-100"
              >
                {doc.label}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="font-poppins font-semibold text-gray-900 text-lg mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
