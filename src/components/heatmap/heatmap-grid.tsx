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
    'bg-orange-50 dark:bg-orange-950/30',
    'bg-orange-100 dark:bg-orange-900/30',
    'bg-orange-200 dark:bg-orange-800/40',
    'bg-orange-300 dark:bg-orange-700/50',
    'bg-orange-400 dark:bg-orange-600/60',
  ],
  green: [
    'bg-green-50 dark:bg-green-950/30',
    'bg-green-100 dark:bg-green-900/30',
    'bg-green-200 dark:bg-green-800/40',
    'bg-green-300 dark:bg-green-700/50',
    'bg-green-400 dark:bg-green-600/60',
  ],
  blue: [
    'bg-blue-50 dark:bg-blue-950/30',
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-blue-200 dark:bg-blue-800/40',
    'bg-blue-300 dark:bg-blue-700/50',
    'bg-blue-400 dark:bg-blue-600/60',
  ],
  purple: [
    'bg-purple-50 dark:bg-purple-950/30',
    'bg-purple-100 dark:bg-purple-900/30',
    'bg-purple-200 dark:bg-purple-800/40',
    'bg-purple-300 dark:bg-purple-700/50',
    'bg-purple-400 dark:bg-purple-600/60',
  ],
}

const DAYS = ['Mon', 'Wed', 'Fri', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function HeatmapGrid({
  data,
  colorTheme = 'orange',
  weekStart = 'monday',
  className
}: HeatmapGridProps) {
  // Find min and max values for scaling
  const { minValue, maxValue } = useMemo(() => {
    const values = data.map(d => d.value)
    return {
      minValue: Math.min(...values, 0),
      maxValue: Math.max(...values, 0)
    }
  }, [data])

  // Create a map of date to value for quick lookup
  const dateValueMap = useMemo(() => {
    return data.reduce((acc, { date, value }) => {
      acc[date] = value
      return acc
    }, {} as Record<string, number>)
  }, [data])

  // Generate dates for the full year
  const dates = useMemo(() => {
    const result = []
    const today = new Date()
    const currentYear = today.getFullYear()
    
    // Start from January 1st
    const start = new Date(currentYear, 0, 1)
    // End at December 31st
    const end = new Date(currentYear, 11, 31)
    
    // Generate all dates for the year
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        value: dateValueMap[dateStr] || 0
      })
    }
    
    return result
  }, [dateValueMap])

  // Group dates by week
  const weeks = useMemo(() => {
    const result: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []
    
    // Get the first day's weekday (0-6)
    const firstDate = new Date(dates[0].date)
    const firstDayOfWeek = firstDate.getDay()
    
    // Calculate how many empty cells we need at the start
    const emptyDaysAtStart = weekStart === 'monday'
      ? (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
      : firstDayOfWeek
    
    // Add empty cells at the start
    for (let i = 0; i < emptyDaysAtStart; i++) {
      currentWeek.push({ date: '', value: 0 })
    }
    
    // Add all dates
    dates.forEach((date) => {
      currentWeek.push(date)
      
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Fill in the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', value: 0 })
      }
      result.push(currentWeek)
    }
    
    return result
  }, [dates, weekStart])

  // Get color intensity based on value
  const getColorIntensity = (value: number): number => {
    if (value === 0) return 0
    if (maxValue === minValue) return 1
    
    // Use logarithmic scale for better distribution
    const normalizedValue = Math.log1p(value) / Math.log1p(maxValue)
    return Math.ceil(normalizedValue * 4)
  }

  // Get month labels positions
  const monthLabels = useMemo(() => {
    const labels: { month: string, offset: number }[] = []
    let currentMonth = -1
    
    dates.forEach((date, index) => {
      const month = new Date(date.date).getMonth()
      if (month !== currentMonth) {
        labels.push({
          month: MONTHS[month],
          offset: Math.floor(index / 7)
        })
        currentMonth = month
      }
    })
    return labels
  }, [dates])

  return (
    <div className="flex flex-col gap-2">
      {/* Month labels */}
      <div className="flex pl-8">
        {monthLabels.map(({ month, offset }, i) => (
          <div
            key={`${month}-${i}`}
            className="text-xs text-muted-foreground"
            style={{
              position: 'relative',
              left: `${offset * 16}px`,
            }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground h-[116px]">
          {DAYS.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className={cn("flex gap-1", className)}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day, dayIndex) => {
                const intensity = getColorIntensity(day.value)
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "w-3 h-3 rounded-sm",
                      day.date ? colorClasses[colorTheme][intensity] : "bg-muted",
                      "transition-colors duration-200"
                    )}
                    title={day.date ? `${day.date}: ${day.value.toFixed(1)} hours` : ''}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 