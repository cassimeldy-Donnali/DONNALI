import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Plane } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 px-6 py-6 relative overflow-hidden">
          <div className="absolute top-3 right-12 opacity-10">
            <Plane className="w-20 h-20 text-white -rotate-45" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 text-white -rotate-45" />
            </div>
            <span className="text-white font-bold text-lg">DONNALI</span>
          </div>
          <h2 className="text-white font-poppins font-bold text-2xl">
            {success ? 'Mot de passe mis à jour' : 'Nouveau mot de passe'}
          </h2>
          <p className="text-ocean-200 text-sm mt-1">
            {success
              ? 'Vous pouvez maintenant vous connecter'
              : 'Choisissez un nouveau mot de passe sécurisé'}
          </p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-eco-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-eco-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Mot de passe mis à jour !</h3>
              <p className="text-gray-500 text-sm mb-6">
                Votre mot de passe a été modifié avec succès. Vous êtes maintenant connecté.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continuer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Au moins 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Répétez le mot de passe"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </>
                ) : (
                  'Enregistrer le mot de passe'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
