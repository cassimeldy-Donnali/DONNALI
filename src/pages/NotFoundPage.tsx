import { Plane, Leaf, Home, ArrowLeft, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate?: (page: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const handleHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-eco-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-ocean-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-eco-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-amber-100/20 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-ocean-500 rounded-xl" />
            <Plane className="relative w-5 h-5 text-white -rotate-45" />
            <Leaf className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-eco-500 fill-eco-500" />
          </div>
          <span className="font-poppins font-bold text-2xl tracking-tight text-ocean-800">DONNALI</span>
        </div>

        <div className="relative mb-8">
          <div className="text-[9rem] font-poppins font-black text-ocean-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-ocean-100">
              <Compass className="w-12 h-12 text-ocean-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>

        <h1 className="font-poppins font-bold text-2xl text-gray-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Cette page n&apos;existe pas ou a ete deplacee. Peut-etre que le vol a deja ete effectue ?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-ocean-200 text-ocean-600 font-semibold rounded-xl hover:bg-ocean-50 hover:border-ocean-400 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={handleHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-ocean-500 hover:bg-ocean-600 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
          >
            <Home className="w-4 h-4" />
            Accueil
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span>La Reunion</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Mayotte</span>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Paris</span>
        </div>
      </div>
    </div>
  );
}
