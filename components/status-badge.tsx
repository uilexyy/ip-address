'use client'

import type { IpStatus } from '@/lib/constants'

const variants: Record<IpStatus, { bg: string; text: string; border: string }> = {
  AKTIF: { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800/40' },
  NONAKTIF: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800/40' },
  MAINTENANCE: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40' },
}

export function StatusBadge({ status }: { status: IpStatus }) {
  const v = variants[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${v.bg} ${v.text} ${v.border}`}
    >
      {status}
    </span>
  )
}
