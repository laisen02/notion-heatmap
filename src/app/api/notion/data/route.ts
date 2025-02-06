import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { heatmapId } = await request.json()
    
    // Get heatmap config from Supabase
    const supabase = createServerComponentClient({ cookies })
    const { data: heatmap, error: configError } = await supabase
      .from('heatmaps')
      .select('*')
      .eq('id', heatmapId)
      .single()

    if (configError || !heatmap) {
      return NextResponse.json(
        { error: 'Heatmap not found' },
        { status: 404 }
      )
    }

    // Initialize Notion client
    const notion = new Client({
      auth: heatmap.notion_api_key,
      notionVersion: '2022-06-28'
    })

    // Query the database with filter for the specific activity
    const response = await notion.databases.query({
      database_id: heatmap.database_id,
      filter: {
        property: heatmap.property_column,
        select: {
          equals: heatmap.activity_column
        }
      }
    })

    console.log('Notion response:', {
      results: response.results.length,
      firstResult: response.results[0]?.properties,
      dateColumn: heatmap.date_column,
      timeColumn: heatmap.time_column,
      propertyColumn: heatmap.property_column,
      activityFilter: heatmap.activity_column
    })

    // Process the results
    const data = response.results
      .map((page: any) => {
        if (!('properties' in page)) {
          console.warn('Page missing properties:', page.id)
          return null
        }

        const dateProperty = page.properties[heatmap.date_column]
        const timeProperty = page.properties[heatmap.time_column]

        if (!dateProperty || !timeProperty) {
          console.warn('Missing required properties:', {
            pageId: page.id,
            hasDate: !!dateProperty,
            hasTime: !!timeProperty,
            dateColumn: heatmap.date_column,
            timeColumn: heatmap.time_column,
            availableColumns: Object.keys(page.properties)
          })
          return null
        }

        let date: string | null = null
        let value = 0

        // Extract date based on property type
        if (dateProperty.type === 'date' && dateProperty.date?.start) {
          date = dateProperty.date.start.split('T')[0]
        } else if (dateProperty.type === 'created_time') {
          date = dateProperty.created_time.split('T')[0]
        } else if (dateProperty.type === 'last_edited_time') {
          date = dateProperty.last_edited_time.split('T')[0]
        } else if (dateProperty.type === 'rich_text' && dateProperty.rich_text?.[0]) {
          const parsedDate = new Date(dateProperty.rich_text[0].plain_text)
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0]
          }
        }

        // Extract value based on property type
        if (timeProperty.type === 'number') {
          value = timeProperty.number || 0
        } else if (timeProperty.type === 'formula' && timeProperty.formula?.type === 'number') {
          value = timeProperty.formula.number || 0
        } else if (timeProperty.type === 'rich_text' && timeProperty.rich_text?.[0]) {
          value = parseFloat(timeProperty.rich_text[0].plain_text) || 0
        } else if (timeProperty.type === 'date' && timeProperty.date?.start) {
          // If time column is a date, calculate duration in hours
          const start = new Date(timeProperty.date.start)
          const end = timeProperty.date.end ? new Date(timeProperty.date.end) : start
          value = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // Convert ms to hours
        }

        // Debug logging
        console.log('Processing entry:', {
          pageId: page.id,
          date,
          value,
          dateProperty: {
            type: dateProperty.type,
            value: dateProperty.date?.start || dateProperty.created_time || dateProperty.last_edited_time
          },
          timeProperty: {
            type: timeProperty.type,
            value: timeProperty.number || timeProperty.formula?.number || timeProperty.date?.start
          }
        })

        return date && !isNaN(value) ? { date, value } : null
      })
      .filter((item): item is { date: string; value: number } => item !== null)

    // Group by date to sum hours
    const groupedData = data.reduce((acc: any[], item) => {
      const existingItem = acc.find(x => x.date === item.date)
      
      if (existingItem) {
        existingItem.value += item.value
      } else {
        acc.push({ ...item })
      }
      
      return acc
    }, [])

    // Sort by date
    groupedData.sort((a, b) => a.date.localeCompare(b.date))

    console.log('Processed data:', {
      totalItems: groupedData.length,
      firstItem: groupedData[0],
      totalHours: groupedData.reduce((sum, item) => sum + item.value, 0)
    })

    return NextResponse.json({ data: groupedData })
  } catch (error) {
    console.error('Error fetching Notion data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 