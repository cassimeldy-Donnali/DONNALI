import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Listing } from '../../types';
import { CITY_LABELS } from '../../types';

interface RatingModalProps {
  listing: Listing;
  user: User;
  existingRating?: { id: string; score: number; comment: string };
  onClose: () => void;
  onSaved: () => void;
}

export function RatingModal({ listing, user, existingRating, onClose, onSaved }: RatingModalProps) {
  const [score, setScore] = useState(existingRating?.score ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const LABELS = ['', 'Mauvaise expérience', 'Passable', 'Bien', 'Très bien', 'Excellent'];

  const handleSubmit = async () => {
    if (score === 0) {
      setError('Veuillez sélectionner une note.');
      return;
    }
    setError('');
    setSaving(true);

    if (existingRating) {
      const { error: err } = await supabase
        .from('ratings')
        .update({ score, comment: comment.trim() })
        .eq('id', existingRating.id);
      if (err) {
        setError('Impossible de mettre à jour la note. Réessayez.');
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('ratings').insert({
        rater_id: user.id,
        rated_user_id: listing.user_id,
        listing_id: listing.id,
        score,
        comment: comment.trim(),
      });
      if (err) {
        setError('Impossible de soumettre la note. Réessayez.');
        setSaving(false);
        return;
      }
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-poppins font-bold text-lg text-gray-900">
              {existingRating ? 'Modifier votre note' : 'Évaluer ce voyageur'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {CITY_LABELS[listing.departure]} → {CITY_LABELS[listing.destination]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Quelle est votre expérience ?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setScore(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      s <= (hovered || score)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || score) > 0 && (
              <p className="text-center text-sm font-medium text-gray-600 mt-2 h-5">
                {LABELS[hovered || score]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce voyageur..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || score === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {saving ? 'Envoi...' : existingRating ? 'Modifier' : 'Soumettre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
