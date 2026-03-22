import { Mail, Phone, Clock, MapPin, MessageSquare, Shield, ChevronRight } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <p className="text-sm text-ocean-500 font-medium">Support & Contact</p>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Nous contacter</h1>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Une question, un problème, un signalement ? Nous sommes là.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a
            href="mailto:contact@donnali.re"
            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-ocean-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ocean-200 transition-colors">
              <Mail className="w-6 h-6 text-ocean-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-ocean-600 font-medium text-sm mb-2">contact@donnali.re</p>
            <p className="text-gray-500 text-xs">Réponse sous 24-48h en jours ouvrés</p>
          </a>

          <a
            href="tel:+262262000000"
            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-ocean-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-eco-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-eco-200 transition-colors">
              <Phone className="w-6 h-6 text-eco-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
            <p className="text-eco-600 font-medium text-sm mb-2">+262 262 00 00 00</p>
            <p className="text-gray-500 text-xs">Lun–Ven de 9h à 17h (heure de La Réunion)</p>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Horaires</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lundi – Vendredi</span>
                <span className="font-medium text-gray-900">9h00 – 17h00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Samedi</span>
                <span className="font-medium text-gray-900">9h00 – 12h00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimanche</span>
                <span className="text-gray-400">Fermé</span>
              </div>
              <p className="text-xs text-gray-400 pt-2">Heures de La Réunion (UTC+4)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Siège social</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              DONNALI SAS<br />
              La Réunion (97400)<br />
              France
            </p>
            <p className="text-xs text-gray-400 mt-3">Rencontres sur rendez-vous uniquement</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm mb-1">Signaler une fraude ou contenu illicite</p>
              <p className="text-red-800 text-sm leading-relaxed mb-3">
                Si vous suspectez une fraude, un transport illicite ou un abus sur la plateforme, signalez-le immédiatement. Nous coopérons pleinement avec les autorités judiciaires.
              </p>
              <a
                href="mailto:signalement@donnali.re"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                signalement@donnali.re
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Questions fréquentes</h3>
          <p className="text-sm text-gray-600 mb-4">Avant de nous contacter, consultez notre FAQ — la réponse y est peut-être déjà.</p>
          <div className="space-y-2">
            {[
              'Comment fonctionne le paiement ?',
              'Mon annonce n\'apparaît pas dans les résultats',
              'Comment vérifier mon identité ?',
              'Comment obtenir un remboursement ?',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => onNavigate('faq')}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-ocean-50 transition-colors text-sm text-gray-700 hover:text-ocean-600"
              >
                {q}
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
          <button
            onClick={() => onNavigate('faq')}
            className="w-full mt-4 py-3 border-2 border-ocean-200 text-ocean-600 font-semibold text-sm rounded-xl hover:bg-ocean-50 transition-colors"
          >
            Voir toute la FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
