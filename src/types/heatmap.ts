export type ColorTheme = 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'brown' | 'gray' | 'lightgray'

export interface HeatmapData {
  date: string
  value: number
}

export interface HeatmapConfig {
  id: string
  name: string
  description?: string
  notion_api_key: string
  database_id: string
  date_column: string
  time_column: string
  property_column: string
  activity_column: string
  color_theme: ColorTheme
  week_start: 'monday' | 'sunday'
  is_public: boolean
  insights: {
    averageTime: boolean
    totalDays: boolean
    totalTime: boolean
    standardDeviation: boolean
  }
  embedLink?: string
  display_order: number
  isDemo?: boolean
} 