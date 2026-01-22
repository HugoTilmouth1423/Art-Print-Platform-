'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArtworkCanvas } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { PROJECT_STATUS_LABELS, FRAME_LABELS } from '@/types'
import { formatPrice, SIZE_DIMENSIONS } from '@/constants/pricing'
import { PRESET_PALETTES } from '@/constants/palettes'
import type {
  Project,
  Upload,
  Palette,
  ProjectStatus,
  LayerRole,
} from '@/types'
import {
  ArrowLeft,
  Upload as UploadIcon,
  ExternalLink,
  Mail,
} from 'lucide-react'

interface AdminProjectViewProps {
  project: Project
  uploads: Upload[]
  palettes: Palette[]
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'paid_in_progress', label: 'Paid – In Progress' },
  { value: 'proof_ready', label: 'Proof Ready' },
  { value: 'revision_requested', label: 'Revision Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent_to_print', label: 'Sent to Print' },
  { value: 'shipped', label: 'Shipped' },
]

const LAYER_ROLES: LayerRole[] = [
  'background',
  'ground',
  'shading',
  'highlight',
]

export function AdminProjectView({
  project,
  uploads,
  palettes,
}: AdminProjectViewProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUploadingLayers, setIsUploadingLayers] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Get uploads by type
  const referenceImage = useMemo(
    () => uploads.find((u) => u.type === 'reference'),
    [uploads],
  )
  const layerUploads = useMemo(
    () => uploads.filter((u) => u.type === 'layer'),
    [uploads],
  )
  const textureUpload = useMemo(
    () => uploads.find((u) => u.type === 'texture'),
    [uploads],
  )

  // Selected palette colors
  const selectedPalette = palettes.find((p) => p.is_selected) || palettes[0]
  const colors = selectedPalette?.colors || PRESET_PALETTES[0].colors

  // Build canvas layers
  const canvasLayers = useMemo(() => {
    return LAYER_ROLES.map((role, index) => {
      const upload = layerUploads.find((u) => u.layer_role === role)
      if (!upload) return null
      return {
        url: upload.file_url,
        color: colors[index] || colors[0],
      }
    }).filter((l): l is { url: string; color: string } => l !== null)
  }, [layerUploads, colors])

  const dimensions = SIZE_DIMENSIONS[project.size]

  // Handle status update
  const handleStatusUpdate = async (newStatus: ProjectStatus) => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/project/${project.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Handle layer upload
  const handleLayerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingLayers(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('projectId', project.id)

    // Map files to layer roles based on order or filename
    Array.from(files).forEach((file, index) => {
      const layerRole = LAYER_ROLES[index]
      if (layerRole) {
        formData.append('layers', file)
        formData.append('roles', layerRole)
      }
    })

    try {
      const response = await fetch('/api/admin/upload-layers', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setUploadError(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Upload failed')
    } finally {
      setIsUploadingLayers(false)
    }
  }

  // Handle texture upload
  const handleTextureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('projectId', project.id)
    formData.append('texture', file)

    try {
      const response = await fetch('/api/admin/upload-texture', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to upload texture')
      }
    } catch (error) {
      console.error('Texture upload error:', error)
      alert('Failed to upload texture')
    }
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            Order #{project.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">{project.customer_email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/project/${project.id}`}
            target="_blank"
            className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Customer view
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Reference image */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h2 className="mb-4 text-lg font-medium">Reference Photo</h2>
            {referenceImage ? (
              <img
                src={referenceImage.file_url}
                alt="Reference"
                className="max-w-md rounded-lg"
              />
            ) : (
              <p className="text-muted-foreground">
                No reference image uploaded
              </p>
            )}
          </section>

          {/* Artwork layers */}
          <section className="bg-card border-border rounded-xl border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Artwork Layers</h2>
              <label className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm">
                <UploadIcon className="h-4 w-4" />
                Upload Layers
                <input
                  type="file"
                  accept="image/png"
                  multiple
                  onChange={handleLayerUpload}
                  className="sr-only"
                  disabled={isUploadingLayers}
                />
              </label>
            </div>

            {uploadError && (
              <p className="text-destructive mb-4 text-sm">{uploadError}</p>
            )}

            {isUploadingLayers && (
              <p className="text-muted-foreground mb-4 text-sm">Uploading...</p>
            )}

            {/* Layer status */}
            <div className="mb-6 grid grid-cols-4 gap-4">
              {LAYER_ROLES.map((role) => {
                const upload = layerUploads.find((u) => u.layer_role === role)
                return (
                  <div
                    key={role}
                    className={`rounded-lg border p-3 text-center ${
                      upload
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-border border-dashed'
                    }`}
                  >
                    <p className="text-xs font-medium capitalize">{role}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {upload ? '✓ Uploaded' : 'Missing'}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Artwork preview */}
            {canvasLayers.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <ArtworkCanvas
                  layers={canvasLayers}
                  textureUrl={textureUpload?.file_url}
                  width={400}
                  height={533}
                  showTexture={!!textureUpload}
                  className="mx-auto"
                />
              </div>
            )}

            {/* Texture upload */}
            <div className="border-border mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Paper Texture (Optional)
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {textureUpload ? 'Texture uploaded' : 'No texture uploaded'}
                  </p>
                </div>
                <label className="border-border hover:bg-muted inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                  <UploadIcon className="h-4 w-4" />
                  {textureUpload ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleTextureUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Revision notes */}
          {project.revision_notes && (
            <section className="rounded-xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-950">
              <h2 className="mb-2 text-lg font-medium">Revision Notes</h2>
              <p className="text-sm">{project.revision_notes}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status control */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-3 text-sm font-medium">Project Status</h3>
            <select
              value={project.status}
              onChange={(e) =>
                handleStatusUpdate(e.target.value as ProjectStatus)
              }
              disabled={isUpdatingStatus}
              className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isUpdatingStatus && (
              <p className="text-muted-foreground mt-2 text-xs">Updating...</p>
            )}
          </section>

          {/* Order details */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-4 text-sm font-medium">Order Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd>
                  {project.size} ({dimensions.width}×{dimensions.height}mm)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frame</dt>
                <dd>{FRAME_LABELS[project.frame]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium">
                  {formatPrice(project.price_paid)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Revision</dt>
                <dd>{project.revision_used ? 'Used' : 'Available'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>
                  {new Date(project.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </section>

          {/* IDs for debugging */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-4 text-sm font-medium">System Info</h3>
            <dl className="space-y-3 font-mono text-xs">
              <div>
                <dt className="text-muted-foreground">Project ID</dt>
                <dd className="break-all">{project.id}</dd>
              </div>
              {project.stripe_session_id && (
                <div>
                  <dt className="text-muted-foreground">Stripe Session</dt>
                  <dd className="break-all">{project.stripe_session_id}</dd>
                </div>
              )}
              {project.prodigi_order_id && (
                <div>
                  <dt className="text-muted-foreground">Prodigi Order</dt>
                  <dd className="break-all">{project.prodigi_order_id}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Quick actions */}
          <section className="bg-card border-border rounded-xl border p-6">
            <h3 className="mb-4 text-sm font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  // TODO: Send proof ready email
                  alert('Email functionality coming soon')
                }}
              >
                <Mail className="h-4 w-4" />
                Send Proof Ready Email
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
