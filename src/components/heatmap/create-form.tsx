"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { getDatabases, getDatabaseSchema } from "@/lib/notion"

interface Database {
  id: string
  title: Array<{ plain_text: string }>
}

interface Property {
  id: string
  name: string
  type: string
}

export function CreateHeatmapForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [databases, setDatabases] = useState<Database[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedDb, setSelectedDb] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    timeColumn: "",
    activityColumn: "",
    colorTheme: "orange",
    weekStart: "monday",
  })

  const handleNotionConnect = () => {
    // Redirect to Notion OAuth endpoint
    window.location.href = '/api/notion/oauth'
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

  const fetchDatabases = async () => {
    try {
      setIsLoading(true)
      const { data: connection } = await supabase
        .from('notion_connections')
        .select()
        .single()

      if (!connection) {
        throw new Error('No Notion connection found')
      }

      const dbs = await getDatabases(connection.access_token)
      setDatabases(dbs)
    } catch (error) {
      toast.error('Failed to fetch Notion databases')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDatabaseSelect = async (dbId: string) => {
    try {
      setIsLoading(true)
      setSelectedDb(dbId)
      const notionToken = "your_notion_token" // This will come from OAuth
      const schema = await getDatabaseSchema(notionToken, dbId)
      setProperties(Object.entries(schema).map(([id, prop]: [string, any]) => ({
        id,
        name: prop.name,
        type: prop.type,
      })))
    } catch (error) {
      toast.error("Failed to fetch database schema")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("heatmaps").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        notion_database_id: selectedDb,
        property_column_name: formData.timeColumn,
        activity_name: formData.activityColumn,
        color_theme: formData.colorTheme,
        week_start: formData.weekStart,
        display_order: 0, // Will be updated later with proper ordering
      })

      if (error) throw error

      toast.success("Heatmap created successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating heatmap:", error)
      toast.error("Failed to create heatmap")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Heatmap Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Notion Database</Label>
          {databases.length === 0 ? (
            <Button
              type="button"
              onClick={handleNotionConnect}
              disabled={isLoading}
            >
              Connect to Notion
            </Button>
          ) : (
            <Select
              value={selectedDb}
              onValueChange={handleDatabaseSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a database" />
              </SelectTrigger>
              <SelectContent>
                {databases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.title[0]?.plain_text || "Untitled"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                    .filter((prop) => ["number", "formula"].includes(prop.type))
                    .map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                    .filter((prop) => ["title", "rich_text"].includes(prop.type))
                    .map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

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
      </div>

      <Button type="submit" disabled={isLoading || !selectedDb}>
        Create Heatmap
      </Button>
    </form>
  )
} 