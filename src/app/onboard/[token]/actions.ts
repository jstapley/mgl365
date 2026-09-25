'use server'

import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

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
      selected_activities: selectedActivities,
      num_guests: formData.get('num_guests') ? Number(formData.get('num_guests')) : null,
      num_guests_under_6: formData.get('num_guests_under_6') ? Number(formData.get('num_guests_under_6')) : null,
      arrival_flight: (formData.get('arrival_flight') as string)?.trim() || null,
      arrival_datetime: (formData.get('arrival_datetime') as string) || null,
      departure_flight: (formData.get('departure_flight') as string)?.trim() || null,
      departure_datetime: (formData.get('departure_datetime') as string) || null,
      car_insurance: (formData.get('car_insurance') as string) || null,
      grocery_items: (formData.get('grocery_items') as string) || null,
      grocery_notes: (formData.get('grocery_notes') as string) || null,
      guest_notes: (formData.get('guest_notes') as string)?.trim() || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'booking_id' }
  )

  if (error) throw new Error(error.message)

  // Mark booking as completed
  await supabase
    .from('bookings')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', booking.id)

  redirect(`/onboard/${token}/success`)
}
