import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const headersList = headers()
  const referer = headersList.get('referer')

  // Check if request is from Notion
  const isFromNotion = referer?.includes('notion.so')

  // Redirect to the embed page
  return NextResponse.redirect(
    new URL(`/embed/${params.id}`, request.url), 
    {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://*.notion.so https://notion.so https://www.notion.so;",
      },
    }
  )
} 