import { NotionPage } from "@/types/notion"

interface HeatmapData {
  date: string
  count: number
}

interface ProcessedData {
  id: string
  timestamp: Date
  activity: string
}

export function processNotionData(
  data: ProcessedData[],
  timeProperty: string,
  activityProperty: string
): HeatmapData[] {
  // Group data by date
  const groupedData = data.reduce((acc, item) => {
    const dateStr = item.timestamp.toISOString().split('T')[0]
    acc[dateStr] = (acc[dateStr] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Convert to array format and sort by date
  return Object.entries(groupedData)
    .map(([date, count]) => ({
      date,
      count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function validateNotionData(
  data: ProcessedData[],
  timeProperty: string,
  activityProperty: string
): boolean {
  return data.every((item) => 
    item.timestamp instanceof Date &&
    !isNaN(item.timestamp.getTime()) &&
    typeof item.activity === 'string' &&
    item.activity.length > 0
  )
}

export function getDateRange(data: HeatmapData[]): { start: Date; end: Date } {
  if (data.length === 0) {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365),
      end: now
    }
  }

  return {
    start: new Date(data[0].date),
    end: new Date(data[data.length - 1].date)
  }
} 