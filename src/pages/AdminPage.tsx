import { useState, useEffect } from 'react';
import { Shield, Users, Package, TrendingUp, Eye, EyeOff, Trash2, CheckCircle, XCircle, Search, AlertTriangle, X, RefreshCw, Ban, PhoneOff } from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';
import { CITY_LABELS } from '../types';
import { useToast } from '../components/ui/Toast';
import { adminApi, type AdminListing, type AdminUser, type AdminStats } from '../lib/adminApi';

interface AdminPageProps {
  user: SupaUser | null;
  onAuthRequired: () => void;
}

type AdminTab = 'overview' | 'listings' | 'users';

const DELETE_REASONS = [
  { value: 'phone_number', label: 'Numéro de téléphone détecté', icon: PhoneOff },
  { value: 'contact_bypass', label: 'Tentative de contournement du système', icon: Ban },
  { value: 'fake_listing', label: 'Annonce fausse ou trompeuse', icon: AlertTriangle },
  { value: 'prohibited_content', label: 'Contenu interdit ou illicite', icon: AlertTriangle },
  { value: 'other', label: 'Autre raison', icon: Trash2 },
];

const SUSPEND_REASONS = [
  { value: 'contact_bypass', label: 'Partage de coordonnées dans une annonce' },
  { value: 'repeated_violations', label: 'Violations répétées des CGU' },
  { value: 'fake_account', label: 'Faux compte ou usurpation d\'identité' },
  { value: 'fraud', label: 'Tentative de fraude' },
  { value: 'prohibited_content', label: 'Publication de contenu illicite' },
];

