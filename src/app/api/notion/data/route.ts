import { NextResponse } from "next/server"
import { getNotionClient } from "@/lib/notion"
import { getSupabaseClient } from "@/lib/server-utils"

export async function POST(req: Request) {
  try {
    const { heatmapId } = await req.json()
    const supabase = await getSupabaseClient()

    // Get heatmap config
    const { data: config } = await supabase
      .from('heatmaps')
      .select('*')
      .eq('id', heatmapId)
      .single()

    if (!config) {
      return NextResponse.json({ error: 'Heatmap not found' }, { status: 404 })
    }

    const notion = getNotionClient(config.notion_api_key)

    // First get the property type with error handling
    let propertyType: string
    try {
      const database = await notion.databases.retrieve({
        database_id: config.database_id
      })

      const property = database.properties[config.property_column]
      if (!property) {
        throw new Error(`Property column "${config.property_column}" not found`)
      }
      propertyType = property.type

      // Debug log
      console.log('Property info:', {
        columnName: config.property_column,
        type: propertyType,
        property
      })
    } catch (error) {
      console.error('Error getting property type:', error)
      return NextResponse.json(
        { error: `Failed to get property type: ${error.message}` },
        { status: 500 }
      )
    }

    // Build the appropriate filter based on property type
    let propertyFilter: any
    switch (propertyType) {
      case 'title':
        propertyFilter = {
          property: config.property_column,
          title: {
            equals: config.activity_column
          }
        }
        break
      case 'rich_text':
        propertyFilter = {
          property: config.property_column,
          rich_text: {
            equals: config.activity_column
          }
        }
        break
      case 'select':
        propertyFilter = {
          property: config.property_column,
          select: {
            equals: config.activity_column
          }
        }
        break
      case 'multi_select':
        propertyFilter = {
          property: config.property_column,
          multi_select: {
            contains: config.activity_column
          }
        }
        break
      default:
        return NextResponse.json(
          { error: `Unsupported property type: ${propertyType}` },
          { status: 400 }
        )
    }

    // Query the database with the appropriate filter
    const response = await notion.databases.query({
      database_id: config.database_id,
      filter: {
        and: [
          {
            property: config.date_column,
            date: {
              is_not_empty: true,
            },
          },
          {
            property: config.time_column,
            formula: {
              number: {
                is_not_empty: true,
              },
            },
          },
          propertyFilter
        ],
      },
    })

    // Debug log
    console.log('Query response:', {
      resultCount: response.results.length,
      filter: propertyFilter,
      firstResult: response.results[0]?.properties
    })

    // Process the results
    const data = response.results.map((page: any) => {
      const dateProperty = page.properties[config.date_column]
      const timeProperty = page.properties[config.time_column]

      // Extract date
      const date = dateProperty?.date?.start

      // Extract time value
      let time = 0
      if (timeProperty?.type === 'formula') {
        time = timeProperty.formula.number || 0
      } else if (timeProperty?.type === 'number') {
        time = timeProperty.number || 0
      }

      return {
        date,
        value: time
      }
    }).filter(item => item.date)

    // Group by date and sum values
    const groupedData = data.reduce((acc: Record<string, number>, curr) => {
      const date = curr.date.split('T')[0]
      acc[date] = (acc[date] || 0) + curr.value
      return acc
    }, {})

    // Convert to array format and sort by date
    const formattedData = Object.entries(groupedData)
      .map(([date, value]) => ({
        date,
        value
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ data: formattedData })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: `Failed to fetch heatmap data: ${error.message}` },
      { status: 500 }
    )
  }
} 