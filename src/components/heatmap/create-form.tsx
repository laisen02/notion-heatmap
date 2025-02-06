"use client"

import { useState } from "react"
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

interface FormData {
  name: string
  description: string
  notionApiKey: string
  databaseId: string
  timeColumn: string
  activityColumn: string
  propertyColumn: string
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

export function CreateHeatmapForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    notionApiKey: "",
    databaseId: "",
    timeColumn: "",
    activityColumn: "",
    propertyColumn: "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
          time_column: formData.timeColumn,
          activity_column: formData.activityColumn,
          property_column: formData.propertyColumn,
          color_theme: formData.colorTheme,
          week_start: formData.weekStart,
          is_public: formData.isPublic,
          insights: formData.insights,
          user_id: user.id,
          display_order: 0 // Add this if your table requires it
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

        {/* Column Names */}
        <div className="space-y-2">
          <Label htmlFor="timeColumn">Time Column Name</Label>
          <Input
            id="timeColumn"
            value={formData.timeColumn}
            onChange={(e) => setFormData({ ...formData, timeColumn: e.target.value })}
            placeholder="Date"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activityColumn">Activity Column Name</Label>
          <Input
            id="activityColumn"
            value={formData.activityColumn}
            onChange={(e) => setFormData({ ...formData, activityColumn: e.target.value })}
            placeholder="Activity"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyColumn">Property Column Name</Label>
          <Input
            id="propertyColumn"
            value={formData.propertyColumn}
            onChange={(e) => setFormData({ ...formData, propertyColumn: e.target.value })}
            placeholder="Type"
            required
          />
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Heatmap"}
      </Button>
    </form>
  )
} 