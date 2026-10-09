'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export async function saveInventoryCheck(
  villaId: string,
  data: { check_date: string; checked_by: string; linens: string; kitchen: string; other: string }
): Promise<string | null> {
  const supabase = getServiceSupabase()

  const { error } = await supabase.from('inventory_checks').insert({
    villa_id: villaId,
    check_date: data.check_date,
    checked_by: data.checked_by,
    linens: data.linens || null,
    kitchen: data.kitchen || null,
    other: data.other || null,
  })
  if (error) return error.message

  // Retain only the last 12 weeks (84 days) per villa
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 84)
  await supabase
    .from('inventory_checks')
    .delete()
    .eq('villa_id', villaId)
    .lt('check_date', cutoff.toISOString().slice(0, 10))

  revalidatePath('/admin/inventory')
  return null
}

export async function deleteInventoryCheck(id: string): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('inventory_checks').delete().eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/inventory')
  return null
}
