import React from 'react'
import { StripeProduct } from '../../stripe-config'
import { CheckoutButton } from './CheckoutButton'

interface ProductCardProps {
  product: StripeProduct
  className?: string
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="text-gray-600 mt-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            €2.99
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.mode === 'payment' ? 'One-time' : 'Subscription'}
          </span>
        </div>
        
        <CheckoutButton 
          product={product}
          className="w-full"
        />
      </div>
    </div>
  )
}