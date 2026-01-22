'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { PRESET_PALETTES, generateRandomPalette } from '@/constants/palettes'
import { Lock, Unlock, Shuffle } from 'lucide-react'

interface PalettePickerProps {
  colors: string[]
  onColorsChange: (colors: string[]) => void
  showGenerator?: boolean
  className?: string
}

const LAYER_LABELS = ['Background', 'Ground', 'Shading', 'Highlight', 'Accent']

export function PalettePicker({
  colors,
  onColorsChange,
  showGenerator = true,
  className = '',
}: PalettePickerProps) {
  const [lockedColors, setLockedColors] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ])
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const handlePresetSelect = useCallback(
    (presetId: string, presetColors: string[]) => {
      setActivePreset(presetId)
      onColorsChange(presetColors)
    },
    [onColorsChange],
  )

  const handleRandomize = useCallback(() => {
    setActivePreset(null)
    const locked = lockedColors.map((isLocked, i) =>
      isLocked ? colors[i] : null,
    )
    const newColors = generateRandomPalette(locked)
    onColorsChange(newColors)
  }, [colors, lockedColors, onColorsChange])

  const toggleLock = useCallback((index: number) => {
    setLockedColors((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }, [])

  const handleColorChange = useCallback(
    (index: number, newColor: string) => {
      setActivePreset(null)
      const newColors = [...colors]
      newColors[index] = newColor
      onColorsChange(newColors)
    },
    [colors, onColorsChange],
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preset palettes */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Choose a Palette</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id, preset.colors)}
              className={`group rounded-lg border p-2 transition-all ${
                activePreset === preset.id
                  ? 'border-primary ring-primary/20 ring-2'
                  : 'border-border hover:border-primary/50'
              }`}
              title={preset.name}
            >
              <div className="mb-1.5 flex gap-0.5">
                {preset.colors.map((color, i) => (
                  <div
                    key={i}
                    className="h-6 flex-1 first:rounded-l last:rounded-r"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground truncate text-xs transition-colors">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Current colors with generator */}
      {showGenerator && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">Customize Colors</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomize}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Randomize
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((color, index) => (
              <div key={index} className="space-y-2">
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="border-border h-12 w-full cursor-pointer rounded-lg border"
                    style={{ backgroundColor: color }}
                  />
                  <button
                    onClick={() => toggleLock(index)}
                    className={`absolute -top-2 -right-2 rounded-full border p-1 ${
                      lockedColors[index]
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary'
                    }`}
                    title={lockedColors[index] ? 'Unlock color' : 'Lock color'}
                  >
                    {lockedColors[index] ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  {LAYER_LABELS[index]}
                </p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Lock colors to keep them when randomizing
          </p>
        </div>
      )}
    </div>
  )
}
