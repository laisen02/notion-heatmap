"use client"

import { Button } from "@/components/ui/button"

export function ResetPasswordButton() {
  return (
    <Button
      variant="link"
      onClick={() => window.location.href = '/auth/reset-password'}
      className="text-sm"
    >
      Forgot your password?
    </Button>
  )
} 