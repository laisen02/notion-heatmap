"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Create a cache store
const heatmapCache = {
  data: null as any[] | null,
  lastFetch: 0,
}

export default function DashboardPage() {
  const router = useRouter()
  const [heatmaps, setHeatmaps] = useState<any[]>(() => heatmapCache.data || [])
  const [isLoading, setIsLoading] = useState(!heatmapCache.data)
  const [isBackgroundUpdate, setIsBackgroundUpdate] = useState(false)

  const fetchHeatmaps = useCallback(async (background = false) => {
    // Check if cache is still valid
    const now = Date.now()
    if (!background && heatmapCache.data && (now - heatmapCache.lastFetch) < CACHE_DURATION) {
      return // Use cached data
    }

    if (!background) {
      setIsLoading(true)
    } else {
      setIsBackgroundUpdate(true)
    }

    try {
      const supabase = createClientComponentClient()
      
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('heatmaps')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Update cache
      heatmapCache.data = data
      heatmapCache.lastFetch = now

      setHeatmaps(data || [])
    } catch (error: any) {
      if (!background) {
        toast.error('Failed to load heatmaps')
      }
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
      setIsBackgroundUpdate(false)
    }
  }, [router])

  // Initial load - use cache or fetch
  useEffect(() => {
    if (heatmapCache.data) {
      // If we have cached data, show it immediately and update in background
      setHeatmaps(heatmapCache.data)
      fetchHeatmaps(true) // Background update
    } else {
      // First load - fetch normally
      fetchHeatmaps(false)
    }
  }, [fetchHeatmaps])

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    const subscription = supabase
      .channel('heatmaps_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'heatmaps' 
        }, 
        () => {
          // When data changes, update in background
          fetchHeatmaps(true)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchHeatmaps])

  // Manual refresh function
  const handleRefresh = () => {
    fetchHeatmaps(false) // Force refresh
  }

  if (isLoading && !heatmaps.length) {
    return (
      <div className="container py-8">
        <Loading text="Loading your heatmaps..." />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Heatmaps</h1>
        <div className="flex items-center gap-4">
          {isBackgroundUpdate && (
            <span className="text-sm text-muted-foreground">
              Updating...
            </span>
          )}
          <Button onClick={handleRefresh} disabled={isLoading}>
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
            data={heatmap.initialData}
            isEmbed={false}
          />
        ))}
      </div>
    </div>
  )
} 