export function AdminPage({ user, onAuthRequired }: AdminPageProps) {
  const { success, error: toastError } = useToast();
  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats>({ totalListings: 0, activeListings: 0, totalUsers: 0, totalUnlocks: 0 });
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteModal, setDeleteModal] = useState<{ id: string; type: 'listing' } | null>(null);
  const [deleteReason, setDeleteReason] = useState('phone_number');

  const [suspendModal, setSuspendModal] = useState<{ id: string; name: string; permanent: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState('contact_bypass');
  const [suspendDuration, setSuspendDuration] = useState('7');

  useEffect(() => {
    if (!user) {
      setCheckingAccess(false);
      return;
    }
    verifyAdminAccess();
  }, [user]);

  const verifyAdminAccess = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
      setAccessGranted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('403') || msg.includes('Forbidden')) {
        setAccessError('forbidden');
      } else if (msg.includes('401') || msg.includes('Non authentifié')) {
        setAccessError('unauthenticated');
      } else {
        setAccessError('forbidden');
      }
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch {
      toastError('Impossible de charger les statistiques.');
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getListings();
      setListings(data);
    } catch {
      toastError('Impossible de charger les annonces.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch {
      toastError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessGranted) return;
    if (tab === 'listings') loadListings();
    if (tab === 'users') loadUsers();
  }, [tab, accessGranted]);

  const toggleListingPublished = async (listing: AdminListing) => {
    try {
      await adminApi.toggleListingPublished(listing.id, !listing.is_published);
      setListings((prev) =>
        prev.map((l) => l.id === listing.id ? { ...l, is_published: !l.is_published } : l)
      );
      success(listing.is_published ? 'Annonce masquée.' : 'Annonce publiée.');
    } catch {
      toastError('Erreur lors de la modification.');
    }
  };

  const confirmDeleteListing = async () => {
    if (!deleteModal) return;
    try {
      await adminApi.deleteListing(deleteModal.id);
      setListings((prev) => prev.filter((l) => l.id !== deleteModal.id));
      setDeleteModal(null);
      setDeleteReason('phone_number');
      success('Annonce supprimée.');
      loadStats();
    } catch {
      toastError('Impossible de supprimer.');
      setDeleteModal(null);
    }
  };

  const confirmSuspendUser = async () => {
    if (!suspendModal) return;
    try {
      await adminApi.suspendUser(suspendModal.id, suspendModal.permanent, suspendReason, suspendModal.permanent ? null : parseInt(suspendDuration));
      setUsers((prev) =>
        prev.map((u) => u.id === suspendModal.id ? { ...u, is_suspended: true } : u)
      );
      setSuspendModal(null);
      setSuspendReason('contact_bypass');
      setSuspendDuration('7');
      success(suspendModal.permanent ? 'Compte suspendu définitivement.' : `Compte suspendu pour ${suspendDuration} jours.`);
    } catch {
      toastError('Impossible de suspendre le compte.');
      setSuspendModal(null);
    }
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    try {
      await adminApi.toggleAdmin(userId, !current);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_admin: !current } : u)
      );
      success(!current ? 'Utilisateur promu admin.' : 'Droits admin retirés.');
    } catch {
      toastError('Erreur lors de la modification.');
    }
  };

  const filteredListings = listings.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.profiles?.full_name?.toLowerCase().includes(q) ||
      l.departure.includes(q) ||
      l.destination.includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    return u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">Accès restreint</h2>
          <p className="text-gray-500 text-sm mb-6">Connectez-vous pour accéder à l'administration.</p>
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

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="font-poppins font-bold text-2xl text-gray-900 mb-3">Accès non autorisé</h2>
          <p className="text-gray-500 text-sm">
            {accessError === 'unauthenticated'
              ? 'Votre session a expiré. Veuillez vous reconnecter.'
              : "Vous n'avez pas les droits d'accès à l'administration."}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as AdminTab, label: "Vue d'ensemble", icon: TrendingUp },
    { id: 'listings' as AdminTab, label: 'Annonces', icon: Package },
    { id: 'users' as AdminTab, label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ocean-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-poppins text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-500 text-sm">Tableau de bord administrateur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-card border border-gray-100 w-fit mb-8 flex-wrap">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-ocean-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-ocean-600 hover:bg-ocean-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Annonces totales', value: stats.totalListings, icon: Package, color: 'ocean' },
                { label: 'Annonces actives', value: stats.activeListings, icon: CheckCircle, color: 'eco' },
                { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'amber' },
                { label: 'Contacts débloqués', value: stats.totalUnlocks, icon: TrendingUp, color: 'ocean' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      stat.color === 'eco' ? 'bg-eco-100' : stat.color === 'amber' ? 'bg-amber-100' : 'bg-ocean-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        stat.color === 'eco' ? 'text-eco-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-ocean-600'
                      }`} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Annonces récentes</h3>
                <button
                  onClick={() => setTab('listings')}
                  className="text-sm text-ocean-600 font-medium hover:text-ocean-700"
                >
                  Voir tout
                </button>
              </div>
              <button
                onClick={loadListings}
                className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:text-ocean-600 hover:border-ocean-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Charger les annonces récentes
              </button>
            </div>
          </div>
        )}

        {tab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, ville..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                />
              </div>
              <button
                onClick={loadListings}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trajet</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kilos</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-900">
                              {CITY_LABELS[listing.departure as keyof typeof CITY_LABELS] || listing.departure}
                              {' → '}
                              {CITY_LABELS[listing.destination as keyof typeof CITY_LABELS] || listing.destination}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">{listing.profiles?.full_name || 'Inconnu'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">
                              {new Date(listing.flight_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">{listing.kilos_available} kg</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${listing.is_active ? 'bg-eco-100 text-eco-700' : 'bg-gray-100 text-gray-500'}`}>
                                {listing.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {!listing.is_published && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                  Masquée
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleListingPublished(listing)}
                                className="p-1.5 text-gray-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                                title={listing.is_published ? 'Masquer' : 'Publier'}
                              >
                                {listing.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setDeleteModal({ id: listing.id, type: 'listing' })}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredListings.length === 0 && (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      Aucune annonce trouvée.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                />
              </div>
              <button
                onClick={loadUsers}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vérif.</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.is_suspended ? 'opacity-60' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{u.full_name || 'Sans nom'}</span>
                              {u.is_suspended && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                                  <Ban className="w-3 h-3" />
                                  Suspendu
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500">
                              {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              {u.identity_verified ? (
                                <CheckCircle className="w-4 h-4 text-eco-500" title="Identité vérifiée" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-300" title="Non vérifié" />
                              )}
                              {u.flight_verified ? (
                                <CheckCircle className="w-4 h-4 text-ocean-500" title="Vol vérifié" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-300" title="Vol non vérifié" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">
                              {u.rating_count > 0 ? `${u.rating_avg.toFixed(1)} (${u.rating_count})` : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.is_admin ? 'bg-ocean-100 text-ocean-700' : 'bg-gray-100 text-gray-500'}`}>
                              {u.is_admin ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {u.id !== user?.id && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => toggleAdmin(u.id, u.is_admin)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                    u.is_admin
                                      ? 'text-red-600 hover:bg-red-50'
                                      : 'text-ocean-600 hover:bg-ocean-50'
                                  }`}
                                >
                                  {u.is_admin ? 'Retirer admin' : 'Admin'}
                                </button>
                                {!u.is_suspended && (
                                  <>
                                    <button
                                      onClick={() => setSuspendModal({ id: u.id, name: u.full_name || 'cet utilisateur', permanent: false })}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                      title="Suspension temporaire"
                                    >
                                      Suspendre
                                    </button>
                                    <button
                                      onClick={() => setSuspendModal({ id: u.id, name: u.full_name || 'cet utilisateur', permanent: true })}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Suspension définitive"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      Aucun utilisateur trouvé.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <button onClick={() => setDeleteModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Supprimer cette annonce</h3>
            <p className="text-sm text-gray-500 mb-4">
              Sélectionnez la raison de la suppression. Cette action est définitive.
            </p>
            <div className="space-y-2 mb-5">
              {DELETE_REASONS.map((r) => {
                const Icon = r.icon;
                return (
                  <label
                    key={r.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      deleteReason === r.value
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deleteReason"
                      value={r.value}
                      checked={deleteReason === r.value}
                      onChange={() => setDeleteReason(r.value)}
                      className="sr-only"
                    />
                    <Icon className={`w-4 h-4 shrink-0 ${deleteReason === r.value ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${deleteReason === r.value ? 'text-red-900' : 'text-gray-700'}`}>
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteListing}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${suspendModal.permanent ? 'bg-red-100' : 'bg-amber-100'}`}>
                <Ban className={`w-5 h-5 ${suspendModal.permanent ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <button onClick={() => setSuspendModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {suspendModal.permanent ? 'Suspension définitive' : 'Suspension temporaire'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {suspendModal.permanent
                ? `Le compte de ${suspendModal.name} sera suspendu définitivement et ne pourra plus jamais accéder à DONNALI.`
                : `Le compte de ${suspendModal.name} sera suspendu temporairement.`
              }
            </p>

            {!suspendModal.permanent && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Durée de suspension</label>
                <div className="grid grid-cols-4 gap-2">
                  {['7', '14', '30', '90'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSuspendDuration(d)}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                        suspendDuration === d
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d}j
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Motif</label>
              {SUSPEND_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    suspendReason === r.value
                      ? suspendModal.permanent ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="suspendReason"
                    value={r.value}
                    checked={suspendReason === r.value}
                    onChange={() => setSuspendReason(r.value)}
                    className="sr-only"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    suspendReason === r.value
                      ? suspendModal.permanent ? 'border-red-500 bg-red-500' : 'border-amber-500 bg-amber-500'
                      : 'border-gray-300'
                  }`}>
                    {suspendReason === r.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-medium ${
                    suspendReason === r.value
                      ? suspendModal.permanent ? 'text-red-900' : 'text-amber-900'
                      : 'text-gray-700'
                  }`}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>

            {suspendModal.permanent && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-red-800 font-semibold">
                  Cette action est irréversible. Le compte sera définitivement banni de DONNALI.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSuspendModal(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={confirmSuspendUser}
                className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors text-sm ${
                  suspendModal.permanent
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {suspendModal.permanent ? 'Bannir définitivement' : `Suspendre ${suspendDuration}j`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
