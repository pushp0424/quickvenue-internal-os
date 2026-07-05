import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { Breadcrumb } from '@/components/shared/breadcrumb'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background print:h-auto print:w-auto print:overflow-visible print:block">
      <div className="contents print:hidden"><Sidebar /></div>
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden print:overflow-visible print:block">
        <div className="contents print:hidden"><Navbar /></div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 print:overflow-visible print:p-0">
          <div className="contents print:hidden"><Breadcrumb /></div>
          {children}
        </main>
      </div>
    </div>
  )
}