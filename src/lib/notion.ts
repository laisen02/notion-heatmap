import { Client } from "@notionhq/client"
import { cache } from "react"

export const getNotionClient = (accessToken: string) => {
  return new Client({ auth: accessToken })
}

export const getDatabases = cache(async (accessToken: string) => {
  const notion = getNotionClient(accessToken)
  
  try {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      }
    })
    
    return response.results as Array<any>
  } catch (error) {
    console.error('Error fetching Notion databases:', error)
    throw new Error('Failed to fetch Notion databases')
  }
})

export const getDatabaseSchema = cache(async (accessToken: string, databaseId: string) => {
  const notion = getNotionClient(accessToken)
  
  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId
    })
    
    return response.properties
  } catch (error) {
    console.error('Error fetching database schema:', error)
    throw new Error('Failed to fetch database schema')
  }
}) 