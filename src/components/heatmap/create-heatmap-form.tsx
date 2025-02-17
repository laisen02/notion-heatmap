"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

export function CreateHeatmapForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  // ... other state and form fields

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const supabase = createClientComponentClient()
      
      // Show creating state
      toast.loading('Creating your heatmap...')

      const { data, error } = await supabase
        .from('heatmaps')
        .insert([
          // your heatmap data
        ])
        .select()
        .single()

      if (error) throw error

      // Navigate first
      await router.push('/dashboard')
      // Then show success
      toast.success('Heatmap created successfully')
    } catch (error) {
      toast.error('Failed to create heatmap')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Your form fields */}
      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? (
          <Loading text="Creating heatmap..." />
        ) : (
          "Create Heatmap"
        )}
      </Button>
    </form>
  )
} 