import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import EditTemplateForm from './EditTemplateForm'

async function getTemplate(id: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) notFound()
  return data as any
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = await getTemplate(id)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/email-templates" className="mb-1 block text-xs text-[#1f5772] hover:underline">
          ← Email Templates
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{template.name}</h1>
        <p className="mt-0.5 text-xs text-gray-400">Trigger: {template.trigger}</p>
      </div>
      <EditTemplateForm template={template} />
    </div>
  )
}
