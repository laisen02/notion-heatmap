import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Generate state to prevent CSRF
  const state = Math.random().toString(36).substring(7)
  await supabase
    .from('notion_oauth_states')
    .insert({ state, user_id: user.id })

  const notionUrl = new URL('https://api.notion.com/v1/oauth/authorize')
  notionUrl.searchParams.append('client_id', NOTION_CLIENT_ID)
  notionUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  notionUrl.searchParams.append('response_type', 'code')
  notionUrl.searchParams.append('state', state)
  notionUrl.searchParams.append('owner', 'user')

  return NextResponse.redirect(notionUrl.toString())
} 