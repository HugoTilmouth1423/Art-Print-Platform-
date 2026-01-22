import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { formatPrice, PRICING } from '@/constants/pricing'

export function CTASection() {
  const startingPrice = PRICING.size.A4 // Cheapest option

  return (
    <section className="bg-primary/5 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold sm:text-4xl">
            Ready to create yours?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Starting from {formatPrice(startingPrice)} for an A4 print. Each
            artwork is hand-drawn, exclusive to you, and printed on premium
            paper.
          </p>

          <Button asChild size="lg" className="gap-2 text-base">
            <Link href="/create">
              Start Your Commission
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="mt-8 grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="mb-1 font-medium">Proof approval</div>
              <p className="text-muted-foreground">
                See your artwork before printing
              </p>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="mb-1 font-medium">One revision included</div>
              <p className="text-muted-foreground">Request changes if needed</p>
            </div>
            <div className="bg-card border-border rounded-lg border p-4">
              <div className="mb-1 font-medium">UK delivery</div>
              <p className="text-muted-foreground">
                Shipped securely to your door
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
