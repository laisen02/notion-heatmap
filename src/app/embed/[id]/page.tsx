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

// Combine both metadata declarations into one
export const metadata = {
  title: 'Notion Heatmap',
  description: 'Heatmap visualization',
  viewport: 'width=device-width, initial-scale=1',
  referrer: 'no-referrer',
  other: {
    'notion:renderer': 'iframe',
  },
  // Updated headers for Notion embedding
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy': "frame-ancestors 'self' https://*.notion.so https://notion.so https://www.notion.so;",
  // OpenGraph meta tags for better embedding
  openGraph: {
    type: 'website',
    title: 'Notion Heatmap',
    description: 'Heatmap visualization',
  }
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
    <div className="p-2 bg-transparent w-full h-full">
      <HeatmapCard
        config={config}
        data={data}
        isEmbed={true}
        showControls={true}
      />
    </div>
  )
} 