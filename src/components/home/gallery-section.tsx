'use client'

import { useState } from 'react'
import { PRESET_PALETTES } from '@/constants/palettes'

// Gallery items - would be actual artwork images in production
// Using placeholder colored rectangles for now
const GALLERY_ITEMS = [
  {
    id: '1',
    title: 'St Ives Harbour',
    palette: 'cornish-coast',
  },
  {
    id: '2',
    title: 'Durdle Door',
    palette: 'sandy-shores',
  },
  {
    id: '3',
    title: 'Bamburgh Castle',
    palette: 'stormy-seas',
  },
  {
    id: '4',
    title: 'Seven Sisters',
    palette: 'cliff-walk',
  },
  {
    id: '5',
    title: 'Whitby Abbey',
    palette: 'harbour-twilight',
  },
  {
    id: '6',
    title: 'Padstow Estuary',
    palette: 'estuary',
  },
]

function GalleryPlaceholder({
  palette,
  title,
}: {
  palette: string
  title: string
}) {
  const paletteData =
    PRESET_PALETTES.find((p) => p.id === palette) || PRESET_PALETTES[0]

  return (
    <div className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg">
      {/* Layered color representation */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: paletteData.colors[0] }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `linear-gradient(180deg, transparent 30%, ${paletteData.colors[1]} 60%, ${paletteData.colors[2]} 100%)`,
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0 h-1/3"
        style={{
          background: `linear-gradient(180deg, transparent, ${paletteData.colors[3]}40)`,
        }}
      />

      {/* Abstract shapes */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 133">
        <ellipse
          cx="30"
          cy="25"
          rx="15"
          ry="8"
          fill={paletteData.colors[3]}
          opacity="0.6"
        />
        <path
          d="M0,70 Q30,50 50,65 T100,60 L100,133 L0,133 Z"
          fill={paletteData.colors[1]}
          opacity="0.8"
        />
        <path
          d="M0,90 Q25,80 50,85 T100,80 L100,133 L0,133 Z"
          fill={paletteData.colors[2]}
          opacity="0.7"
        />
      </svg>

      {/* Hover overlay */}
      <div className="bg-foreground/0 group-hover:bg-foreground/10 absolute inset-0 transition-colors" />

      {/* Title */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="text-xs text-white/70">{paletteData.name}</p>
      </div>
    </div>
  )
}

export function GallerySection() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <section id="gallery" className="bg-background scroll-mt-16 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold sm:text-4xl">
            Recent commissions
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg">
            Each piece is unique — created from a customer&apos;s photo of a
            place they love
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <GalleryPlaceholder palette={item.palette} title={item.title} />
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          These are example artworks. Your commission will be completely unique.
        </p>
      </div>
    </section>
  )
}
