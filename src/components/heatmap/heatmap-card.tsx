"use client"

import { useState } from "react"
import Link from "next/link"
import { HeatmapGrid } from "./heatmap-grid"
import { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface HeatmapCardProps {
  config: HeatmapConfig
  data: HeatmapData[]
}

export function HeatmapCard({ config, data }: HeatmapCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const stats = {
    averageTime: data.reduce((sum, d) => sum + d.value, 0) / data.filter(d => d.value > 0).length || 0,
    totalDays: data.filter(d => d.value > 0).length,
    totalTime: data.reduce((sum, d) => sum + d.value, 0),
    standardDeviation: calculateStandardDeviation(data.map(d => d.value))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{config.name}</CardTitle>
          {config.description && (
            <CardDescription>{config.description}</CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {/* TODO: Implement refresh */}}
            disabled={isLoading}
          >
            <Icons.refresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href={`/edit/${config.id}`}>
              <Icons.settings className="h-4 w-4" />
            </Link>
          </Button>
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
  )
}

function calculateStandardDeviation(values: number[]): number {
  const n = values.length
  if (n === 0) return 0
  
  const mean = values.reduce((a, b) => a + b) / n
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n
  return Math.sqrt(variance)
} 