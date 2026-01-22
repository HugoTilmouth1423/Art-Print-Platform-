'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/layout'
import {
  ImageUpload,
  SizeSelector,
  FrameSelector,
  OrderSummary,
} from '@/components/create'
import { PalettePicker } from '@/components/artwork'
import { PrintSize, FrameType } from '@/types'
import { PRESET_PALETTES } from '@/constants/palettes'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreatePage() {
  const router = useRouter()

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageConfirmed, setImageConfirmed] = useState(false)
  const [size, setSize] = useState<PrintSize>('A3')
  const [frame, setFrame] = useState<FrameType>('none')
  const [colors, setColors] = useState<string[]>(PRESET_PALETTES[0].colors)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle image selection
  const handleImageSelect = useCallback((file: File, previewUrl: string) => {
    setImageFile(file)
    setImagePreview(previewUrl)
    setImageConfirmed(false)
  }, [])

  const handleImageClear = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    setImageConfirmed(false)
  }, [imagePreview])

  // Validation
  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [email])

  const isFormValid = useMemo(() => {
    return imageFile !== null && imageConfirmed && isEmailValid
  }, [imageFile, imageConfirmed, isEmailValid])

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (!isFormValid || !imageFile) return

    setIsLoading(true)

    try {
      // First, upload the image to storage
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('email', email)
      formData.append('size', size)
      formData.append('frame', frame)
      formData.append('colors', JSON.stringify(colors))

      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // TODO: Show error toast
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isFormValid, imageFile, email, size, frame, colors])

  // Current step for visual indicator
  const currentStep = useMemo(() => {
    if (!imageFile) return 1
    if (!imageConfirmed) return 1
    return 2
  }, [imageFile, imageConfirmed])

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <Header showNav={false} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="mb-2 font-serif text-3xl font-semibold sm:text-4xl">
              Create your artwork
            </h1>
            <p className="text-muted-foreground">
              Upload a photo, choose your options, and we&apos;ll create
              something beautiful.
            </p>
          </div>

          {/* Progress steps */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Upload Photo</span>
            </div>
            <div className="bg-border h-px flex-1" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Choose Options</span>
            </div>
            <div className="bg-border h-px flex-1" />
            <div className="flex items-center gap-2">
              <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium">Pay & Submit</span>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column - Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Step 1: Image upload */}
              <section className="bg-card border-border rounded-xl border p-6">
                <h2 className="mb-4 text-lg font-medium">
                  1. Upload your photo
                </h2>
                <ImageUpload
                  selectedImage={imagePreview}
                  onImageSelect={handleImageSelect}
                  onClear={handleImageClear}
                  onConfirmChange={setImageConfirmed}
                />
              </section>

              {/* Step 2: Options (only show after image confirmed) */}
              {imageConfirmed && (
                <>
                  <section className="bg-card border-border rounded-xl border p-6">
                    <h2 className="mb-4 text-lg font-medium">
                      2. Choose your print options
                    </h2>
                    <div className="space-y-6">
                      <SizeSelector selected={size} onSelect={setSize} />
                      <FrameSelector selected={frame} onSelect={setFrame} />
                    </div>
                  </section>

                  <section className="bg-card border-border rounded-xl border p-6">
                    <h2 className="mb-4 text-lg font-medium">
                      3. Select a colour palette
                    </h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                      This is your initial preference — you can adjust it when
                      you review your proof.
                    </p>
                    <PalettePicker
                      colors={colors}
                      onColorsChange={setColors}
                      showGenerator={true}
                    />
                  </section>
                </>
              )}
            </div>

            {/* Right column - Order summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                size={size}
                frame={frame}
                email={email}
                onEmailChange={setEmail}
                isValid={isFormValid}
                onCheckout={handleCheckout}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
