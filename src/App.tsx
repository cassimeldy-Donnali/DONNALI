import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { ToastProvider } from './components/ui/Toast';
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

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
    </div>
  );
}

type Page = 'home' | 'listings' | 'dashboard' | 'post' | 'about' | 'faq' | 'legal' | 'cgu' | 'privacy' | 'contact';

function MainApp() {
  const { user, loading, signOut, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialFilters, setInitialFilters] = useState<Partial<SearchFilters>>({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleNavigate = (target: string) => {
    const valid: Page[] = ['home', 'listings', 'dashboard', 'post', 'about', 'faq', 'legal', 'cgu', 'privacy', 'contact'];
    if (valid.includes(target as Page)) {
      setPage(target as Page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setInitialFilters(filters);
    setPage('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthRequired = () => {
    setAuthModalOpen(true);
  };

  const renderPage = () => {
    switch (page) {
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
      default:
        return <HomePage onSearch={handleSearch} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={page}
        onNavigate={handleNavigate}
        user={user}
        onAuthClick={handleAuthRequired}
        onSignOut={signOut}
      />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
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
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
