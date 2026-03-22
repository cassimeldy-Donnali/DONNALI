import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching subscription:', error);
          setError('Failed to fetch subscription data');
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchSubscription();
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const hasActiveSubscription = subscription?.subscription_status === 'active';

  const getSubscriptionPlanName = () => {
    if (!subscription?.price_id) return null;
    
    // Map price IDs to plan names - you can extend this based on your products
    const planNames: Record<string, string> = {
      'price_1TBAF8GyEeDenYZHX5tCCgOF': 'TEST 2',
      'price_1STeqXGyEeDenYZH2LWD54mB': 'DONNALI CONTACT',
    };

    return planNames[subscription.price_id] || 'Unknown Plan';
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    getSubscriptionPlanName,
  };
};