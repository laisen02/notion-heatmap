"use client"

import { motion } from "framer-motion"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"

export function DemoSection() {
  // Sample demo data
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
    display_order: 0
  }

  const demoData: HeatmapData[] = [
    { date: "2024-03-01", value: 2.5 },
    { date: "2024-03-02", value: 1.5 },
    { date: "2024-03-03", value: 3.0 },
    // Add more sample data as needed
  ]

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