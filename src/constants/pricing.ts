import type { PrintSize, FrameType, PriceConfig } from '@/types'

// Prices in pence (GBP)
export const PRICING: PriceConfig = {
  size: {
    A4: 4500, // £45
    A3: 6500, // £65
    A2: 8500, // £85
    A1: 12000, // £120
  },
  frame: {
    none: 0,
    black: 3500, // £35
    white: 3500, // £35
    natural: 4000, // £40
  },
}

// Size dimensions in mm for display
export const SIZE_DIMENSIONS: Record<
  PrintSize,
  { width: number; height: number }
> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  A1: { width: 594, height: 841 },
}

// Calculate total price
export function calculatePrice(size: PrintSize, frame: FrameType): number {
  return PRICING.size[size] + PRICING.frame[frame]
}

// Format price in pounds
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

// Prodigi SKUs based on size and frame
// TODO: Replace with actual Prodigi SKUs when available
export const PRODIGI_SKUS: Record<PrintSize, Record<FrameType, string>> = {
  A4: {
    none: 'GLOBAL-FAP-A4',
    black: 'GLOBAL-FAP-A4-BLK',
    white: 'GLOBAL-FAP-A4-WHT',
    natural: 'GLOBAL-FAP-A4-NAT',
  },
  A3: {
    none: 'GLOBAL-FAP-A3',
    black: 'GLOBAL-FAP-A3-BLK',
    white: 'GLOBAL-FAP-A3-WHT',
    natural: 'GLOBAL-FAP-A3-NAT',
  },
  A2: {
    none: 'GLOBAL-FAP-A2',
    black: 'GLOBAL-FAP-A2-BLK',
    white: 'GLOBAL-FAP-A2-WHT',
    natural: 'GLOBAL-FAP-A2-NAT',
  },
  A1: {
    none: 'GLOBAL-FAP-A1',
    black: 'GLOBAL-FAP-A1-BLK',
    white: 'GLOBAL-FAP-A1-WHT',
    natural: 'GLOBAL-FAP-A1-NAT',
  },
}
