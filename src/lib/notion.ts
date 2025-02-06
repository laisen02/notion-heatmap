import { Client } from "@notionhq/client"
import { cache } from "react"
import type { 
  NotionDatabase, 
  NotionProperty,
  NotionPropertyType,
  NotionPropertyValue 
} from "@/types/notion"
import type { 
  PageObjectResponse,
  DatabaseObjectResponse,
  PropertyItemObjectResponse,
  SearchResponse,
  GetUserResponse
} from "@notionhq/client/build/src/api-endpoints"

export const getNotionClient = (accessToken: string) => {
  if (!accessToken) {
    throw new Error('No access token provided')
  }

  return new Client({ 
    auth: accessToken,
    notionVersion: '2022-06-28'
  })
}

export const getDatabases = cache(async (accessToken: string) => {
  const notion = getNotionClient(accessToken)
  
  try {
    // First, verify the token by checking user access
    try {
      const user = await notion.users.me<GetUserResponse>({})
      const userName = user.name || 'Unknown User'
      console.log('Notion user verified:', userName)
    } catch (error) {
      console.error('Failed to verify Notion token:', error)
      throw new Error('Invalid or expired Notion access token')
    }

    // Use search endpoint to find databases
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      }
    }) as SearchResponse

    console.log('Found databases:', response.results.length)

    const databases = response.results
      .filter((result): result is DatabaseObjectResponse => 
        result.object === 'database' && !result.archived
      )
      .map((db: DatabaseObjectResponse) => ({
        id: db.id,
        title: db.title,
        properties: db.properties,
        object: db.object,
        created_time: db.created_time,
        last_edited_time: db.last_edited_time,
        parent: db.parent,
        url: db.url,
        archived: db.archived
      } as NotionDatabase))

    return databases
  } catch (error) {
    console.error('Error fetching databases:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch databases')
  }
})

export const getDatabaseSchema = cache(async (accessToken: string, databaseId: string) => {
  const notion = getNotionClient(accessToken)
  
  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId
    })
    
    const properties = Object.entries(response.properties).reduce((acc, [key, prop]) => {
      acc[key] = {
        id: prop.id,
        name: prop.name,
        type: prop.type as NotionPropertyType
      }
      return acc
    }, {} as Record<string, NotionProperty>)

    return properties
  } catch (error) {
    console.error('Error fetching database schema:', error)
    throw new Error('Failed to fetch database schema')
  }
})

export const getDatabaseContent = cache(async (
  accessToken: string,
  databaseId: string,
  timeColumn: string,
  activityColumn: string
) => {
  const notion = getNotionClient(accessToken)
  
  try {
    // First, validate the columns exist and are of correct type
    const schema = await getDatabaseSchema(accessToken, databaseId)
    validateColumnTypes(schema, timeColumn, activityColumn)

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: timeColumn,
          direction: 'ascending',
        },
      ],
    })
    
    return response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map((page) => {
        const timeProperty = page.properties[timeColumn] as PropertyItemObjectResponse
        const activityProperty = page.properties[activityColumn] as PropertyItemObjectResponse

        return {
          id: page.id,
          timestamp: extractTimeValue(timeProperty),
          activity: extractActivityValue(activityProperty),
        }
      })
  } catch (error) {
    console.error('Error fetching database content:', error)
    throw new Error('Failed to fetch database content')
  }
})

function validateColumnTypes(
  schema: Record<string, NotionProperty>,
  timeColumn: string,
  activityColumn: string
) {
  const timeProperty = schema[timeColumn]
  const activityProperty = schema[activityColumn]

  if (!timeProperty) {
    throw new Error(`Time column "${timeColumn}" not found`)
  }
  if (!activityProperty) {
    throw new Error(`Activity column "${activityColumn}" not found`)
  }

  const validTimeTypes = ['date', 'created_time', 'last_edited_time', 'formula'] as const
  if (!validTimeTypes.includes(timeProperty.type as any)) {
    throw new Error(`Time column must be a date or time type, got ${timeProperty.type}`)
  }

  const validActivityTypes = ['title', 'rich_text', 'select', 'multi_select'] as const
  if (!validActivityTypes.includes(activityProperty.type as any)) {
    throw new Error(`Activity column must be a text type, got ${activityProperty.type}`)
  }
}

function extractTimeValue(property: PropertyItemObjectResponse): Date {
  switch (property.type) {
    case 'date':
      if (!property.date?.start) throw new Error('Date property has no start value')
      return new Date(property.date.start)
    
    case 'formula':
      if (property.formula.type !== 'date' || !property.formula.date?.start) {
        throw new Error('Formula property is not a valid date')
      }
      return new Date(property.formula.date.start)
    
    case 'created_time':
      return new Date(property.created_time)
    
    case 'last_edited_time':
      return new Date(property.last_edited_time)
    
    default:
      throw new Error(`Invalid time property type: ${property.type}`)
  }
}

function extractActivityValue(property: PropertyItemObjectResponse): string {
  switch (property.type) {
    case 'title':
      return property.title[0]?.plain_text || ''
    
    case 'rich_text':
      return property.rich_text[0]?.plain_text || ''
    
    case 'select':
      return property.select?.name || ''
    
    case 'multi_select':
      return property.multi_select[0]?.name || ''
    
    default:
      throw new Error(`Invalid activity property type: ${property.type}`)
  }
}

export const validateDatabaseAccess = async (
  accessToken: string,
  databaseId: string
) => {
  const notion = getNotionClient(accessToken)
  
  try {
    await notion.databases.retrieve({
      database_id: databaseId
    })
    return true
  } catch (error) {
    return false
  }
}

export async function cleanupOldOAuthStates(supabase: any) {
  const ONE_HOUR = 60 * 60 * 1000 // 1 hour in milliseconds
  const cutoffTime = new Date(Date.now() - ONE_HOUR).toISOString()
  
  try {
    const { error } = await supabase
      .from('notion_oauth_states')
      .delete()
      .lt('created_at', cutoffTime)

    if (error) {
      console.error('Error cleaning up old OAuth states:', error)
    }
  } catch (error) {
    console.error('Failed to cleanup old OAuth states:', error)
  }
} 