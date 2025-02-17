"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/components/icons"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Create", href: "/create" },
  { name: "Settings", href: "/settings" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/images/notion-heatmap-logo.png"
              alt="Notion Heatmap Logo"
              width={24}
              height={24}
              className="h-6 w-6 dark:hidden"
            />
            <Image
              src="/images/logo-dark.png"
              alt="Notion Heatmap Logo"
              width={24}
              height={24}
              className="hidden h-6 w-6 dark:block"
            />
            <span className="hidden font-bold sm:inline-block">
              Notion Heatmap
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <Link
              href="/auth"
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                "hover:bg-accent hover:text-accent-foreground",
                "h-9 py-2 px-4",
                "dark:text-gray-200"
              )}
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 