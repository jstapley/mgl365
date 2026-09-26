'use server'

import { revalidatePath } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabase'

export async function updateEmailTemplate(
  id: string,
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const supabase = getServiceSupabase()
  const { error } = await supabase
    .from('email_templates')
    .update({
      name: (formData.get('name') as string).trim(),
      subject: (formData.get('subject') as string).trim(),
      body: (formData.get('body') as string).trim(),
      active: formData.get('active') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return error.message
  revalidatePath('/admin/email-templates')
  return null
}
