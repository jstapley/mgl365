'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

// ── Checklist items (templates) ───────────────────────────────────────────────

export async function createItem(villaId: string, formData: FormData) {
  const label = (formData.get('label') as string)?.trim()
  if (!label) return
  const supabase = getServiceSupabase()
  // Put new items at the end
  const { data: last } = await supabase
    .from('checklist_items')
    .select('sort_order')
    .eq('villa_id', villaId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()
  const { error } = await supabase.from('checklist_items').insert({
    villa_id: villaId,
    label,
    sort_order: (last?.sort_order ?? -1) + 1,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/checklist')
}

export async function deleteItem(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('checklist_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/checklist')
}

export async function updateItemLabel(id: string, label: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('checklist_items').update({ label }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/checklist')
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export async function createSnapshot(
  villaId: string,
  items: { label: string; checked: boolean; notes?: string }[],
  formData: FormData,
) {
  const supabase = getServiceSupabase()
  const snapshotDate = formData.get('snapshot_date') as string
  const notes = (formData.get('notes') as string)?.trim() || null
  const bookingId = (formData.get('booking_id') as string) || null

  const { data: snapshot, error: snapError } = await supabase
    .from('checklist_snapshots')
    .insert({ villa_id: villaId, booking_id: bookingId, snapshot_date: snapshotDate, notes })
    .select('id')
    .single()
  if (snapError || !snapshot) throw new Error(snapError?.message ?? 'Snapshot insert failed')

  if (items.length > 0) {
    const { error: resError } = await supabase.from('checklist_results').insert(
      items.map(i => ({
        snapshot_id: snapshot.id,
        item_label: i.label,
        checked: i.checked,
        notes: i.notes || null,
      })),
    )
    if (resError) throw new Error(resError.message)
  }

  revalidatePath('/admin/checklist')
}

export async function deleteSnapshot(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('checklist_snapshots').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/checklist')
}
