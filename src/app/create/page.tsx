import { CreateHeatmapForm } from "@/components/heatmap/create-form"

export default function CreatePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Create New Heatmap</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your Notion database and customize your heatmap display.
        </p>
        
        <div className="mt-8">
          <CreateHeatmapForm />
        </div>
      </div>
    </div>
  )
} 