"use client"

import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { EmbedThemeProvider } from "@/context/theme-context"
import { HeatmapConfig, HeatmapData } from "@/types/heatmap"

interface EmbedContentProps {
  config: HeatmapConfig
  data: HeatmapData[]
}

export function EmbedContent({ config, data }: EmbedContentProps) {
  return (
    <EmbedThemeProvider>
      <div className="w-full h-full transition-colors duration-200 dark:bg-gray-900 bg-white">
        <div className="p-2 w-full h-full">
          <HeatmapCard
            config={config}
            data={data}
            isEmbed={true}
            showControls={true}
          />
        </div>
      </div>
    </EmbedThemeProvider>
  )
} 