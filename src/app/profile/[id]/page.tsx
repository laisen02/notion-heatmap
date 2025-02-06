interface ProfilePageProps {
  params: {
    id: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">User ID: {params.id}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Public Heatmaps</h2>
          <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Public heatmaps will be displayed here with drag-and-drop reordering functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 