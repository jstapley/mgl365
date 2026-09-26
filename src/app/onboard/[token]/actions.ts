'use server'

import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function applyTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replaceAll(`{{${key}}}`, val),
    template
  )
}

async function sendOnboardingCompleteEmail(bookingId: string) {
  const supabase = getServiceSupabase()

  const { data: tmpl, error: tmplError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('trigger', 'onboarding_complete')
    .eq('active', true)
    .single()
  if (tmplError || !tmpl) return

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, villas(name), clients(name, email)')
    .eq('id', bookingId)
    .single()
  if (!booking) return

  const client = (booking as any).clients
  const villaName = (booking as any).villas?.name ?? 'Unknown Villa'
  const adminLink = `https://www.mgl365antigua.com/admin/bookings/${bookingId}`

  const vars = {
    guest_name: client?.name ?? '',
    guest_first_name: (client?.name ?? '').split(' ')[0],
    villa_name: villaName,
    check_in: booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
    check_out: booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '',
    admin_link: adminLink,
    guest_email: client?.email ?? '',
  }

  const subject = applyTemplate(tmpl.subject, vars)
  const bodyText = applyTemplate(tmpl.body, vars)

  const bodyHtml = `
    <div style="font-family: sans-serif; max-width: 600px; color: #333;">
      <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
        <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Onboarding Complete — ${villaName}</p>
      </div>
      <div style="padding: 0 32px 32px;">
        <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${bodyText.replace(adminLink, `<a href="${adminLink}" style="color: #1f5772;">${adminLink}</a>`)}</div>
        <div style="margin-top: 32px; text-align: center;">
          <a href="${adminLink}" style="display: inline-block; background: #1f5772; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
            View Booking
          </a>
        </div>
      </div>
    </div>
  `

  await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: 'mgl365management@gmail.com',
    cc: 'jeff@stapleyinc.com',
    replyTo: 'mgl365management@gmail.com',
    subject,
    html: bodyHtml,
  })
}

export async function submitOnboarding(token: string, formData: FormData) {
  const supabase = getServiceSupabase()

  // Get booking by token (include villa for liability snapshot)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, client_id, villa_id')
    .eq('onboarding_token', token)
    .single()

  if (bookingError || !booking) throw new Error('Invalid onboarding link.')

  // Snapshot the current liability form text so it's preserved permanently
  const { data: liabilityForm } = await supabase
    .from('liability_forms')
    .select('content')
    .eq('villa_id', booking.villa_id)
    .single()
  const liabilitySnapshot = liabilityForm?.content ?? null

  // Collect selected activity IDs and their notes
  const activityIds = formData.getAll('activity_ids') as string[]
  const selectedActivities = activityIds.map((id) => {
    const priceRaw = formData.get(`activity_price_${id}`) as string | null
    return {
      id,
      name: (formData.get(`activity_name_${id}`) as string | null)?.trim() || id,
      price: priceRaw ? Number(priceRaw) : undefined,
      duration: (formData.get(`activity_duration_${id}`) as string | null)?.trim() || undefined,
      notes: (formData.get(`activity_notes_${id}`) as string | null)?.trim() || undefined,
    }
  })

  const { error } = await supabase.from('onboarding_submissions').upsert(
    {
      booking_id: booking.id,
      client_id: booking.client_id,
      agreed_to_liability: formData.get('agreed_to_liability') === 'on',
      liability_signed_name: (formData.get('liability_signed_name') as string)?.trim() || null,
      liability_signed_date: (formData.get('liability_signed_date') as string) || null,
      liability_signature: (formData.get('liability_signature') as string) || null,
      liability_content_snapshot: liabilitySnapshot,
      interest_spa: formData.get('interest_spa') === 'on',
      interest_tours: formData.get('interest_tours') === 'on',
      interest_wine: formData.get('interest_wine') === 'on',
      interest_transport: formData.get('interest_transport') === 'on',
      interest_chef: formData.get('interest_chef') === 'on',
      interest_provisioning: formData.get('interest_provisioning') === 'on',
      interest_miscellaneous: formData.get('interest_miscellaneous') === 'on',
      selected_activities: selectedActivities,
      num_guests: formData.get('num_guests') ? Number(formData.get('num_guests')) : null,
      num_guests_under_6: formData.get('num_guests_under_6') ? Number(formData.get('num_guests_under_6')) : null,
      arrival_flight: (formData.get('arrival_flight') as string)?.trim() || null,
      arrival_datetime: (formData.get('arrival_datetime') as string) || null,
      departure_flight: (formData.get('departure_flight') as string)?.trim() || null,
      departure_datetime: (formData.get('departure_datetime') as string) || null,
      car_insurance: (formData.get('car_insurance') as string) || null,
      wine_notes: (formData.get('wine_notes') as string)?.trim() || null,
      chef_special_event: (formData.get('chef_special_event') as string) || null,
      chef_special_event_desc: (formData.get('chef_special_event_desc') as string)?.trim() || null,
      grocery_items: (formData.get('grocery_items') as string) || null,
      grocery_notes: (formData.get('grocery_notes') as string)?.trim() || null,
      guest_notes: (formData.get('guest_notes') as string)?.trim() || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'booking_id' }
  )

  if (error) throw new Error(error.message)

  // Mark booking confirmed and record completion timestamp
  await supabase
    .from('bookings')
    .update({ status: 'confirmed', onboarding_completed_at: new Date().toISOString() })
    .eq('id', booking.id)

  // Notify management
  await sendOnboardingCompleteEmail(booking.id).catch(console.error)

  redirect(`/onboard/${token}/success`)
}
