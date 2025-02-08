"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import Link from "next/link"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthForm({ className, ...props }: AuthFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const form = e.currentTarget
      const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]')
      const passwordInput = form.querySelector<HTMLInputElement>('input[type="password"]')

      const email = emailInput?.value
      const password = passwordInput?.value

      if (!email || !password) {
        throw new Error("Please enter both email and password")
      }

      if (isSignUp) {
        try {
          // Check if user exists by attempting to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: 'dummy-password-for-check'
          })

          // If no error or error is not "Invalid credentials", user exists
          if (!signInError || signInError.message !== 'Invalid login credentials') {
            toast.error(
              <div className="flex flex-col gap-2">
                <p>An account with this email already exists.</p>
                <div className="flex gap-2">
                  <Button 
                    variant="link" 
                    className="h-auto p-0" 
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign in instead
                  </Button>
                  <span>or</span>
                  <Button 
                    variant="link" 
                    className="h-auto p-0"
                    onClick={() => router.push('/auth/forgot-password')}
                  >
                    Reset password
                  </Button>
                </div>
              </div>
            )
            return
          }

          // Proceed with signup if user doesn't exist
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
          if (error) throw error
          toast.success("Check your email to confirm your account")
        } catch (error) {
          console.error("Auth error:", error)
          toast.error(error.message)
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data?.user) {
          toast.success("Successfully signed in")
          router.refresh()
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast.error(error.message)
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
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </div>
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