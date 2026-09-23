'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function saveLiabilityForm(villaId: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('liability_forms')
    .upsert({ villa_id: villaId, content, updated_at: new Date().toISOString() }, { onConflict: 'villa_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/forms')
  revalidatePath('/admin/forms/liability')
  redirect(`/admin/forms/liability?villa=${villaId}`)
}
