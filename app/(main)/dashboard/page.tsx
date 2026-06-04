'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Network, CircleCheck, CircleX, Building2, LoaderCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { BarChartCard, PieChartCard } from '@/components/dashboard-charts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { fetchApi } from '@/lib/api'
import type { DashboardStats, IpApiItem, FloorApiItem } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentIps, setRecentIps] = useState<IpApiItem[]>([])
  const [floorData, setFloorData] = useState<FloorApiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetchApi<DashboardStats>('/api/dashboard/stats'),
      fetchApi<IpApiItem[]>('/api/dashboard/recent'),
      fetchApi<FloorApiItem[]>('/api/per-lantai'),
    ]).then(([s, r, f]) => {
      setStats(s)
      setRecentIps(r)
      setFloorData(f)
    }).catch(() => setError('Gagal memuat data dashboard. Periksa koneksi database.'))
      .finally(() => setLoading(false))
  }, [])

  const barData = floorData.map((f) => ({
    floor: f.nama,
    total: f.departemens.reduce((sum, d) => sum + d.ipAddresses.length, 0),
  }))

  const deviceCount = new Map<string, number>()
  floorData.forEach((f) =>
    f.departemens.forEach((d) =>
      d.ipAddresses.forEach((ip) =>
        deviceCount.set(ip.tipe, (deviceCount.get(ip.tipe) ?? 0) + 1)
      )
    )
  )
  const pieData = Array.from(deviceCount.entries()).map(([name, value]) => ({
    name,
    value,
  }))

  const statCards = stats
    ? [
        { label: 'Total IP Tercatat', value: stats.totalIp, icon: Network, color: '#6366f1' },
        { label: 'IP Aktif', value: stats.aktif, icon: CircleCheck, color: '#16a34a' },
        { label: 'IP Nonaktif', value: stats.nonaktif, icon: CircleX, color: '#dc2626' },
        { label: 'Total Departemen', value: stats.totalDepartemen, icon: Building2, color: '#2563eb' },
      ]
    : []

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview jaringan IP Address rumah sakit</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview jaringan IP Address rumah sakit</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} size="sm" className="border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="size-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                  <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-blue-600" />
          <span className="ml-3 text-sm text-muted-foreground">Memuat data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview jaringan IP Address rumah sakit</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard data={barData} />
        <PieChartCard data={pieData} />
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>10 IP terakhir diperbarui</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 dark:bg-zinc-800/40">
                <TableHead>IP Address</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Belum ada data IP Address
                  </TableCell>
                </TableRow>
              ) : recentIps.map((ip) => (
                <TableRow key={ip.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                  <TableCell className="font-mono text-xs">{ip.ipAddress}</TableCell>
                  <TableCell className="font-medium">{ip.hostname}</TableCell>
                  <TableCell>{ip.departemen.nama}</TableCell>
                  <TableCell><StatusBadge status={ip.status} /></TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(ip.updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {recentIps.length > 0 && (
          <div className="border-t px-4 py-3 text-right">
            <Link href="/ip-address" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Lihat semua IP
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
