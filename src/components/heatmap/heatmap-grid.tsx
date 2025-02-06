"use client"

import { useMemo } from "react"
import { HeatmapData, ColorTheme } from "@/types/heatmap"
import { cn } from "@/lib/utils"

interface HeatmapGridProps {
  data: HeatmapData[]
  colorTheme?: ColorTheme
  weekStart?: 'monday' | 'sunday'
  className?: string
}

const colorClasses: Record<ColorTheme, string[]> = {
  orange: [
    'bg-orange-50',
    'bg-orange-100',
    'bg-orange-200',
    'bg-orange-300',
    'bg-orange-400',
  ],
  green: [
    'bg-green-50',
    'bg-green-100',
    'bg-green-200',
    'bg-green-300',
    'bg-green-400',
  ],
  blue: [
    'bg-blue-50',
    'bg-blue-100',
    'bg-blue-200',
    'bg-blue-300',
    'bg-blue-400',
  ],
  purple: [
    'bg-purple-50',
    'bg-purple-100',
    'bg-purple-200',
    'bg-purple-300',
    'bg-purple-400',
  ],
}

export function HeatmapGrid({
  data,
  colorTheme = 'orange',
  weekStart = 'monday',
  className
}: HeatmapGridProps) {
  const gridData = useMemo(() => {
    // Group data by week and day
    const weeks: Record<string, Record<string, number>> = {}
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 365)
    
    // Initialize empty grid
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const week = getWeekNumber(d, weekStart)
      const day = d.getDay()
      
      if (!weeks[week]) {
        weeks[week] = {}
      }
      weeks[week][day] = 0
    }
    
    // Fill in actual data
    data.forEach(({ date, value }) => {
      const d = new Date(date)
      const week = getWeekNumber(d, weekStart)
      const day = d.getDay()
      
      if (weeks[week]) {
        weeks[week][day] = value
      }
    })
    
    return weeks
  }, [data, weekStart])

  return (
    <div className={cn("grid grid-flow-col gap-1", className)}>
      {Object.entries(gridData).map(([week, days]) => (
        <div key={week} className="grid grid-rows-7 gap-1">
          {Object.entries(days).map(([day, value]) => {
            const intensity = Math.min(Math.floor(value * 5), 4)
            return (
              <div
                key={`${week}-${day}`}
                className={cn(
                  "w-3 h-3 rounded-sm",
                  colorClasses[colorTheme][intensity]
                )}
                title={`${new Date(week).toLocaleDateString()}: ${value} hours`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function getWeekNumber(d: Date, weekStart: 'monday' | 'sunday'): string {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  
  // Adjust for week start
  if (weekStart === 'monday') {
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  } else {
    date.setDate(date.getDate() + 3 - date.getDay())
  }
  
  const week1 = new Date(date.getFullYear(), 0, 4)
  return date.getFullYear() + '-W' + Math.floor(1 + 0.5 + (date.getTime() - week1.getTime()) / 86400000 / 7)
} 