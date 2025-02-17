"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loading } from "@/components/ui/loading"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClientComponentClient()
      
      // Show loading state
      toast.loading('Signing out...')
      
      await supabase.auth.signOut()
      
      // Navigate first
      await router.push('/')
      // Then show success
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Don't show navigation on home page
  if (pathname === "/") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/dashboard" className="font-bold">
          Notion Heatmap
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            onClick={handleSignOut} 
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loading text="Signing out..." />
            ) : (
              "Sign Out"
            )}
          </Button>
        </div>
      </div>
    </header>
  )
} 