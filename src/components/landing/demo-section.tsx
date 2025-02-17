"use client"

import { motion } from "framer-motion"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { useState, useEffect } from "react"

export function DemoSection() {
  const [mounted, setMounted] = useState(false)
  const [demoData, setDemoData] = useState<HeatmapData[]>([])

  useEffect(() => {
    // Generate data only on client side
    const generateDemoData = () => {
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
        const value = seededRandom(seed) * 5
        
        data.push({
          date: dateStr,
          value: Number(value.toFixed(1))
        })
      }
      
      return data
    }

    setDemoData(generateDemoData())
    setMounted(true)
  }, [])

  const demoConfig: HeatmapConfig = {
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
  }

  // Don't render anything until client-side
  if (!mounted) return null

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-muted p-8"
        >
          <HeatmapCard 
            config={demoConfig}
            data={demoData}
            isEmbed={false}
            showControls={true}
          />
        </motion.div>
      </div>
    </section>
  )
} 