'use client'

import { FrameType, FRAME_LABELS } from '@/types'
import { PRICING, formatPrice } from '@/constants/pricing'

interface FrameSelectorProps {
  selected: FrameType
  onSelect: (frame: FrameType) => void
}

const FRAMES: FrameType[] = ['none', 'black', 'white', 'natural']

// Visual representation colors for each frame type
const FRAME_COLORS: Record<FrameType, string> = {
  none: 'transparent',
  black: '#1a1a1a',
  white: '#ffffff',
  natural: '#c4a77d',
}

export function FrameSelector({ selected, onSelect }: FrameSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Frame</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FRAMES.map((frame) => {
          const price = PRICING.frame[frame]
          const isSelected = selected === frame
          const frameColor = FRAME_COLORS[frame]

          return (
            <button
              key={frame}
              onClick={() => onSelect(frame)}
              className={`relative rounded-lg border-2 p-4 text-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Frame preview */}
              <div className="relative mx-auto mb-3 h-20 w-16">
                {frame !== 'none' ? (
                  <div
                    className="absolute inset-0 rounded-sm"
                    style={{
                      backgroundColor: frameColor,
                      padding: '4px',
                    }}
                  >
                    <div className="bg-muted h-full w-full rounded-[2px]" />
                  </div>
                ) : (
                  <div className="bg-muted border-border h-full w-full rounded-sm border border-dashed" />
                )}
              </div>

              {/* Frame label */}
              <div className="text-sm font-medium">{FRAME_LABELS[frame]}</div>

              {/* Price */}
              <div className="text-muted-foreground mt-1 text-xs">
                {price === 0 ? 'Included' : `+${formatPrice(price)}`}
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
