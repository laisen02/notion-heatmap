interface EditPageProps {
  params: {
    id: string
  }
}

export default function EditPage({ params }: EditPageProps) {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Edit Heatmap</h1>
        <p className="mt-2 text-muted-foreground">
          Edit your heatmap settings and preferences.
        </p>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Editing heatmap ID: {params.id}
        </div>
        
        <div className="mt-8 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Edit form will be implemented here with pre-filled data based on the heatmap ID.
          </p>
        </div>
      </div>
    </div>
  )
} 