'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Pencil, Trash2, LoaderCircle, AlertCircle, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { Toolbar } from '@/components/toolbar'
import { IpForm } from '@/components/ip-form'
import { fetchApi } from '@/lib/api'
import type { IpListResponse, IpApiItem } from '@/lib/api'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { successToast } from '@/lib/use-toast'

const PER_PAGE = 20

export default function IpAddressPage() {
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<IpApiItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IpApiItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [data, setData] = useState<IpListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (floorFilter !== 'all') params.set('lantai', floorFilter)
    if (deptFilter !== 'all') params.set('departemen', deptFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('page', String(page))
    params.set('limit', String(PER_PAGE))

    try {
      const res = await fetchApi<IpListResponse>(`/api/ip-address?${params}`)
      setData(res)
      setError('')
    } catch {
      setData(null)
      setError('Gagal memuat data. Periksa koneksi server.')
    } finally {
      setLoading(false)
    }
  }, [search, floorFilter, deptFilter, statusFilter, page])

  useEffect(() => {
    Promise.resolve().then(fetchData)
  }, [fetchData])

  const totalPages = data?.totalPages ?? 1
  const pageButtons = useMemo(() => {
    const pages: number[] = []
    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
    const endPage = Math.min(totalPages, startPage + 4)
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    if (startPage > 1) pages.unshift(-1)
    if (endPage < totalPages) pages.push(-1)
    return pages
  }, [page, totalPages])

  const handleEdit = (ip: IpApiItem) => {
    setEditData(ip)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetchApi(`/api/ip-address/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      setDeleteError('')
      successToast(`IP ${deleteTarget.ipAddress} berhasil dihapus`)
      fetchData()
    } catch {
      setDeleteError('Gagal menghapus IP. Coba lagi.')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await fetchApi('/api/ip-address', { method: 'DELETE' })
      setDeleteAllOpen(false)
      setPage(1)
      successToast('Semua IP Address berhasil dihapus')
      fetchData()
    } catch {
      setDeleteAllOpen(false)
    }
  }

  const handleAdd = () => {
    setEditData(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Address</h1>
        <p className="text-sm text-muted-foreground">
          Kelola seluruh IP Address terdaftar di jaringan rumah sakit
        </p>
      </div>

      <Toolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        floorFilter={floorFilter}
        onFloorChange={(v) => { setFloorFilter(v ?? ''); setPage(1) }}
        deptFilter={deptFilter}
        onDeptChange={(v) => { setDeptFilter(v ?? ''); setPage(1) }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v ?? ''); setPage(1) }}
        onAdd={handleAdd}
        onDeleteAll={() => setDeleteAllOpen(true)}
      />

      <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-zinc-800/40">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Lantai</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diperbarui</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-20 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <LoaderCircle className="size-6 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="size-8 text-destructive" />
                    <span className="text-destructive font-medium">{error}</span>
                    <button
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={() => Promise.resolve().then(fetchData)}
                    >
                      Coba lagi
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.map((ip, idx) => (
              <TableRow key={ip.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                <TableCell className="text-center text-muted-foreground">
                  {(page - 1) * PER_PAGE + idx + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">{ip.ipAddress}</TableCell>
                <TableCell className="font-medium">{ip.hostname}</TableCell>
                <TableCell>{ip.lantai.nama}</TableCell>
                <TableCell>{ip.departemen.nama}</TableCell>
                <TableCell>{ip.tipe}</TableCell>
                <TableCell>{ip.pic}</TableCell>
                <TableCell><StatusBadge status={ip.status} /></TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(ip.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(ip)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(ip)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && !error && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Network className="size-8 text-muted-foreground/50" />
                    <span>Tidak ada data ditemukan</span>
                    <span className="text-xs">Coba ubah filter atau tambah data baru</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && !loading && !error && (
        <div className="flex items-center justify-between rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 px-4 py-3 text-sm shadow-xs transition-colors">
          <p className="text-muted-foreground">
            Menampilkan{' '}
            <span className="font-medium text-foreground">
              {data.total === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, data.total)}
            </span>{' '}
            dari{' '}
            <span className="font-medium text-foreground">{data.total}</span> data
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
            <div className="flex items-center gap-1 px-2">
              {pageButtons.map((p, i) =>
                p === -1 ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? 'default' : 'ghost'}
                    size="xs"
                    className="min-w-7"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (data?.totalPages ?? 1)}
              onClick={() => setPage(page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => { setDeleteTarget(null); setDeleteError('') }}
        title="Hapus IP Address"
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.ipAddress} (${deleteTarget?.hostname})? Tindakan ini tidak dapat dibatalkan.`}
        error={deleteError}
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        title="Hapus Semua IP Address"
        description={`Apakah Anda yakin ingin menghapus seluruh ${data?.total ?? 0} data IP Address? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteAll}
        confirmText="Hapus Semua"
      />

      <IpForm open={formOpen} onOpenChange={setFormOpen} editData={editData} onSaved={fetchData} />
    </div>
  )
}
