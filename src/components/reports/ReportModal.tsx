import { useState } from 'react';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

interface ReportModalProps {
  user: SupaUser | null;
  reportedUserId?: string;
  reportedListingId?: string;
  reportedUserName?: string;
  onClose: () => void;
  onAuthRequired: () => void;
}

const REASONS = [
  { value: 'fraude', label: 'Fraude ou escroquerie' },
  { value: 'arnaque', label: 'Arnaque financiere' },
  { value: 'contenu_inapproprie', label: 'Contenu inapproprie' },
  { value: 'faux_profil', label: 'Faux profil ou usurpation' },
  { value: 'comportement_abusif', label: 'Comportement abusif ou harcelement' },
  { value: 'autre', label: 'Autre probleme' },
];

export function ReportModal({
  user,
  reportedUserId,
  reportedListingId,
  reportedUserName,
  onClose,
  onAuthRequired,
}: ReportModalProps) {
  const { success, error: toastError } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      onClose();
      onAuthRequired();
      return;
    }
    if (!reason) return;

    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId || null,
      reported_listing_id: reportedListingId || null,
      reason,
      description: description.trim(),
    });

    if (error) {
      toastError('Impossible d\'envoyer le signalement. Reessayez.');
    } else {
      success('Signalement envoye. Nous l\'examinerons sous 24h.');
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-gray-900 text-lg">Signaler</h2>
              {reportedUserName && (
                <p className="text-xs text-gray-500">{reportedUserName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-eco-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-eco-500" />
              </div>
              <h3 className="font-poppins font-bold text-gray-900 text-lg mb-2">Signalement envoye</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Notre equipe examinera votre signalement dans les 24 heures. Merci de contribuer a la securite de la communaute.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Les faux signalements peuvent entrainer la suspension de votre compte. Merci de signaler uniquement des problemes reels.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Motif du signalement *
                </label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        reason === r.value
                          ? 'border-red-300 bg-red-50 text-red-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Description (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Decrivez le probleme en detail..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{description.length}/500</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
