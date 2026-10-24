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

export async function bulkDeleteBookingServices(ids: string[], bookingId: string): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('booking_services').delete().in('id', ids)
  if (error) return error.message
  revalidatePath(`/admin/bookings/${bookingId}`)
  return null
}

const INTEREST_LABELS: { key: string; label: string }[] = [
  { key: 'interest_spa',          label: 'Spa Services' },
  { key: 'interest_tours',        label: 'Barefoot Tours' },
  { key: 'interest_excursions',   label: 'Excursions' },
  { key: 'interest_wine',         label: 'Wine List' },
  { key: 'interest_transport',    label: 'Transport' },
  { key: 'interest_chef',         label: 'Private Chef' },
  { key: 'interest_provisioning', label: 'Provisioning' },
]

export async function importFromSubmission(bookingId: string): Promise<{ imported: number; skipped: number; error?: string }> {
  const supabase = getServiceSupabase()

  // Fetch activities, interest flags, and provisioning grocery data
  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('selected_activities, interest_spa, interest_tours, interest_excursions, interest_wine, interest_transport, interest_chef, interest_provisioning, grocery_items, grocery_notes')
    .eq('booking_id', bookingId)
    .single()

  if (!submission) return { imported: 0, skipped: 0, error: 'No onboarding submission found for this booking.' }

  // Build candidate list: selected activities first, then checked interests
  type Candidate = { service_name: string; cost_usd: number | null; notes: string | null }

  const activities: { id?: string; name: string; price?: number; duration?: string; notes?: string }[] =
    (submission as any).selected_activities ?? []

  const candidates: Candidate[] = [
    ...activities.map(a => ({
      service_name: a.name,
      cost_usd:     a.price ?? null,
      notes:        a.duration ? `Duration: ${a.duration}${a.notes ? ` · ${a.notes}` : ''}` : (a.notes ?? null),
    })),
    ...INTEREST_LABELS
      .filter(({ key }) => (submission as any)[key])
      .map(({ key, label }) => {
        let notes: string | null = null
        if (key === 'interest_provisioning') {
          const items = ((submission as any).grocery_items as string | null)?.trim() || ''
          const extraNotes = ((submission as any).grocery_notes as string | null)?.trim() || ''
          const parts = [items, extraNotes].filter(Boolean)
          notes = parts.length ? parts.join('\n') : null
        }
        return { service_name: label, cost_usd: null, notes }
      }),
  ]

  if (candidates.length === 0) return { imported: 0, skipped: 0, error: 'No activities or service interests found in the submission.' }

  // Fetch existing service names to avoid duplicates
  const { data: existing } = await supabase
    .from('booking_services')
    .select('service_name')
    .eq('booking_id', bookingId)
  const existingNames = new Set((existing ?? []).map(s => s.service_name.toLowerCase()))

  const toInsert = candidates.filter(c => !existingNames.has(c.service_name.toLowerCase()))
  const skipped = candidates.length - toInsert.length

  if (toInsert.length === 0) return { imported: 0, skipped }

  const { error } = await supabase.from('booking_services').insert(
    toInsert.map(c => ({ booking_id: bookingId, ...c }))
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

  // Find provider by name match — if not found, create one on the fly
  const { data: providers } = await supabase
    .from('commission_providers')
    .select('id, name, sort_order')
    .eq('active', true)

  let providerId: string | null = null

  if (svc.provider) {
    const matched = providers?.find(
      p => p.name.toLowerCase() === svc.provider!.toLowerCase()
    )
    if (matched) {
      providerId = matched.id
    } else {
      // Auto-create the provider
      const maxSort = providers?.reduce((m, p) => Math.max(m, p.sort_order ?? 0), 0) ?? 0
      const { data: newProvider, error: provErr } = await supabase
        .from('commission_providers')
        .insert({ name: svc.provider, primary_service: svc.service_name, sort_order: maxSort + 1, active: true })
        .select('id')
        .single()
      if (provErr) return provErr.message
      providerId = newProvider.id
    }
  } else {
    // No provider on the service — use first as placeholder, user corrects in tracker
    providerId = providers?.[0]?.id ?? null
  }

  // Fetch client name for the booking
  const { data: bookingRow } = await supabase
    .from('bookings')
    .select('client:clients(name)')
    .eq('id', bookingId)
    .single()
  const guestName = (bookingRow?.client as any)?.name ?? null

  const { error: entryErr } = await supabase.from('commission_entries').insert({
    provider_id:        providerId,
    villa_id:           villaId,
    entry_date:         svc.service_date ?? entryDate,
    guest_name:         guestName,
    service_booked:     svc.service_name,
    collected_by:       'Jamie',
    commission_usd:     svc.cost_usd,
    commission_xcd:     svc.cost_xcd,
    payment_status:     'unpaid',
    notes:              null,
    booking_service_id: serviceId,
  })
  if (entryErr) return entryErr.message

  // Mark as pushed
  await supabase.from('booking_services').update({ pushed_to_commissions: true }).eq('id', serviceId)

  revalidatePath(`/admin/bookings/${bookingId}`)
  revalidatePath('/admin/commissions')
  return null
}
