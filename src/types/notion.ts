import type { 
  DatabaseObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
  PropertyItemObjectResponse,
  DatabasePropertyConfigResponse
} from "@notionhq/client/build/src/api-endpoints"

export interface NotionDatabase {
  id: string
  title: RichTextItemResponse[]
  properties: Record<string, DatabasePropertyConfigResponse>
  object: 'database'
  created_time: string
  last_edited_time: string
  parent: DatabaseObjectResponse['parent']
  url: string
  archived: boolean
}

export type NotionPage = PageObjectResponse
export type NotionPropertyValue = PropertyItemObjectResponse

// Use a more specific type for database property configuration
export type NotionPropertyType = 
  | 'title'
  | 'rich_text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'formula'
  | 'relation'
  | 'rollup'
  | 'created_time'
  | 'last_edited_time'

export interface NotionProperty {
  id: string
  name: string
  type: NotionPropertyType
} 