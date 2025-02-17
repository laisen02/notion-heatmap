"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { HeatmapGrid } from "./heatmap-grid"
import { ColorTheme, HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmbedTheme } from "@/context/theme-context"

interface HeatmapCardProps {
  config: HeatmapConfig
  data: HeatmapData[]
  isEmbed?: boolean
  showControls?: boolean
  onThemeChange?: (isDark: boolean) => void
}

export function HeatmapCard({ config, data: initialData, isEmbed = false, showControls = true, onThemeChange }: HeatmapCardProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<HeatmapData[]>(initialData || [])
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [localDarkMode, setLocalDarkMode] = useState(false)
  const embedTheme = useEmbedTheme()
  
  const isDarkMode = isEmbed ? embedTheme.isDarkMode : localDarkMode
  const setIsDarkMode = isEmbed ? embedTheme.setIsDarkMode : setLocalDarkMode

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        averageTime: 0,
        totalDays: 0,
        totalTime: 0,
        standardDeviation: 0
      }
    }

    const nonZeroValues = data.filter(d => d.value > 0)
    const totalTime = data.reduce((sum, d) => sum + d.value, 0)

    return {
      averageTime: nonZeroValues.length > 0 ? totalTime / nonZeroValues.length : 0,
      totalDays: nonZeroValues.length,
      totalTime,
      standardDeviation: calculateStandardDeviation(data.map(d => d.value))
    }
  }, [data])

  useEffect(() => {
    // Get unique years from data
    const years = Array.from(new Set(
      data.map(d => new Date(d.date).getFullYear().toString())
    )).sort((a, b) => b.localeCompare(a)) // Sort descending
    
    setAvailableYears(['past 365 days', ...years])
  }, [data])

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    if (selectedYear === 'past 365 days') {
      const today = new Date()
      const yearAgo = new Date(today)
      yearAgo.setDate(yearAgo.getDate() - 365)
      return data.filter(d => {
        const date = new Date(d.date)
        return date >= yearAgo && date <= today
      })
    }

    // For specific years, generate all dates for that year
    const year = parseInt(selectedYear)
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    // Generate all dates for the year
    const allDates = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const existingData = data.find(item => item.date === dateStr)
      allDates.push({
        date: dateStr,
        value: existingData ? existingData.value : 0
      })
    }
    
    return allDates
  }, [data, selectedYear])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notion/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heatmapId: config.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch data')
      }

      const { data: newData } = await response.json()
      setData(newData)
      toast.success('Data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize with any provided data and refresh in background
  useEffect(() => {
    if (initialData?.length > 0) {
      setData(initialData)
    }
    refreshData()
  }, [])

  // Generate embed URL
  const embedUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin
      return `${baseUrl}/embed/${config.id}`
    }
    return ''
  }, [config.id])

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('heatmaps')
        .delete()
        .eq('id', config.id)

      if (error) throw error
      
      toast.success("Heatmap deleted successfully")
      window.location.reload()
    } catch (error) {
      console.error('Error deleting heatmap:', error)
      toast.error("Failed to delete heatmap")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyEmbed = async () => {
    try {
      // Use the /embed/{id} format
      const embedUrl = `${window.location.origin}/embed/${config.id}`
      await navigator.clipboard.writeText(embedUrl)
      
      toast.success("Embed link copied! In Notion, create an embed block and paste this link", {
        duration: 4000,
        position: "top-center",
        style: {
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      })
    } catch (error) {
      console.error('Failed to copy embed link:', error)
      toast.error("Failed to copy embed link")
    }
  }

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    onThemeChange?.(newTheme)
  }

  return (
    <div className={cn(
      "relative isolate overflow-hidden",
      isDarkMode ? "[&_*]:dark" : "[&_*]:light"
    )}>
      <Card className={cn(
        "max-w-[1000px] mx-auto bg-background",
        "min-w-fit relative",
        isEmbed && "shadow-sm",
        isDarkMode 
          ? "border-gray-700" 
          : "border-gray-200",
        "rounded-lg border"
      )}>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2 bg-background",
        )}>
          <div className="overflow-x-auto flex-grow pr-4">
            <div className="min-w-[800px]">
              <div className="space-y-1 min-w-0">
                <CardTitle className={cn(
                  "truncate",
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                )}>
                  {config.name}
                </CardTitle>
                <CardDescription className={cn(
                  "truncate",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {config.description}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className={cn(
            "flex items-center space-x-2 flex-shrink-0",
            "sticky right-0 bg-background pl-2",
            isDarkMode ? "bg-gray-900" : "bg-white"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
              className={cn(
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              <Icons.refresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className={cn(
                "w-[100px] sm:w-[140px]",
                isDarkMode 
                  ? "bg-gray-800 text-gray-200" 
                  : "bg-white text-gray-900"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={cn(
                isDarkMode ? "bg-gray-800" : "bg-white"
              )}>
                {availableYears.map(year => (
                  <SelectItem 
                    key={year} 
                    value={year} 
                    className={cn(
                      isDarkMode 
                        ? "text-gray-200 hover:bg-gray-700" 
                        : "text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className={cn(
                isDarkMode && "text-gray-300 hover:text-white hover:bg-gray-800"
              )}
            >
              {isDarkMode ? (
                <Icons.sun className="h-4 w-4" />
              ) : (
                <Icons.moon className="h-4 w-4" />
              )}
            </Button>

            {!isEmbed && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEmbed}
                >
                  <Icons.link className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Icons.settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className={cn(
                      isDarkMode && "bg-gray-800 border-gray-700"
                    )}
                  >
                    <DropdownMenuItem 
                      asChild
                      className={cn(
                        "dark:text-gray-200 hover:bg-gray-700"
                      )}
                    >
                      <Link 
                        href={`/edit/${config.id}`}
                        className="flex items-center"
                      >
                        <Icons.edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <div className="sm:hidden">
                      <DropdownMenuItem
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={cn(
                          isDarkMode && "text-gray-200 hover:bg-gray-700"
                        )}
                      >
                        {isDarkMode ? (
                          <Icons.sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Icons.moon className="mr-2 h-4 w-4" />
                        )}
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuItem
                      className={cn(
                        "text-destructive focus:text-destructive",
                        "dark:hover:bg-gray-700"
                      )}
                      onSelect={() => setShowDeleteAlert(true)}
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(
          "bg-background relative",
          isEmbed ? "pb-2" : "pb-4"
        )}>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="mb-4">
                <HeatmapGrid
                  data={filteredData}
                  colorTheme={config.color_theme as ColorTheme}
                  weekStart={config.week_start}
                  isDarkMode={isDarkMode}
                />
              </div>

              {config.insights && (
                <div className={cn(
                  "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-1",
                  isDarkMode ? "text-gray-300" : "text-gray-900"
                )}>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>
                      Average Time
                    </p>
                    <p className="text-2xl font-bold">
                      {formatDuration(stats.averageTime)}
                    </p>
                  </div>
                  {config.insights.totalDays && (
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Total Days
                      </p>
                      <p className="text-2xl font-bold">{stats.totalDays}</p>
                    </div>
                  )}
                  {config.insights.totalTime && (
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Total Time
                      </p>
                      <p className="text-2xl font-bold">{formatDuration(stats.totalTime)}</p>
                    </div>
                  )}
                  {config.insights.standardDeviation && (
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Std Dev
                      </p>
                      <p className="text-2xl font-bold">{formatDuration(stats.standardDeviation)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateStandardDeviation(values: number[]): number {
  if (!values || values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squareDiffs = values.map(value => Math.pow(value - mean, 2))
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(avgSquareDiff)
}

function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes}m`
} 