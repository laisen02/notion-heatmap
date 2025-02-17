import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function EditHeatmapPage({
  params,
}: {
  params: { id: string }
}) {
  // Don't allow editing demo heatmap
  if (params.id === 'demo') {
    redirect('/')
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

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