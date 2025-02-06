export default function CreatePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Create New Heatmap</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your Notion database and customize your heatmap display.
        </p>
        
        <div className="mt-8 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Form will be implemented here with:
          </p>
          <ul className="mt-2 list-disc pl-6 text-sm text-muted-foreground">
            <li>Notion API connection</li>
            <li>Database selection</li>
            <li>Column mapping</li>
            <li>Color customization</li>
            <li>Display preferences</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 