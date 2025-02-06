import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function POST(request: Request) {
  try {
    const { apiKey, databaseId } = await request.json()

    if (!apiKey || !databaseId) {
      return NextResponse.json(
        { error: 'API key and database ID are required' },
        { status: 400 }
      )
    }

    const notion = new Client({ 
      auth: apiKey,
      notionVersion: '2022-06-28'
    })

    // Test database access
    const response = await notion.databases.retrieve({
      database_id: databaseId
    })

    return NextResponse.json({
      success: true,
      database: {
        id: response.id,
        title: response.title,
        properties: response.properties
      }
    })
  } catch (error) {
    console.error('Notion validation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to validate Notion access' },
      { status: 500 }
    )
  }
} 