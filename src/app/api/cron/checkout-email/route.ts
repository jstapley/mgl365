import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function applyTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    template
  )
}

export async function GET(req: NextRequest) {
  // Verify this request comes from Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()

  // Today's date in Antigua (UTC-4) as YYYY-MM-DD
  const now = new Date()
  const antiguaOffset = -4 * 60
  const antiguaDate = new Date(now.getTime() + (antiguaOffset - now.getTimezoneOffset()) * 60000)
  const today = antiguaDate.toISOString().slice(0, 10)

  // Find confirmed bookings checking out today
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, guests, package, villas(name), clients(name, email)')
    .eq('check_out', today)
    .eq('status', 'confirmed')

  if (error) {
    console.error('[checkout-cron] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!bookings || bookings.length === 0) {
    console.log('[checkout-cron] No checkouts today:', today)
    return NextResponse.json({ sent: 0, date: today })
  }

  // Fetch the template
  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'booking_completed')
    .eq('active', true)
    .single()

  if (tmplError || !tmpl) {
    console.error('[checkout-cron] Template not found:', tmplError?.message)
    return NextResponse.json({ error: 'Template not found' }, { status: 500 })
  }

  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL ?? ''
  const results: { id: string; status: string }[] = []

  for (const booking of bookings) {
    const client = (booking as any).clients
    const villaName = (booking as any).villas?.name ?? 'your villa'

    if (!client?.email) {
      results.push({ id: booking.id, status: 'skipped: no email' })
      continue
    }

    const nights = booking.check_in && booking.check_out
      ? Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const checkInFmt = booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : ''
    const checkOutFmt = booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : ''

    const vars = {
      guest_name: client.name ?? '',
      guest_first_name: (client.name ?? '').split(' ')[0],
      villa_name: villaName,
      check_in: checkInFmt,
      check_out: checkOutFmt,
      nights: nights ? String(nights) : '',
      google_review_link: googleReviewUrl,
    }

    const subject = applyTemplate(tmpl.subject, vars)
    const bodyText = applyTemplate(tmpl.body, vars)

    const detailRows = [
      ['Villa', villaName],
      ['Check-in', checkInFmt],
      ['Check-out', checkOutFmt],
      nights ? ['Duration', `${nights} night${nights === 1 ? '' : 's'}`] : null,
      (booking as any).guests ? ['Guests', String((booking as any).guests)] : null,
      (booking as any).package ? ['Package', (booking as any).package] : null,
    ].filter(Boolean) as [string, string][]

    const detailHtml = detailRows.map(([label, value]) => `
      <tr>
        <td style="padding: 6px 16px 6px 0; font-size: 13px; color: #6b7280; white-space: nowrap;">${label}</td>
        <td style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 500;">${value}</td>
      </tr>`).join('')

    const reviewButtonHtml = googleReviewUrl ? `
      <div style="margin-top: 28px; text-align: center;">
        <a href="${googleReviewUrl}" style="display: inline-block; background: #4285F4; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
          Leave a Google Review
        </a>
      </div>` : ''

    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
          <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">${villaName}</p>
        </div>
        <div style="padding: 0 32px;">
          ${bodyText.split(/\n\n+/).map(p => `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.8;">${p.replace(/\n/g, '<br>')}</p>`).join('')}
          ${reviewButtonHtml}
          <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">Your Booking Details</p>
            <table style="border-collapse: collapse; width: 100%;">
              ${detailHtml}
            </table>
          </div>
        </div>
        <div style="padding: 24px 32px; margin-top: 8px;"></div>
      </div>
    `

    // Send the email
    const { error: emailError } = await resend.emails.send({
      from: 'MGL 365 Management <info@mgl365antigua.com>',
      to: client.email,
      cc: ['mgl365management@gmail.com', 'jeff@stapleyinc.com'],
      replyTo: 'mgl365management@gmail.com',
      subject,
      html: bodyHtml,
    })

    if (emailError) {
      console.error('[checkout-cron] Resend error for booking', booking.id, emailError)
      results.push({ id: booking.id, status: `email error: ${JSON.stringify(emailError)}` })
      continue
    }

    // Mark booking as completed
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', booking.id)
    results.push({ id: booking.id, status: 'sent' })
    console.log('[checkout-cron] Sent thank-you for booking', booking.id)
  }

  return NextResponse.json({ date: today, results })
}
