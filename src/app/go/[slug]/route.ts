import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function detectDevice(ua: string | null): string {
  if (!ua) return 'unknown'
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = getServiceSupabase()

  const { data: link } = await supabase
    .from('tracking_links')
    .select('id, destination_url, active')
    .eq('slug', slug)
    .single()

  if (!link || !link.active) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const userAgent = request.headers.get('user-agent') ?? null

  await supabase.from('tracking_clicks').insert({
    link_id: link.id,
    referrer: request.headers.get('referer') ?? null,
    user_agent: userAgent,
    device_type: detectDevice(userAgent),
  })

  // 302 (not 301) so browsers don't cache the redirect — every click is tracked
  return NextResponse.redirect(link.destination_url, { status: 302 })
}
