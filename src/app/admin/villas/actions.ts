'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'

export async function createVilla(formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('villas').insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    tagline: (formData.get('tagline') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
    max_guests: formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
    price_per_night: formData.get('price_per_night') ? Number(formData.get('price_per_night')) : null,
    active: formData.get('active') === 'true',
    features: formData.getAll('features') as string[],
    gallery_images: (formData.getAll('gallery_images') as string[]).filter(Boolean),
    content: JSON.parse((formData.get('content') as string) || '[]'),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/villas')
  redirect('/admin/villas')
}

export async function updateVilla(id: string, formData: FormData) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('villas').update({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    tagline: (formData.get('tagline') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
    max_guests: formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
    price_per_night: formData.get('price_per_night') ? Number(formData.get('price_per_night')) : null,
    active: formData.get('active') === 'true',
    features: formData.getAll('features') as string[],
    gallery_images: (formData.getAll('gallery_images') as string[]).filter(Boolean),
    content: JSON.parse((formData.get('content') as string) || '[]'),
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/villas')
  redirect('/admin/villas')
}

export async function deleteVilla(id: string) {
  const supabase = getServiceSupabase()
  const { error } = await supabase.from('villas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/villas')
}
