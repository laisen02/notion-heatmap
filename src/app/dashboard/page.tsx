import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth')
  }

  // Get user's heatmaps
  const { data: heatmaps, error } = await supabase
    .from('heatmaps')
    .select('*')
    .eq('user_id', session.user.id) // Only get current user's heatmaps
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching heatmaps:', error)
    return <div>Error loading heatmaps</div>
  }

  // If no heatmaps, redirect to create page
  if (heatmaps.length === 0) {
    redirect('/create')
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Heatmaps</h1>
        <Link href="/create">
          <Button>Create New Heatmap</Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {heatmaps.map((heatmap) => (
          <HeatmapCard key={heatmap.id} heatmap={heatmap} />
        ))}
      </div>
    </div>
  )
} 