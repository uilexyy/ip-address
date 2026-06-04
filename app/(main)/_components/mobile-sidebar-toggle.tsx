'use client'

import { Menu, X } from 'lucide-react'

export function MobileSidebarToggle({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-3 left-3 z-60 flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-xs md:hidden dark:border-zinc-700 dark:bg-zinc-800"
      aria-label={open ? 'Tutup menu' : 'Buka menu'}
    >
      {open ? <X className="size-4" /> : <Menu className="size-4" />}
    </button>
  )
}
