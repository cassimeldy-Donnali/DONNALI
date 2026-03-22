import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { StripeProduct } from '../../stripe-config'

interface CheckoutButtonProps {
  product: StripeProduct
  successUrl?: string
  cancelUrl?: string
  className?: string
}

export function CheckoutButton({ 
  product, 
  successUrl = `${window.location.origin}/success`,
  cancelUrl = window.location.href,
  className 
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession()

      if (sessionError || !session) {
        setError('You must be logged in to make a purchase')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode: product.mode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}
      
      <Button
        onClick={handleCheckout}
        loading={loading}
        className={className}
      >
        {loading ? 'Processing...' : `Purchase ${product.name}`}
      </Button>
    </div>
  )
}