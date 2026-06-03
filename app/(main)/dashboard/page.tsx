'use client'

import { useState, useEffect } from 'react'
import { Network, CircleCheck, CircleX, Building2 } from 'lucide-react'
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

  useEffect(() => {
    Promise.all([
      fetchApi<DashboardStats>('/api/dashboard/stats'),
      fetchApi<IpApiItem[]>('/api/dashboard/recent'),
      fetchApi<FloorApiItem[]>('/api/per-lantai'),
    ]).then(([s, r, f]) => {
      setStats(s)
      setRecentIps(r)
      setFloorData(f)
    }).finally(() => setLoading(false))
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview jaringan IP Address rumah sakit</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              <TableRow className="bg-muted/40">
                <TableHead>IP Address</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diperbarui</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIps.map((ip) => (
                <TableRow key={ip.id} className="even:bg-muted/20">
                  <TableCell className="font-mono text-xs">{ip.ipAddress}</TableCell>
                  <TableCell className="font-medium">{ip.hostname}</TableCell>
                  <TableCell>{ip.departemen.nama}</TableCell>
                  <TableCell><StatusBadge status={ip.status} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(ip.updatedAt).toLocaleDateString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
