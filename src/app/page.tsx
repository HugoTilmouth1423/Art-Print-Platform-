import { Header, Footer } from '@/components/layout'
import {
  HeroSection,
  DemoSection,
  HowItWorksSection,
  GallerySection,
  CTASection,
} from '@/components/home'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <DemoSection />
        <HowItWorksSection />
        <GallerySection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
