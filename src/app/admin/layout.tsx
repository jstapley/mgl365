import AdminShell from '@/components/admin/AdminShell'

export const revalidate = 0

export const metadata = { title: 'MGL 365 Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
