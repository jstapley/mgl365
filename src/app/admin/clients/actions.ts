'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function createClient(formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('clients').insert({
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    nationality: (formData.get('nationality') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/clients')
  redirect('/admin/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('clients').update({
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    nationality: (formData.get('nationality') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/clients')
  redirect(`/admin/clients/${id}`)
}
