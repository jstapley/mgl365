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

function formatMoney(amount: number | null | undefined, symbol: string): string {
  if (amount == null) return ''
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function buildServicesHtml(services: any[]): string {
  if (!services || services.length === 0) {
    return `<p style="margin: 0; font-size: 14px; color: #6b7280;">No services booked yet.</p>`
  }

  return services.map(svc => {
    const lines: string[] = []

    if (svc.provider) {
      lines.push(`<p style="margin:0 0 3px; font-size:13px; color:#4b5563;">Provider: ${svc.provider}</p>`)
    }

    const dateStr = svc.service_date ? formatDate(svc.service_date) : ''
    const timeStr = svc.service_time ?? ''
    if (dateStr || timeStr) {
      const dateTime = [dateStr, timeStr].filter(Boolean).join(' at ')
      lines.push(`<p style="margin:0 0 3px; font-size:13px; color:#4b5563;">${dateTime}</p>`)
    }

    const costUsd = formatMoney(svc.cost_usd, '$')
    const costXcd = formatMoney(svc.cost_xcd, 'EC$')
    const costParts = [costUsd, costXcd ? `(${costXcd} XCD)` : ''].filter(Boolean)
    if (costParts.length > 0) {
      lines.push(`<p style="margin:0 0 3px; font-size:13px; color:#4b5563;">Cost: ${costParts.join(' ')}</p>`)
    }

    if (svc.pickup_location) {
      lines.push(`<p style="margin:0 0 3px; font-size:13px; color:#4b5563;">Pickup: ${svc.pickup_location}</p>`)
    }

    if (svc.notes) {
      lines.push(`<p style="margin:0; font-size:13px; color:#6b7280; font-style:italic;">${svc.notes}</p>`)
    }

    return `<div style="border:1px solid #e5e7eb; border-radius:6px; padding:14px 16px; margin-bottom:10px;">
  <p style="margin:0 0 4px; font-size:14px; font-weight:600; color:#111827;">${svc.service_name}</p>
  ${lines.join('\n  ')}
</div>`
  }).join('\n')
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()
  const today = antiguaToday()
  const in1Day  = addDays(today, 1)
  const in7Days = addDays(today, 7)

  // Lead times by villa type:
  //   Starfish House Upper / Lower → 1 day before check-in
  //   Cool House / Water Edge      → 7 days before check-in
  function leadDaysForVilla(villaName: string): number {
    return villaName.toLowerCase().includes('starfish') ? 1 : 7
  }

  // Fetch the template
  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'pre_arrival_week')
    .eq('active', true)
    .single()

  if (tmplError || !tmpl) {
    console.error('[pre-arrival-cron] Template not found:', tmplError?.message)
    return NextResponse.json({ error: 'Template not found or inactive' }, { status: 500 })
  }

  // Fetch confirmed bookings checking in at either target date, not yet sent
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, villas(name), clients(name, email)')
    .in('check_in', [in1Day, in7Days])
    .eq('status', 'confirmed')
    .is('pre_arrival_sent_at', null)

  if (bookingsError) {
    console.error('[pre-arrival-cron] DB error:', bookingsError.message)
    return NextResponse.json({ error: bookingsError.message }, { status: 500 })
  }

  const results: { id: string; status: string }[] = []

  for (const booking of bookings ?? []) {
    const client = (booking as any).clients
    const villaName = (booking as any).villas?.name ?? ''

    // Skip if this booking's check-in doesn't match the lead time for its villa type
    const expectedCheckIn = addDays(today, leadDaysForVilla(villaName))
    if (booking.check_in !== expectedCheckIn) continue

    const villaDisplay = villaName || 'your villa'

    if (!client?.email) {
      results.push({ id: booking.id, status: 'skipped: no client email' })
      continue
    }

    // Fetch services for this booking ordered by date then creation time
    const { data: services } = await supabase
      .from('booking_services')
      .select('service_name, provider, service_date, service_time, cost_usd, cost_xcd, pickup_location, notes')
      .eq('booking_id', booking.id)
      .order('service_date', { ascending: true })
      .order('created_at', { ascending: true })

    const servicesHtml = buildServicesHtml(services ?? [])

    const checkInFmt = booking.check_in ? formatDate(booking.check_in) : ''
    const checkOutFmt = booking.check_out ? formatDate(booking.check_out) : ''

    const vars: Record<string, string> = {
      guest_name: client.name ?? '',
      guest_first_name: (client.name ?? '').split(' ')[0],
      villa_name: villaDisplay,
      check_in: checkInFmt,
      check_out: checkOutFmt,
      services_html: servicesHtml,
    }

    const subject = applyTemplate(tmpl.subject, vars)

    // Split body on {{services_html}} placeholder to preserve services block outside paragraph wrapping
    const bodyWithoutServices = applyTemplate(tmpl.body, { ...vars, services_html: '\x00SERVICES\x00' })
    const bodyParts = bodyWithoutServices.split('\x00SERVICES\x00')

    const wrapParagraphs = (text: string) =>
      text
        .split(/\n\n+/)
        .map(para => para.trim())
        .filter(Boolean)
        .map(para => `<p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.8;">${para.replace(/\n/g, '<br>')}</p>`)
        .join('')

    const bodyHtmlContent =
      wrapParagraphs(bodyParts[0] ?? '') +
      `<div style="margin: 20px 0;">${servicesHtml}</div>` +
      wrapParagraphs(bodyParts[1] ?? '')

    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
          <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">${villaDisplay}</p>
        </div>
        <div style="padding: 0 32px 32px;">
          ${bodyHtmlContent}
        </div>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: 'MGL 365 Management <info@mgl365antigua.com>',
      to: client.email,
      cc: 'mgl365management@gmail.com',
      replyTo: 'mgl365management@gmail.com',
      subject,
      html: bodyHtml,
    })

    if (emailError) {
      console.error('[pre-arrival-cron] Resend error for booking', booking.id, emailError)
      results.push({ id: booking.id, status: `email error: ${JSON.stringify(emailError)}` })
      continue
    }

    await supabase
      .from('bookings')
      .update({ pre_arrival_sent_at: new Date().toISOString() })
      .eq('id', booking.id)

    results.push({ id: booking.id, status: 'sent' })
    console.log('[pre-arrival-cron] Sent pre-arrival email for booking', booking.id)
  }

  console.log('[pre-arrival-cron]', JSON.stringify({ date: today, targets: { '7day': in7Days, '1day': in1Day }, results }))
  return NextResponse.json({ date: today, targets: { '7day': in7Days, '1day': in1Day }, results })
}
