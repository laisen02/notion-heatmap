"use client"

import { useState } from "react"
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
  data: number[][] // Update this to match your schema
}

interface HeatmapCardProps {
  heatmap: Heatmap
}

export function HeatmapCard({ heatmap }: HeatmapCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientComponentClient()

  // Initialize empty grid if no data
  const gridData = heatmap.data || Array(7).fill(Array(7).fill(0))

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
          <div className="w-full aspect-square">
            <HeatmapGrid 
              data={gridData}
              isInteractive={false}
              showTooltip={true}
            />
          </div>
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