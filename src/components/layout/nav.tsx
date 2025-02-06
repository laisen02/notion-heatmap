"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/auth")
  }

  // Don't show navigation on home page
  if (pathname === "/") return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Notion Heatmap
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"}
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className={pathname === "/create" ? "text-foreground" : "text-foreground/60"}
            >
              Create
            </Link>
            <Link
              href="/settings"
              className={pathname === "/settings" ? "text-foreground" : "text-foreground/60"}
            >
              Settings
            </Link>
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-auto text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
} 