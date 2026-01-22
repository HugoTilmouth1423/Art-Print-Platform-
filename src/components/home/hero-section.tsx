import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="from-background to-muted/30 relative overflow-hidden bg-gradient-to-b py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 aspect-[2/1] w-[200%] -translate-x-1/2">
          <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-r via-transparent blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground mb-6 font-serif text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Turn a place you love into a{' '}
            <span className="text-primary">timeless artwork</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg leading-relaxed sm:text-xl">
            Send us a photo of your favourite spot — a beach, a view, a memory.
            We&apos;ll hand-draw it into a beautiful, one-of-a-kind artwork,
            printed and framed in the UK.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/create">
                Create Your Artwork
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#demo">Try the Demo</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-muted-foreground mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm">
            <span className="flex items-center gap-2">
              <svg
                className="text-primary h-5 w-5"
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
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="text-primary h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Printed in the UK
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="text-primary h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              UK-wide delivery
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
