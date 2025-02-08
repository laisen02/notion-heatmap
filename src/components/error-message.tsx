"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ErrorMessage() {
  const router = useRouter()

  return (
    <div className="container py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">Please try refreshing the page.</p>
        <Button onClick={() => router.refresh()}>
          Try again
        </Button>
      </div>
    </div>
  )
} 