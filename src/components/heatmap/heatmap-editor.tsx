"use client"

import { useState } from "react"
import { HeatmapGrid } from "./heatmap-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface HeatmapEditorProps {
  initialData?: number[][]
  onSave: (name: string, data: number[][]) => Promise<void>
}

export function HeatmapEditor({ initialData, onSave }: HeatmapEditorProps) {
  const [name, setName] = useState("")
  const [currentValue, setCurrentValue] = useState(50)
  const [gridData, setGridData] = useState<number[][]>(
    initialData || Array(7).fill(Array(7).fill(0))
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleCellClick = (row: number, col: number) => {
    const newData = gridData.map((r, i) => 
      i === row ? r.map((cell, j) => j === col ? currentValue : cell) : r
    )
    setGridData(newData)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      return
    }

    try {
      setIsLoading(true)
      await onSave(name, gridData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Heatmap"
        />
      </div>

      <div className="space-y-2">
        <Label>Current Value</Label>
        <Slider
          value={[currentValue]}
          onValueChange={([value]) => setCurrentValue(value)}
          min={0}
          max={100}
          step={10}
        />
        <div className="text-sm text-muted-foreground text-center">
          {currentValue}%
        </div>
      </div>

      <div className="border rounded-lg">
        <HeatmapGrid
          data={gridData}
          isInteractive={true}
          showTooltip={true}
          onCellClick={handleCellClick}
        />
      </div>

      <Button 
        className="w-full" 
        onClick={handleSave}
        disabled={!name.trim() || isLoading}
      >
        Save Heatmap
      </Button>
    </div>
  )
} 