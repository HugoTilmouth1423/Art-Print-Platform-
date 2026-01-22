// 15 preset palettes with coastal, clean, editorial tones
// Each palette has exactly 5 colors: [background, ground, shading, highlight, accent]

export interface PresetPalette {
  id: string
  name: string
  colors: string[]
}

export const PRESET_PALETTES: PresetPalette[] = [
  {
    id: 'cornish-coast',
    name: 'Cornish Coast',
    colors: ['#E8F4F8', '#4A90A4', '#2C5F6E', '#89B4C4', '#F5F5F0'],
  },
  {
    id: 'dune-driftwood',
    name: 'Dune & Driftwood',
    colors: ['#F5F0E6', '#C4A77D', '#8B7355', '#DED4C1', '#9C8B7A'],
  },
  {
    id: 'morning-mist',
    name: 'Morning Mist',
    colors: ['#F0F4F5', '#A8B5BD', '#6B7C85', '#C9D3D8', '#E2E8EB'],
  },
  {
    id: 'harbour-twilight',
    name: 'Harbour Twilight',
    colors: ['#2D3B4A', '#5C7085', '#8499AD', '#1F2832', '#A4B5C4'],
  },
  {
    id: 'sea-glass',
    name: 'Sea Glass',
    colors: ['#E5F0ED', '#7AB8A8', '#4A8B7A', '#A8D4C8', '#C2E2D9'],
  },
  {
    id: 'sandy-shores',
    name: 'Sandy Shores',
    colors: ['#FDF8F3', '#D4C4B0', '#A69580', '#E8DED0', '#C5B5A0'],
  },
  {
    id: 'stormy-seas',
    name: 'Stormy Seas',
    colors: ['#3A4A5C', '#5E7082', '#8294A4', '#283644', '#9AACBC'],
  },
  {
    id: 'cliff-walk',
    name: 'Cliff Walk',
    colors: ['#F4F2EF', '#8B9A7A', '#5C6B4C', '#B8C4A8', '#D0D8C5'],
  },
  {
    id: 'tide-pools',
    name: 'Tide Pools',
    colors: ['#E8EEF2', '#6A9CAF', '#3D6F82', '#9CBDCC', '#C5D8E2'],
  },
  {
    id: 'pebble-beach',
    name: 'Pebble Beach',
    colors: ['#EEECEA', '#9A9590', '#6B6560', '#C5C0BB', '#D8D4CF'],
  },
  {
    id: 'sunset-cove',
    name: 'Sunset Cove',
    colors: ['#FAF0E6', '#D4A574', '#A87C4F', '#E8C9A8', '#C9A882'],
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    colors: ['#F8F8F8', '#B8C4D0', '#6B7D8C', '#DCE4EC', '#8A9CAC'],
  },
  {
    id: 'rock-pools',
    name: 'Rock Pools',
    colors: ['#E6EBE8', '#6A8A7A', '#3C5C4C', '#98B4A4', '#B8CCC0'],
  },
  {
    id: 'estuary',
    name: 'Estuary',
    colors: ['#F2EEE8', '#8C9B8A', '#5C6B5A', '#B8C4B6', '#D0D8CC'],
  },
  {
    id: 'moonlit-bay',
    name: 'Moonlit Bay',
    colors: ['#1E2832', '#4A5A6A', '#7888A0', '#0F1820', '#8898B0'],
  },
]

// Generate a random color
function randomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  const saturation = Math.floor(Math.random() * 30) + 20 // 20-50% saturation for muted tones
  const lightness = Math.floor(Math.random() * 40) + 30 // 30-70% lightness
  return hslToHex(hue, saturation, lightness)
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Generate a random palette with optional locked colors
export function generateRandomPalette(
  lockedColors: (string | null)[] = [null, null, null, null, null],
): string[] {
  return lockedColors.map((locked) =>
    locked !== null ? locked : randomColor(),
  )
}

// Get a preset palette by ID
export function getPresetPalette(id: string): PresetPalette | undefined {
  return PRESET_PALETTES.find((p) => p.id === id)
}
