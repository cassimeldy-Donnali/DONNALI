import { useState, useEffect, useRef } from 'react';
import {
  User, Camera, Phone, Mail, FileText, Save, ShieldCheck, Plane, Star,
  Package, Lock, Trash2, AlertTriangle, Eye, EyeOff, ChevronDown, ChevronUp,
  Bell, BellOff, Plus,
} from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { TrustBadge } from '../components/verification/TrustBadge';
import { useToast } from '../components/ui/Toast';
import { NewsletterSubscribeModal } from '../components/newsletter/NewsletterSubscribeModal';

interface ProfilePageProps {
  user: SupaUser | null;
  onAuthRequired: () => void;
}

export function ProfilePage({ user, onAuthRequired }: ProfilePageProps) {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [listingsCount, setListingsCount] = useState(0);
  const [unlocksCount, setUnlocksCount] = useState(0);

  const [form, setForm] = useState({ full_name: '', phone: '', bio: '' });

  const [securityOpen, setSecurityOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNextPwd, setShowNextPwd] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<{ id: string; destination: string; departure: string | null; created_at: string }[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  const CITY_LABELS: Record<string, string> = {
    reunion: 'La Réunion',
    mayotte: 'Mayotte',
    paris: 'Paris / France métro',
  };

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadSubscriptions = async () => {
    if (!user) return;
    setLoadingSubscriptions(true);
    const { data } = await supabase
      .from('newsletter_subscriptions')
      .select('id, destination, departure, created_at')
      .eq('email', user.email?.toLowerCase() ?? '')
      .order('created_at', { ascending: false });
    setSubscriptions(data ?? []);
    setLoadingSubscriptions(false);
  };

  const handleUnsubscribe = async (id: string) => {
    const { error } = await supabase.from('newsletter_subscriptions').delete().eq('id', id);
    if (!error) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      success('Abonnement supprimé.');
    } else {
      toastError('Impossible de supprimer cet abonnement.');
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    const [profileRes, listingsRes, unlocksRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('listings').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('unlocked_contacts').select('id', { count: 'exact' }).eq('buyer_id', user.id),
    ]);

    if (profileRes.data) {
      const p = profileRes.data as Profile;
      setProfile(p);
      setForm({ full_name: p.full_name || '', phone: p.phone || '', bio: p.bio || '' });
    }
    setListingsCount(listingsRes.count ?? 0);
    setUnlocksCount(unlocksRes.count ?? 0);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name.trim(), phone: form.phone.trim(), bio: form.bio.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      toastError('Impossible de sauvegarder. Reessayez.');
    } else {
      success('Profil mis a jour avec succes.');
      setProfile((prev) => prev ? { ...prev, ...form } : prev);
    }
    setSaving(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toastError('Image trop lourde (max 2 Mo).');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Format non supporte. Utilisez JPG, PNG ou WebP.');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toastError('Echec de l\'upload. Verifiez votre connexion.');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      toastError('Photo uploadee mais profil non mis a jour.');
    } else {
      setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      success('Photo de profil mise a jour.');
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail.trim() || !emailForm.password.trim()) return;
    setChangingEmail(true);

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: emailForm.password,
    });

    if (signInErr) {
      toastError('Mot de passe incorrect.');
      setChangingEmail(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: emailForm.newEmail.trim() });
    if (error) {
      toastError('Impossible de changer l\'email. ' + (error.message || ''));
    } else {
      success('Un lien de confirmation a ete envoye a votre nouvelle adresse.');
      setEmailForm({ newEmail: '', password: '' });
    }
    setChangingEmail(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.next.trim() || !passwordForm.confirm.trim()) return;
    if (passwordForm.next !== passwordForm.confirm) {
      toastError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.next.length < 8) {
      toastError('Le mot de passe doit faire au moins 8 caracteres.');
      return;
    }

    setChangingPassword(true);

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: passwordForm.current,
    });

    if (signInErr) {
      toastError('Mot de passe actuel incorrect.');
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
    if (error) {
      toastError('Impossible de changer le mot de passe.');
    } else {
      success('Mot de passe change avec succes.');
      setPasswordForm({ current: '', next: '', confirm: '' });
    }
    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER' || !user) return;
    setDeleting(true);

    const { error } = await supabase.functions.invoke('delete-account', {
      body: { user_id: user.id },
    });

    if (error) {
      toastError('Impossible de supprimer le compte. Contactez le support.');
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <User className="w-12 h-12 text-ocean-400 mx-auto mb-4" />
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">Acces restreint</h2>
          <p className="text-gray-500 text-sm mb-6">Connectez-vous pour acceder a votre profil.</p>
          <button
            onClick={onAuthRequired}
            className="w-full py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-ocean-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {uploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-ocean-300 border-t-ocean-600 rounded-full animate-spin" />
                    ) : profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-ocean-500" />
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    title="Changer la photo"
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h2 className="font-poppins font-bold text-xl text-gray-900">
                    {form.full_name || user.email?.split('@')[0]}
                  </h2>
                  {profile && profile.rating_count > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= Math.round(profile.rating_avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{profile.rating_avg.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({profile.rating_count} avis)</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP — max 2 Mo</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-ocean-600 mb-1">
                    <Package className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listingsCount}</p>
                  <p className="text-xs text-gray-500">Annonces</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="flex items-center justify-center gap-1.5 text-eco-600 mb-1">
                    <Star className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile?.rating_count ? profile.rating_avg.toFixed(1) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Note moy.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{unlocksCount}</p>
                  <p className="text-xs text-gray-500">Contacts</p>
                </div>
              </div>

              {profile && (
                <div className="mb-2">
                  <TrustBadge
                    identityVerified={profile.identity_verified}
                    flightVerified={profile.flight_verified}
                    trustScore={profile.trust_score}
                    compact
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-5">
              <h3 className="font-semibold text-gray-900">Informations personnelles</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Votre nom complet"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Telephone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+262 692 000 000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Quelques mots sur vous..."
                    rows={3}
                    maxLength={300}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 resize-none"
                  />
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/300</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-ocean-300 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Verifications</h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${profile?.identity_verified ? 'border-eco-200 bg-eco-50' : 'border-gray-100 bg-gray-50'}`}>
                  <ShieldCheck className={`w-5 h-5 ${profile?.identity_verified ? 'text-eco-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${profile?.identity_verified ? 'text-eco-700' : 'text-gray-600'}`}>
                      Identite {profile?.identity_verified ? 'verifiee' : 'non verifiee'}
                    </p>
                    <p className="text-xs text-gray-500">Piece d'identite + selfie</p>
                  </div>
                  {profile?.identity_verified && (
                    <span className="ml-auto text-xs font-bold text-eco-600 bg-eco-100 px-2 py-1 rounded-full">Valide</span>
                  )}
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${profile?.flight_verified ? 'border-ocean-200 bg-ocean-50' : 'border-gray-100 bg-gray-50'}`}>
                  <Plane className={`w-5 h-5 -rotate-45 ${profile?.flight_verified ? 'text-ocean-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${profile?.flight_verified ? 'text-ocean-700' : 'text-gray-600'}`}>
                      Vol {profile?.flight_verified ? 'confirme' : 'non confirme'}
                    </p>
                    <p className="text-xs text-gray-500">Billet d'avion verifie</p>
                  </div>
                  {profile?.flight_verified && (
                    <span className="ml-auto text-xs font-bold text-ocean-600 bg-ocean-100 px-2 py-1 rounded-full">Valide</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <button
                onClick={() => setSecurityOpen(!securityOpen)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-ocean-50 rounded-xl flex items-center justify-center">
                    <Lock className="w-4 h-4 text-ocean-500" />
                  </div>
                  <span className="font-semibold text-gray-900">Securite du compte</span>
                </div>
                {securityOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {securityOpen && (
                <div className="px-6 pb-6 space-y-6 border-t border-gray-100">
                  <div className="pt-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Changer l'adresse email</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Adresse actuelle</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nouvelle adresse</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
                            placeholder="nouvelle@email.com"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mot de passe actuel (confirmation)</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleEmailChange}
                        disabled={!emailForm.newEmail || !emailForm.password || changingEmail}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
                      >
                        {changingEmail ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                        {changingEmail ? 'Envoi...' : 'Mettre a jour l\'email'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Changer le mot de passe</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mot de passe actuel</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showCurrentPwd ? 'text' : 'password'}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showNextPwd ? 'text' : 'password'}
                            value={passwordForm.next}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                            placeholder="Min. 8 caracteres"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNextPwd(!showNextPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNextPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Confirmer le nouveau mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                            placeholder="••••••••"
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300 ${
                              passwordForm.confirm && passwordForm.confirm !== passwordForm.next
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          />
                        </div>
                        {passwordForm.confirm && passwordForm.confirm !== passwordForm.next && (
                          <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                        )}
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={!passwordForm.current || !passwordForm.next || !passwordForm.confirm || changingPassword}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
                      >
                        {changingPassword ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                        {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <button
                onClick={() => {
                  if (!newsletterOpen) loadSubscriptions();
                  setNewsletterOpen(!newsletterOpen);
                }}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-ocean-50 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 text-ocean-500" />
                  </div>
                  <span className="font-semibold text-gray-900">Alertes newsletter</span>
                </div>
                {newsletterOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {newsletterOpen && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="pt-5">
                    <p className="text-sm text-gray-500 mb-4">
                      Gérez vos abonnements aux alertes de voyage. Vous recevez un email dès qu'un voyageur publie pour votre destination.
                    </p>

                    {loadingSubscriptions ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-5 h-5 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
                      </div>
                    ) : subscriptions.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                        <BellOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucun abonnement actif.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-4 h-4 text-ocean-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {sub.departure ? `${CITY_LABELS[sub.departure]} → ` : 'Tous départs → '}
                                  {CITY_LABELS[sub.destination] ?? sub.destination}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Depuis le {new Date(sub.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnsubscribe(sub.id)}
                              title="Supprimer cet abonnement"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setNewsletterModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-ocean-200 text-ocean-600 hover:border-ocean-400 hover:bg-ocean-50 font-semibold rounded-xl transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une alerte
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-red-100 overflow-hidden">
              <button
                onClick={() => setDeleteOpen(!deleteOpen)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-red-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-red-600">Supprimer mon compte</span>
                </div>
                {deleteOpen ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
              </button>

              {deleteOpen && (
                <div className="px-6 pb-6 border-t border-red-100">
                  <div className="pt-5">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">Action irreversible</p>
                        <p className="text-xs text-red-600 leading-relaxed">
                          La suppression de votre compte effacera definitivement toutes vos donnees : profil, annonces, historique. Cette action est conforme au RGPD (droit a l'oubli).
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Tapez <span className="font-bold text-red-600">SUPPRIMER</span> pour confirmer
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder="SUPPRIMER"
                        className="w-full px-4 py-3 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'SUPPRIMER' || deleting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      {deleting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {deleting ? 'Suppression...' : 'Supprimer definitivement mon compte'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {newsletterModalOpen && (
        <NewsletterSubscribeModal
          onClose={() => {
            setNewsletterModalOpen(false);
            loadSubscriptions();
          }}
        />
      )}
    </div>
  );
}
