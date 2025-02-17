"use client"

import { motion } from "framer-motion"
import { Icons } from "@/components/ui/icons"

const features = [
  {
    name: "Easy Integration",
    description: "Connect your Notion database in minutes with our simple setup process.",
    icon: Icons.notion
  },
  {
    name: "Customizable Themes",
    description: "Choose from multiple color themes or create your own to match your style.",
    icon: Icons.palette
  },
  {
    name: "Real-time Updates",
    description: "Your heatmap automatically updates as you track habits in Notion.",
    icon: Icons.refresh
  },
  // Add more features as needed
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to track your habits
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Transform your Notion habit tracking into beautiful visualizations
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 