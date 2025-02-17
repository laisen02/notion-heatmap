import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"

export const getDemoConfig = (): HeatmapConfig => ({
  id: "demo",
  name: "Reading Habits",
  description: "Track daily reading progress",
  notion_api_key: "",
  database_id: "",
  date_column: "",
  time_column: "",
  property_column: "",
  activity_column: "",
  color_theme: "green",
  week_start: "monday",
  is_public: true,
  insights: {
    averageTime: true,
    totalDays: true,
    totalTime: true,
    standardDeviation: false
  },
  display_order: 0,
  isDemo: true
})

export const generateDemoData = (): HeatmapData[] => {
  const data: HeatmapData[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const seed = parseInt(dateStr.replace(/-/g, ''))
    const value = seededRandom(seed) * 3
    
    const isZero = seededRandom(seed + 1) > 0.7
    
    data.push({
      date: dateStr,
      value: isZero ? 0 : Number(value.toFixed(1))
    })
  }
  
  return data
} 