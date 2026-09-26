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

async function sendBookingEmail(bookingId: string) {
  const supabase = getServiceSupabase()

  // Fetch template
  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'booking_pending')
    .eq('active', true)
    .single()
  if (tmplError) { console.error('[sendBookingEmail] template fetch error:', tmplError.message); return }
  if (!tmpl) { console.error('[sendBookingEmail] no active booking_pending template found'); return }

  // Fetch booking with villa + client
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, onboarding_token, villas(name), clients(name, email)')
    .eq('id', bookingId)
    .single()
  if (bookingError) { console.error('[sendBookingEmail] booking fetch error:', bookingError.message); return }
  if (!booking) { console.error('[sendBookingEmail] booking not found:', bookingId); return }

  const client = (booking as any).clients
  const villaName = (booking as any).villas?.name ?? 'your villa'
  if (!client?.email) { console.error('[sendBookingEmail] client has no email for booking:', bookingId); return }

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
  if (emailError) console.error('[sendBookingEmail] resend error:', emailError)
  else console.log('[sendBookingEmail] sent OK, id:', emailData?.id)
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
    await sendBookingEmail(newBooking.id).catch(console.error)
  }

  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
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
