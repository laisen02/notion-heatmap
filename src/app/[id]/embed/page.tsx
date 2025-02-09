import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"

async function getHeatmapData(heatmapId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notion/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ heatmapId }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch heatmap data:', await response.text())
      return []
    }

    const { data } = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    return []
  }
}

export const metadata = {
  title: 'Notion Heatmap',
  description: 'Heatmap visualization',
  viewport: 'width=device-width, initial-scale=1',
  referrer: 'no-referrer',
  other: {
    'notion:renderer': 'iframe',
  },
}

export default async function EmbedPage({ params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data: config, error } = await supabase
      .from('heatmaps')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !config) {
      return <div className="p-4 text-center text-sm text-muted-foreground">Heatmap not found</div>
    }

    const data = await getHeatmapData(config.id)

    return (
      <div className="p-2 bg-transparent w-full h-full">
        <HeatmapCard
          config={config}
          data={data}
          isEmbed={true}
          showControls={true}
        />
      </div>
    )
  } catch (error) {
    console.error('Error in embed page:', error)
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load heatmap. Please try again later.
      </div>
    )
  }
} 