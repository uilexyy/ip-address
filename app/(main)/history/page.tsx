'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, AlertCircle, LoaderCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchApi } from '@/lib/api'
import type { HistoryListResponse } from '@/lib/api'

const PER_PAGE = 20

const AKSI_STYLE: Record<string, string> = {
  CREATED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40',
  UPDATED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
  DELETED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',
}

const AKSI_LABEL: Record<string, string> = {
  CREATED: 'Ditambahkan',
  UPDATED: 'Diperbarui',
  DELETED: 'Dihapus',
}

function AksiBadge({ aksi }: { aksi: string }) {
  const style = AKSI_STYLE[aksi] ?? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800/40'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {AKSI_LABEL[aksi] ?? aksi}
    </span>
  )
}

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [aksiFilter, setAksiFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<HistoryListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (aksiFilter !== 'all') params.set('aksi', aksiFilter)
    params.set('page', String(page))
    params.set('limit', String(PER_PAGE))

    try {
      const res = await fetchApi<HistoryListResponse>(`/api/history?${params}`)
      setData(res)
    } catch {
      setData(null)
      setError('Gagal memuat riwayat aktivitas.')
    } finally {
      setLoading(false)
    }
  }, [search, aksiFilter, page])

  useEffect(() => {
    Promise.resolve().then(fetchData)
  }, [fetchData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat aktivitas perubahan data IP Address
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari IP, hostname, detail..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={aksiFilter} onValueChange={(v) => { setAksiFilter(v ?? 'all'); setPage(1) }}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="CREATED">Ditambahkan</SelectItem>
            <SelectItem value="UPDATED">Diperbarui</SelectItem>
            <SelectItem value="DELETED">Dihapus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-zinc-800/40">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="size-5 animate-spin" />
                    Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="size-8 text-destructive" />
                    <span className="text-destructive font-medium">{error}</span>
                    <button
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={() => fetchData()}
                    >
                      Coba lagi
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.map((h, idx) => (
              <TableRow key={h.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                <TableCell className="text-center text-muted-foreground">
                  {(page - 1) * PER_PAGE + idx + 1}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {new Date(h.createdAt).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </TableCell>
                <TableCell><AksiBadge aksi={h.aksi} /></TableCell>
                <TableCell className="font-mono text-xs">{h.ipAddress.ipAddress}</TableCell>
                <TableCell className="font-medium">{h.ipAddress.hostname}</TableCell>
                <TableCell className="text-muted-foreground">{h.detail ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!loading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Belum ada riwayat aktivitas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 px-4 py-3 text-sm shadow-xs transition-colors">
        <p className="text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">
            {data && data.total > 0 ? (page - 1) * PER_PAGE + 1 : 0}-{data ? Math.min(page * PER_PAGE, data.total) : 0}
          </span> dari{' '}
          <span className="font-medium text-foreground">{data?.total ?? 0}</span> aktivitas
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="px-2 text-muted-foreground">
            Halaman {page} / {data?.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data ? page >= data.totalPages : true}
            onClick={() => setPage(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
