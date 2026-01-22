'use client'

import { PrintSize } from '@/types'
import { PRICING, SIZE_DIMENSIONS, formatPrice } from '@/constants/pricing'

interface SizeSelectorProps {
  selected: PrintSize
  onSelect: (size: PrintSize) => void
}

const SIZES: PrintSize[] = ['A4', 'A3', 'A2', 'A1']

export function SizeSelector({ selected, onSelect }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Print Size</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SIZES.map((size) => {
          const dimensions = SIZE_DIMENSIONS[size]
          const price = PRICING.size[size]
          const isSelected = selected === size

          return (
            <button
              key={size}
              onClick={() => onSelect(size)}
              className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Size label */}
              <div className="text-lg font-semibold">{size}</div>

              {/* Dimensions */}
              <div className="text-muted-foreground mt-1 text-xs">
                {dimensions.width} × {dimensions.height}mm
              </div>

              {/* Price */}
              <div className="text-primary mt-2 text-sm font-medium">
                {formatPrice(price)}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="bg-primary absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full">
                  <svg
                    className="text-primary-foreground h-2.5 w-2.5"
                    fill="currentColor"
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
