'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'
import type { ContactStatus } from '@/types'

export async function updateContactStatus(id: string, status: ContactStatus) {
  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from('contact_submissions')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/contact')
}
