'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Home,
  Network,
  Layers,
  Database,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/ip-address', label: 'IP Address', icon: Network },
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

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const childActive = useMemo(() =>
    menuItems.some(item =>
      item.children?.some(c => c.href && pathname.startsWith(c.href))
    ),
    [pathname]
  )
  const [openSub, setOpenSub] = useState(() => childActive)

  useEffect(() => {
    Promise.resolve().then(() => setOpenSub(childActive))
  }, [childActive])

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    Promise.resolve().then(() => setTheme(isDark ? 'dark' : 'light'))
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          'flex h-screen w-64 flex-col border-r border-border bg-card transition-all duration-300',
          'fixed -translate-x-full z-50 md:static md:translate-x-0',
          mobileOpen && 'translate-x-0'
        )}
      >
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold shadow-xs">
          IP
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">IP Manager RS</p>
          <p className="text-[11px] text-muted-foreground font-medium">Manajemen Jaringan</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenSub(!openSub)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:translate-x-1 duration-200',
                    childActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      openSub && 'rotate-180'
                    )}
                  />
                </button>
                {openSub && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-border pl-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-xs transition-all hover:translate-x-1 duration-200',
                          pathname === child.href
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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

          const isActive = pathname === item.href || (item.href && pathname.startsWith(item.href) && item.href !== '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:translate-x-1 duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-md bg-blue-600 dark:bg-blue-500" />
              )}
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {session?.user?.nama?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 leading-tight min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {session?.user?.nama || 'User'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Ubah Tema"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={() => signOut({ redirectTo: '/login' })}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
