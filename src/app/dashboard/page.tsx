import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Failed to get session')
    }

    if (!session) {
      redirect('/auth')
    }

    // Get user's heatmaps
    const { data: heatmaps, error: heatmapsError } = await supabase
      .from('heatmaps')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (heatmapsError) {
      console.error('Error fetching heatmaps:', heatmapsError)
      throw new Error('Failed to load heatmaps')
    }

    if (!heatmaps) {
      throw new Error('No heatmaps found')
    }

    // Show empty state if no heatmaps
    if (heatmaps.length === 0) {
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

    // Show heatmaps grid
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
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Please try refreshing the page'}
          </p>
          <Link href="/dashboard">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    )
  }
} 