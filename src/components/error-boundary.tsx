"use client"

import { Component } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children?: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">Please try clearing your cache and refreshing.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear cache and reload
                  window.location.href = '/clear-site-data'
                }}
              >
                Clear Cache & Reload
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 