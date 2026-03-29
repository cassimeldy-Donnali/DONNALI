import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, ArrowRight } from 'lucide-react';

interface PaymentResultBannerProps {
  onNavigate: (page: string) => void;
}

export function PaymentResultBanner({ onNavigate }: PaymentResultBannerProps) {
  const [result, setResult] = useState<'success' | 'cancel' | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const lid = params.get('listing_id');

    if (payment === 'success') {
      setResult('success');
      setListingId(lid);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancel') {
      setResult('cancel');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const dismiss = () => setResult(null);

  if (!result) return null;

  if (result === 'success') {
    return (
      <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden animate-slide-down">
          <div className="bg-green-50 px-5 py-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 text-base">Paiement confirme !</h3>
              <p className="text-sm text-green-700 mt-1">
                Le contact du voyageur a ete debloque avec succes. Rendez-vous sur votre tableau de bord pour retrouver les coordonnees.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { dismiss(); onNavigate('dashboard'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Voir le tableau de bord
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {listingId && (
                  <a
                    href={`/listing/${listingId}`}
                    onClick={dismiss}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                  >
                    Voir l'annonce
                  </a>
                )}
              </div>
            </div>
            <button onClick={dismiss} className="text-green-400 hover:text-green-600 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden animate-slide-down">
        <div className="bg-red-50 px-5 py-4 flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-red-900 text-base">Paiement annule</h3>
            <p className="text-sm text-red-700 mt-1">
              Votre paiement n'a pas ete complete. Vous pouvez reessayer a tout moment en cliquant sur "Debloquer le contact".
            </p>
          </div>
          <button onClick={dismiss} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
