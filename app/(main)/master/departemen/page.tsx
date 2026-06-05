'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Search, AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePagination } from '@/components/data-table-pagination'
import { fetchApi } from '@/lib/api'
import type { DepartemenMasterItem } from '@/lib/api'
import { useDepartemenMaster, useLantaiList } from '@/lib/hooks'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { successToast } from '@/lib/use-toast'

const PER_PAGE = 10

export default function MasterDepartemenPage() {
  const { data, error, isLoading, mutate } = useDepartemenMaster()
  const { data: floors = [] } = useLantaiList()
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<DepartemenMasterItem | null>(null)
  const [nama, setNama] = useState('')
  const [lantaiId, setLantaiId] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<DepartemenMasterItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const allData = (data ?? []).filter((d) => {
    const matchSearch = search ? d.nama.toLowerCase().includes(search.toLowerCase()) : true
    const matchFloor = floorFilter !== 'all' ? d.lantaiId === floorFilter : true
    return matchSearch && matchFloor
  })
  const totalPages = Math.max(1, Math.ceil(allData.length / PER_PAGE))
  const paged = allData.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleAdd = () => {
    setEditData(null)
    setNama('')
    setLantaiId('')
    setFormError('')
    setFormOpen(true)
  }

  const handleEdit = (dept: DepartemenMasterItem) => {
    setEditData(dept)
    setNama(dept.nama)
    setLantaiId(dept.lantaiId)
    setFormError('')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const trimmed = nama.trim()
    if (!trimmed) {
      setFormError('Nama departemen wajib diisi')
      return
    }
    if (!lantaiId) {
      setFormError('Lantai wajib dipilih')
      return
    }
    setSaving(true)
    try {
      const payload = JSON.stringify({ nama: trimmed, lantaiId })
      if (editData) {
        await fetchApi(`/api/departemen/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        })
      } else {
        await fetchApi('/api/departemen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        })
      }
      setFormOpen(false)
      successToast(editData ? `Departemen ${trimmed} berhasil diperbarui` : `Departemen ${trimmed} berhasil ditambahkan`)
      mutate()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetchApi(`/api/departemen/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      setDeleteError('')
      successToast(`Departemen ${deleteTarget.nama} berhasil dihapus`)
      mutate()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus. Coba lagi.')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await fetchApi('/api/departemen', { method: 'DELETE' })
      setDeleteAllOpen(false)
      setDeleteError('')
      successToast('Semua departemen berhasil dihapus')
      mutate()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus semua. Coba lagi.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Master Departemen</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar departemen dan penempatannya per lantai
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => { setDeleteError(''); setDeleteAllOpen(true) }}
            disabled={allData.length === 0}
          >
            <Trash2 className="size-4" />
            Hapus Semua
          </Button>
          <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
            <Plus className="size-4" />
            Tambah Departemen
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari departemen..."
            className="h-9 pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={floorFilter} onValueChange={(v) => { setFloorFilter(v ?? 'all'); setPage(1) }}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Lantai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lantai</SelectItem>
            {floors.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-zinc-800/40">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Departemen</TableHead>
              <TableHead>Lantai</TableHead>
              <TableHead className="text-center">IP Address</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle className="size-5 animate-spin" />
                    Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <AlertCircle className="size-8 text-destructive" />
                    <span className="text-destructive font-medium">Gagal memuat data departemen.</span>
                    <button
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={() => mutate()}
                    >
                      Coba lagi
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : paged.map((dept, idx) => (
              <TableRow key={dept.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                <TableCell className="text-center text-muted-foreground">{(page - 1) * PER_PAGE + idx + 1}</TableCell>
                <TableCell className="font-medium">{dept.nama}</TableCell>
                <TableCell>{dept.lantai.nama}</TableCell>
                <TableCell className="text-center">{dept._count.ipAddresses}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(dept)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setDeleteError(''); setDeleteTarget(dept) }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !error && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {allData.length > PER_PAGE && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          total={allData.length}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      )}

      {/* Form tambah / edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah data departemen yang sudah ada' : 'Isi data departemen baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>
                Nama Departemen <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Contoh: Radiologi"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>
                Lantai <span className="text-destructive">*</span>
              </Label>
              <Select value={lantaiId} onValueChange={(v) => setLantaiId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lantai" className="sr-only" />
                  <span className="flex flex-1 text-left">
                    {floors.find((f) => f.id === lantaiId)?.nama || 'Pilih lantai'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t dark:border-zinc-800 pt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={saving}>
              {editData ? 'Simpan Perubahan' : 'Tambah Departemen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => { setDeleteTarget(null); setDeleteError('') }}
        title="Hapus Departemen"
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Tindakan ini tidak dapat dibatalkan.`}
        error={deleteError}
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={deleteAllOpen}
        onOpenChange={(o) => { setDeleteAllOpen(o); if (!o) setDeleteError('') }}
        title="Hapus Semua Departemen"
        description={`Apakah Anda yakin ingin menghapus seluruh ${allData.length} departemen? Tindakan ini tidak dapat dibatalkan.`}
        error={deleteError}
        onConfirm={handleDeleteAll}
        confirmText="Hapus Semua"
      />
    </div>
  )
}
