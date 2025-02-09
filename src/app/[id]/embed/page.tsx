import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"

export const metadata = {
  title: 'Notion Heatmap',
  description: 'Heatmap visualization',
  viewport: 'width=device-width, initial-scale=1',
  referrer: 'no-referrer',
  'x-frame-options': 'SAMEORIGIN',
  'content-security-policy': "frame-ancestors 'self' https://*.notion.so https://notion.so https://www.notion.so;",
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