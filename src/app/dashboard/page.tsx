import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      redirect('/auth')
    }

    if (!session) {
      redirect('/auth')
    }

    // Get user's heatmaps with error handling
    const { data: heatmaps, error: heatmapsError } = await supabase
      .from('heatmaps')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (heatmapsError) {
      console.error('Error fetching heatmaps:', heatmapsError)
      return (
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Heatmaps</h1>
            <p className="text-muted-foreground mb-4">Unable to load your heatmaps. Please try again later.</p>
            <Button asChild>
              <Link href="/create">Create New Heatmap</Link>
            </Button>
          </div>
        </div>
      )
    }

    // If no heatmaps, show empty state
    if (!heatmaps || heatmaps.length === 0) {
      return (
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Notion Heatmap!</h1>
            <p className="text-muted-foreground mb-4">Get started by creating your first heatmap.</p>
            <Button asChild>
              <Link href="/create">Create Your First Heatmap</Link>
            </Button>
          </div>
        </div>
      )
    }

    // Show heatmaps grid if we have data
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Heatmaps</h1>
          <Button asChild>
            <Link href="/create">Create New Heatmap</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {heatmaps.map((heatmap) => (
            <HeatmapCard 
              key={heatmap.id} 
              heatmap={heatmap} 
            />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }
} 