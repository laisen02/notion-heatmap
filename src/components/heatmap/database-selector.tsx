"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { NotionDatabase } from "@/types/notion"

interface DatabaseSelectorProps {
  databases: NotionDatabase[]
  onSelect: (dbId: string) => void
  isLoading?: boolean
}

export function DatabaseSelector({ 
  databases, 
  onSelect,
  isLoading = false 
}: DatabaseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDatabases = databases.filter(db => {
    const title = db.title.map(t => t.plain_text).join("")
    return title.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search databases..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        {filteredDatabases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "No databases found" : "No databases available"}
          </p>
        ) : (
          filteredDatabases.map((db) => (
            <Button
              key={db.id}
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => onSelect(db.id)}
              disabled={isLoading}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">
                  {db.title.map(t => t.plain_text).join("")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {db.id}
                </span>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  )
} 