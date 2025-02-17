"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { useState, useEffect } from "react"

export function HeroSection() {
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
        // Generate more realistic reading time values (between 0 and 3 hours)
        const value = seededRandom(seed) * 3
        
        // Add some zero values to make it more realistic (weekends or missed days)
        const isZero = seededRandom(seed + 1) > 0.7
        
        data.push({
          date: dateStr,
          value: isZero ? 0 : Number(value.toFixed(1))
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

  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-background min-h-[80vh]">
      {/* Flickering Grid Background */}
      <div className="absolute inset-0 w-full h-full">
        <FlickeringGrid
          squareSize={32}
          gridGap={1}
          color="#9CA3AF"
          maxOpacity={0.25}
          flickerChance={0.15}
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Create Beautiful Heatmap With Your Notion Database
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Link or Track habit with your Existing Notion Setup.
              Monitor your progress with visual insights.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </Link>
          </div>

          {/* Demo Heatmap */}
          {mounted && (
            <motion.div 
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm max-w-[1000px] mx-auto">
                <HeatmapCard 
                  config={{
                    ...demoConfig,
                    insights: {
                      averageTime: true,
                      totalDays: true,
                      totalTime: true,
                      standardDeviation: false
                    }
                  }}
                  data={demoData}
                  isEmbed={false}
                  showControls={true}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
} 