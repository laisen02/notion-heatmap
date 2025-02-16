"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icons } from "@/components/ui/icons"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const supabase = createClientComponentClient()
    
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClientComponentClient()
      
      toast.loading('Signing out...')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures all sessions are cleared
      })
      if (error) throw error

      // Clear session state
      setSession(null)
      
      // Clear all local storage
      localStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Force a complete page reload and redirect
      window.location.href = '/'
      
      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Don't show navigation on auth pages
  if (pathname === "/auth") return null

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Loading text="Loading..." />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Notion Heatmap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-6 space-x-6">
            <nav className="flex items-center space-x-6">
              {!session ? (
                <>
                  <Link href="#how-it-works">
                    <Button variant="ghost">How It Works</Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="ghost">Create Heatmap</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost">Profile</Button>
                  </Link>
                  <Link href="/create">
                    <Button variant="ghost">Create</Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost">Settings</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icons.menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  {!session ? (
                    <>
                      <Link href="#how-it-works">
                        <Button variant="ghost">How It Works</Button>
                      </Link>
                      <Link href="/auth">
                        <Button variant="ghost">Create Heatmap</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard">
                        <Button variant="ghost">Dashboard</Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="ghost">Profile</Button>
                      </Link>
                      <Link href="/create">
                        <Button variant="ghost">Create</Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost">Settings</Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Buttons */}
          {!session ? (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          ) : (
            <Button onClick={handleSignOut} disabled={isLoggingOut}>
              {isLoggingOut ? <Loading text="Signing out..." /> : "Sign Out"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 