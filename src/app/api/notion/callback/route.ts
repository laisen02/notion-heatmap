import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    console.log('OAuth callback received:', { code: code?.substring(0, 5) + '...', state })
    
    // Use await with cookies()
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !code || !state) {
      console.error('Missing required params:', { user: !!user, code: !!code, state: !!state })
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Verify state to prevent CSRF
    const { data: stateData, error: stateError } = await supabase
      .from('notion_oauth_states')
      .select()
      .eq('state', state)
      .eq('user_id', user.id)
      .single()

    if (stateError || !stateData) {
      console.error('State verification failed:', stateError)
      return NextResponse.redirect(new URL('/create?error=invalid_state', request.url))
    }

    // Delete the used state
    await supabase
      .from('notion_oauth_states')
      .delete()
      .eq('state', state)
      .eq('user_id', user.id)

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.redirect(new URL('/create?error=token_exchange', request.url))
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful:', { 
      workspace_name: tokenData.workspace_name,
      bot_id: tokenData.bot_id
    })

    // Store the access token
    const { error: insertError } = await supabase
      .from('notion_connections')
      .upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        workspace_name: tokenData.workspace_name,
        workspace_icon: tokenData.workspace_icon,
        workspace_id: tokenData.workspace_id,
        bot_id: tokenData.bot_id
      }, {
        onConflict: 'user_id'
      })

    if (insertError) {
      console.error('Failed to store token:', insertError)
      return NextResponse.redirect(new URL('/create?error=storage', request.url))
    }

    const response = NextResponse.redirect(new URL('/create?connected=true', request.url))
    response.headers.set('Cache-Control', 'no-store, no-cache')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error('Notion OAuth error:', error)
    return NextResponse.redirect(new URL('/create?error=unknown', request.url))
  }
} 