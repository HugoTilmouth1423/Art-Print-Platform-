'use client'

import { PrintSize, FrameType, FRAME_LABELS } from '@/types'
import {
  PRICING,
  formatPrice,
  SIZE_DIMENSIONS,
  calculatePrice,
} from '@/constants/pricing'

interface OrderSummaryProps {
  size: PrintSize
  frame: FrameType
  email: string
  onEmailChange: (email: string) => void
  isValid: boolean
  onCheckout: () => void
  isLoading?: boolean
}

export function OrderSummary({
  size,
  frame,
  email,
  onEmailChange,
  isValid,
  onCheckout,
  isLoading = false,
}: OrderSummaryProps) {
  const sizePrice = PRICING.size[size]
  const framePrice = PRICING.frame[frame]
  const totalPrice = calculatePrice(size, frame)
  const dimensions = SIZE_DIMENSIONS[size]

  return (
    <div className="bg-card border-border sticky top-24 rounded-xl border p-6">
      <h3 className="mb-4 font-serif text-lg font-semibold">Order Summary</h3>

      <div className="space-y-3 text-sm">
        {/* Size */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {size} Print ({dimensions.width}×{dimensions.height}mm)
          </span>
          <span>{formatPrice(sizePrice)}</span>
        </div>

        {/* Frame */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{FRAME_LABELS[frame]}</span>
          <span>{framePrice === 0 ? 'Included' : formatPrice(framePrice)}</span>
        </div>

        {/* Divider */}
        <div className="border-border mt-3 border-t pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="border-border mt-6 border-t pt-6">
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          WHAT&apos;S INCLUDED
        </p>
        <ul className="text-muted-foreground space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Hand-drawn artwork
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Proof approval before print
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            One revision included
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Premium paper print
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="text-primary h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            UK delivery
          </li>
        </ul>
      </div>

      {/* Email input */}
      <div className="border-border mt-6 border-t pt-6">
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Your email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          We&apos;ll send your proof and updates here
        </p>
      </div>

      {/* Checkout button */}
      <button
        onClick={onCheckout}
        disabled={!isValid || isLoading}
        className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
          isValid && !isLoading
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
      </button>

      {/* Terms */}
      <p className="text-muted-foreground mt-4 text-center text-xs">
        By ordering you agree to our terms of service. Orders are
        non-refundable.
      </p>
    </div>
  )
}
