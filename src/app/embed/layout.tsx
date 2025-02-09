import { Toaster } from "sonner"
import '../../styles/globals.css'

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen">
      {children}
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
    </div>
  )
} 