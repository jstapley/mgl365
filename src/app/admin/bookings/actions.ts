'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { Resend } from 'resend'
import type { BookingStatus } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

function applyTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    template
  )
}

async function sendBookingEmail(bookingId: string): Promise<string> {
  const supabase = getServiceSupabase()

  // Fetch template
  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'booking_pending')
    .eq('active', true)
    .single()
  if (tmplError) return `Template fetch error: ${tmplError.message}`
  if (!tmpl) return 'No active booking_pending template found'

  // Fetch booking with villa + client
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, onboarding_token, villas(name), clients(name, email)')
    .eq('id', bookingId)
    .single()
  if (bookingError) return `Booking fetch error: ${bookingError.message}`
  if (!booking) return `Booking not found: ${bookingId}`

  const client = (booking as any).clients
  const villaName = (booking as any).villas?.name ?? 'your villa'
  if (!client?.email) return `Client has no email address`

  const bookingLink = booking.onboarding_token
    ? `https://www.mgl365antigua.com/onboard/${booking.onboarding_token}`
    : `https://www.mgl365antigua.com`

  const vars = {
    guest_name: client.name ?? '',
    guest_first_name: (client.name ?? '').split(' ')[0],
    villa_name: villaName,
    check_in: booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
    check_out: booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
    booking_link: bookingLink,
  }

  const subject = applyTemplate(tmpl.subject, vars)
  const bodyText = applyTemplate(tmpl.body, vars)

  // Convert plain text body to simple HTML
  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
        <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">${villaName}</p>
      </div>
      <div style="padding: 0 32px 32px;">
        <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${bodyText.replace(bookingLink, `<a href="${bookingLink}" style="color: #1f5772;">${bookingLink}</a>`)}</div>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${bookingLink}" style="display: inline-block; background: #1f5772; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            View Your Booking
          </a>
        </div>
      </div>
    </div>
  `

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: client.email,
    cc: 'mgl365management@gmail.com',
    replyTo: 'mgl365management@gmail.com',
    subject,
    html: bodyHtml,
  })
  if (emailError) return `Resend error: ${JSON.stringify(emailError)}`
  return `OK:${emailData?.id}`
}

async function checkOverlap(
  supabase: ReturnType<typeof getServiceSupabase>,
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
) {
  let query = supabase
    .from('bookings')
    .select('id, check_in, check_out, clients(name)')
    .eq('villa_id', villaId)
    .neq('status', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)

  if (excludeBookingId) query = query.neq('id', excludeBookingId)

  const { data } = await query
  return data ?? []
}

export async function createBooking(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const villaId = (formData.get('villa_id') as string) || null
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string

  if (villaId && checkIn && checkOut) {
    const overlaps = await checkOverlap(supabase, villaId, checkIn, checkOut)
    if (overlaps.length > 0) {
      const clash = overlaps[0] as any
      return (
        `This villa is already booked from ${clash.check_in} to ${clash.check_out}` +
        (clash.clients?.name ? ` (${clash.clients.name})` : '') +
        `. Please choose different dates.`
      )
    }
  }

  const { data: newBooking, error } = await supabase.from('bookings').insert({
    villa_id: villaId,
    client_id: (formData.get('client_id') as string) || null,
    check_in: checkIn,
    check_out: checkOut,
    guests: formData.get('guests') ? Number(formData.get('guests')) : null,
    package: (formData.get('package') as string) || null,
    status: (formData.get('status') as BookingStatus) || 'pending',
    total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
    notes: (formData.get('notes') as string) || null,
  }).select('id').single()
  if (error) return error.message

  // Send welcome email if status is pending
  const status = (formData.get('status') as string) || 'pending'
  if (status === 'pending' && newBooking?.id) {
    const result = await sendBookingEmail(newBooking.id).catch(String)
    if (!result.startsWith('OK:')) console.error('[sendBookingEmail]', result)
    else console.log('[sendBookingEmail] sent OK, id:', result.slice(3))
  }

  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}

async function sendCompletedEmail(bookingId: string): Promise<string> {
  const supabase = getServiceSupabase()

  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'booking_completed')
    .eq('active', true)
    .single()
  if (tmplError) return `Template fetch error: ${tmplError.message}`
  if (!tmpl) return 'No active booking_completed template found'

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, guests, package, total_amount, villas(name), clients(name, email)')
    .eq('id', bookingId)
    .single()
  if (bookingError) return `Booking fetch error: ${bookingError.message}`
  if (!booking) return `Booking not found: ${bookingId}`

  const client = (booking as any).clients
  const villaName = (booking as any).villas?.name ?? 'your villa'
  if (!client?.email) return `Client has no email address`

  const nights = booking.check_in && booking.check_out
    ? Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const checkInFmt = booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const checkOutFmt = booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const googleReviewUrl = process.env.GOOGLE_REVIEW_URL ?? ''

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
        <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${bodyText}</div>
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

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: client.email,
    cc: ['mgl365management@gmail.com', 'jeff@stapleyinc.com'],
    replyTo: 'mgl365management@gmail.com',
    subject,
    html: bodyHtml,
  })
  if (emailError) return `Resend error: ${JSON.stringify(emailError)}`
  return `OK:${emailData?.id}`
}

export async function resendCompletedEmail(id: string): Promise<string> {
  const result = await sendCompletedEmail(id).catch(String)
  revalidatePath(`/admin/bookings/${id}`)
  return result
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)

  if (status === 'completed') {
    const result = await sendCompletedEmail(id).catch(String)
    if (!result.startsWith('OK:')) console.error('[sendCompletedEmail]', result)
    else console.log('[sendCompletedEmail] sent OK, id:', result.slice(3))
  }

  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${id}`)
}

export async function updateBooking(
  id: string,
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const villaId = (formData.get('villa_id') as string) || null
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string

  if (villaId && checkIn && checkOut) {
    const overlaps = await checkOverlap(supabase, villaId, checkIn, checkOut, id)
    if (overlaps.length > 0) {
      const clash = overlaps[0] as any
      return (
        `This villa is already booked from ${clash.check_in} to ${clash.check_out}` +
        (clash.clients?.name ? ` (${clash.clients.name})` : '') +
        `. Please choose different dates.`
      )
    }
  }

  const { error } = await supabase.from('bookings').update({
    villa_id: villaId,
    client_id: (formData.get('client_id') as string) || null,
    check_in: checkIn,
    check_out: checkOut,
    guests: formData.get('guests') ? Number(formData.get('guests')) : null,
    package: (formData.get('package') as string) || null,
    status: formData.get('status') as BookingStatus,
    total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}

export async function resendBookingEmail(id: string): Promise<string> {
  const result = await sendBookingEmail(id).catch(String)
  revalidatePath(`/admin/bookings/${id}`)
  return result
}
