import { useState } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { NewsletterSubscribeModal } from './NewsletterSubscribeModal';

type Location = 'reunion' | 'mayotte' | 'paris';

interface Props {
  suggestedDestination?: Location;
}

export function NewsletterBanner({ suggestedDestination }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-bold text-white text-base mb-1">
              Soyez alerté en premier
            </h3>
            <p className="text-ocean-200 text-sm leading-relaxed mb-4">
              Inscrivez-vous pour recevoir un email dès qu'un voyageur publie une annonce pour votre destination. Sans les coordonnées — pour accéder à l'annonce complète.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-ocean-700 font-semibold rounded-xl hover:bg-ocean-50 transition-colors text-sm shadow-sm"
            >
              Créer mon alerte
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <NewsletterSubscribeModal
          onClose={() => setOpen(false)}
          defaultDestination={suggestedDestination}
        />
      )}
    </>
  );
}
