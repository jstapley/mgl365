'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

function computeNextDue(lastCompleted: string, frequencyDays: number): string {
  const d = new Date(lastCompleted + 'T00:00:00')
  d.setDate(d.getDate() + frequencyDays)
  return d.toISOString().slice(0, 10)
}

export async function createSchedule(formData: FormData) {
  const supabase = getServiceSupabase()
  const frequencyDays = Number(formData.get('frequency_days')) || 90
  const lastCompleted = (formData.get('last_completed') as string) || null
  const nextDue = formData.get('next_due') as string

  const { error } = await supabase.from('maintenance_schedules').insert({
    villa_id:           (formData.get('villa_id') as string) || null,
    name:               formData.get('name') as string,
    description:        (formData.get('description') as string) || null,
    frequency_days:     frequencyDays,
    last_completed:     lastCompleted,
    next_due:           nextDue || null,
    notify_email:       (formData.get('notify_email') as string) || null,
    notify_days_before: Number(formData.get('notify_days_before')) || 7,
    active:             formData.get('active') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/maintenance')
  redirect('/admin/maintenance')
}

export async function updateSchedule(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const frequencyDays = Number(formData.get('frequency_days')) || 90

  const { error } = await supabase.from('maintenance_schedules').update({
    villa_id:           (formData.get('villa_id') as string) || null,
    name:               formData.get('name') as string,
    description:        (formData.get('description') as string) || null,
    frequency_days:     frequencyDays,
    next_due:           (formData.get('next_due') as string) || null,
    notify_email:       (formData.get('notify_email') as string) || null,
    notify_days_before: Number(formData.get('notify_days_before')) || 7,
    active:             formData.get('active') === 'true',
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/maintenance')
  revalidatePath(`/admin/maintenance/${id}`)
  redirect('/admin/maintenance')
}

export async function markComplete(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const completedDate = formData.get('completed_date') as string
  const notes = (formData.get('notes') as string) || null
  const cost = formData.get('cost') ? Number(formData.get('cost')) : null

  // Get the schedule to calculate next_due
  const { data: schedule, error: fetchError } = await supabase
    .from('maintenance_schedules')
    .select('frequency_days')
    .eq('id', id)
    .single()
  if (fetchError || !schedule) throw new Error('Schedule not found')

  const nextDue = computeNextDue(completedDate, schedule.frequency_days)

  // Log the completion
  const { error: logError } = await supabase.from('maintenance_logs').insert({
    schedule_id:    id,
    completed_date: completedDate,
    notes,
    cost,
  })
  if (logError) throw new Error(logError.message)

  // Update the schedule
  const { error: updateError } = await supabase
    .from('maintenance_schedules')
    .update({ last_completed: completedDate, next_due: nextDue })
    .eq('id', id)
  if (updateError) throw new Error(updateError.message)

  revalidatePath('/admin/maintenance')
  revalidatePath(`/admin/maintenance/${id}`)
}

export async function deleteSchedule(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('maintenance_schedules').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/maintenance')
}
