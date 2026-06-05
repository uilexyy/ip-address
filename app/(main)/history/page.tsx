'use client'

import { useState } from 'react'
import { Search, AlertCircle, LoaderCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import { DataTablePagination } from '@/components/data-table-pagination'
import { useHistoryList } from '@/lib/hooks'

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

  const params: Record<string, string> = { page: String(page), limit: String(PER_PAGE) }
  if (search) params.search = search
  if (aksiFilter !== 'all') params.aksi = aksiFilter

  const { data, error, isLoading } = useHistoryList(params)

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
              <TableHead>User</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="size-5 animate-spin" />
                    Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="size-8 text-destructive" />
                    <span className="text-destructive font-medium">Gagal memuat riwayat aktivitas.</span>
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
                <TableCell className="text-muted-foreground">{h.user?.nama ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{h.detail ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !error && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Belum ada riwayat aktivitas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
