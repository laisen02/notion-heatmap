export type ColorTheme = 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'red' 
  | 'brown' 
  | 'gray' 
  | 'lightgray'

export interface HeatmapData {
  date: string
  value: number
}

export interface HeatmapConfig {
  id: string
  name: string
  description?: string
  notionApiKey: string
  databaseId: string
  dateColumn: string
  timeColumn: string
  propertyColumn: string
  activityColumn: string
  colorTheme: ColorTheme
  weekStart: 'monday' | 'sunday'
  isPublic: boolean
  insights: {
    averageTime: boolean
    totalDays: boolean
    totalTime: boolean
    standardDeviation: boolean
  }
  embedLink?: string
  displayOrder: number
} 