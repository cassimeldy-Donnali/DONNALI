import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingFilters } from '../components/listings/ListingFilters';
import { ContactModal } from '../components/listings/ContactModal';
import { SearchBar } from '../components/home/SearchBar';
import { ListingSkeleton } from '../components/listings/ListingSkeleton';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../components/ui/Toast';
import type { Listing, SearchFilters } from '../types';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingsPageProps {
  user: User | null;
  onAuthRequired: () => void;
  initialFilters?: Partial<SearchFilters>;
}

const DEFAULT_FILTERS: SearchFilters = {
  departure: '',
  destination: '',
  date: '',
  minKilos: 0,
  maxPrice: 999,
};

const PAGE_SIZE = 12;

export function ListingsPage({ user, onAuthRequired, initialFilters }: ListingsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const filtersFromUrl: Partial<SearchFilters> = {
    departure: searchParams.get('departure') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    minKilos: searchParams.get('minKilos') ? parseInt(searchParams.get('minKilos')!) : 0,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 999,
  };

  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS, ...filtersFromUrl, ...initialFilters });
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { favoriteIds, toggle: toggleFavorite } = useFavorites(user);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const updateFiltersAndUrl = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const params: Record<string, string> = {};
    if (newFilters.departure) params.departure = newFilters.departure;
    if (newFilters.destination) params.destination = newFilters.destination;
    if (newFilters.date) params.date = newFilters.date;
    if (newFilters.minKilos > 0) params.minKilos = String(newFilters.minKilos);
    if (newFilters.maxPrice < 999) params.maxPrice = String(newFilters.maxPrice);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('listings')
        .select('*, profiles(full_name, avatar_url, id_verified, identity_verified, flight_verified)', { count: 'exact' })
        .eq('is_active', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filters.departure) query = query.eq('departure', filters.departure);
      if (filters.destination) query = query.eq('destination', filters.destination);
      if (filters.date) query = query.eq('flight_date', filters.date);
      if (filters.minKilos > 0) query = query.gte('kilos_available', filters.minKilos);
      if (filters.maxPrice < 999) query = query.lte('price_per_kilo', filters.maxPrice);

      const { data, count } = await query;
      setListings((data as Listing[]) ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    })();
  }, [filters, currentPage]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('unlocked_contacts')
        .select('listing_id')
        .eq('buyer_id', user.id);
      if (data) setUnlockedIds(new Set(data.map((r) => r.listing_id)));
    })();
  }, [user]);

  const handleUnlockSuccess = (listingId: string) => {
    setUnlockedIds((prev) => new Set([...prev, listingId]));
  };

  const handleSearch = (f: SearchFilters) => {
    updateFiltersAndUrl(f);
    setShowFilters(false);
  };

  const handleToggleFavorite = async (listingId: string): Promise<boolean> => {
    if (!user) {
      onAuthRequired();
      return favoriteIds.has(listingId);
    }
    const newState = await toggleFavorite(listingId);
    if (newState) {
      success('Annonce ajoutée aux favoris.');
    } else {
      toastError('Annonce retirée des favoris.');
    }
    return newState;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-5">
            Annonces de voyageurs
          </h1>
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-sm text-gray-600 font-medium">
            {totalCount} annonce{totalCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 lg:hidden">
            <ListingFilters filters={filters} onChange={updateFiltersAndUrl} total={totalCount} />
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <ListingFilters filters={filters} onChange={updateFiltersAndUrl} total={totalCount} />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <ListingSkeleton key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-ocean-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Essayez de modifier vos critères de recherche ou revenez plus tard.
                </p>
                <button
                  onClick={() => updateFiltersAndUrl(DEFAULT_FILTERS)}
                  className="mt-4 px-5 py-2 bg-ocean-500 text-white text-sm font-semibold rounded-xl hover:bg-ocean-600 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isUnlocked={unlockedIds.has(listing.id)}
                      isFavorite={favoriteIds.has(listing.id)}
                      onUnlock={setSelectedListing}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const isEllipsis = totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages;
                        const isPrevEllipsis = page === currentPage - 3 && currentPage > 4;
                        const isNextEllipsis = page === currentPage + 3 && currentPage < totalPages - 3;

                        if (isEllipsis && !isPrevEllipsis && !isNextEllipsis) return null;

                        if (isPrevEllipsis || isNextEllipsis) {
                          return (
                            <span key={page} className="px-2 text-gray-400 text-sm">…</span>
                          );
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-xl transition-colors ${
                              page === currentPage
                                ? 'bg-ocean-500 text-white'
                                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {totalCount > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Page {currentPage} sur {totalPages} · {totalCount} annonce{totalCount !== 1 ? 's' : ''} au total
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {selectedListing && (
        <ContactModal
          listing={selectedListing}
          user={user}
          onClose={() => setSelectedListing(null)}
          onSuccess={handleUnlockSuccess}
          onAuthRequired={() => {
            setSelectedListing(null);
            onAuthRequired();
          }}
        />
      )}
    </div>
  );
}
