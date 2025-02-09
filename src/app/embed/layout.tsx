import { Toaster } from "sonner"
import '../../styles/globals.css'

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Notion Heatmap" />
        <meta property="og:description" content="Heatmap visualization" />
        <meta name="notion:renderer" content="iframe" />
      </head>
      <body className="bg-transparent min-h-0">
        <div className="notion-embed">
          {children}
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
} 