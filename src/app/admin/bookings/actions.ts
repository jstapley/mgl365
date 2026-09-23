'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import type { BookingStatus } from '@/types'

async function checkOverlap(
  supabase: ReturnType<typeof getServiceSupabase>,
  villaId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
) {
  let query = supabase
    .from('bookings')
    .select('id, check_in, check_out, clients(name)')
    .eq('villa_id', villaId)
    .neq('status', 'cancelled')
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)

  if (excludeBookingId) query = query.neq('id', excludeBookingId)

  const { data } = await query
  return data ?? []
}

export async function createBooking(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const villaId = (formData.get('villa_id') as string) || null
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string

  if (villaId && checkIn && checkOut) {
    const overlaps = await checkOverlap(supabase, villaId, checkIn, checkOut)
    if (overlaps.length > 0) {
      const clash = overlaps[0] as any
      return (
        `This villa is already booked from ${clash.check_in} to ${clash.check_out}` +
        (clash.clients?.name ? ` (${clash.clients.name})` : '') +
        `. Please choose different dates.`
      )
    }
  }

  const { error } = await supabase.from('bookings').insert({
    villa_id: villaId,
    client_id: (formData.get('client_id') as string) || null,
    check_in: checkIn,
    check_out: checkOut,
    guests: formData.get('guests') ? Number(formData.get('guests')) : null,
    package: (formData.get('package') as string) || null,
    status: (formData.get('status') as BookingStatus) || 'pending',
    total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
    notes: (formData.get('notes') as string) || null,
  })
  if (error) return error.message
  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${id}`)
}

export async function updateBooking(
  id: string,
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const villaId = (formData.get('villa_id') as string) || null
  const checkIn = formData.get('check_in') as string
  const checkOut = formData.get('check_out') as string

  if (villaId && checkIn && checkOut) {
    const overlaps = await checkOverlap(supabase, villaId, checkIn, checkOut, id)
    if (overlaps.length > 0) {
      const clash = overlaps[0] as any
      return (
        `This villa is already booked from ${clash.check_in} to ${clash.check_out}` +
        (clash.clients?.name ? ` (${clash.clients.name})` : '') +
        `. Please choose different dates.`
      )
    }
  }

  const { error } = await supabase.from('bookings').update({
    villa_id: villaId,
    client_id: (formData.get('client_id') as string) || null,
    check_in: checkIn,
    check_out: checkOut,
    guests: formData.get('guests') ? Number(formData.get('guests')) : null,
    package: (formData.get('package') as string) || null,
    status: formData.get('status') as BookingStatus,
    total_amount: formData.get('total_amount') ? Number(formData.get('total_amount')) : null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)
  if (error) return error.message
  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}
