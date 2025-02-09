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
    <div className="min-h-screen w-full transition-colors duration-200">
      <div className="min-h-screen w-full transition-colors duration-200">
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