'use client'

import { useState } from 'react'
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
import { DataTablePagination } from '@/components/data-table-pagination'
import { fetchApi } from '@/lib/api'
import type { IpApiItem } from '@/lib/api'
import { useIpList } from '@/lib/hooks'
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

  const params: Record<string, string> = { page: String(page), limit: String(PER_PAGE) }
  if (search) params.search = search
  if (floorFilter !== 'all') params.lantai = floorFilter
  if (deptFilter !== 'all') params.departemen = deptFilter
  if (statusFilter !== 'all') params.status = statusFilter

  const { data, error, isLoading, mutate } = useIpList(params)

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
      mutate()
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
      mutate()
    } catch {
      setDeleteAllOpen(false)
    }
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
        onAdd={() => { setEditData(null); setFormOpen(true) }}
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
            {isLoading ? (
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
                    <span className="text-destructive font-medium">Gagal memuat data. Periksa koneksi server.</span>
                    <button
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={() => mutate()}
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
            {!isLoading && !error && data?.data.length === 0 && (
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

      {data && (
        <DataTablePagination
          page={page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
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

      <IpForm open={formOpen} onOpenChange={setFormOpen} editData={editData} onSaved={() => mutate()} />
    </div>
  )
}
