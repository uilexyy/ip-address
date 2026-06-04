'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
          'flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300',
          'fixed -translate-x-full z-50 md:static md:translate-x-0',
          mobileOpen && 'translate-x-0'
        )}
      >
      <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-sm font-bold shadow-xs">
          IP
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">IP Manager RS</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Manajemen Jaringan</p>
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
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
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
                  <div className="ml-6 mt-1 space-y-1 border-l border-zinc-100 pl-2 dark:border-zinc-800">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-xs transition-all hover:translate-x-1 duration-200',
                          pathname === child.href
                            ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
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
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
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

      <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            AD
          </div>
          <div className="flex-1 leading-tight min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">Admin RS</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">admin@rs.com</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title="Ubah Tema"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
