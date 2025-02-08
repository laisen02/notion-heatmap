import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { MainNav } from '@/components/layout/nav'
import { Toaster } from 'sonner'
import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

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

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {session && <MainNav />}
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    )
  }
}
