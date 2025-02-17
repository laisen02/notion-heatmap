"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { HeatmapForm } from "@/components/heatmap/heatmap-form"
import { Loading } from "@/components/ui/loading"
import type { HeatmapConfig } from "@/types/heatmap"

export default function EditHeatmapPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [config, setConfig] = useState<HeatmapConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const { data, error } = await supabase
          .from('heatmaps')
          .select('*')
          .eq('id', resolvedParams.id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Heatmap not found')

        setConfig(data)
      } catch (error: any) {
        console.error('Error fetching heatmap:', error)
        toast.error('Failed to load heatmap')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatmap()
  }, [resolvedParams.id, router, supabase])

  if (isLoading) {
    return <Loading text="Loading heatmap..." />
  }

  if (!config) {
    return null
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Heatmap</h1>
      <HeatmapForm 
        initialData={config}
        mode="edit"
      />
    </div>
  )
} 