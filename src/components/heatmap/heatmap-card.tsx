"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { HeatmapGrid } from "./heatmap-grid"
import { HeatmapConfig, HeatmapData } from "@/types/heatmap"
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

interface HeatmapCardProps {
  config: HeatmapConfig
  data: HeatmapData[]
  isEmbed?: boolean
}

export function HeatmapCard({ config, data: initialData, isEmbed = false }: HeatmapCardProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(initialData)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)

  const stats = {
    averageTime: data.reduce((sum, d) => sum + d.value, 0) / data.filter(d => d.value > 0).length || 0,
    totalDays: data.filter(d => d.value > 0).length,
    totalTime: data.reduce((sum, d) => sum + d.value, 0),
    standardDeviation: calculateStandardDeviation(data.map(d => d.value))
  }

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

  const deleteHeatmap = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('heatmaps')
        .delete()
        .eq('id', config.id)

      if (error) throw error

      toast.success('Heatmap deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting heatmap:', error)
      toast.error('Failed to delete heatmap')
    } finally {
      setIsLoading(false)
      setShowDeleteAlert(false)
    }
  }

  useEffect(() => {
    // Get unique years from data
    const years = Array.from(new Set(
      initialData.map(d => new Date(d.date).getFullYear().toString())
    )).sort((a, b) => b.localeCompare(a)) // Sort descending
    
    setAvailableYears(['past 365 days', ...years])
  }, [initialData])

  const filteredData = useMemo(() => {
    if (selectedYear === 'past 365 days') {
      const today = new Date()
      const yearAgo = new Date(today)
      yearAgo.setDate(yearAgo.getDate() - 365)
      return initialData.filter(d => {
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
      const existingData = initialData.find(item => item.date === dateStr)
      allDates.push({
        date: dateStr,
        value: existingData ? existingData.value : 0
      })
    }
    
    return allDates
  }, [initialData, selectedYear])

  const embedCode = `<iframe 
    src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${config.id}" 
    width="100%" 
    height="220" 
    style="border:none; background: transparent;" 
    loading="lazy"
  ></iframe>`

  return (
    <>
      <Card className="overflow-hidden max-w-[1000px] mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 dark:bg-gray-900">
          <div className="space-y-1 min-w-0 flex-shrink">
            <CardTitle className="truncate">{config.name}</CardTitle>
            <CardDescription className="truncate">{config.description}</CardDescription>
          </div>
          {!isEmbed && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshData}
                disabled={isLoading}
                className="dark:text-gray-400"
              >
                <Icons.refresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] sm:w-[140px] dark:bg-gray-800 dark:text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year} className="dark:text-gray-200">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? (
                    <Icons.sun className="h-4 w-4" />
                  ) : (
                    <Icons.moon className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode)
                    toast.success('Embed code copied to clipboard')
                  }}
                >
                  <Icons.link className="h-4 w-4" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Icons.settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
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
                    >
                      {isDarkMode ? (
                        <Icons.sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Icons.moon className="mr-2 h-4 w-4" />
                      )}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode)
                        toast.success('Embed code copied to clipboard')
                      }}
                    >
                      <Icons.link className="mr-2 h-4 w-4" />
                      Copy Embed Link
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setShowDeleteAlert(true)}
                  >
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto pb-6 dark:bg-gray-900">
          <div className={cn("min-w-[800px]", isDarkMode && "dark")}>
            <HeatmapGrid
              data={filteredData}
              colorTheme={config.colorTheme}
              weekStart={config.weekStart}
              className="mb-4"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-sm sm:text-base sm:gap-4">
            {config.insights.averageTime && (
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Average Time</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.averageTime.toFixed(1)}h</p>
              </div>
            )}
            {config.insights.totalDays && (
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Days</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.totalDays}</p>
              </div>
            )}
            {config.insights.totalTime && (
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.totalTime.toFixed(0)}h</p>
              </div>
            )}
            {config.insights.standardDeviation && (
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Std Dev</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.standardDeviation.toFixed(1)}h</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the heatmap "{config.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteHeatmap}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function calculateStandardDeviation(values: number[]): number {
  const n = values.length
  if (n === 0) return 0
  
  const mean = values.reduce((a, b) => a + b) / n
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
  return Math.sqrt(variance)
} 