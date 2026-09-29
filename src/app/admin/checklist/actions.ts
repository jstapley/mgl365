'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export async function saveInspection(villaId: string, data: {
  inspection_date: string
  checked_by: string
  checked_by_other: string | null
  responses: Record<string, unknown>
}) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('inspections').insert({
    villa_id: villaId,
    inspection_date: data.inspection_date,
    checked_by: data.checked_by,
    checked_by_other: data.checked_by_other,
    responses: data.responses,
  })
  if (error) throw new Error(error.message)

  // Enforce 10-record limit — delete oldest beyond 10
  const { data: all } = await supabase
    .from('inspections')
    .select('id')
    .eq('villa_id', villaId)
    .order('created_at', { ascending: false })
  if (all && all.length > 10) {
    const toDelete = all.slice(10).map(r => r.id)
    await supabase.from('inspections').delete().in('id', toDelete)
  }

  revalidatePath('/admin/checklist')
}

export async function deleteInspection(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('inspections').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/checklist')
}
