import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: 'MGL 365 Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
