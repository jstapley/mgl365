import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getServiceSupabase } from '@/lib/supabase'

async function getVillaLinks() {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('villas')
    .select('name, slug')
    .eq('active', true)
    .order('created_at', { ascending: true })
  return (data ?? []) as { name: string; slug: string }[]
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const villas = await getVillaLinks()
  return (
    <>
      <Navbar villas={villas} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
