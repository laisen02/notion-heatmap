"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { HeatmapConfig } from "@/types/heatmap"

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Create a cache store
const heatmapCache = {
  data: null as any[] | null,
  lastFetch: 0,
}

export default function DashboardPage() {
  const router = useRouter()
  const [heatmaps, setHeatmaps] = useState<HeatmapConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchHeatmaps = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('heatmaps')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      console.log('Fetched heatmaps:', data)
      setHeatmaps(data || [])
    } catch (error: any) {
      console.error('Error fetching heatmaps:', error)
      toast.error('Failed to load heatmaps')
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  // Initial fetch
  useEffect(() => {
    fetchHeatmaps()
  }, [fetchHeatmaps])

  // Subscribe to changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>

    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      channel = supabase
        .channel('heatmaps_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'heatmaps',
            filter: `user_id=eq.${session.user.id}`
          }, 
          () => {
            fetchHeatmaps()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [supabase, fetchHeatmaps])

  if (isLoading) {
    return <Loading text="Loading heatmaps..." />
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Heatmaps</h1>
        <div className="flex items-center gap-4">
          <Button onClick={fetchHeatmaps} disabled={isLoading}>
            Refresh
          </Button>
          <Link href="/create">
            <Button>Create New Heatmap</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {heatmaps.map((heatmap) => (
          <HeatmapCard 
            key={heatmap.id}
            config={heatmap}
            showControls={true}
            data={[]} // Add empty data array to satisfy type
          />
        ))}
      </div>
    </div>
  )
} 