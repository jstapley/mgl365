'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

async function resolveProviderId(formData: FormData): Promise<{ id: string; error?: string }> {
  const supabase = getServiceSupabase()
  const providerId = formData.get('provider_id') as string
  if (providerId !== '__adhoc__') return { id: providerId }
  const name = (formData.get('provider_name') as string)?.trim()
  if (!name) return { id: '', error: 'Please enter a provider name.' }
  const { data, error } = await supabase
    .from('commission_providers')
    .insert({ name, primary_service: name, sort_order: 999, active: true })
    .select('id')
    .single()
  if (error) return { id: '', error: error.message }
  return { id: data.id }
}

export async function createEntry(formData: FormData): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { id: providerId, error: provErr } = await resolveProviderId(formData)
  if (provErr) return provErr
  const { error } = await supabase.from('commission_entries').insert({
    provider_id:    providerId,
    villa_id:       (formData.get('villa_id') as string) || null,
    entry_date:     formData.get('entry_date') as string,
    guest_name:     (formData.get('guest_name') as string)?.trim() || null,
    service_booked: (formData.get('service_booked') as string)?.trim() || null,
    collected_by:   formData.get('collected_by') as string,
    commission_usd: formData.get('commission_usd') ? Number(formData.get('commission_usd')) : null,
    commission_xcd: formData.get('commission_xcd') ? Number(formData.get('commission_xcd')) : null,
    payment_status: formData.get('payment_status') as string,
    notes:          (formData.get('notes') as string)?.trim() || null,
  })
  if (error) return error.message
  revalidatePath('/admin/commissions')
  return null
}

export async function updatePaymentStatus(id: string, status: string): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('commission_entries').update({ payment_status: status }).eq('id', id)
  revalidatePath('/admin/commissions')
}

export async function updateEntry(id: string, formData: FormData): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { id: providerId, error: provErr } = await resolveProviderId(formData)
  if (provErr) return provErr
  const { error } = await supabase.from('commission_entries').update({
    provider_id:    providerId,
    villa_id:       (formData.get('villa_id') as string) || null,
    entry_date:     formData.get('entry_date') as string,
    guest_name:     (formData.get('guest_name') as string)?.trim() || null,
    service_booked: (formData.get('service_booked') as string)?.trim() || null,
    collected_by:   formData.get('collected_by') as string,
    commission_usd: formData.get('commission_usd') ? Number(formData.get('commission_usd')) : null,
    commission_xcd: formData.get('commission_xcd') ? Number(formData.get('commission_xcd')) : null,
    payment_status: formData.get('payment_status') as string,
    notes:          (formData.get('notes') as string)?.trim() || null,
  }).eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/commissions')
  return null
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('commission_entries').delete().eq('id', id)
  revalidatePath('/admin/commissions')
}
