'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Database, Info, Network, Layers, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fetchApi } from '@/lib/api'
import type { DashboardStats } from '@/lib/api'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { successToast } from '@/lib/use-toast'

interface ResetTarget {
  label: string
  endpoint: string
  description: string
}

const RESET_TARGETS: ResetTarget[] = [
  {
    label: 'Hapus Semua IP Address',
    endpoint: '/api/ip-address',
    description: 'Menghapus seluruh data IP Address beserta riwayatnya.',
  },
  {
    label: 'Hapus Semua Departemen',
    endpoint: '/api/departemen',
    description: 'Menghapus seluruh departemen. Hanya bisa jika tidak ada IP terkait.',
  },
  {
    label: 'Hapus Semua Lantai',
    endpoint: '/api/lantai',
    description: 'Menghapus seluruh lantai. Hanya bisa jika tidak ada departemen/IP terkait.',
  },
]

export default function PengaturanPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null)
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)

  const fetchStats = useCallback(() => {
    fetchApi<DashboardStats>('/api/dashboard/stats').then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleReset = async () => {
    if (!resetTarget) return
    setResetting(true)
    try {
      await fetchApi(resetTarget.endpoint, { method: 'DELETE' })
      setResetTarget(null)
      setResetError('')
      successToast(`${resetTarget.label} berhasil dilakukan`)
      fetchStats()
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Gagal menghapus. Coba lagi.')
    } finally {
      setResetting(false)
    }
  }

  const summary = [
    { label: 'Total IP Address', value: stats?.totalIp ?? 0, icon: Network },
    { label: 'IP Aktif', value: stats?.aktif ?? 0, icon: Network },
    { label: 'Departemen', value: stats?.totalDepartemen ?? 0, icon: Building2 },
  ]

  const appInfo = [
    { label: 'Nama Aplikasi', value: 'IP Manager RS' },
    { label: 'Versi', value: '0.1.0' },
    { label: 'Framework', value: 'Next.js 16.2.7' },
    { label: 'Database', value: 'PostgreSQL (Prisma)' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Informasi aplikasi dan manajemen data sistem
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-4 text-blue-600" />
              Informasi Aplikasi
            </CardTitle>
            <CardDescription>Detail versi dan teknologi sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appInfo.map((item, i) => (
              <div key={item.label}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-blue-600" />
              Ringkasan Data
            </CardTitle>
            <CardDescription>Jumlah data terdaftar saat ini</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {summary.map((s) => (
              <div key={s.label} className="rounded-lg border dark:border-zinc-800 bg-muted/30 dark:bg-zinc-800/30 p-3 text-center">
                <s.icon className="mx-auto mb-1 size-4 text-muted-foreground" />
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="ring-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" />
            Zona Berbahaya
          </CardTitle>
          <CardDescription>
            Tindakan berikut akan menghapus data secara permanen dan tidak dapat dibatalkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {RESET_TARGETS.map((target) => (
            <div
              key={target.endpoint}
              className="flex items-center justify-between gap-4 rounded-lg border border-destructive/20 dark:border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-3"
            >
              <div className="flex items-start gap-3">
                <Layers className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium">{target.label}</p>
                  <p className="text-xs text-muted-foreground">{target.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => { setResetError(''); setResetTarget(target) }}
              >
                Hapus
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={!!resetTarget}
        onOpenChange={(o) => { if (!o) { setResetTarget(null); setResetError('') } }}
        title={resetTarget?.label ?? ''}
        description={`${resetTarget?.description} Tindakan ini tidak dapat dibatalkan.`}
        error={resetError}
        loading={resetting}
        onConfirm={handleReset}
      />
    </div>
  )
}
