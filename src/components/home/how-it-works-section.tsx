import { Upload, Palette, Package, Home } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: 'Send your photo',
    description:
      'Upload a photo of a place you love — a beach, a hillside, a favourite view. Choose your print size and frame.',
  },
  {
    icon: Palette,
    title: 'Choose your palette',
    description:
      'Select from our curated coastal palettes or create your own. Lock colours you love and regenerate the rest.',
  },
  {
    icon: Package,
    title: 'We create & print',
    description:
      "Holly hand-draws your artwork on iPad. Once you approve the proof, it's printed on premium paper and framed in the UK.",
  },
  {
    icon: Home,
    title: 'Delivered to you',
    description:
      'Your finished artwork arrives at your door, ready to hang. A timeless piece celebrating a place you love.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/30 scroll-mt-16 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-semibold sm:text-4xl">
            How it works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg">
            From photo to finished artwork in four simple steps
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="bg-border absolute top-8 left-1/2 hidden h-px w-full lg:block" />
              )}

              <div className="bg-card border-border relative rounded-xl border p-6 shadow-sm">
                {/* Step number */}
                <div className="bg-primary text-primary-foreground absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  {index + 1}
                </div>

                <div className="mb-4">
                  <step.icon className="text-primary h-8 w-8" />
                </div>

                <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
