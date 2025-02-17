"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        toast.error("Invalid or expired reset link", {
          position: "top-center",
          style: { marginTop: '4rem' },
        })
        router.push('/auth')
        return
      }
      
      setHasSession(true)
    }
    
    checkSession()
  }, [router])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSession) return
    
    setIsLoading(true)
    try {
      const supabase = createClientComponentClient()
      
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success("Password updated successfully")
      router.push("/auth")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSession) {
    return null // Or loading state
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>
      <form onSubmit={handleReset} className="space-y-4">
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          minLength={6}
          required
        />
        <Button type="submit" disabled={isLoading}>
          Reset Password
        </Button>
      </form>
    </div>
  )
} 