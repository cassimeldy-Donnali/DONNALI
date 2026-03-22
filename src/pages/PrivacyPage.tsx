import { Lock, Database, Eye, ChevronRight, Mail } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <p className="text-sm text-ocean-500 font-medium">Documents légaux</p>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Politique de Confidentialité</h1>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026 — Conforme au RGPD.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-ocean-50 border border-ocean-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-ocean-600 mt-0.5 shrink-0" />
            <p className="text-ocean-800 text-sm leading-relaxed">
              DONNALI s'engage à protéger vos données personnelles. Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme et ne les vendons jamais à des tiers.
            </p>
          </div>
        </div>

        <Section title="1. Responsable du traitement">
          <p>Le responsable du traitement des données est DONNALI SAS, joignable à l'adresse <a href="mailto:contact@donnali.re" className="text-ocean-600 hover:underline">contact@donnali.re</a>.</p>
        </Section>

        <Section title="2. Données collectées">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 mb-1">Données d'inscription</p>
              <p>Adresse email, nom complet, numéro de téléphone (optionnel lors de l'inscription, requis pour publier une annonce).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Données d'annonce</p>
              <p>Ville de départ, destination, date de vol, kilos disponibles, prix, description, coordonnées de contact (email et téléphone).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Données de vérification</p>
              <p>Pour la vérification d'identité : pièce d'identité et selfie traités par Stripe Identity (nous ne conservons pas ces documents). Pour la vérification de vol : captures d'écran ou photos de votre billet d'avion.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Données de paiement</p>
              <p>Les paiements sont traités par Stripe. DONNALI ne conserve aucune donnée bancaire. Nous enregistrons uniquement le montant payé et l'identifiant de la transaction.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Données de navigation</p>
              <p>Adresse IP, type de navigateur, pages consultées (à des fins statistiques et de sécurité uniquement).</p>
            </div>
          </div>
        </Section>

        <Section title="3. Finalités du traitement">
          <ul className="space-y-1.5 list-disc list-inside text-gray-600">
            <li>Gestion de votre compte et authentification</li>
            <li>Publication et affichage des annonces</li>
            <li>Mise en relation entre voyageurs et expéditeurs</li>
            <li>Traitement des paiements</li>
            <li>Vérification d'identité et de vol (sur demande volontaire)</li>
            <li>Prévention de la fraude et sécurité de la plateforme</li>
            <li>Respect des obligations légales</li>
          </ul>
        </Section>

        <Section title="4. Base légale du traitement">
          <ul className="space-y-1.5 list-disc list-inside text-gray-600">
            <li><strong>Exécution du contrat</strong> : traitement nécessaire à l'utilisation du service</li>
            <li><strong>Consentement</strong> : vérification d'identité (volontaire)</li>
            <li><strong>Obligation légale</strong> : conservation de certaines données (facturation, etc.)</li>
            <li><strong>Intérêt légitime</strong> : sécurité de la plateforme, prévention des abus</li>
          </ul>
        </Section>

        <Section title="5. Durée de conservation">
          <ul className="space-y-1.5 list-disc list-inside text-gray-600">
            <li>Données de compte : durée de vie du compte + 3 ans après suppression</li>
            <li>Données d'annonces : 1 an après expiration de l'annonce</li>
            <li>Données de paiement : 5 ans (obligation légale comptable)</li>
            <li>Données de navigation : 13 mois maximum</li>
          </ul>
        </Section>

        <Section title="6. Partage des données">
          <p>Vos données ne sont partagées qu'avec :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li><strong>Stripe</strong> : traitement des paiements et vérification d'identité</li>
            <li><strong>Supabase</strong> : hébergement sécurisé des données</li>
            <li><strong>Les autres utilisateurs</strong> : uniquement après paiement de mise en relation (email et téléphone du voyageur)</li>
            <li><strong>Les autorités</strong> : en cas d'obligation légale ou de réquisition judiciaire</li>
          </ul>
          <p className="mt-3 font-semibold text-gray-800">Nous ne vendons jamais vos données à des tiers à des fins commerciales.</p>
        </Section>

        <Section title="7. Vos droits (RGPD)">
          <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte et données</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format exploitable</li>
            <li><strong>Droit d'opposition</strong> : s'opposer à certains traitements</li>
            <li><strong>Droit à la limitation</strong> : restreindre le traitement de vos données</li>
          </ul>
          <p className="mt-3">Pour exercer ces droits, contactez-nous à <a href="mailto:contact@donnali.re" className="text-ocean-600 hover:underline">contact@donnali.re</a>. Nous répondrons dans un délai d'un mois. Vous pouvez également adresser une réclamation à la CNIL.</p>
        </Section>

        <Section title="8. Sécurité des données">
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement en transit (HTTPS), contrôle d'accès par Row Level Security (RLS), authentification sécurisée.</p>
        </Section>

        <Section title="9. Cookies">
          <p>DONNALI utilise uniquement des cookies techniques nécessaires au fonctionnement de la plateforme (session d'authentification). Aucun cookie de tracking publicitaire n'est utilisé.</p>
        </Section>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Contact pour vos droits</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Pour exercer vos droits ou poser des questions sur la protection de vos données :</p>
          <a
            href="mailto:contact@donnali.re"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Mail className="w-4 h-4" />
            contact@donnali.re
          </a>
        </div>

        <div className="bg-ocean-50 rounded-2xl p-6 border border-ocean-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-ocean-600" />
            Documents connexes
          </h3>
          <div className="space-y-2">
            {[
              { id: 'legal', label: 'Mentions légales' },
              { id: 'cgu', label: 'Conditions Générales d\'Utilisation' },
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
