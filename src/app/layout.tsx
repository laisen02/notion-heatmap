import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { MainNav } from '@/components/layout/nav'
import { Toaster } from 'sonner'
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Notion Heatmap',
  description: 'Visualize your Notion habits with beautiful heatmaps',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = headers().get("x-pathname") || ""
  const isEmbedPage = pathname.startsWith("/embed")

  // For embed pages, use a minimal layout
  if (isEmbedPage) {
    return (
      <html lang="en" suppressHydrationWarning className="light">
        <head />
        <body className={cn(
          "min-h-screen bg-background text-foreground"
        )}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // Regular layout for non-embed pages
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="en" suppressHydrationWarning className="light">
        <head />
        <body className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground"
        )}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <div className="relative flex min-h-screen flex-col">
              {session ? (
                <>
                  <SiteHeader />
                  <MainNav />
                </>
              ) : (
                <SiteHeader />
              )}
              <main className="flex-1">
                {children}
              </main>
            </div>
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
          </ThemeProvider>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <html lang="en" suppressHydrationWarning className="light">
        <head />
        <body className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground"
        )}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    )
  }
}
