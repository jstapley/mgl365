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

function antiguaToday(): string {
  const now = new Date()
  const antiguaOffset = -4 * 60
  const antiguaDate = new Date(now.getTime() + (antiguaOffset - now.getTimezoneOffset()) * 60000)
  return antiguaDate.toISOString().slice(0, 10)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
}

async function fetchWineListAttachment(): Promise<{ filename: string; content: Buffer } | null> {
  const url = process.env.WINE_LIST_PDF_URL
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) { console.error('[fetchWineList] fetch failed:', res.status); return null }
    const buffer = Buffer.from(await res.arrayBuffer())
    return { filename: 'MGL365 Wine List.pdf', content: buffer }
  } catch (e) {
    console.error('[fetchWineList] error:', e)
    return null
  }
}

async function sendReminderEmail(
  booking: any,
  tmpl: any,
  triggerLabel: string
): Promise<string> {
  const client = booking.clients
  const villaName = booking.villas?.name ?? 'your villa'

  if (!client?.email) return 'skipped: no client email'

  const bookingLink = booking.onboarding_token
    ? `https://www.mgl365antigua.com/onboard/${booking.onboarding_token}`
    : `https://www.mgl365antigua.com`

  const vars = {
    guest_name: client.name ?? '',
    guest_first_name: (client.name ?? '').split(' ')[0],
    villa_name: villaName,
    check_in: booking.check_in ? formatDate(booking.check_in) : '',
    check_out: booking.check_out ? formatDate(booking.check_out) : '',
    booking_link: bookingLink,
  }

  const subject = applyTemplate(tmpl.subject, vars)
  const bodyText = applyTemplate(tmpl.body, vars)

  const bodyHtmlContent = bodyText
    .replace(bookingLink, `<a href="${bookingLink}" style="color: #1f5772;">${bookingLink}</a>`)
    .split(/\n\n+/)
    .map(para => `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('')

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
        <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">${villaName}</p>
      </div>
      <div style="padding: 0 32px 32px;">
        ${bodyHtmlContent}
        <div style="margin-top: 32px; text-align: center;">
          <a href="${bookingLink}" style="display: inline-block; background: #1f5772; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            Complete Your Onboarding
          </a>
        </div>
      </div>
    </div>
  `

  const wineList = await fetchWineListAttachment()

  const { error } = await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: client.email,
    cc: 'mgl365management@gmail.com',
    replyTo: 'mgl365antigua.com',
    subject,
    html: bodyHtml,
    ...(wineList ? { attachments: [wineList] } : {}),
  })

  if (error) return `resend error: ${JSON.stringify(error)}`
  return 'sent'
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()
  const today = antiguaToday()
  const in90Days = addDays(today, 90)
  const in28Days = addDays(today, 28)

  const results: Record<string, any[]> = { reminder_3mo: [], reminder_4wk: [] }

  // ── 3-month reminder ──────────────────────────────────────────────────────
  const { data: tmpl3mo } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'onboarding_reminder_3mo')
    .eq('active', true)
    .single()

  if (tmpl3mo) {
    const { data: bookings3mo } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, onboarding_token, reminder_3mo_sent_at, villas(name), clients(name, email)')
      .eq('status', 'pending')
      .lte('check_in', in90Days)
      .gt('check_in', today)
      .is('reminder_3mo_sent_at', null)

    for (const booking of bookings3mo ?? []) {
      const status = await sendReminderEmail(booking, tmpl3mo, '3-month reminder')
      if (status === 'sent') {
        await supabase
          .from('bookings')
          .update({ reminder_3mo_sent_at: new Date().toISOString() })
          .eq('id', booking.id)
      }
      results.reminder_3mo.push({ id: booking.id, status })
    }
  } else {
    results.reminder_3mo.push({ id: 'n/a', status: 'template not found or inactive' })
  }

  // ── 4-week reminder ───────────────────────────────────────────────────────
  const { data: tmpl4wk } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'onboarding_reminder_4wk')
    .eq('active', true)
    .single()

  if (tmpl4wk) {
    const { data: bookings4wk } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, onboarding_token, reminder_4wk_sent_at, villas(name), clients(name, email)')
      .eq('status', 'pending')
      .lte('check_in', in28Days)
      .gt('check_in', today)
      .is('reminder_4wk_sent_at', null)

    for (const booking of bookings4wk ?? []) {
      const status = await sendReminderEmail(booking, tmpl4wk, '4-week reminder')
      if (status === 'sent') {
        await supabase
          .from('bookings')
          .update({ reminder_4wk_sent_at: new Date().toISOString() })
          .eq('id', booking.id)
      }
      results.reminder_4wk.push({ id: booking.id, status })
    }
  } else {
    results.reminder_4wk.push({ id: 'n/a', status: 'template not found or inactive' })
  }

  console.log('[booking-reminders]', JSON.stringify(results))
  return NextResponse.json({ date: today, results })
}
