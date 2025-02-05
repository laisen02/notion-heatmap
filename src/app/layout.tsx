import { Inter } from 'next/font/google'
import '../styles/globals.css'
import RootLayout from '@/components/layout/root-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Notion Heatmap',
  description: 'Visualize your Notion habits with beautiful heatmaps',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  )
}
