import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  if (event.type === 'identity.verification_session.verified') {
    await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
    return;
  }

  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        const session = stripeData as Stripe.Checkout.Session;
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          metadata: sessionMetadata,
        } = session;

        let receipt_url: string | null = null;
        try {
          if (payment_intent && typeof payment_intent === 'string') {
            const pi = await stripe.paymentIntents.retrieve(payment_intent, {
              expand: ['latest_charge'],
            });
            const charge = pi.latest_charge as Stripe.Charge | null;
            receipt_url = charge?.receipt_url ?? null;
          }
        } catch (receiptErr) {
          console.warn('[stripe-webhook] Could not retrieve receipt_url:', receiptErr);
        }

        console.info(`[stripe-webhook] Processing one-time payment — session: ${checkout_session_id}, payment_intent: ${payment_intent}`);
        console.info(`[stripe-webhook] Session metadata:`, JSON.stringify(sessionMetadata));

        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });

        if (orderError) {
          console.error('[stripe-webhook] Error inserting stripe_orders:', orderError);
        } else {
          console.info(`[stripe-webhook] stripe_orders inserted for session: ${checkout_session_id}`);
        }

        const listing_id = sessionMetadata?.listing_id;
        const buyer_id = sessionMetadata?.buyer_id;

        if (listing_id && buyer_id) {
          console.info(`[stripe-webhook] Inserting unlocked_contacts — buyer: ${buyer_id}, listing: ${listing_id}`);

          const { data: unlockData, error: unlockError } = await supabase
            .from('unlocked_contacts')
            .insert({
              buyer_id,
              listing_id,
              payment_intent_id: typeof payment_intent === 'string' ? payment_intent : String(payment_intent),
              amount_paid: amount_total ?? 299,
              receipt_url,
            })
            .select()
            .maybeSingle();

          if (unlockError) {
            console.error('[stripe-webhook] Error inserting unlocked_contacts:', unlockError);
          } else {
            console.info('[stripe-webhook] unlocked_contacts inserted:', JSON.stringify(unlockData));
            try {
              const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-contact-unlocked`;
              await fetch(notifyUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                },
                body: JSON.stringify({ listing_id, buyer_id }),
              });
              console.info('[stripe-webhook] Notification sent for listing:', listing_id);
            } catch (notifyErr) {
              console.error('[stripe-webhook] Failed to send notification:', notifyErr);
            }
          }
        } else {
          console.warn('[stripe-webhook] No listing_id or buyer_id in metadata — skipping unlocked_contacts insert');
        }
      } catch (error) {
        console.error('[stripe-webhook] Error processing one-time payment:', error);
      }
    }
  }
}

async function handleIdentityVerified(session: Stripe.Identity.VerificationSession) {
  const listing_id = session.metadata?.listing_id;
  const user_id = session.metadata?.user_id;

  if (!listing_id) {
    console.warn('[stripe-webhook] identity.verified — no listing_id in metadata, skipping');
    return;
  }

  console.info(`[stripe-webhook] Identity verified for listing ${listing_id}, user ${user_id}`);

  const { error } = await supabase
    .from('listings')
    .update({
      is_published: true,
      identity_verified_at: new Date().toISOString(),
    })
    .eq('id', listing_id);

  if (error) {
    console.error('[stripe-webhook] Error publishing listing after identity verification:', error);
  } else {
    console.info(`[stripe-webhook] Listing ${listing_id} published successfully`);
  }

  if (user_id) {
    await supabase
      .from('profiles')
      .update({ identity_verified: true })
      .eq('id', user_id);
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}