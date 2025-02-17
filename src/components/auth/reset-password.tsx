import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export function ResetPasswordButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) throw error
      
      toast.success('Check your email for password reset instructions')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ... rest of the component
} 