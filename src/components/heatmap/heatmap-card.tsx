"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { HeatmapGrid } from "./heatmap-grid"
import { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
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

interface HeatmapCardProps {
  config: HeatmapConfig
  data: HeatmapData[]
}

export function HeatmapCard({ config, data: initialData }: HeatmapCardProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(initialData)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{config.name}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
            >
              <Icons.refresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/edit/${config.id}`}>
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setShowDeleteAlert(true)}
                >
                  <Icons.trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <HeatmapGrid
            data={data}
            colorTheme={config.colorTheme}
            weekStart={config.weekStart}
            className="mb-4"
          />
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {config.insights.averageTime && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Time</p>
                <p className="text-2xl font-bold">{stats.averageTime.toFixed(1)}h</p>
              </div>
            )}
            {config.insights.totalDays && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
            )}
            {config.insights.totalTime && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{stats.totalTime.toFixed(0)}h</p>
              </div>
            )}
            {config.insights.standardDeviation && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Std Dev</p>
                <p className="text-2xl font-bold">{stats.standardDeviation.toFixed(1)}h</p>
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