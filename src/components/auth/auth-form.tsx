"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthForm({ className, ...props }: AuthFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) {
          toast.error(error.message)
          return
        }

        toast.success("Check your email for the confirmation link")
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('Invalid email or password')
          } else {
            toast.error(error.message)
          }
          return
        }
        
        toast.success('Successfully signed in')
        router.refresh()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      toast.error("Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6" {...props}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      <Button
        variant="link"
        className="px-0 font-normal"
        onClick={() => setIsSignUp(!isSignUp)}
        disabled={isLoading}
      >
        {isSignUp ? "Already have an account? Sign in" : "Create an account"}
      </Button>
    </div>
  )
} 