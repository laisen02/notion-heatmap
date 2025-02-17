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
  isDarkMode: boolean
}

const colorThemes: Record<ColorTheme, (isDark: boolean) => string[]> = {
  orange: (isDark) => [
    isDark ? 'bg-orange-950/30' : 'bg-orange-50',
    isDark ? 'bg-orange-900/30' : 'bg-orange-100',
    isDark ? 'bg-orange-800/40' : 'bg-orange-200',
    isDark ? 'bg-orange-700/50' : 'bg-orange-300',
    isDark ? 'bg-orange-600/60' : 'bg-orange-400',
  ],
  yellow: (isDark) => [
    isDark ? 'bg-yellow-950/30' : 'bg-yellow-50',
    isDark ? 'bg-yellow-900/30' : 'bg-yellow-100',
    isDark ? 'bg-yellow-800/40' : 'bg-yellow-200',
    isDark ? 'bg-yellow-700/50' : 'bg-yellow-300',
    isDark ? 'bg-yellow-600/60' : 'bg-yellow-400',
  ],
  green: (isDark) => [
    isDark ? 'bg-green-950/30' : 'bg-green-50',
    isDark ? 'bg-green-900/30' : 'bg-green-100',
    isDark ? 'bg-green-800/40' : 'bg-green-200',
    isDark ? 'bg-green-700/50' : 'bg-green-300',
    isDark ? 'bg-green-600/60' : 'bg-green-400',
  ],
  blue: (isDark) => [
    isDark ? 'bg-blue-950/30' : 'bg-blue-50',
    isDark ? 'bg-blue-900/30' : 'bg-blue-100',
    isDark ? 'bg-blue-800/40' : 'bg-blue-200',
    isDark ? 'bg-blue-700/50' : 'bg-blue-300',
    isDark ? 'bg-blue-600/60' : 'bg-blue-400',
  ],
  purple: (isDark) => [
    isDark ? 'bg-purple-950/30' : 'bg-purple-50',
    isDark ? 'bg-purple-900/30' : 'bg-purple-100',
    isDark ? 'bg-purple-800/40' : 'bg-purple-200',
    isDark ? 'bg-purple-700/50' : 'bg-purple-300',
    isDark ? 'bg-purple-600/60' : 'bg-purple-400',
  ],
  pink: (isDark) => [
    isDark ? 'bg-pink-950/30' : 'bg-pink-50',
    isDark ? 'bg-pink-900/30' : 'bg-pink-100',
    isDark ? 'bg-pink-800/40' : 'bg-pink-200',
    isDark ? 'bg-pink-700/50' : 'bg-pink-300',
    isDark ? 'bg-pink-600/60' : 'bg-pink-400',
  ],
  red: (isDark) => [
    isDark ? 'bg-red-950/30' : 'bg-red-50',
    isDark ? 'bg-red-900/30' : 'bg-red-100',
    isDark ? 'bg-red-800/40' : 'bg-red-200',
    isDark ? 'bg-red-700/50' : 'bg-red-300',
    isDark ? 'bg-red-600/60' : 'bg-red-400',
  ],
  brown: (isDark) => [
    isDark ? 'bg-amber-950/30' : 'bg-amber-50',
    isDark ? 'bg-amber-900/30' : 'bg-amber-100',
    isDark ? 'bg-amber-800/40' : 'bg-amber-200',
    isDark ? 'bg-amber-700/50' : 'bg-amber-300',
    isDark ? 'bg-amber-600/60' : 'bg-amber-400',
  ],
  gray: (isDark) => [
    isDark ? 'bg-gray-950/30' : 'bg-gray-50',
    isDark ? 'bg-gray-900/30' : 'bg-gray-100',
    isDark ? 'bg-gray-800/40' : 'bg-gray-200',
    isDark ? 'bg-gray-700/50' : 'bg-gray-300',
    isDark ? 'bg-gray-600/60' : 'bg-gray-400',
  ],
  lightgray: (isDark) => [
    isDark ? 'bg-slate-950/30' : 'bg-slate-50',
    isDark ? 'bg-slate-900/30' : 'bg-slate-100',
    isDark ? 'bg-slate-800/40' : 'bg-slate-200',
    isDark ? 'bg-slate-700/50' : 'bg-slate-300',
    isDark ? 'bg-slate-600/60' : 'bg-slate-400',
  ],
  github: (isDark) => [
    isDark ? 'bg-gray-800/30' : 'bg-[#f6f8fa]',
    isDark ? 'bg-green-700/40' : 'bg-[#9be9a8]',
    isDark ? 'bg-green-600/60' : 'bg-[#40c463]',
    isDark ? 'bg-green-500/80' : 'bg-[#30a14e]',
    isDark ? 'bg-green-400' : 'bg-[#216e39]',
  ],
  gitlab: (isDark) => [
    isDark ? 'bg-gray-800/30' : 'bg-[#f8f9fa]',
    isDark ? 'bg-blue-700/40' : 'bg-[#acd5f2]',
    isDark ? 'bg-blue-600/60' : 'bg-[#7fa8d1]',
    isDark ? 'bg-blue-500/80' : 'bg-[#49729b]',
    isDark ? 'bg-blue-400' : 'bg-[#254e77]',
  ],
  notion: (isDark) => [
    isDark ? 'bg-gray-800/30' : 'bg-[#f9f9f9]',
    isDark ? 'bg-orange-700/40' : 'bg-[#ffd5cc]',
    isDark ? 'bg-orange-600/60' : 'bg-[#ff9c8f]',
    isDark ? 'bg-orange-500/80' : 'bg-[#ff6b55]',
    isDark ? 'bg-orange-400' : 'bg-[#de4931]',
  ],
}

const DAYS = ['Mon', 'Wed', 'Fri', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function HeatmapGrid({
  data,
  colorTheme = 'github',
  weekStart = 'monday',
  className,
  isDarkMode
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
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-fit">
        <div className={cn("grid gap-px", className)}>
          {/* Month labels */}
          <div className="flex pl-8">
            {monthLabels.map(({ month, offset }, i) => (
              <div
                key={`${month}-${i}`}
                className={cn(
                  "text-xs",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}
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
            <div className={cn(
              "flex flex-col justify-between pr-2 text-xs h-[116px]",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              {DAYS.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
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
                            day.date ? colorThemes[colorTheme](isDarkMode)[intensity] : 
                              (isDarkMode ? "bg-gray-800/30" : "bg-gray-100"),
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
      </div>
    </div>
  )
} 