'use client'

import type { IpStatus } from '@/lib/constants'

const variants: Record<IpStatus, { bg: string; text: string; border: string }> = {
  AKTIF: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  NONAKTIF: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  MAINTENANCE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
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
