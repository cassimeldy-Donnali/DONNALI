import { useState } from 'react';
import { Copy, CheckCircle, Loader2, Clock, PackageCheck, Zap } from 'lucide-react';
import { createTransactionCode, type TransactionCode } from '../../lib/transactions';

interface Props {
  listingId: string;
  senderId: string;
  travelerId: string;
  travelerName?: string;
}

export function TransactionCodeCard({ listingId, senderId, travelerId, travelerName }: Props) {
  const [tc, setTc] = useState<TransactionCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    const result = await createTransactionCode(listingId, senderId, travelerId);
    setLoading(false);
    if (result.data) {
      setTc(result.data);
    } else {
      setError(result.error || 'Erreur lors de la génération du code.');
    }
  };

  const copyCode = async () => {
    if (!tc) return;
    await navigator.clipboard.writeText(tc.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = tc ? new Date(tc.expires_at) < new Date() : false;
  const isValidated = tc?.status === 'validated';

  const expiresInMinutes = tc && !isExpired
    ? Math.max(1, Math.ceil((new Date(tc.expires_at).getTime() - Date.now()) / (1000 * 60)))
    : 0;

  return (
    <div className="bg-gradient-to-br from-ocean-50 to-blue-50 rounded-2xl border border-ocean-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center">
          <PackageCheck className="w-5 h-5 text-ocean-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Code de remise</h3>
          <p className="text-xs text-gray-500">
            {travelerName
              ? `À générer sur place avec ${travelerName}`
              : 'À générer au moment de la remise physique'}
          </p>
        </div>
      </div>

      {!tc || isExpired || isValidated ? (
        <div className="space-y-3">
          {isValidated && (
            <div className="flex items-center gap-2 p-3 bg-eco-50 rounded-xl border border-eco-100">
              <CheckCircle className="w-4 h-4 text-eco-600" />
              <p className="text-sm text-eco-700 font-medium">Échange validé — remise confirmée</p>
            </div>
          )}
          {isExpired && !isValidated && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-700">Code expiré. Générez-en un nouveau sur place.</p>
            </div>
          )}
          {!isValidated && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Générez ce code <strong>uniquement lors de la remise physique</strong>. Le voyageur devra le saisir immédiatement sur son téléphone. Code valable <strong>15 minutes</strong>.
                </p>
              </div>
              <button
                onClick={generate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    Générer le code sur place
                  </>
                )}
              </button>
            </>
          )}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-white border-2 border-ocean-200 rounded-xl px-4 py-3 text-center">
              <span className="text-3xl font-bold font-mono tracking-widest text-ocean-800 select-all">
                {tc.code}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="Copier le code"
            >
              {copied
                ? <CheckCircle className="w-5 h-5 text-eco-600" />
                : <Copy className="w-5 h-5 text-gray-500" />
              }
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            Expire dans {expiresInMinutes} minute{expiresInMinutes > 1 ? 's' : ''} — à saisir maintenant
          </div>

          <p className="text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">
            Dictez ce code au voyageur. Il doit le saisir immédiatement dans l'application pour confirmer la remise.
          </p>
        </div>
      )}
    </div>
  );
}
