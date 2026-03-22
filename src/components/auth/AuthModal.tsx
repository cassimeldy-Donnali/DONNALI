import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Plane, Leaf, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'login' | 'register' | 'forgot';

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cguAccepted, setCguAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !cguAccepted) {
      setError("Vous devez accepter les CGU pour créer un compte.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/?reset=true`,
        });
        if (resetError) throw resetError;
        setResetSent(true);
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (signUpError) throw signUpError;
        setConfirmSent(true);
        setLoading(false);
        return;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      if (msg.includes('Invalid login')) setError('Email ou mot de passe incorrect.');
      else if (msg.includes('already registered')) setError('Cet email est déjà utilisé.');
      else if (msg.includes('Password should')) setError('Le mot de passe doit contenir au moins 6 caractères.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 px-6 py-6 relative overflow-hidden">
          <div className="absolute top-3 right-12 opacity-10">
            <Plane className="w-20 h-20 text-white -rotate-45" />
          </div>
          <div className="absolute bottom-0 left-6 opacity-10">
            <Leaf className="w-12 h-12 text-eco-300 fill-eco-300" />
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 text-white -rotate-45" />
            </div>
            <span className="text-white font-bold text-lg">DONNALI</span>
          </div>
          <h2 className="text-white font-poppins font-bold text-2xl">
            {confirmSent
              ? 'Vérifiez votre email'
              : mode === 'login'
              ? 'Bon retour !'
              : mode === 'register'
              ? 'Créer un compte'
              : 'Mot de passe oublié'}
          </h2>
          <p className="text-ocean-200 text-sm mt-1">
            {confirmSent
              ? 'Un email de confirmation vous a été envoyé'
              : mode === 'login'
              ? 'Connectez-vous pour accéder aux coordonnées des voyageurs'
              : mode === 'register'
              ? 'Rejoignez la communauté DONNALI'
              : 'Recevez un lien de réinitialisation par email'}
          </p>
        </div>

        <div className="p-6">
          {confirmSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-ocean-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-ocean-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Email envoyé !</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                Un lien de confirmation a été envoyé à
              </p>
              <p className="font-semibold text-ocean-600 text-sm mb-5">{email}</p>
              <div className="bg-ocean-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-ocean-800 leading-relaxed">
                  Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez aussi vos spams si vous ne le trouvez pas.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Fermer
              </button>
              <button
                onClick={() => { setMode('login'); setConfirmSent(false); setError(''); }}
                className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Déjà confirmé ? Se connecter
              </button>
            </div>
          ) : resetSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-eco-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email envoyé !</h3>
              <p className="text-gray-500 text-sm mb-5">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boite mail.
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); setError(''); }}
                className="text-sm font-semibold text-ocean-600 hover:text-ocean-700 transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Prénom et nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Marie Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="vous@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600">
                    Mot de passe
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-xs text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
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
            )}

            {mode === 'register' && (
              <button
                type="button"
                onClick={() => setCguAccepted(!cguAccepted)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                  cguAccepted ? 'border-eco-400 bg-eco-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                  cguAccepted ? 'bg-eco-500 border-eco-500' : 'border-gray-300 bg-white'
                }`}>
                  {cguAccepted && <span className="text-white text-xs font-bold leading-none">✓</span>}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  J'accepte les{' '}
                  <span className="font-semibold text-ocean-600">Conditions Générales d'Utilisation</span>
                  {' '}et la{' '}
                  <span className="font-semibold text-ocean-600">Politique de confidentialité</span>
                  {' '}de DONNALI.
                </p>
              </button>
            )}

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
              ) : mode === 'login' ? (
                'Se connecter'
              ) : mode === 'forgot' ? (
                'Envoyer le lien'
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
          )}

          {!resetSent && !confirmSent && (
          <div className="mt-5 text-center">
            {mode === 'forgot' ? (
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-sm font-semibold text-ocean-600 hover:text-ocean-700 transition-colors"
              >
                Retour à la connexion
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?'}{' '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  className="font-semibold text-ocean-600 hover:text-ocean-700 transition-colors"
                >
                  {mode === 'login' ? "S'inscrire gratuitement" : 'Se connecter'}
                </button>
              </p>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
