'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function createService(formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('services').insert({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    package: (formData.get('package') as string) || null,
    sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
    active: formData.get('active') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
  redirect('/admin/services')
}

export async function updateService(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('services').update({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    package: (formData.get('package') as string) || null,
    sort_order: formData.get('sort_order') ? Number(formData.get('sort_order')) : 0,
    active: formData.get('active') === 'true',
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
  redirect('/admin/services')
}

export async function deleteService(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}
