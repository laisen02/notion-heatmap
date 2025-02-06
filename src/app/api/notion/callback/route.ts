import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !code || !state) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Verify state to prevent CSRF
  const { data: stateData } = await supabase
    .from('notion_oauth_states')
    .select()
    .eq('state', state)
    .eq('user_id', user.id)
    .single()

  if (!stateData) {
    return NextResponse.redirect(new URL('/create?error=invalid_state', request.url))
  }

  // Delete used state
  await supabase
    .from('notion_oauth_states')
    .delete()
    .eq('state', state)

  try {
    // Exchange code for access token
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to exchange code')
    }

    // Store the access token
    await supabase
      .from('notion_connections')
      .upsert({
        user_id: user.id,
        access_token: data.access_token,
        workspace_id: data.workspace_id,
        workspace_name: data.workspace_name,
        workspace_icon: data.workspace_icon,
        bot_id: data.bot_id,
      })

    return NextResponse.redirect(new URL('/create?connected=true', request.url))
  } catch (error) {
    console.error('Notion OAuth error:', error)
    return NextResponse.redirect(new URL('/create?error=token_exchange', request.url))
  }
} 