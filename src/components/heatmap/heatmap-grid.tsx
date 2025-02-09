"use client"

import { useMemo } from "react"
import { HeatmapData, ColorTheme } from "@/types/heatmap"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"

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
  yellow: [
    'bg-yellow-50 dark:bg-yellow-950/30',
    'bg-yellow-100 dark:bg-yellow-900/30',
    'bg-yellow-200 dark:bg-yellow-800/40',
    'bg-yellow-300 dark:bg-yellow-700/50',
    'bg-yellow-400 dark:bg-yellow-600/60',
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
  pink: [
    'bg-pink-50 dark:bg-pink-950/30',
    'bg-pink-100 dark:bg-pink-900/30',
    'bg-pink-200 dark:bg-pink-800/40',
    'bg-pink-300 dark:bg-pink-700/50',
    'bg-pink-400 dark:bg-pink-600/60',
  ],
  red: [
    'bg-red-50 dark:bg-red-950/30',
    'bg-red-100 dark:bg-red-900/30',
    'bg-red-200 dark:bg-red-800/40',
    'bg-red-300 dark:bg-red-700/50',
    'bg-red-400 dark:bg-red-600/60',
  ],
  brown: [
    'bg-amber-50 dark:bg-amber-950/30',
    'bg-amber-100 dark:bg-amber-900/30',
    'bg-amber-200 dark:bg-amber-800/40',
    'bg-amber-300 dark:bg-amber-700/50',
    'bg-amber-400 dark:bg-amber-600/60',
  ],
  gray: [
    'bg-gray-50 dark:bg-gray-950/30',
    'bg-gray-100 dark:bg-gray-900/30',
    'bg-gray-200 dark:bg-gray-800/40',
    'bg-gray-300 dark:bg-gray-700/50',
    'bg-gray-400 dark:bg-gray-600/60',
  ],
  lightgray: [
    'bg-slate-50 dark:bg-slate-950/30',
    'bg-slate-100 dark:bg-slate-900/30',
    'bg-slate-200 dark:bg-slate-800/40',
    'bg-slate-300 dark:bg-slate-700/50',
    'bg-slate-400 dark:bg-slate-600/60',
  ],
}

const colorThemes: Record<ColorTheme, string[]> = {
  github: [
    'bg-[#f6f8fa] dark:bg-gray-800/30', // Lighter empty cell color
    'bg-[#9be9a8] dark:bg-green-700/40',
    'bg-[#40c463] dark:bg-green-600/60',
    'bg-[#30a14e] dark:bg-green-500/80',
    'bg-[#216e39] dark:bg-green-400',
  ],
  gitlab: [
    'bg-[#f8f9fa] dark:bg-gray-800/30',
    'bg-[#acd5f2] dark:bg-blue-700/40',
    'bg-[#7fa8d1] dark:bg-blue-600/60',
    'bg-[#49729b] dark:bg-blue-500/80',
    'bg-[#254e77] dark:bg-blue-400',
  ],
  notion: [
    'bg-[#f9f9f9] dark:bg-gray-800/30',
    'bg-[#ffd5cc] dark:bg-orange-700/40',
    'bg-[#ff9c8f] dark:bg-orange-600/60',
    'bg-[#ff6b55] dark:bg-orange-500/80',
    'bg-[#de4931] dark:bg-orange-400',
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
    const totalWeeks = weeks.length
    
    dates.forEach((date, index) => {
      const dateObj = new Date(date.date)
      const month = dateObj.getMonth()
      const weekIndex = Math.floor(index / 7)
      
      // Only add label if it's a new month and within the grid
      if (month !== currentMonth && weekIndex < totalWeeks) {
        labels.push({
          month: MONTHS[month],
          offset: weekIndex
        })
        currentMonth = month
      }
    })
    return labels
  }, [dates, weeks.length])

  return (
    <div className="flex flex-col gap-2">
      {/* Month labels */}
      <div className="flex pl-8">
        {monthLabels.map(({ month, offset }, i) => (
          <div
            key={`${month}-${i}`}
            className="text-xs text-muted-foreground dark:text-gray-400"
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
        <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground dark:text-gray-400 h-[116px]">
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
                  <Tooltip
                    key={`${weekIndex}-${dayIndex}`}
                    content={day.date ? `${day.date}: ${day.value.toFixed(1)} hours` : ''}
                    delayDuration={0}
                  >
                    <div
                      className={cn(
                        "w-3 h-3 rounded-sm transition-all duration-100",
                        day.date ? colorClasses[colorTheme][intensity] : "bg-muted dark:bg-gray-800",
                        "hover:ring-2 hover:ring-offset-2 hover:ring-ring hover:ring-offset-background"
                      )}
                    />
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 