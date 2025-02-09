"use client"

import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { EmbedThemeProvider } from "@/context/theme-context"
import { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface EmbedContentProps {
  config: HeatmapConfig
  data: HeatmapData[]
}

export function EmbedContent({ config, data }: EmbedContentProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <EmbedThemeProvider>
      <div className={cn(
        "w-full h-full transition-colors duration-200",
        isDarkMode ? "dark bg-gray-900" : "light bg-white"
      )}>
        <div className="p-2 w-full h-full">
          <HeatmapCard
            config={config}
            data={data}
            isEmbed={true}
            showControls={true}
            onThemeChange={(dark) => setIsDarkMode(dark)}
          />
        </div>
      </div>
    </EmbedThemeProvider>
  )
} 