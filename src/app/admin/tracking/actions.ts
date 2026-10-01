'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export async function createLink(formData: FormData): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('tracking_links').insert({
    slug:            (formData.get('slug') as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    label:           (formData.get('label') as string).trim(),
    destination_url: (formData.get('destination_url') as string).trim(),
    villa_id:        (formData.get('villa_id') as string) || null,
    channel:         formData.get('channel') as string,
    active:          true,
  })
  if (error) return error.message
  revalidatePath('/admin/tracking')
  return null
}

export async function updateLink(id: string, formData: FormData): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('tracking_links').update({
    slug:            (formData.get('slug') as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    label:           (formData.get('label') as string).trim(),
    destination_url: (formData.get('destination_url') as string).trim(),
    villa_id:        (formData.get('villa_id') as string) || null,
    channel:         formData.get('channel') as string,
  }).eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/tracking')
  return null
}

export async function toggleLink(id: string, active: boolean): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('tracking_links').update({ active }).eq('id', id)
  revalidatePath('/admin/tracking')
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = getServiceSupabase()
  await supabase.from('tracking_links').delete().eq('id', id)
  revalidatePath('/admin/tracking')
}
