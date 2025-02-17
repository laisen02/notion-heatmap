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

export default function DashboardPage() {
  const router = useRouter()
  const [heatmaps, setHeatmaps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchHeatmaps = useCallback(async (force = false) => {
    // Check if cache is still valid
    const now = Date.now()
    if (!force && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return // Use cached data
    }

    setIsLoading(true)
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

      setHeatmaps(data || [])
      setLastFetchTime(now)
    } catch (error: any) {
      toast.error('Failed to load heatmaps')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, lastFetchTime])

  useEffect(() => {
    fetchHeatmaps()
  }, [fetchHeatmaps])

  // Manual refresh function
  const handleRefresh = () => {
    fetchHeatmaps(true) // Force refresh
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
        <Link href="/create">
          <Button>Create New Heatmap</Button>
        </Link>
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