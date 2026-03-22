import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { Alert } from '../ui/Alert'

export function SubscriptionStatus() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    )
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <Alert type="info">
        No active subscription
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'past_due':
      case 'unpaid':
        return 'warning'
      case 'canceled':
      case 'incomplete_expired':
        return 'error'
      default:
        return 'info'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Alert type={getStatusColor(subscription.subscription_status) as any}>
      <div className="flex justify-between items-center">
        <span>
          Subscription Status: <strong>{formatStatus(subscription.subscription_status)}</strong>
        </span>
        {subscription.current_period_end && (
          <span className="text-sm">
            {subscription.cancel_at_period_end ? 'Ends' : 'Renews'}: {' '}
            {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
          </span>
        )}
      </div>
    </Alert>
  )
}