export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-transparent min-h-0">
        {children}
      </body>
    </html>
  )
} 