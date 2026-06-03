'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { fetchApi } from '@/lib/api'
import type { DashboardStats } from '@/lib/api'
import {
  Home,
  Network,
  Layers,
  Database,
  History,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  {
    href: '/ip-address',
    label: 'IP Address',
    icon: Network,
    badgeKey: 'totalIp' as const,
  },
  { href: '/per-lantai', label: 'Per Lantai', icon: Layers },
  {
    label: 'Master Data',
    icon: Database,
    children: [
      { href: '/master/lantai', label: 'Lantai' },
      { href: '/master/departemen', label: 'Departemen' },
    ],
  },
  { href: '/history', label: 'History', icon: History },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openSub, setOpenSub] = useState(() =>
    menuItems.some(item =>
      item.children?.some(c => c.href && pathname.startsWith(c.href))
    )
  )
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetchApi<DashboardStats>('/api/dashboard/stats').then(setStats).catch(() => {})
  }, [])

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex items-center gap-3 border-b px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
          IP
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">IP Manager RS</p>
          <p className="text-[11px] text-muted-foreground">Manajemen Jaringan</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          if (item.children) {
            const childActive = item.children.some((c) => c.href && pathname.startsWith(c.href))
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenSub(!openSub)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    childActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform',
                      openSub && 'rotate-180'
                    )}
                  />
                </button>
                {openSub && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const badge = item.badgeKey ? stats?.[item.badgeKey] : undefined

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href || (item.href && pathname.startsWith(item.href) && item.href !== '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge !== undefined && (
                <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            AD
          </div>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-medium">Admin RS</p>
            <p className="text-[11px] text-muted-foreground">admin@rs.com</p>
          </div>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
