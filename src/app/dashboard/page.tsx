import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Heatmaps</h1>
        <Button asChild>
          <Link href="/create">Create New Heatmap</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {heatmaps?.map((heatmap) => (
          <HeatmapCard
            key={heatmap.id}
            config={heatmap}
            data={[]} // TODO: Fetch actual data
          />
        ))}
      </div>

      {heatmaps?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No heatmaps yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
} 