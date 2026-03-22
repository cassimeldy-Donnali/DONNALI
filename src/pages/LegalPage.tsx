import { Shield, FileText, Lock, ChevronRight } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export function LegalPage({ onNavigate }: LegalPageProps) {
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
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Mentions légales</h1>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm mb-1">Clause de non-responsabilité pour fraude</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                DONNALI est une plateforme de mise en relation. Nous nous désolidarisons formellement de tout acte frauduleux, transport illicite ou contenu interdit qui pourrait être convenu entre les utilisateurs. Chaque utilisateur est personnellement et uniquement responsable de ses actions et du contenu des colis transportés. Tout manquement aux lois en vigueur engage la seule responsabilité de la personne concernée.
              </p>
            </div>
          </div>
        </div>

        <Section title="1. Éditeur du site">
          <p>Le site DONNALI est édité par la société DONNALI SAS, dont le siège social est situé à La Réunion (97400), immatriculée au Registre du Commerce et des Sociétés sous le numéro en cours d'enregistrement.</p>
          <p className="mt-2">Email de contact : <a href="mailto:contact@donnali.re" className="text-ocean-600 hover:underline">contact@donnali.re</a></p>
        </Section>

        <Section title="2. Hébergement">
          <p>Le site est hébergé par Supabase Inc., 970 Toa Payoh North, Singapour, ainsi que par les infrastructures cloud de Vercel Inc., San Francisco, Californie, États-Unis.</p>
        </Section>

        <Section title="3. Nature de la plateforme">
          <p>DONNALI est une plateforme de mise en relation entre particuliers. Elle permet aux voyageurs de proposer leurs kilos de bagages disponibles et aux expéditeurs de les contacter pour transporter des colis.</p>
          <p className="mt-2 font-semibold text-gray-800">DONNALI n'est pas transporteur, n'intervient pas dans les transactions entre utilisateurs et ne garantit pas la réalisation des trajets annoncés.</p>
        </Section>

        <Section title="4. Responsabilité">
          <p>DONNALI ne peut être tenu responsable :</p>
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-gray-600">
            <li>Du contenu des annonces publiées par les utilisateurs</li>
            <li>De la nature des colis transportés</li>
            <li>Des éventuels dommages, pertes ou préjudices liés à une transaction entre utilisateurs</li>
            <li>De tout acte illicite commis par un utilisateur de la plateforme</li>
            <li>Des retards, annulations ou modifications de vol</li>
          </ul>
          <p className="mt-3 font-semibold text-gray-800">Chaque utilisateur reconnaît être seul responsable du respect des lois et règlements applicables, notamment ceux relatifs au transport aérien et au contenu des bagages.</p>
        </Section>

        <Section title="5. Propriété intellectuelle">
          <p>L'ensemble du contenu de ce site (logo, textes, design, code) est protégé par le droit d'auteur et appartient à DONNALI SAS. Toute reproduction, même partielle, sans autorisation écrite est interdite.</p>
        </Section>

        <Section title="6. Droit applicable">
          <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        </Section>

        <div className="bg-ocean-50 rounded-2xl p-6 border border-ocean-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-ocean-600" />
            Documents connexes
          </h3>
          <div className="space-y-2">
            {[
              { id: 'cgu', label: 'Conditions Générales d\'Utilisation' },
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
