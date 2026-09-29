'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function saveLiabilityForm(villaId: string, _prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = getServiceSupabase()
  const content = formData.get('content') as string

  // Try update first, then insert if no row exists
  const { data: existing } = await supabase
    .from('liability_forms')
    .select('id')
    .eq('villa_id', villaId)
    .maybeSingle()

  let error
  if (existing) {
    ;({ error } = await supabase
      .from('liability_forms')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('villa_id', villaId))
  } else {
    ;({ error } = await supabase
      .from('liability_forms')
      .insert({ villa_id: villaId, content, updated_at: new Date().toISOString() }))
  }

  if (error) return error.message

  revalidatePath('/admin/forms')
  revalidatePath('/admin/forms/liability')
  redirect(`/admin/forms/liability?villa=${villaId}`)
}
