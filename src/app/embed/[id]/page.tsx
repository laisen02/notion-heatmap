import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"

async function getHeatmapData(heatmapId: string) {
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
}

export default async function EmbedPage({ params }: { params: { id: string } }) {
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
    <div className="p-2 bg-transparent">
      <HeatmapCard
        config={config}
        data={data}
        isEmbed={true}
        showControls={true}
      />
    </div>
  )
}

// Add metadata to help with caching and security
export const metadata = {
  referrer: 'no-referrer',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  // Add OpenGraph meta tags for better embedding
  openGraph: {
    type: 'website',
    title: 'Notion Heatmap',
    description: 'Heatmap visualization',
  }
} 