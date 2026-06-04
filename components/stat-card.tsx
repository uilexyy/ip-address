'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  color: string
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card 
      size="sm" 
      className="border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-500/20"
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">{label}</span>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
