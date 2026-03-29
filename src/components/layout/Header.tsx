import { useState, useEffect } from 'react';
import { Plane, Leaf, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationBell, NotificationPanel } from '../notifications/NotificationCenter';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: SupabaseUser | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

export function Header({ currentPage, onNavigate, user, onAuthClick, onSignOut }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
      setIsAdmin(data?.is_admin ?? false);
    })();
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Accueil' },
    { id: 'listings', label: 'Annonces' },
    { id: 'about', label: 'Notre mission' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-ocean-100 shadow-md'
        : 'bg-white/95 backdrop-blur-sm border-b border-ocean-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-ocean-500 rounded-xl group-hover:bg-ocean-600 transition-colors" />
              <Plane className="relative w-5 h-5 text-white -rotate-45" />
              <Leaf className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-eco-500 fill-eco-500" />
            </div>
            <span className="font-poppins font-bold text-xl tracking-tight text-ocean-800">
              DONNALI
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.id
                    ? 'bg-ocean-50 text-ocean-600'
                    : 'text-gray-600 hover:text-ocean-600 hover:bg-ocean-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => handleNav('post')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ocean-600 border-2 border-ocean-200 rounded-xl hover:bg-ocean-50 hover:border-ocean-400 hover:shadow-sm transition-all duration-200 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publier une annonce
                </button>
                <div className="relative">
                  <NotificationBell unreadCount={unreadCount} onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} />
                  {notifOpen && (
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onMarkRead={markRead}
                      onClose={() => setNotifOpen(false)}
                    />
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-ocean-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.email?.split('@')[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                      <button
                        onClick={() => handleNav('dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Tableau de bord
                      </button>
                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('admin')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Administration
                        </button>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-ocean-600 transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={onAuthClick}
                  className="px-4 py-2 text-sm font-semibold text-white bg-ocean-500 hover:bg-ocean-600 rounded-xl transition-colors shadow-sm"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === link.id
                  ? 'bg-ocean-50 text-ocean-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNav('post')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-ocean-600 border-2 border-ocean-200 rounded-xl"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publier une annonce
                </button>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="w-full py-3 text-sm font-medium text-gray-700 hover:text-ocean-600"
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full py-3 text-sm font-medium text-gray-700 hover:text-ocean-600"
                >
                  Mon profil
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full py-3 text-sm font-medium text-gray-700 hover:text-ocean-600"
                  >
                    Administration
                  </button>
                )}
                <button
                  onClick={onSignOut}
                  className="w-full py-3 text-sm font-medium text-red-600"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="w-full py-3 text-sm font-semibold text-white bg-ocean-500 rounded-xl"
                >
                  Connexion / Inscription
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
