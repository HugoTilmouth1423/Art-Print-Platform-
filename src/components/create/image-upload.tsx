'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void
  selectedImage: string | null
  onClear: () => void
  onConfirmChange?: (allConfirmed: boolean) => void
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export function ImageUpload({
  onImageSelect,
  selectedImage,
  onClear,
  onConfirmChange,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmations, setConfirmations] = useState({
    noPeople: false,
    noCopyright: false,
    ownPhoto: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allConfirmed =
    confirmations.noPeople &&
    confirmations.noCopyright &&
    confirmations.ownPhoto

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG or PNG image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be under 20MB'
    }
    return null
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      const previewUrl = URL.createObjectURL(file)
      onImageSelect(file, previewUrl)
    },
    [validateFile, onImageSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleClear = useCallback(() => {
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClear()
  }, [onClear])

  if (selectedImage) {
    return (
      <div className="space-y-4">
        <div className="border-border bg-muted/30 relative overflow-hidden rounded-lg border">
          <img
            src={selectedImage}
            alt="Selected reference"
            className="mx-auto h-auto max-h-[400px] w-full object-contain"
          />
          <button
            onClick={handleClear}
            className="bg-background/90 border-border hover:bg-destructive hover:text-destructive-foreground absolute top-3 right-3 rounded-full border p-2 transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Confirmation checkboxes */}
        <div className="bg-muted/50 space-y-3 rounded-lg p-4">
          <p className="mb-3 text-sm font-medium">
            Please confirm the following:
          </p>

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-people"
              checked={confirmations.noPeople}
              onCheckedChange={(checked) => {
                const newVal = !!checked
                setConfirmations((prev) => {
                  const next = { ...prev, noPeople: newVal }
                  onConfirmChange?.(
                    next.noPeople && next.noCopyright && next.ownPhoto,
                  )
                  return next
                })
              }}
            />
            <Label
              htmlFor="no-people"
              className="cursor-pointer text-sm leading-tight"
            >
              This photo does not contain identifiable people
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-copyright"
              checked={confirmations.noCopyright}
              onCheckedChange={(checked) => {
                const newVal = !!checked
                setConfirmations((prev) => {
                  const next = { ...prev, noCopyright: newVal }
                  onConfirmChange?.(
                    next.noPeople && next.noCopyright && next.ownPhoto,
                  )
                  return next
                })
              }}
            />
            <Label
              htmlFor="no-copyright"
              className="cursor-pointer text-sm leading-tight"
            >
              This is not a copyrighted image (e.g., from a photographer or
              stock site)
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="own-photo"
              checked={confirmations.ownPhoto}
              onCheckedChange={(checked) => {
                const newVal = !!checked
                setConfirmations((prev) => {
                  const next = { ...prev, ownPhoto: newVal }
                  onConfirmChange?.(
                    next.noPeople && next.noCopyright && next.ownPhoto,
                  )
                  return next
                })
              }}
            />
            <Label
              htmlFor="own-photo"
              className="cursor-pointer text-sm leading-tight"
            >
              I took this photo or have permission to use it for this artwork
            </Label>
          </div>

          {!allConfirmed && (
            <p className="text-muted-foreground pt-2 text-xs">
              Please confirm all checkboxes to continue
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="space-y-4">
          <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <Upload className="text-muted-foreground h-6 w-6" />
          </div>

          <div>
            <p className="font-medium">Drop your photo here</p>
            <p className="text-muted-foreground mt-1 text-sm">
              or click to browse
            </p>
          </div>

          <p className="text-muted-foreground text-xs">
            JPG or PNG, up to 20MB
          </p>
        </div>
      </div>

      {error && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-muted-foreground text-sm">
          <strong>Best photos for artwork:</strong> Landscape scenes, coastal
          views, buildings, nature. Photos with clear subjects and good lighting
          work best.
        </p>
      </div>
    </div>
  )
}

export function useImageUploadState() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleSelect = useCallback((f: File, url: string) => {
    setFile(f)
    setPreviewUrl(url)
    setIsConfirmed(false)
  }, [])

  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setIsConfirmed(false)
  }, [previewUrl])

  return {
    file,
    previewUrl,
    isConfirmed,
    setIsConfirmed,
    handleSelect,
    handleClear,
  }
}
