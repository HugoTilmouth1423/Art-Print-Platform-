'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface LayerConfig {
  url: string
  color: string
}

interface ArtworkCanvasProps {
  layers: LayerConfig[]
  textureUrl?: string
  width?: number
  height?: number
  className?: string
  showTexture?: boolean
}

// Cache for loaded images
const imageCache = new Map<string, HTMLImageElement>()

async function loadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function ArtworkCanvas({
  layers,
  textureUrl,
  width = 600,
  height = 800,
  className = '',
  showTexture = false,
}: ArtworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const renderLayers = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    setIsLoading(true)
    setError(null)

    try {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Create offscreen canvas for compositing
      const offscreen = document.createElement('canvas')
      offscreen.width = width
      offscreen.height = height
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return

      // Load and render each layer
      for (const layer of layers) {
        try {
          const img = await loadImage(layer.url)
          const rgb = hexToRgb(layer.color)

          // Create temp canvas for this layer
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = width
          tempCanvas.height = height
          const tempCtx = tempCanvas.getContext('2d', {
            willReadFrequently: true,
          })
          if (!tempCtx) continue

          // Draw the image scaled to fit
          const scale = Math.min(width / img.width, height / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const x = (width - scaledWidth) / 2
          const y = (height - scaledHeight) / 2

          tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight)

          // Get image data and apply color multiply
          const imageData = tempCtx.getImageData(0, 0, width, height)
          const data = imageData.data

          for (let i = 0; i < data.length; i += 4) {
            // Multiply blend: (base * color) / 255
            // Using the layer's grayscale value multiplied by the target color
            const alpha = data[i + 3]
            if (alpha > 0) {
              // Use luminance of original pixel to scale the color
              const luminance = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255
              data[i] = Math.round(rgb.r * luminance)
              data[i + 1] = Math.round(rgb.g * luminance)
              data[i + 2] = Math.round(rgb.b * luminance)
            }
          }

          tempCtx.putImageData(imageData, 0, 0)

          // Composite this layer onto offscreen canvas
          offCtx.globalCompositeOperation = 'source-over'
          offCtx.drawImage(tempCanvas, 0, 0)
        } catch {
          console.warn(`Failed to load layer: ${layer.url}`)
        }
      }

      // Apply texture overlay if enabled
      if (showTexture && textureUrl) {
        try {
          const textureImg = await loadImage(textureUrl)
          offCtx.globalCompositeOperation = 'multiply'
          offCtx.globalAlpha = 0.1
          offCtx.drawImage(textureImg, 0, 0, width, height)
          offCtx.globalAlpha = 1
          offCtx.globalCompositeOperation = 'source-over'
        } catch {
          console.warn('Failed to load texture')
        }
      }

      // Draw final result to main canvas
      ctx.drawImage(offscreen, 0, 0)
    } catch (err) {
      setError('Failed to render artwork')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [layers, textureUrl, width, height, showTexture])

  useEffect(() => {
    renderLayers()
  }, [renderLayers])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="artwork-canvas block h-auto max-w-full"
        style={{ aspectRatio: `${width}/${height}` }}
      />
      {isLoading && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      )}
      {error && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <div className="text-destructive text-sm">{error}</div>
        </div>
      )}
      {showTexture && (
        <div className="paper-texture pointer-events-none absolute inset-0" />
      )}
    </div>
  )
}
