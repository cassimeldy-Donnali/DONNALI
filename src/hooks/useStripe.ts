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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
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