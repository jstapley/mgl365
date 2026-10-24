'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export interface BookingService {
  id: string
  booking_id: string
  service_name: string
  provider: string | null
  service_date: string | null
  service_time: string | null
  cost_usd: number | null
  cost_xcd: number | null
  pickup_location: string | null
  notes: string | null
  pushed_to_commissions: boolean
  created_at: string
}

export async function getBookingServices(bookingId: string): Promise<BookingService[]> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('booking_services')
    .select('*')
    .eq('booking_id', bookingId)
    .order('service_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  return (data ?? []) as BookingService[]
}

export async function createBookingService(
  bookingId: string,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('booking_services').insert({
    booking_id:       bookingId,
    service_name:     (formData.get('service_name') as string).trim(),
    provider:         (formData.get('provider') as string)?.trim() || null,
    service_date:     (formData.get('service_date') as string) || null,
    service_time:     (formData.get('service_time') as string)?.trim() || null,
    cost_usd:         formData.get('cost_usd') ? Number(formData.get('cost_usd')) : null,
    cost_xcd:         formData.get('cost_xcd') ? Number(formData.get('cost_xcd')) : null,
    pickup_location:  (formData.get('pickup_location') as string)?.trim() || null,
    notes:            (formData.get('notes') as string)?.trim() || null,
  })
  if (error) return error.message
  revalidatePath(`/admin/bookings/${bookingId}`)
  return null
}

export async function updateBookingService(
  id: string,
  bookingId: string,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('booking_services').update({
    service_name:     (formData.get('service_name') as string).trim(),
    provider:         (formData.get('provider') as string)?.trim() || null,
    service_date:     (formData.get('service_date') as string) || null,
    service_time:     (formData.get('service_time') as string)?.trim() || null,
    cost_usd:         formData.get('cost_usd') ? Number(formData.get('cost_usd')) : null,
    cost_xcd:         formData.get('cost_xcd') ? Number(formData.get('cost_xcd')) : null,
    pickup_location:  (formData.get('pickup_location') as string)?.trim() || null,
    notes:            (formData.get('notes') as string)?.trim() || null,
  }).eq('id', id)
  if (error) return error.message
  revalidatePath(`/admin/bookings/${bookingId}`)
  return null
}

export async function deleteBookingService(id: string, bookingId: string): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('booking_services').delete().eq('id', id)
  revalidatePath(`/admin/bookings/${bookingId}`)
}

export async function importFromSubmission(bookingId: string): Promise<{ imported: number; skipped: number; error?: string }> {
  const supabase = getServiceSupabase()

  // Fetch the onboarding submission for this booking
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('selected_activities')
    .eq('booking_id', bookingId)
    .single()

  if (!submission) return { imported: 0, skipped: 0, error: 'No onboarding submission found for this booking.' }

  const activities: { id?: string; name: string; price?: number; duration?: string; notes?: string }[] =
    submission.selected_activities ?? []

  if (activities.length === 0) return { imported: 0, skipped: 0, error: 'No selected activities found in the submission.' }

  // Fetch existing service names to avoid duplicates
  const { data: existing } = await supabase
    .from('booking_services')
    .select('service_name')
    .eq('booking_id', bookingId)
  const existingNames = new Set((existing ?? []).map(s => s.service_name.toLowerCase()))

  const toInsert = activities.filter(a => !existingNames.has(a.name.toLowerCase()))
  const skipped = activities.length - toInsert.length

  if (toInsert.length === 0) return { imported: 0, skipped }

  const { error } = await supabase.from('booking_services').insert(
    toInsert.map(a => ({
      booking_id:   bookingId,
      service_name: a.name,
      cost_usd:     a.price ?? null,
      notes:        a.duration ? `Duration: ${a.duration}${a.notes ? ` · ${a.notes}` : ''}` : (a.notes ?? null),
    }))
  )
  if (error) return { imported: 0, skipped, error: error.message }

  revalidatePath(`/admin/bookings/${bookingId}`)
  return { imported: toInsert.length, skipped }
}

export async function pushToCommissions(
  serviceId: string,
  bookingId: string,
  villaId: string | null,
  entryDate: string,
): Promise<string | null> {
  const supabase = getServiceSupabase()

  // Fetch the service
  const { data: svc, error: svcErr } = await supabase
    .from('booking_services')
    .select('*')
    .eq('id', serviceId)
    .single()
  if (svcErr || !svc) return 'Service not found.'

  // Find provider by name match, or leave null (user picks in commissions)
  const { data: providers } = await supabase
    .from('commission_providers')
    .select('id, name')
    .eq('active', true)
  const matched = providers?.find(
    p => p.name.toLowerCase() === (svc.provider ?? '').toLowerCase()
  )

  // Fetch first active provider as fallback placeholder
  const fallbackProvider = providers?.[0]

  const { error: entryErr } = await supabase.from('commission_entries').insert({
    provider_id:    matched?.id ?? fallbackProvider?.id ?? null,
    villa_id:       villaId,
    entry_date:     entryDate,
    guest_name:     null,
    service_booked: svc.service_name,
    collected_by:   'Jamie',  // default — user edits in commission tracker
    commission_usd: svc.cost_usd,
    commission_xcd: svc.cost_xcd,
    payment_status: 'unpaid',
    notes:          svc.provider ? `Provider: ${svc.provider}` : null,
  })
  if (entryErr) return entryErr.message

  // Mark as pushed
  await supabase.from('booking_services').update({ pushed_to_commissions: true }).eq('id', serviceId)

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/commissions')
  return null
}
