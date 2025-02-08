import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { MainNav } from '@/components/layout/nav'
import { Toaster } from 'sonner'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ErrorBoundary } from '@/components/error-boundary'

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
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          {session && <MainNav />}
          <main>{children}</main>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
