import { Plane, Leaf, Mail, Phone, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-ocean-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-ocean-400 rounded-xl" />
                <Plane className="relative w-5 h-5 text-white -rotate-45" />
                <Leaf className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-eco-400 fill-eco-400" />
              </div>
              <span className="font-bold text-xl tracking-tight">DONNALI</span>
            </div>
            <p className="text-ocean-200 text-sm leading-relaxed">
              La plateforme de partage de kilos de bagages aériens entre La Réunion, Mayotte et Paris.
            </p>
            <div className="mt-5 flex items-center gap-2 text-eco-400">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Voyager malin, voyager éco</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { id: 'home', label: 'Accueil' },
                { id: 'listings', label: 'Annonces voyageurs' },
                { id: 'post', label: 'Publier une annonce' },
                { id: 'dashboard', label: 'Mon tableau de bord' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2.5">
              {[
                { id: 'about', label: 'Notre mission' },
                { id: 'faq', label: 'FAQ' },
                { id: 'legal', label: 'Mentions légales' },
                { id: 'cgu', label: 'CGU' },
                { id: 'privacy', label: 'Confidentialité' },
                { id: 'contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-ocean-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@donnali.re"
                className="flex items-center gap-3 text-ocean-300 hover:text-white text-sm transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                contact@donnali.re
              </a>
              <a
                href="tel:+262262000000"
                className="flex items-center gap-3 text-ocean-300 hover:text-white text-sm transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                +262 262 00 00 00
              </a>
            </div>
            <div className="mt-6">
              <p className="text-xs text-ocean-400">Routes desservies :</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Réunion ↔ Paris', 'Réunion ↔ Mayotte', 'Mayotte ↔ Paris'].map((route) => (
                  <span key={route} className="px-2 py-1 bg-ocean-800 rounded-lg text-xs text-ocean-200">
                    {route}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ocean-800 space-y-4">
          <div className="flex items-start gap-2 p-3.5 bg-ocean-800/60 rounded-xl border border-ocean-700">
            <Shield className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
            <p className="text-ocean-400 text-xs leading-relaxed">
              <span className="font-semibold text-ocean-300">Non-responsabilité :</span> DONNALI est une plateforme de mise en relation uniquement. Nous nous désolidarisons formellement de tout acte frauduleux ou transport illicite commis par les utilisateurs. Chaque utilisateur est seul responsable de ses actions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-ocean-400 text-sm">
              © 2026 DONNALI. Tous droits réservés.
            </p>
            <p className="text-ocean-400 text-sm flex items-center gap-1.5">
              Fait avec <Leaf className="w-3.5 h-3.5 text-eco-500 fill-eco-500" /> à La Réunion
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
