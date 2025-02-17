"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FlickeringGrid } from "@/components/ui/flickering-grid"
import { HeatmapCard } from "@/components/heatmap/heatmap-card"
import type { HeatmapConfig, HeatmapData } from "@/types/heatmap"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { generateDemoData, getDemoConfig } from "@/lib/demo-data"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [demoData, setDemoData] = useState<HeatmapData[]>([])
  const [embedCode, setEmbedCode] = useState('')

  useEffect(() => {
    setDemoData(generateDemoData())
    setEmbedCode(`<iframe
  src="${window.location.origin}/embed/demo"
  width="100%"
  height="400"
  frameBorder="0"
  style="border-radius: 8px; background: transparent;"
></iframe>`)
    setMounted(true)
  }, [])

  const demoConfig = getDemoConfig()

  // Don't render anything until client-side
  if (!mounted) {
    return null
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

              {/* Embed Code Section */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Embed in Notion</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode)
                      toast.success('Embed code copied to clipboard')
                    }}
                  >
                    Copy Embed Code
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Paste this code into a Notion embed block to display your heatmap
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
} 