import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Visualize Your Habits with Notion Heatmap
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Create beautiful, embeddable heatmaps for your Notion habit tracking database.
          Monitor your progress and stay motivated with visual insights.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/auth">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
