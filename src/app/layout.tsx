import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { MainNav } from '@/components/layout/nav'
import { Toaster } from 'sonner'
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Notion Heatmap - Visualize Your Habits',
    template: '%s | Notion Heatmap'
  },
  description: 'Create beautiful heatmaps with your Notion database. Track habits, visualize progress, and gain insights from your data.',
  keywords: ['notion', 'heatmap', 'habit tracking', 'data visualization', 'productivity'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name/Company',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://notionheatmap.com',
    title: 'Notion Heatmap - Visualize Your Habits',
    description: 'Create beautiful heatmaps with your Notion database',
    siteName: 'Notion Heatmap',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notion Heatmap - Visualize Your Habits',
    description: 'Create beautiful heatmaps with your Notion database',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/images/notion-heatmap-logo.png',
        sizes: 'any',
      }
    ],
    shortcut: [
      {
        url: '/images/notion-heatmap-logo.png',
        sizes: 'any',
      }
    ],
    apple: [
      {
        url: '/images/notion-heatmap-logo.png',
        sizes: 'any',
      }
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#ffffff',
    'theme-color': '#ffffff',
    'cache-control': 'public, max-age=31536000, immutable',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") || ""
    const isEmbedPage = pathname.startsWith("/embed")
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

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

    // Regular layout
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link 
            rel="icon" 
            href="/images/notion-heatmap-logo.png"
            type="image/png"
          />
          <link 
            rel="shortcut icon" 
            href="/images/notion-heatmap-logo.png"
            type="image/png"
          />
          <link 
            rel="apple-touch-icon" 
            href="/images/notion-heatmap-logo.png"
          />
        </head>
        <body className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground"
        )}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster
              position="top-center"
              expand={false}
              richColors
              closeButton
              visibleToasts={6}
              toastOptions={{
                duration: 5000,
                className: "fixed !bg-background !text-foreground border border-border",
                style: {
                  marginTop: '4rem',
                  zIndex: 9999,
                  position: 'fixed',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  width: 'auto',
                  maxWidth: '420px',
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link 
            rel="icon" 
            href="/images/notion-heatmap-logo.png"
            type="image/png"
          />
          <link 
            rel="shortcut icon" 
            href="/images/notion-heatmap-logo.png"
            type="image/png"
          />
          <link 
            rel="apple-touch-icon" 
            href="/images/notion-heatmap-logo.png"
          />
        </head>
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
