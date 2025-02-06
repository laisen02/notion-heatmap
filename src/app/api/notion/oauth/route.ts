import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(new URL('/auth?error=session_expired', request.url))
    }

    if (!user) {
      console.log('No user found, redirecting to auth')
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    console.log('User authenticated:', user.id)

    // Generate state to prevent CSRF
    const state = Math.random().toString(36).substring(7)
    
    // Delete any existing states for this user
    const { error: deleteError } = await supabase
      .from('notion_oauth_states')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting old states:', deleteError)
    }

    // Insert new state
    const { error: insertError } = await supabase
      .from('notion_oauth_states')
      .insert({ state, user_id: user.id })

    if (insertError) {
      console.error('Error inserting state:', insertError)
      return NextResponse.redirect(new URL('/create?error=state_creation', request.url))
    }

    // Use Notion's official OAuth endpoint
    const notionUrl = new URL('https://api.notion.com/v1/oauth/authorize')
    notionUrl.searchParams.set('client_id', NOTION_CLIENT_ID)
    notionUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    notionUrl.searchParams.set('response_type', 'code')
    notionUrl.searchParams.set('state', state)
    notionUrl.searchParams.set('owner', 'user')
    notionUrl.searchParams.set('scope', ['read_user', 'read_databases', 'read_content'].join(' '))

    const response = NextResponse.redirect(notionUrl.toString())
    response.headers.set('Cache-Control', 'no-store, no-cache')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/create?error=oauth_failed', request.url))
  }
} 