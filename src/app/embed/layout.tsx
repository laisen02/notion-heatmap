"use client"

import { Toaster } from "sonner"
import '../../styles/globals.css'
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Share dark mode state through React context or URL params
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className={cn(
      "min-h-screen w-full",
      isDarkMode ? "dark" : "light"
    )}>
      <div className="bg-background min-h-screen w-full">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
            className: 'text-sm font-medium',
            duration: 3000,
          }}
        />
      </div>
    </div>
  )
} 