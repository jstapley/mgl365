'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function createActivity(formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('activities').insert({
    name:        formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    price:       formData.get('price') ? Number(formData.get('price')) : null,
    duration:    (formData.get('duration') as string) || null,
    max_guests:  formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
    category:    (formData.get('category') as string) || 'Other',
    sort_order:  formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
    active:      formData.get('active') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/activities')
  redirect('/admin/activities')
}

export async function updateActivity(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('activities').update({
    name:        formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    price:       formData.get('price') ? Number(formData.get('price')) : null,
    duration:    (formData.get('duration') as string) || null,
    max_guests:  formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
    category:    (formData.get('category') as string) || 'Other',
    sort_order:  formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
    active:      formData.get('active') === 'true',
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/activities')
  redirect('/admin/activities')
}

export async function deleteActivity(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/activities')
}
