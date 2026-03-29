import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS, type StripeProduct } from '../stripe-config';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to make a purchase');
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}?payment=success`,
          cancel_url: window.location.href,
          mode: 'payment',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getProducts = () => Object.values(STRIPE_PRODUCTS);

  const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
    return Object.values(STRIPE_PRODUCTS).find(product => product.priceId === priceId);
  };

  return {
    createCheckoutSession,
    getProducts,
    getProductByPriceId,
    loading,
    error,
  };
};