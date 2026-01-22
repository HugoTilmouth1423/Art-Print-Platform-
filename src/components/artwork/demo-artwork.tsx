'use client'

import { useState, useMemo } from 'react'
import { ArtworkCanvas } from './artwork-canvas'
import { PalettePicker } from './palette-picker'
import { PRESET_PALETTES } from '@/constants/palettes'

// Demo artwork configurations - these would be actual PNG layer URLs in production
// Using placeholder SVG data URIs that create abstract coastal scenes
const DEMO_ARTWORKS = [
  {
    id: 'coastal-cliffs',
    name: 'Coastal Cliffs',
    layers: [
      '/demo/coastal-cliffs/layer_1.png',
      '/demo/coastal-cliffs/layer_2.png',
      '/demo/coastal-cliffs/layer_3.png',
      '/demo/coastal-cliffs/layer_4.png',
    ],
  },
  {
    id: 'harbour-view',
    name: 'Harbour View',
    layers: [
      '/demo/harbour-view/layer_1.png',
      '/demo/harbour-view/layer_2.png',
      '/demo/harbour-view/layer_3.png',
      '/demo/harbour-view/layer_4.png',
    ],
  },
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    layers: [
      '/demo/beach-sunset/layer_1.png',
      '/demo/beach-sunset/layer_2.png',
      '/demo/beach-sunset/layer_3.png',
      '/demo/beach-sunset/layer_4.png',
    ],
  },
]

// Generate placeholder layer as data URI for development
function createPlaceholderLayer(
  width: number,
  height: number,
  type: 'background' | 'ground' | 'shading' | 'highlight',
): string {
  let svgContent = ''

  switch (type) {
    case 'background':
      // Full background rectangle
      svgContent = `<rect width="${width}" height="${height}" fill="white"/>`
      break
    case 'ground':
      // Landscape shapes
      svgContent = `
        <path d="M0,${height * 0.6} Q${width * 0.3},${height * 0.45} ${width * 0.5},${height * 0.55} T${width},${height * 0.5} L${width},${height} L0,${height} Z" fill="white"/>
        <ellipse cx="${width * 0.2}" cy="${height * 0.3}" rx="${width * 0.15}" ry="${height * 0.08}" fill="white" opacity="0.8"/>
        <ellipse cx="${width * 0.7}" cy="${height * 0.25}" rx="${width * 0.12}" ry="${height * 0.06}" fill="white" opacity="0.6"/>
      `
      break
    case 'shading':
      // Shadow areas
      svgContent = `
        <path d="M${width * 0.1},${height * 0.65} Q${width * 0.4},${height * 0.5} ${width * 0.6},${height * 0.6} T${width * 0.9},${height * 0.55} L${width * 0.9},${height * 0.75} Q${width * 0.5},${height * 0.85} ${width * 0.1},${height * 0.75} Z" fill="white" opacity="0.7"/>
        <ellipse cx="${width * 0.3}" cy="${height * 0.4}" rx="${width * 0.1}" ry="${height * 0.04}" fill="white" opacity="0.5"/>
      `
      break
    case 'highlight':
      // Highlight points
      svgContent = `
        <circle cx="${width * 0.5}" cy="${height * 0.2}" r="${width * 0.05}" fill="white" opacity="0.9"/>
        <ellipse cx="${width * 0.25}" cy="${height * 0.35}" rx="${width * 0.03}" ry="${height * 0.015}" fill="white" opacity="0.7"/>
        <ellipse cx="${width * 0.75}" cy="${height * 0.55}" rx="${width * 0.04}" ry="${height * 0.02}" fill="white" opacity="0.6"/>
        <path d="M0,${height * 0.95} Q${width * 0.5},${height * 0.88} ${width},${height * 0.95} L${width},${height} L0,${height} Z" fill="white" opacity="0.4"/>
      `
      break
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${svgContent}
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
}

// Create placeholder layers for development
const PLACEHOLDER_LAYERS = {
  background: createPlaceholderLayer(600, 800, 'background'),
  ground: createPlaceholderLayer(600, 800, 'ground'),
  shading: createPlaceholderLayer(600, 800, 'shading'),
  highlight: createPlaceholderLayer(600, 800, 'highlight'),
}

interface DemoArtworkProps {
  className?: string
}

export function DemoArtwork({ className = '' }: DemoArtworkProps) {
  const [selectedArtwork] = useState(0)
  const [colors, setColors] = useState<string[]>(PRESET_PALETTES[0].colors)
  const [showTexture, setShowTexture] = useState(false)

  // Use placeholder layers for development - these would be actual layer URLs in production
  const layers = useMemo(() => {
    // For demo purposes, use generated placeholder layers
    // In production, these would come from DEMO_ARTWORKS[selectedArtwork].layers
    const layerTypes: Array<'background' | 'ground' | 'shading' | 'highlight'> =
      ['background', 'ground', 'shading', 'highlight']

    return layerTypes.map((type, index) => ({
      url: PLACEHOLDER_LAYERS[type],
      color: colors[index],
    }))
  }, [colors])

  return (
    <div className={`${className}`}>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        {/* Canvas display */}
        <div className="relative">
          <div className="bg-card border-border rounded-xl border p-6 shadow-lg">
            <ArtworkCanvas
              layers={layers}
              width={480}
              height={640}
              showTexture={showTexture}
              className="mx-auto overflow-hidden rounded-lg shadow-md"
            />
          </div>

          {/* Artwork selector - for when we have multiple demos */}
          <div className="mt-4 flex justify-center gap-2">
            {DEMO_ARTWORKS.map((artwork, index) => (
              <button
                key={artwork.id}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  selectedArtwork === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                disabled // Disabled until we have actual demo artwork
                title={artwork.name}
              >
                {artwork.name}
              </button>
            ))}
          </div>
        </div>

        {/* Palette picker */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 font-serif text-2xl">See the magic</h2>
            <p className="text-muted-foreground">
              Choose a colour palette and watch the artwork transform instantly.
              Each palette brings a different mood to the same piece.
            </p>
          </div>

          <PalettePicker
            colors={colors}
            onColorsChange={setColors}
            showGenerator={true}
          />

          {/* Texture toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTexture(!showTexture)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showTexture ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showTexture ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-muted-foreground text-sm">
              Paper texture overlay
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
