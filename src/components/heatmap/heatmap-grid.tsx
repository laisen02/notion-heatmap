"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface HeatmapGridProps {
  data: number[][]
  isInteractive?: boolean
  showTooltip?: boolean
  onCellClick?: (row: number, col: number) => void
}

export function HeatmapGrid({ 
  data, 
  isInteractive = true,
  showTooltip = true,
  onCellClick 
}: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const getColor = (value: number) => {
    // Color scale from light to dark
    const colors = [
      'bg-emerald-50',
      'bg-emerald-100',
      'bg-emerald-200',
      'bg-emerald-300',
      'bg-emerald-400',
      'bg-emerald-500',
      'bg-emerald-600',
      'bg-emerald-700',
      'bg-emerald-800',
      'bg-emerald-900',
    ]
    
    // Map value (0-100) to color index
    const index = Math.min(Math.floor(value / 10), 9)
    return colors[index]
  }

  return (
    <div className="relative w-full h-full">
      <div className="grid grid-cols-7 gap-1 w-full h-full">
        {data.map((row, rowIndex) => (
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative aspect-square rounded-sm transition-colors",
                getColor(value),
                isInteractive && "cursor-pointer hover:ring-2 hover:ring-primary",
              )}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
              onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {showTooltip && hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-background border rounded shadow">
                  {value}%
                </div>
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  )
} 