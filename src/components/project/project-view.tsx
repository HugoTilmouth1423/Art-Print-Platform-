'use client'

import { useState, useMemo } from 'react'
import { ArtworkCanvas, PalettePicker } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { PROJECT_STATUS_LABELS, FRAME_LABELS } from '@/types'
import { formatPrice, SIZE_DIMENSIONS } from '@/constants/pricing'
import { PRESET_PALETTES } from '@/constants/palettes'
import type { Project, Upload, Palette, LayerRole } from '@/types'
import {
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Palette as PaletteIcon,
} from 'lucide-react'

interface ProjectViewProps {
  project: Project
  uploads: Upload[]
  palettes: Palette[]
  isNewOrder?: boolean
}

// Status icon mapping
const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid_in_progress: <Clock className="h-5 w-5" />,
  proof_ready: <PaletteIcon className="h-5 w-5" />,
  revision_requested: <Clock className="h-5 w-5" />,
  approved: <CheckCircle className="h-5 w-5" />,
  sent_to_print: <Truck className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
}

export function ProjectView({
  project,
  uploads,
  palettes,
  isNewOrder = false,
}: ProjectViewProps) {
  // Get the selected palette or use first available or default
  const selectedPalette = palettes.find((p) => p.is_selected) || palettes[0]
  const [colors, setColors] = useState<string[]>(
    selectedPalette?.colors || PRESET_PALETTES[0].colors,
  )
  const [showTexture, setShowTexture] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRequestingRevision, setIsRequestingRevision] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')

  // Get layer uploads
  const layerUploads = useMemo(() => {
    return uploads.filter((u) => u.type === 'layer')
  }, [uploads])

  // Get reference image
  const referenceImage = useMemo(() => {
    return uploads.find((u) => u.type === 'reference')
  }, [uploads])

  // Get texture
  const textureUpload = useMemo(() => {
    return uploads.find((u) => u.type === 'texture')
  }, [uploads])

  // Build layers for canvas
  const canvasLayers = useMemo(() => {
    const layerRoleOrder: LayerRole[] = [
      'background',
      'ground',
      'shading',
      'highlight',
    ]

    return layerRoleOrder
      .map((role, index) => {
        const upload = layerUploads.find((u) => u.layer_role === role)
        if (!upload) return null
        return {
          url: upload.file_url,
          color: colors[index] || colors[0],
        }
      })
      .filter((l): l is { url: string; color: string } => l !== null)
  }, [layerUploads, colors])

  const hasArtwork = canvasLayers.length > 0
  const canRequestRevision =
    project.status === 'proof_ready' && !project.revision_used
  const canApprove = project.status === 'proof_ready'
  const dimensions = SIZE_DIMENSIONS[project.size]

  // Handle approve
  const handleApprove = async () => {
    if (
      !confirm(
        'This will send your artwork to print and cannot be changed. Are you sure?',
      )
    ) {
      return
    }

    setIsApproving(true)
    try {
      const response = await fetch(`/api/project/${project.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to approve. Please try again.')
      }
    } catch (error) {
      console.error('Approve error:', error)
      alert('Failed to approve. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  // Handle revision request
  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      alert('Please describe the changes you would like.')
      return
    }

    setIsRequestingRevision(true)
    try {
      const response = await fetch(`/api/project/${project.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: revisionNotes }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to request revision. Please try again.')
      }
    } catch (error) {
      console.error('Revision error:', error)
      alert('Failed to request revision. Please try again.')
    } finally {
      setIsRequestingRevision(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Success banner for new orders */}
      {isNewOrder && (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Thank you for your order!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                We&apos;ve received your photo and will begin creating your
                artwork soon. You&apos;ll receive an email when your proof is
                ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${
              project.status === 'shipped'
                ? 'bg-green-100 text-green-600'
                : project.status === 'proof_ready'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {STATUS_ICONS[project.status]}
          </div>
          <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
          Your Artwork
        </h1>
        <p className="text-muted-foreground mt-2">
          Order #{project.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Artwork preview */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h2 className="mb-4 text-lg font-medium">
              {hasArtwork ? 'Your Artwork Preview' : 'Artwork In Progress'}
            </h2>

            {hasArtwork ? (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <ArtworkCanvas
                    layers={canvasLayers}
                    textureUrl={textureUpload?.file_url}
                    width={480}
                    height={640}
                    showTexture={showTexture}
                    className="mx-auto overflow-hidden rounded-lg shadow-md"
                  />
                </div>

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

                {/* Palette picker (when proof is ready) */}
                {project.status === 'proof_ready' && (
                  <div className="border-border border-t pt-6">
                    <h3 className="mb-4 text-sm font-medium">
                      Adjust Colour Palette
                    </h3>
                    <PalettePicker
                      colors={colors}
                      onColorsChange={setColors}
                      showGenerator={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg py-12 text-center">
                <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Holly is working on your artwork. You&apos;ll receive an email
                  when your proof is ready for review.
                </p>
              </div>
            )}
          </section>

          {/* Reference image */}
          {referenceImage && (
            <section className="bg-card border-border rounded-xl border p-6">
              <h2 className="mb-4 text-lg font-medium">Your Reference Photo</h2>
              <img
                src={referenceImage.file_url}
                alt="Reference"
                className="mx-auto w-full max-w-md rounded-lg"
              />
            </section>
          )}

          {/* Actions (when proof is ready) */}
          {project.status === 'proof_ready' && (
            <section className="bg-card border-border rounded-xl border p-6">
              <h2 className="mb-4 text-lg font-medium">Ready to Proceed?</h2>

              <div className="space-y-6">
                {/* Approve button */}
                <div>
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || !canApprove}
                    className="w-full sm:w-auto"
                    size="lg"
                  >
                    {isApproving ? 'Processing...' : 'Approve & Print'}
                  </Button>
                  <p className="text-muted-foreground mt-2 text-xs">
                    This will send your artwork to print with the current colour
                    palette. This action cannot be undone.
                  </p>
                </div>

                {/* Revision request */}
                {canRequestRevision && (
                  <div className="border-border border-t pt-6">
                    <h3 className="mb-3 text-sm font-medium">
                      Need changes? Request one revision
                    </h3>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Describe the changes you'd like..."
                      className="border-input bg-background h-24 w-full resize-none rounded-lg border p-3 text-sm"
                    />
                    <Button
                      onClick={handleRequestRevision}
                      disabled={isRequestingRevision || !revisionNotes.trim()}
                      variant="outline"
                      className="mt-3"
                    >
                      {isRequestingRevision
                        ? 'Submitting...'
                        : 'Request Revision'}
                    </Button>
                    <p className="text-muted-foreground mt-2 text-xs">
                      You can request one revision. After that, the artwork will
                      be final.
                    </p>
                  </div>
                )}

                {project.revision_used && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Revision has been used. No further changes available.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Order details */}
        <div className="lg:col-span-1">
          <div className="bg-card border-border sticky top-24 rounded-xl border p-6">
            <h3 className="mb-4 font-serif text-lg font-semibold">
              Order Details
            </h3>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">
                  {project.size} ({dimensions.width}×{dimensions.height}mm)
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frame</dt>
                <dd className="font-medium">{FRAME_LABELS[project.frame]}</dd>
              </div>

              <div className="border-border flex justify-between border-t pt-3">
                <dt className="text-muted-foreground">Total Paid</dt>
                <dd className="text-primary font-medium">
                  {formatPrice(project.price_paid)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Order Date</dt>
                <dd className="font-medium">
                  {new Date(project.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {/* Status timeline */}
            <div className="border-border mt-6 border-t pt-6">
              <h4 className="mb-4 text-sm font-medium">Order Progress</h4>
              <ol className="space-y-3">
                {[
                  { key: 'paid_in_progress', label: 'Order Received' },
                  { key: 'proof_ready', label: 'Proof Ready' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'sent_to_print', label: 'Printing' },
                  { key: 'shipped', label: 'Shipped' },
                ].map((step, index) => {
                  const statusOrder = [
                    'paid_in_progress',
                    'proof_ready',
                    'approved',
                    'sent_to_print',
                    'shipped',
                  ]
                  const currentIndex = statusOrder.indexOf(project.status)
                  const stepIndex = statusOrder.indexOf(step.key)
                  const isComplete = stepIndex <= currentIndex
                  const isCurrent = step.key === project.status

                  return (
                    <li key={step.key} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          isComplete
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isComplete ? '✓' : index + 1}
                      </div>
                      <span
                        className={`text-sm ${
                          isCurrent ? 'font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Contact */}
            <div className="border-border mt-6 border-t pt-6">
              <p className="text-muted-foreground text-xs">
                Questions about your order? Email{' '}
                <a
                  href="mailto:hello@customartwork.co.uk"
                  className="text-primary hover:underline"
                >
                  hello@customartwork.co.uk
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
