import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ErrorMessage } from "@/components/error-message"

export default async function DashboardPage() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
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
      return <ErrorMessage />
    }

    // If no heatmaps, show empty state
    if (!heatmaps || heatmaps.length === 0) {
      return (
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Notion Heatmap!</h1>
            <p className="text-muted-foreground mb-4">Get started by creating your first heatmap.</p>
            <Link href="/create">
              <Button>Create Your First Heatmap</Button>
            </Link>
          </div>
        </div>
      )
    }

    // Show heatmaps grid if we have data
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
    return <ErrorMessage />
  }
} 