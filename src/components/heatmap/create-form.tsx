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

interface FormData {
  name: string
  description: string
  notionApiKey: string
  databaseId: string
  dateColumn: string
  timeColumn: string
  propertyColumn: string
  activityColumn: string
  colorTheme: string
  weekStart: string
  isPublic: boolean
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

export function CreateHeatmapForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema | null>(null)
  const [isValidatingNotion, setIsValidatingNotion] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    notionApiKey: "",
    databaseId: "",
    dateColumn: "",
    timeColumn: "",
    propertyColumn: "",
    activityColumn: "",
    colorTheme: "orange",
    weekStart: "monday",
    isPublic: true,
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

    if (!formData.notionApiKey.trim()) {
      toast.error('Please enter your Notion API key')
      return false
    }

    if (!formData.databaseId.trim()) {
      toast.error('Please enter your database ID')
      return false
    }

    if (!databaseSchema) {
      toast.error('Please ensure your Notion credentials are valid')
      return false
    }

    if (!formData.dateColumn) {
      toast.error('Please select a date column')
      return false
    }

    if (!formData.timeColumn) {
      toast.error('Please select a time/duration column')
      return false
    }

    if (!formData.propertyColumn) {
      toast.error('Please select an activity type column')
      return false
    }

    if (!formData.activityColumn.trim()) {
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
          apiKey: formData.notionApiKey,
          databaseId: formData.databaseId,
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
          notion_api_key: formData.notionApiKey,
          database_id: formData.databaseId,
          date_column: formData.dateColumn,
          time_column: formData.timeColumn,
          property_column: formData.propertyColumn,
          activity_column: formData.activityColumn,
          color_theme: formData.colorTheme,
          week_start: formData.weekStart,
          is_public: formData.isPublic,
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
    if (!formData.notionApiKey || !formData.databaseId) return

    setIsValidatingNotion(true)
    try {
      const response = await fetch('/api/notion/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: formData.notionApiKey,
          databaseId: formData.databaseId,
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
  }, [formData.notionApiKey, formData.databaseId])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">Heatmap Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Activity Heatmap"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Track my daily activities..."
          />
        </div>

        {/* Notion Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notion Database Configuration</h3>
          
          {/* API Key and Database ID fields */}
          <div className="space-y-2">
            <Label htmlFor="notionApiKey">Notion API Key</Label>
            <Input
              id="notionApiKey"
              type="password"
              value={formData.notionApiKey}
              onChange={(e) => setFormData({ ...formData, notionApiKey: e.target.value })}
              placeholder="ntn_xxxxxxxx..."
              required
            />
            <div className="text-sm text-muted-foreground space-y-1">
              <div>To get your API key:</div>
              <ol className="list-decimal list-inside">
                <li>Go to <a 
                  href="https://www.notion.so/my-integrations" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Notion Integrations
                </a></li>
                <li>Click "New integration"</li>
                <li>Name it "Notion Heatmap"</li>
                <li>Select your workspace</li>
                <li>Under "Capabilities", enable:
                  <ul className="list-disc list-inside ml-4">
                    <li>Read content</li>
                    <li>Read databases</li>
                  </ul>
                </li>
                <li>Copy the "Internal Integration Token" (starts with ntn_)</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="databaseId">Database ID</Label>
            <Input
              id="databaseId"
              value={formData.databaseId}
              onChange={(e) => setFormData({ ...formData, databaseId: e.target.value })}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx"
              required
            />
            <div className="text-sm text-muted-foreground space-y-1">
              <div>To get your database ID and share it:</div>
              <ol className="list-decimal list-inside">
                <li>Open your Notion database</li>
                <li>Copy the ID from the URL (after the workspace name and before ?v=)</li>
                <li>Click "Share" in the top right</li>
                <li>Click "Invite" and find your integration</li>
                <li>Click "Invite"</li>
              </ol>
            </div>
          </div>

          {isValidatingNotion && (
            <div className="text-sm text-muted-foreground">
              Validating Notion access...
            </div>
          )}

          {/* Column selection fields - only show when we have the schema */}
          {databaseSchema && (
            <div className="space-y-4">
              {/* Date Column */}
              <div className="space-y-2">
                <Label htmlFor="dateColumn">Date Column</Label>
                <Select
                  value={formData.dateColumn}
                  onValueChange={(value) => setFormData({ ...formData, dateColumn: value })}
                >
                  <SelectTrigger id="dateColumn">
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
                <Label htmlFor="timeColumn">Time/Duration Column</Label>
                <Select
                  value={formData.timeColumn}
                  onValueChange={(value) => setFormData({ ...formData, timeColumn: value })}
                >
                  <SelectTrigger id="timeColumn">
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
                <Label htmlFor="propertyColumn">Activity Type Column</Label>
                <Select
                  value={formData.propertyColumn}
                  onValueChange={(value) => setFormData({ ...formData, propertyColumn: value })}
                >
                  <SelectTrigger id="propertyColumn">
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
                <Label htmlFor="activityColumn">Activity Filter</Label>
                <Input
                  id="activityColumn"
                  value={formData.activityColumn}
                  onChange={(e) => setFormData({ ...formData, activityColumn: e.target.value })}
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
            onValueChange={(value) => setFormData({ ...formData, colorTheme: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select color theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Week Starts On</Label>
          <Select
            value={formData.weekStart}
            onValueChange={(value) => setFormData({ ...formData, weekStart: value })}
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
                  setFormData({
                    ...formData,
                    insights: { ...formData.insights, averageTime: checked as boolean }
                  })
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
                  setFormData({
                    ...formData,
                    insights: { ...formData.insights, totalDays: checked as boolean }
                  })
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
                  setFormData({
                    ...formData,
                    insights: { ...formData.insights, totalTime: checked as boolean }
                  })
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
                  setFormData({
                    ...formData,
                    insights: { ...formData.insights, standardDeviation: checked as boolean }
                  })
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
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isPublic: checked as boolean })
              }
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this heatmap public
            </label>
          </div>
        </div>
      </div>

      {/* Show warning when Notion credentials are missing/invalid */}
      {(!formData.notionApiKey || !formData.databaseId || !databaseSchema) && (
        <div className="rounded-md bg-destructive/15 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icons.warning className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Notion Connection Required
              </h3>
              <div className="mt-2 text-sm text-destructive/90">
                <p>
                  {!formData.notionApiKey || !formData.databaseId
                    ? "Please enter your Notion API key and database ID to continue."
                    : "Unable to fetch database properties. Please verify your credentials."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Heatmap"}
      </Button>
    </form>
  )
} 