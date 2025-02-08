"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { HeatmapGrid } from "./heatmap-grid"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface Heatmap {
  id: string
  name: string
  created_at: string
  user_id: string
  data?: any // Add this for heatmap data
}

interface HeatmapCardProps {
  heatmap: Heatmap
}

export function HeatmapCard({ heatmap }: HeatmapCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchHeatmapData() {
      try {
        const { data, error } = await supabase
          .from('heatmap_data')
          .select('*')
          .eq('heatmap_id', heatmap.id)
          .single()

        if (error) throw error
        setHeatmapData(data)
      } catch (error) {
        console.error('Error fetching heatmap data:', error)
        toast.error("Failed to load heatmap data")
      }
    }

    fetchHeatmapData()
  }, [heatmap.id, supabase])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('heatmaps')
        .delete()
        .eq('id', heatmap.id)

      if (error) throw error
      
      toast.success("Heatmap deleted successfully")
      window.location.reload()
    } catch (error) {
      console.error('Error deleting heatmap:', error)
      toast.error("Failed to delete heatmap")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{heatmap.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Created on {new Date(heatmap.created_at).toLocaleDateString()}
          </p>
          {heatmapData && (
            <div className="w-full aspect-square">
              <HeatmapGrid 
                data={heatmapData.data || []}
                isInteractive={false}
                showTooltip={true}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/edit/${heatmap.id}`}>
          <Button variant="outline" size="sm">
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.trash className="mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

function calculateStandardDeviation(values: number[]): number {
  if (!values || values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squareDiffs = values.map(value => Math.pow(value - mean, 2))
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(avgSquareDiff)
} 