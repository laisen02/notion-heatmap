"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getDatabaseSchema, getDatabaseContent, getNotionClient } from "@/lib/notion"
import { Icons } from "@/components/icons"
import { ColorTheme } from "@/types/heatmap"
import { cn } from "@/lib/utils"

interface FormData {
  name: string
  description: string
  notion_api_key: string
  database_id: string
  date_column: string
  time_column: string
  property_column: string
  activity_column: string
  colorTheme: string
  week_start: string
  is_public: boolean
  insights: {
    averageTime: boolean
    totalDays: boolean
    totalTime: boolean
    standardDeviation: boolean
  }
}

interface DatabaseSchema {
  [key: string]: {
    type: string
    name: string
  }
}

// Add the color classes definition
const colorThemes: ColorTheme[] = [
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'red',
  'brown',
  'gray',
  'lightgray'
]

export function CreateHeatmapForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema | null>(null)
  const [isValidatingNotion, setIsValidatingNotion] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    notion_api_key: "",
    database_id: "",
    date_column: "",
    time_column: "",
    property_column: "",
    activity_column: "",
    colorTheme: "orange",
    week_start: "monday",
    is_public: true,
    insights: {
      averageTime: true,
      totalDays: true,
      totalTime: true,
      standardDeviation: false
    }
  })

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a heatmap name')
      return false
    }

    if (!formData.notion_api_key.trim()) {
      toast.error('Please enter your Notion API key')
      return false
    }

    if (!formData.database_id.trim()) {
      toast.error('Please enter your database ID')
      return false
    }

    if (!databaseSchema) {
      toast.error('Please ensure your Notion credentials are valid')
      return false
    }

    if (!formData.date_column) {
      toast.error('Please select a date column')
      return false
    }

    if (!formData.time_column) {
      toast.error('Please select a time/duration column')
      return false
    }

    if (!formData.property_column) {
      toast.error('Please select an activity type column')
      return false
    }

    if (!formData.activity_column.trim()) {
      toast.error('Please enter an activity type to track')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Please sign in to create a heatmap')
        router.push('/auth')
        return
      }

      // Validate Notion access first
      const validateResponse = await fetch('/api/notion/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: formData.notion_api_key,
          databaseId: formData.database_id,
        }),
      })

      if (!validateResponse.ok) {
        const error = await validateResponse.json()
        throw new Error(error.error || 'Failed to validate Notion access')
      }

      const { database } = await validateResponse.json()
      console.log('Database validated:', database)

      // Store configuration in Supabase
      const { data: heatmap, error: insertError } = await supabase
        .from('heatmaps')
        .insert({
          name: formData.name,
          description: formData.description,
          notion_api_key: formData.notion_api_key,
          database_id: formData.database_id,
          date_column: formData.date_column,
          time_column: formData.time_column,
          property_column: formData.property_column,
          activity_column: formData.activity_column,
          color_theme: formData.colorTheme,
          week_start: formData.week_start,
          is_public: formData.is_public,
          insights: formData.insights,
          user_id: user.id,
          display_order: 0
        })
        .select()
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        if (insertError.code === '23503') { // Foreign key violation
          toast.error('Please sign in to create a heatmap')
          return
        }
        if (insertError.code === '23505') { // Unique violation
          toast.error('You already have a heatmap with this name')
          return
        }
        throw insertError
      }

      if (!heatmap) {
        throw new Error('Failed to create heatmap - no data returned')
      }

      toast.success('Heatmap created successfully')
      router.push(`/dashboard`)
    } catch (error) {
      console.error('Error:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to create heatmap')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Function to validate Notion credentials and fetch schema
  const validateNotionAndFetchSchema = async () => {
    if (!formData.notion_api_key || !formData.database_id) return

    setIsValidatingNotion(true)
    try {
      const response = await fetch('/api/notion/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: formData.notion_api_key,
          databaseId: formData.database_id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to validate Notion access')
      }

      const { database } = await response.json()
      setDatabaseSchema(database.properties)
      toast.success('Notion database connected successfully')
    } catch (error) {
      console.error('Validation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to validate Notion access')
      setDatabaseSchema(null)
    } finally {
      setIsValidatingNotion(false)
    }
  }

  // Validate Notion credentials when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateNotionAndFetchSchema()
    }, 500) // Debounce validation

    return () => clearTimeout(timeoutId)
  }, [formData.notion_api_key, formData.database_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">Heatmap Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="My Activity Heatmap"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Track my daily activities..."
          />
        </div>

        {/* Notion Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notion Database Configuration</h3>
          
          {/* API Key field */}
          <div className="space-y-2">
            <Label htmlFor="notion_api_key">Notion API Key</Label>
            <Input
              id="notion_api_key"
              value={formData.notion_api_key}
              onChange={handleInputChange}
              placeholder="ntn_..."
            />
            <div className="text-sm text-muted-foreground">
              To get your API key:
            </div>
            <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
              <li>Go to Notion Integrations</li>
              <li>Click "New integration"</li>
              <li>Name it "Heatmap Integration"</li>
              <li>Select your workspace</li>
              <li>
                Under "Capabilities", enable:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Read content</li>
                </ul>
              </li>
              <li>Copy the "Internal Integration Token" (starts with ntn_)</li>
            </ol>
          </div>

          {/* Database ID field */}
          <div className="space-y-2">
            <Label htmlFor="database_id">Database ID</Label>
            <Input
              id="database_id"
              value={formData.database_id}
              onChange={handleInputChange}
            />
            <div className="text-sm text-muted-foreground">
              To get your database ID and share it:
            </div>
            <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
              <li>Open your Notion database</li>
              <li>Copy the ID from the URL (after the workspace name and before ?v=)</li>
              <li>Make sure to Click "..." setting on the top right</li>
              <li>Click "Connections" and find "Heatmap Integration"</li>
              <li>Click "Confirm" and check it display on the active connections section</li>
            </ol>
          </div>

          {/* Show warning when Notion credentials are missing/invalid */}
          {(!formData.notion_api_key || !formData.database_id || !databaseSchema) && (
            <div className="rounded-md bg-destructive/15 p-3">
              <div className="flex">
                <Icons.warning className="h-5 w-5 text-destructive" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Notion Connection Required
                  </h3>
                  <div className="text-sm text-destructive">
                    Unable to fetch database properties. Please verify your credentials.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Column selection fields - only show when we have the schema */}
          {databaseSchema && (
            <div className="space-y-4">
              {/* Date Column */}
              <div className="space-y-2">
                <Label htmlFor="date_column">Date Column</Label>
                <Select
                  value={formData.date_column}
                  onValueChange={(value) => handleInputChange({ target: { id: 'date_column', value } })}
                >
                  <SelectTrigger id="date_column">
                    <SelectValue placeholder="Select date column" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(databaseSchema || {})
                      .filter(([_, prop]) => 
                        prop.type === 'date' || 
                        prop.type === 'created_time' || 
                        prop.type === 'last_edited_time'
                      )
                      .map(([key, prop]) => (
                        <SelectItem key={key} value={key}>
                          {key} ({prop.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the column containing the date for each entry
                </p>
              </div>

              {/* Time Column */}
              <div className="space-y-2">
                <Label htmlFor="time_column">Time/Duration Column</Label>
                <Select
                  value={formData.time_column}
                  onValueChange={(value) => handleInputChange({ target: { id: 'time_column', value } })}
                >
                  <SelectTrigger id="time_column">
                    <SelectValue placeholder="Select time column" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(databaseSchema).map(([key, prop]) => (
                      <SelectItem key={key} value={key}>
                        {key} ({prop.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the column containing the duration/hours value
                </p>
              </div>

              {/* Property Column */}
              <div className="space-y-2">
                <Label htmlFor="property_column">Activity Type Column</Label>
                <Select
                  value={formData.property_column}
                  onValueChange={(value) => handleInputChange({ target: { id: 'property_column', value } })}
                >
                  <SelectTrigger id="property_column">
                    <SelectValue placeholder="Select activity type column" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(databaseSchema)
                      .filter(([_, prop]) => prop.type === 'select')
                      .map(([key]) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the column containing activity types
                </p>
              </div>

              {/* Activity Filter */}
              <div className="space-y-2">
                <Label htmlFor="activity_column">Activity Filter</Label>
                <Input
                  id="activity_column"
                  value={formData.activity_column}
                  onChange={handleInputChange}
                  placeholder="e.g., Exercise"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the activity type to track (must match exactly)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="space-y-2">
          <Label>Color Theme</Label>
          <Select
            value={formData.colorTheme}
            onValueChange={(value) => handleInputChange({ target: { id: 'colorTheme', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select color theme" />
            </SelectTrigger>
            <SelectContent>
              {colorThemes.map((color) => (
                <SelectItem
                  key={color}
                  value={color}
                  className={cn(
                    "capitalize",
                    color === 'orange' && 'hover:bg-orange-100',
                    color === 'yellow' && 'hover:bg-yellow-100',
                    color === 'green' && 'hover:bg-green-100',
                    color === 'blue' && 'hover:bg-blue-100',
                    color === 'purple' && 'hover:bg-purple-100',
                    color === 'pink' && 'hover:bg-pink-100',
                    color === 'red' && 'hover:bg-red-100',
                    color === 'brown' && 'hover:bg-amber-100',
                    color === 'gray' && 'hover:bg-gray-100',
                    color === 'lightgray' && 'hover:bg-slate-100'
                  )}
                >
                  {color === 'lightgray' ? 'Light Gray' : color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Week Starts On</Label>
          <Select
            value={formData.week_start}
            onValueChange={(value) => handleInputChange({ target: { id: 'week_start', value } })}
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

        {/* Insights */}
        <div className="space-y-4">
          <Label>Insights</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="averageTime"
                checked={formData.insights.averageTime}
                onCheckedChange={(checked) => 
                  handleInputChange({ target: { id: 'insights.averageTime', value: checked as boolean } })
                }
              />
              <label htmlFor="averageTime" className="text-sm">
                Average Time Per Active Day
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="totalDays"
                checked={formData.insights.totalDays}
                onCheckedChange={(checked) => 
                  handleInputChange({ target: { id: 'insights.totalDays', value: checked as boolean } })
                }
              />
              <label htmlFor="totalDays" className="text-sm">
                Total Days Active
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="totalTime"
                checked={formData.insights.totalTime}
                onCheckedChange={(checked) => 
                  handleInputChange({ target: { id: 'insights.totalTime', value: checked as boolean } })
                }
              />
              <label htmlFor="totalTime" className="text-sm">
                Total Time
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="standardDeviation"
                checked={formData.insights.standardDeviation}
                onCheckedChange={(checked) => 
                  handleInputChange({ target: { id: 'insights.standardDeviation', value: checked as boolean } })
                }
              />
              <label htmlFor="standardDeviation" className="text-sm">
                Standard Deviation
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-2">
          <Label>Privacy</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => 
                handleInputChange({ target: { id: 'is_public', value: checked } })
              }
            />
            <label
              htmlFor="is_public"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Public (can view by others when you share to them)
            </label>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Heatmap"}
      </Button>
    </form>
  )
} 