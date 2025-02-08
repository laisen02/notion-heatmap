"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { HeatmapGrid } from "./heatmap-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Heatmap {
  id: string
  name: string
  created_at: string
  user_id: string
}

interface HeatmapCardProps {
  heatmap: Heatmap
}

export function HeatmapCard({ heatmap }: HeatmapCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('heatmaps')
        .delete()
        .eq('id', heatmap.id)

      if (error) throw error
      
      toast.success("Heatmap deleted successfully")
      // Optionally refresh the page or update the UI
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
        <p className="text-sm text-muted-foreground">
          Created on {new Date(heatmap.created_at).toLocaleDateString()}
        </p>
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