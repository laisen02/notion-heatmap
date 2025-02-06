import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: heatmaps, error } = await supabase
    .from('heatmaps')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching heatmaps:', error)
    return <div>Failed to load heatmaps</div>
  }

  // Fetch data for each heatmap
  const heatmapsWithData = await Promise.all(
    heatmaps.map(async (heatmap) => ({
      config: heatmap,
      data: await getHeatmapData(heatmap.id)
    }))
  )

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Heatmaps</h1>
        <Button asChild>
          <Link href="/create">Create New Heatmap</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {heatmapsWithData.map(({ config, data }) => (
          <HeatmapCard
            key={config.id}
            config={config}
            data={data}
          />
        ))}
      </div>

      {heatmaps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No heatmaps yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
} 