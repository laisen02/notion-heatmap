"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { HeatmapConfig, ColorTheme } from "@/types/heatmap"

interface HeatmapFormProps {
  initialData?: HeatmapConfig
  mode?: "create" | "edit"
}

interface Insights {
  averageTime: boolean;
  totalDays: boolean;
  totalTime: boolean;
  standardDeviation: boolean;
}

export function HeatmapForm({ initialData, mode = "create" }: HeatmapFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const defaultFormData: Partial<HeatmapConfig> = {
    name: "",
    description: "",
    notion_api_key: "",
    database_id: "",
    date_column: "",
    time_column: "",
    property_column: "",
    activity_column: "",
    color_theme: "github" as ColorTheme,
    week_start: "monday",
    is_public: false,
    insights: {
      averageTime: true,
      totalDays: true,
      totalTime: true,
      standardDeviation: false
    }
  }

  const [formData, setFormData] = useState<Partial<HeatmapConfig>>(() => {
    if (mode === "edit" && initialData) {
      return {
        ...initialData,
        insights: {
          averageTime: initialData.insights?.averageTime ?? true,
          totalDays: initialData.insights?.totalDays ?? true,
          totalTime: initialData.insights?.totalTime ?? true,
          standardDeviation: initialData.insights?.standardDeviation ?? false,
        }
      }
    }
    return defaultFormData
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === "edit" && initialData?.id) {
        const updateData = {
          name: formData.name,
          description: formData.description,
          notion_api_key: formData.notion_api_key,
          database_id: formData.database_id,
          date_column: formData.date_column,
          time_column: formData.time_column,
          property_column: formData.property_column,
          activity_column: formData.activity_column,
          color_theme: formData.color_theme,
          week_start: formData.week_start,
          is_public: formData.is_public,
          insights: formData.insights
        }

        console.log('Updating with:', updateData)

        // First, check if the record exists
        const { data: existingData, error: checkError } = await supabase
          .from('heatmaps')
          .select('id')
          .eq('id', initialData.id)
          .single()

        if (checkError || !existingData) {
          throw new Error('Heatmap not found')
        }

        // Then perform the update
        const { error: updateError } = await supabase
          .from('heatmaps')
          .update(updateData)
          .eq('id', initialData.id)

        if (updateError) {
          throw updateError
        }

        toast.success('Heatmap updated successfully')
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase
          .from('heatmaps')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
          }])

        if (error) {
          throw new Error(error.message)
        }

        toast.success('Heatmap created successfully')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Error saving heatmap:', error.message || error)
      toast.error(
        mode === "edit" 
          ? `Failed to update heatmap: ${error.message || 'Unknown error'}`
          : `Failed to create heatmap: ${error.message || 'Unknown error'}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleColorThemeChange = (value: string) => {
    setFormData(prev => ({ ...prev, color_theme: value as ColorTheme }))
  }

  const handleWeekStartChange = (value: string) => {
    setFormData(prev => ({ ...prev, week_start: value }))
  }

  const handleInsightChange = (key: keyof Insights) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      insights: {
        ...prev.insights as Insights,
        [key]: e.target.checked
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Info */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Notion Settings */}
        <div>
          <Label htmlFor="notion_api_key">Notion API Key</Label>
          <Input
            id="notion_api_key"
            type="password"
            value={formData.notion_api_key}
            onChange={(e) => setFormData(prev => ({ ...prev, notion_api_key: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="database_id">Database ID</Label>
          <Input
            id="database_id"
            value={formData.database_id}
            onChange={(e) => setFormData(prev => ({ ...prev, database_id: e.target.value }))}
            required
          />
        </div>

        {/* Column Mappings */}
        <div>
          <Label htmlFor="date_column">Date Column</Label>
          <Input
            id="date_column"
            value={formData.date_column}
            onChange={(e) => setFormData(prev => ({ ...prev, date_column: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="time_column">Time Column</Label>
          <Input
            id="time_column"
            value={formData.time_column}
            onChange={(e) => setFormData(prev => ({ ...prev, time_column: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="property_column">Property Column (Optional)</Label>
          <Input
            id="property_column"
            value={formData.property_column}
            onChange={(e) => setFormData(prev => ({ ...prev, property_column: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="activity_column">Activity Column (Optional)</Label>
          <Input
            id="activity_column"
            value={formData.activity_column}
            onChange={(e) => setFormData(prev => ({ ...prev, activity_column: e.target.value }))}
          />
        </div>

        {/* Display Settings */}
        <div>
          <Label htmlFor="color_theme">Color Theme</Label>
          <Select
            value={formData.color_theme}
            onValueChange={handleColorThemeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a color theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="week_start">Week Starts On</Label>
          <Select
            value={formData.week_start}
            onValueChange={handleWeekStartChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select week start" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Insights Settings */}
        <div className="space-y-2">
          <Label>Insights</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="averageTime"
                checked={formData.insights?.averageTime}
                onChange={handleInsightChange('averageTime')}
              />
              <Label htmlFor="averageTime">Average Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="totalDays"
                checked={formData.insights?.totalDays}
                onChange={handleInsightChange('totalDays')}
              />
              <Label htmlFor="totalDays">Total Days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="totalTime"
                checked={formData.insights?.totalTime}
                onChange={handleInsightChange('totalTime')}
              />
              <Label htmlFor="totalTime">Total Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="standardDeviation"
                checked={formData.insights?.standardDeviation}
                onChange={handleInsightChange('standardDeviation')}
              />
              <Label htmlFor="standardDeviation">Standard Deviation</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {mode === "edit" ? "Update" : "Create"} Heatmap
          </Button>
        </div>
      </div>
    </form>
  )
} 