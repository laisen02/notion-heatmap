import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { MainNav } from '@/components/layout/nav'
import { Toaster } from 'sonner'
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

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
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const pathname = headers().get("x-pathname") || ""

  // Don't show header in embed view
  const isEmbedPage = pathname.startsWith("/embed")

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="relative flex min-h-screen flex-col">
            {!isEmbedPage && (
              <>
                {session ? (
                  <>
                    <SiteHeader />
                    <MainNav />
                  </>
                ) : (
                  <SiteHeader />
                )}
              </>
            )}
            <main className={cn("flex-1", isEmbedPage && "min-h-0")}>
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
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </body>
      </html>
    )
  }
}
