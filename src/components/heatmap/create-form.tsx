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
import { getDatabases, getDatabaseSchema, getDatabaseContent, getNotionClient } from "@/lib/notion"
import { processNotionData, validateNotionData } from "@/lib/heatmap"
import { DatabaseSelector } from "@/components/heatmap/database-selector"
import { Icons } from "@/components/ui/icons"
import { NotionDatabase } from "@/types/notion"
import type { DatabaseObjectResponse, GetUserResponse } from "@notionhq/client/build/src/api-endpoints"

interface FormData {
  name: string
  description: string
  timeColumn: string
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

interface Property {
  id: string
  name: string
  type: string
}

interface NotionConnection {
  access_token: string
  workspace_name?: string
  workspace_icon?: string
  workspace_id?: string
  bot_id?: string
}

export function CreateHeatmapForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedDb, setSelectedDb] = useState("")
  const [formData, setFormData] = useState<FormData>({
    name: "activity",
    description: "",
    timeColumn: "",
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
  const [previewData, setPreviewData] = useState<any>(null)

  const handleNotionConnect = async () => {
    try {
      setIsLoading(true)
      
      // Clear any existing connection first
      await supabase
        .from('notion_connections')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      // Reset states
      setDatabases([])
      setProperties([])
      setSelectedDb('')

      // Redirect to OAuth endpoint
      window.location.href = '/api/notion/oauth'
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect to Notion')
      setIsLoading(false)
    }
  }

  // Check for OAuth response
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('connected') === 'true') {
      toast.success('Successfully connected to Notion')
      // Fetch databases after successful connection
      fetchDatabases()
    } else if (searchParams.get('error')) {
      toast.error('Failed to connect to Notion')
    }
  }, [])

  const verifyConnection = async (connection: NotionConnection) => {
    try {
      const notion = getNotionClient(connection.access_token)
      const user = await notion.users.me<GetUserResponse>({})
      const userName = user.name || 'Unknown User'
      console.log('Connection verified:', userName)
      return true
    } catch (error) {
      console.error('Connection test error:', error)
      return false
    }
  }

  const fetchDatabases = async () => {
    try {
      setIsLoading(true)
      const { data: connection, error: connectionError } = await supabase
        .from('notion_connections')
        .select('*')
        .single()

      if (connectionError) {
        console.error('Error fetching connection:', connectionError)
        throw new Error(`Failed to fetch Notion connection: ${connectionError.message}`)
      }

      if (!connection) {
        throw new Error('No Notion connection found. Please connect to Notion first.')
      }

      if (!connection.access_token) {
        // Clear invalid connection
        await supabase
          .from('notion_connections')
          .delete()
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        throw new Error('Invalid Notion connection. Please reconnect to Notion.')
      }

      // Verify connection before proceeding
      const isConnected = await verifyConnection(connection)
      if (!isConnected) {
        throw new Error('Unable to connect to Notion API. Please reconnect to Notion.')
      }

      console.log('Fetching databases with token:', connection.access_token.substring(0, 10) + '...')
      const dbs = await getDatabases(connection.access_token)
      
      if (!dbs.length) {
        toast.warning('No databases found. Make sure you have shared databases with this integration.')
        return
      }

      setDatabases(dbs)
    } catch (error) {
      console.error('Error in fetchDatabases:', error)
      if (error instanceof Error) {
        // Show the exact error message to help with debugging
        toast.error(error.message)
        
        if (error.message.includes('Invalid') || error.message.includes('unauthorized')) {
          // Clear the invalid connection
          await supabase
            .from('notion_connections')
            .delete()
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          // Reset state
          setDatabases([])
          setProperties([])
          setSelectedDb('')
        }
      } else {
        toast.error('Failed to fetch Notion databases')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDatabaseSelect = async (dbId: string) => {
    try {
      setIsLoading(true)
      setSelectedDb(dbId)
      
      const { data: connection, error: connectionError } = await supabase
        .from('notion_connections')
        .select()
        .single()

      if (connectionError) {
        console.error('Error fetching connection:', connectionError)
        throw new Error('Failed to fetch Notion connection')
      }

      if (!connection) {
        throw new Error('No Notion connection found')
      }

      const schema = await getDatabaseSchema(connection.access_token, dbId)
      // Update the property mapping to match the new types
      setProperties(Object.entries(schema).map(([id, prop]) => ({
        id,
        name: prop.name,
        type: prop.type
      })))
    } catch (error) {
      console.error('Error in handleDatabaseSelect:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to fetch database schema')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    try {
      setIsLoading(true)
      const { data: connection } = await supabase
        .from('notion_connections')
        .select()
        .single()

      if (!connection) {
        throw new Error('No Notion connection found')
      }

      const data = await getDatabaseContent(
        connection.access_token,
        selectedDb,
        formData.timeColumn,
        formData.activityColumn
      )

      if (!validateNotionData(data, formData.timeColumn, formData.activityColumn)) {
        throw new Error('Invalid data format')
      }

      const processedData = processNotionData(
        data,
        formData.timeColumn,
        formData.activityColumn
      )
      setPreviewData(processedData)
    } catch (error) {
      toast.error('Failed to load preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (!selectedDb || !formData.timeColumn || !formData.activityColumn) {
        throw new Error('Please select a database and columns')
      }

      // Create heatmap in Supabase
      const { data: heatmap, error } = await supabase
        .from('heatmaps')
        .insert({
          name: formData.name,
          description: formData.description,
          database_id: selectedDb,
          time_column: formData.timeColumn,
          activity_column: formData.activityColumn,
          color_theme: formData.colorTheme,
          week_start: formData.weekStart,
          is_public: formData.isPublic,
          insights: formData.insights
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Heatmap created successfully')
      router.push(`/dashboard`)
    } catch (error) {
      console.error('Error creating heatmap:', error)
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
      <div className="space-y-6">
        {/* Step 1: Connect to Notion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">1. Connect to Notion</h3>
            {databases.length > 0 && (
              <span className="text-sm text-green-600">✓ Connected</span>
            )}
          </div>
          
          <Button
            type="button"
            onClick={handleNotionConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Icons.notion className="mr-2 h-4 w-4" />
                {databases.length === 0 ? "Connect to Notion" : "Reconnect to Notion"}
              </>
            )}
          </Button>
        </div>

        {/* Step 2: Select Database and Properties */}
        {databases.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">2. Configure Data Source</h3>
            
            <div className="space-y-2">
              <Label>Select Database</Label>
              <DatabaseSelector
                databases={databases}
                onSelect={handleDatabaseSelect}
                isLoading={isLoading}
              />
            </div>

            {properties.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Time Column</Label>
                  <Select
                    value={formData.timeColumn}
                    onValueChange={(value) => setFormData({ ...formData, timeColumn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time column" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties
                        .filter((prop) => [
                          'date',
                          'created_time',
                          'last_edited_time',
                          'formula'
                        ].includes(prop.type))
                        .map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the column that contains your activity timestamps
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Activity Column</Label>
                  <Select
                    value={formData.activityColumn}
                    onValueChange={(value) => setFormData({ ...formData, activityColumn: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity column" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties
                        .filter((prop) => [
                          'title',
                          'rich_text',
                          'select',
                          'multi_select'
                        ].includes(prop.type))
                        .map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the column that contains your activity names
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Heatmap Settings */}
        {selectedDb && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">3. Heatmap Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Heatmap Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Activity Heatmap"
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
        )}
      </div>

      {/* Preview and Submit Buttons */}
      {selectedDb && (
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={isLoading || !formData.timeColumn || !formData.activityColumn}
          >
            Preview Heatmap
          </Button>

          <Button 
            type="submit" 
            disabled={isLoading || !formData.timeColumn || !formData.activityColumn}
          >
            Create Heatmap
          </Button>
        </div>
      )}
    </form>
  )
} 