import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { AuthModal } from './components/auth/AuthModal';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { ToastProvider } from './components/ui/Toast';
import { CookieBanner } from './components/ui/CookieBanner';
import { PaymentResultBanner } from './components/stripe/PaymentResultBanner';
import { HomePage } from './pages/HomePage';
import { useAuth } from './hooks/useAuth';
import type { SearchFilters } from './types';

const ListingsPage = lazy(() => import('./pages/ListingsPage').then((m) => ({ default: m.ListingsPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PostListingPage = lazy(() => import('./pages/PostListingPage').then((m) => ({ default: m.PostListingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const ListingDetail = lazy(() => import('./pages/ListingDetail').then((m) => ({ default: m.ListingDetail })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const CGUPage = lazy(() => import('./pages/CGUPage').then((m) => ({ default: m.CGUPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const EmailPreviewPage = lazy(() => import('./pages/EmailPreviewPage').then((m) => ({ default: m.EmailPreviewPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
    </div>
  );
}

type Page = 'home' | 'listings' | 'dashboard' | 'post' | 'about' | 'faq' | 'legal' | 'cgu' | 'privacy' | 'contact' | 'profile' | 'admin';

function MainApp() {
  const { user, loading, signOut, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [navTarget, setNavTarget] = useState<{ page: Page; key: number }>({ page: 'home', key: 0 });
  const [displayedPage, setDisplayedPage] = useState<Page>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialFilters, setInitialFilters] = useState<Partial<SearchFilters>>({})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleNavigate = (target: string) => {
    const valid: Page[] = ['home', 'listings', 'dashboard', 'post', 'about', 'faq', 'legal', 'cgu', 'privacy', 'contact', 'profile', 'admin'];
    if (valid.includes(target as Page)) {
      setNavTarget(prev => ({ page: target as Page, key: prev.key + 1 }));
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setInitialFilters(filters);
    setNavTarget(prev => ({ page: 'listings', key: prev.key + 1 }));
  };

  const handleAuthRequired = () => {
    setAuthModalOpen(true);
  };

  const renderPage = () => {
    switch (displayedPage) {
      case 'home':
        return <HomePage onSearch={handleSearch} onNavigate={handleNavigate} />;
      case 'listings':
        return (
          <ListingsPage
            user={user}
            onAuthRequired={handleAuthRequired}
            initialFilters={initialFilters}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            user={user}
            onAuthRequired={handleAuthRequired}
            onNavigate={handleNavigate}
          />
        );
      case 'post':
        return (
          <PostListingPage
            user={user}
            onAuthRequired={handleAuthRequired}
            onNavigate={handleNavigate}
          />
        );
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'faq':
        return <FAQPage onNavigate={handleNavigate} />;
      case 'legal':
        return <LegalPage onNavigate={handleNavigate} />;
      case 'cgu':
        return <CGUPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage user={user} onAuthRequired={handleAuthRequired} />;
      case 'admin':
        return <AdminPage user={user} onAuthRequired={handleAuthRequired} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={displayedPage}
        onNavigate={handleNavigate}
        user={user}
        onAuthClick={handleAuthRequired}
        onSignOut={signOut}
      />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <PageTransition
            targetPage={`${navTarget.page}:${navTarget.key}`}
            onSwap={() => setDisplayedPage(navTarget.page)}
          >
            {renderPage()}
          </PageTransition>
        </Suspense>
      </main>
      <Footer onNavigate={handleNavigate} />
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}
      {isPasswordRecovery && (
        <ResetPasswordModal onClose={clearPasswordRecovery} />
      )}
      <PaymentResultBanner onNavigate={handleNavigate} />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/listing/:id" element={<Suspense fallback={<PageLoader />}><ListingDetail /></Suspense>} />
          <Route path="/email-preview" element={<Suspense fallback={<PageLoader />}><EmailPreviewPage /></Suspense>} />
          <Route path="/404" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
