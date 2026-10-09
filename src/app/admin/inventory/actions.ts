'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export type SaveEntry = { item_id: string; quantity: number }

export async function saveInventoryCheck(
  villaId: string,
  data: { check_date: string; checked_by: string; entries: SaveEntry[] }
): Promise<string | null> {
  const supabase = getServiceSupabase()

  const { data: check, error: checkErr } = await supabase
    .from('inventory_checks')
    .insert({ villa_id: villaId, check_date: data.check_date, checked_by: data.checked_by })
    .select('id')
    .single()
  if (checkErr) return checkErr.message

  if (data.entries.length > 0) {
    const { error: entryErr } = await supabase
      .from('inventory_check_entries')
      .insert(data.entries.map(e => ({ check_id: check.id, item_id: e.item_id, quantity: e.quantity })))
    if (entryErr) return entryErr.message
  }

  // Prune checks older than 84 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 84)
  const { data: old } = await supabase
    .from('inventory_checks')
    .select('id')
    .eq('villa_id', villaId)
    .lt('check_date', cutoff.toISOString().slice(0, 10))
  if (old && old.length > 0) {
    await supabase.from('inventory_checks').delete().in('id', old.map(r => r.id))
  }

  revalidatePath('/admin/inventory')
  return null
}

export async function updateInventoryCheck(
  checkId: string,
  data: { check_date: string; checked_by: string; entries: SaveEntry[] }
): Promise<string | null> {
  const supabase = getServiceSupabase()

  const { error: headerErr } = await supabase
    .from('inventory_checks')
    .update({ check_date: data.check_date, checked_by: data.checked_by })
    .eq('id', checkId)
  if (headerErr) return headerErr.message

  // Replace all entries
  await supabase.from('inventory_check_entries').delete().eq('check_id', checkId)
  if (data.entries.length > 0) {
    const { error: entryErr } = await supabase
      .from('inventory_check_entries')
      .insert(data.entries.map(e => ({ check_id: checkId, item_id: e.item_id, quantity: e.quantity })))
    if (entryErr) return entryErr.message
  }

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

export async function saveInventoryItem(
  villaId: string,
  data: { id?: string; category: string; name: string }
): Promise<string | null> {
  const supabase = getServiceSupabase()

  if (data.id) {
    const { error } = await supabase
      .from('inventory_items')
      .update({ category: data.category, name: data.name })
      .eq('id', data.id)
    if (error) return error.message
  } else {
    const { data: existing } = await supabase
      .from('inventory_items')
      .select('sort_order')
      .eq('villa_id', villaId)
      .eq('category', data.category)
      .order('sort_order', { ascending: false })
      .limit(1)
    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0
    const { error } = await supabase
      .from('inventory_items')
      .insert({ villa_id: villaId, category: data.category, name: data.name, sort_order: nextOrder })
    if (error) return error.message
  }

  revalidatePath('/admin/inventory')
  return null
}

export async function deleteInventoryItem(id: string): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/inventory')
  return null
}

export async function moveInventoryItem(
  id: string,
  direction: 'up' | 'down',
  villaId: string,
  category: string
): Promise<void> {
  const supabase = getServiceSupabase()
  const { data: items } = await supabase
    .from('inventory_items')
    .select('id, sort_order')
    .eq('villa_id', villaId)
    .eq('category', category)
    .order('sort_order', { ascending: true })
  if (!items) return

  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  const a = items[idx]
  const b = items[swapIdx]
  await Promise.all([
    supabase.from('inventory_items').update({ sort_order: b.sort_order }).eq('id', a.id),
    supabase.from('inventory_items').update({ sort_order: a.sort_order }).eq('id', b.id),
  ])
  revalidatePath('/admin/inventory')
}
