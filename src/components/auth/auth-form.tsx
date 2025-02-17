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
import { Loading } from "@/components/ui/loading"

interface AuthError {
  message: string
  status?: number
}

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthForm({ className, ...props }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClientComponentClient()
      
      if (isSignUp) {
        // Check for existing user first
        const { data, error: checkError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (data?.user?.identities?.length === 0) {
          toast.error('Email already registered. Please sign in instead.', {
            position: "top-center",
            style: {
              marginTop: '4rem',
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
            duration: 5000,
          })
          setIsSignUp(false)
          setIsLoading(false)
          return
        }

        if (checkError) throw checkError
        
        toast.success('Check your email to confirm your account', {
          position: "top-center",
          style: {
            marginTop: '4rem',
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          duration: 5000,
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast.loading('Preparing your dashboard...', {
          position: "top-center",
          style: {
            marginTop: '4rem',
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        })
        await router.push('/dashboard')
        toast.success('Successfully signed in', {
          position: "top-center",
          style: {
            marginTop: '4rem',
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        })
      }
    } catch (error: any) {
      toast.error(error.message, {
        position: "top-center",
        style: {
          marginTop: '4rem',
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async () => {
    try {
      setIsLoading(true)
      const supabase = createClientComponentClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error("OAuth error:", error)
      toast.error(error.message || "Failed to sign in with Google", {
        position: "top-center",
        style: {
          marginTop: '4rem',
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address", {
        position: "top-center",
        style: {
          marginTop: '4rem',
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        duration: 5000,
      })
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClientComponentClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      toast.success("Password reset link sent to your email")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6" {...props}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loading text={isSignUp ? "Creating account..." : "Signing in..."} />
          ) : (
            isSignUp ? "Sign Up" : "Sign In"
          )}
        </Button>
      </form>
      {!isSignUp && (
        <Button
          variant="link"
          className="px-0 font-normal"
          onClick={handleResetPassword}
          disabled={isLoading}
        >
          Forgot password?
        </Button>
      )}
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
      <Button variant="outline" disabled={isLoading} onClick={handleOAuthSignIn}>
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
        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
      </Button>
    </div>
  )
} 