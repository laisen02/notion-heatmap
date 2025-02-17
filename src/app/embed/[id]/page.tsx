import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { EmbedContent } from "@/components/embed/embed-content"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { generateDemoData, getDemoConfig } from "@/lib/demo-data"

// Metadata can stay in server component
export const metadata = {
  title: 'Notion Heatmap',
  description: 'Heatmap visualization',
  viewport: 'width=device-width, initial-scale=1',
  referrer: 'no-referrer',
  other: {
    'notion:renderer': 'iframe',
    'robots': 'noindex',
  },
  // Updated headers for Notion embedding
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy': "frame-ancestors 'self' https://*.notion.so https://notion.so https://www.notion.so;",
  // OpenGraph meta tags for better embedding
  openGraph: {
    type: 'website',
    title: 'Notion Heatmap',
    description: 'Heatmap visualization',
    'og:site_name': 'Notion Heatmap',
    'og:image': `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
  },
  verification: {
    'notion': 'notionheatmap',
  }
}

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
  // Special handling for demo embed
  if (params.id === 'demo') {
    return (
      <div className="p-4">
        <HeatmapCard
          config={getDemoConfig()}
          data={generateDemoData()}
          isEmbed={true}
          showControls={false}
        />
      </div>
    )
  }

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

  return <EmbedContent config={config} data={data} />
} 