"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Visualize Your Notion Habits
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create beautiful, embeddable heatmaps for your Notion habit tracking database.
            Monitor your progress and stay motivated with visual insights.
          </p>
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
        </motion.div>
      </div>
    </section>
  )
} 