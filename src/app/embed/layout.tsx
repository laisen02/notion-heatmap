"use client"

import { Toaster } from "sonner"
import '../../styles/globals.css'
import { cn } from "@/lib/utils"

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full">
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