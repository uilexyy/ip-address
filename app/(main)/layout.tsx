'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MobileSidebarToggle } from './_components/mobile-sidebar-toggle'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <MobileSidebarToggle
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 transition-colors duration-300 pt-14 md:pt-6">
        {children}
      </main>
    </div>
  )
}
