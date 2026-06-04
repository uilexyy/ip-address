'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

interface BarData {
  floor: string
  total: number
}

interface PieData {
  name: string
  value: number
  fill?: string
}

const COLORS = [
  '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

function EmptyChart({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
      <Icon className="size-10 mb-2 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export function BarChartCard({ data }: { data: BarData[] }) {
  const empty = data.length === 0 || data.every((d) => d.total === 0)

  return (
    <Card className="border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Jumlah Perangkat per Lantai</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {empty ? (
            <EmptyChart icon={BarChart3} message="Belum ada data perangkat" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis dataKey="floor" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: 'var(--foreground)', fontSize: 12 }} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function PieChartCard({ data }: { data: PieData[] }) {
  const empty = data.length === 0

  return (
    <Card className="border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Distribusi Jenis Perangkat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {empty ? (
            <EmptyChart icon={PieChartIcon} message="Belum ada data perangkat" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={3} dataKey="value">
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: 'var(--foreground)', fontSize: 12 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{value}</span>} />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
