'use client'

import { DemoArtwork } from '@/components/artwork'

export function DemoSection() {
  return (
    <section id="demo" className="bg-background scroll-mt-16 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold sm:text-4xl">
            Play with colour palettes
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Every artwork can be rendered in countless colour combinations. Try
            swapping palettes below to see how the same piece transforms.
          </p>
        </div>

        <DemoArtwork className="mx-auto max-w-5xl" />
      </div>
    </section>
  )
}
