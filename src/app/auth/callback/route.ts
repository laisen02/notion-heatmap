import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      if (type === 'recovery') {
        // For password reset, exchange code for session
        await supabase.auth.exchangeCodeForSession(code)
        // Then redirect to reset password page
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
      } else {
        // For normal sign in/up
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_callback_failed`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
} 