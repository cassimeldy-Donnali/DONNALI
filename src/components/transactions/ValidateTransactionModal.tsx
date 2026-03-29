import { useState, useRef } from 'react';
import { X, PackageCheck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateTransactionCode, type TransactionArchive } from '../../lib/transactions';
import type { Listing } from '../../types';
import { CITY_LABELS } from '../../types';

interface Props {
  listing: Listing;
  travelerId: string;
  onClose: () => void;
  onValidated: (archive: TransactionArchive) => void;
}

export function ValidateTransactionModal({ listing, travelerId, onClose, onValidated }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [archive, setArchive] = useState<TransactionArchive | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (idx: number, val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!upper && val) return;
    const next = [...code];
    next[idx] = upper.slice(-1);
    setCode(next);
    setError('');
    if (upper && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = [...code];
      for (let i = 0; i < 6; i++) {
        next[i] = pasted[i] || '';
      }
      setCode(next);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const fullCode = code.join('');

  const handleValidate = async () => {
    if (fullCode.length < 6) {
      setError('Entrez le code complet à 6 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await validateTransactionCode(fullCode, travelerId, listing);
    setLoading(false);
    if (result.success && result.archive) {
      setArchive(result.archive);
      setSuccess(true);
      setTimeout(() => onValidated(result.archive!), 2500);
    } else {
      setError(result.error || 'Code invalide.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-ocean-600" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-gray-900 text-base">Valider la remise</h2>
              <p className="text-xs text-gray-400">Entrez le code fourni par l'expéditeur</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {success && archive ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-eco-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Remise confirmée !</h3>
              <p className="text-sm text-gray-500 mb-4">L'échange a été archivé avec succès.</p>
              <div className="bg-eco-50 rounded-2xl p-4 text-left border border-eco-100">
                <p className="text-xs text-eco-700 font-semibold mb-2">Récapitulatif</p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Trajet :</span>{' '}
                  {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Vol :</span>{' '}
                  {new Date(listing.flight_date).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Code utilisé :</span>{' '}
                  <span className="font-mono text-eco-700">{archive.code_used}</span>
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Validé le :</span>{' '}
                  {new Date(archive.validated_at).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Annonce concernée</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="font-semibold text-gray-900 text-sm">
                    {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">
                    {new Date(listing.flight_date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Code à 6 caractères (donné par l'expéditeur)
                </p>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {code.map((char, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputs.current[idx] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => handleInput(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-14 text-center text-xl font-bold font-mono border-2 rounded-xl transition-all outline-none uppercase
                        ${char ? 'border-ocean-400 bg-ocean-50 text-ocean-800' : 'border-gray-200 bg-white text-gray-900'}
                        ${error ? 'border-red-300 bg-red-50' : ''}
                        focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleValidate}
                disabled={loading || fullCode.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    Confirmer la remise
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Ce code est unique et valable 48h. La validation est irréversible.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
