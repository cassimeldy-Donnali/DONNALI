import { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = 'donnali_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const saveConsent = (state: ConsentState & { necessary: true }) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
    setVisible(false);
  };

  const acceptAll = () => saveConsent({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => saveConsent({ necessary: true, analytics: false, marketing: false });
  const saveCustom = () => saveConsent({ necessary: true, ...consent });

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-ocean-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 text-ocean-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base">Nous respectons votre vie privee</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Nous utilisons des cookies pour ameliorer votre experience. Les cookies necessaires assurent le bon fonctionnement du site. Vous pouvez choisir d'accepter les autres.
              </p>
            </div>
          </div>

          {expanded && (
            <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
              <CookieCategory
                title="Cookies necessaires"
                description="Indispensables au fonctionnement du site : authentification, securite, preferences de session."
                enabled={true}
                locked={true}
                onChange={() => {}}
              />
              <CookieCategory
                title="Cookies analytiques"
                description="Nous aident a comprendre comment vous utilisez le site pour l'ameliorer (mesure d'audience anonymisee)."
                enabled={consent.analytics}
                locked={false}
                onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
              />
              <CookieCategory
                title="Cookies marketing"
                description="Permettent de vous proposer des contenus personnalises et de mesurer l'efficacite de nos communications."
                enabled={consent.marketing}
                locked={false}
                onChange={(v) => setConsent((c) => ({ ...c, marketing: v }))}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
            >
              Personnaliser
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && (
              <button
                onClick={saveCustom}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-ocean-600 border-2 border-ocean-200 hover:bg-ocean-50 rounded-xl transition-colors"
              >
                Enregistrer mes choix
              </button>
            )}
            <button
              onClick={rejectAll}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
            >
              Refuser
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-ocean-500 hover:bg-ocean-600 rounded-xl transition-colors shadow-sm"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieCategory({
  title,
  description,
  enabled,
  locked,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => !locked && onChange(!enabled)}
        disabled={locked}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 mt-0.5 ${
          enabled ? 'bg-ocean-500' : 'bg-gray-300'
        } ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {locked && <Check className="w-2.5 h-2.5 text-ocean-500" />}
        </span>
      </button>
    </div>
  );
}
