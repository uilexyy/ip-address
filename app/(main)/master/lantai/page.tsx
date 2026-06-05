'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { fetchApi } from '@/lib/api'
import type { LantaiMasterItem } from '@/lib/api'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { successToast } from '@/lib/use-toast'

export default function MasterLantaiPage() {
  const [data, setData] = useState<LantaiMasterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<LantaiMasterItem | null>(null)
  const [nama, setNama] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<LantaiMasterItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchApi<LantaiMasterItem[]>('/api/lantai')
      setData(res)
    } catch {
      setData([])
      setError('Gagal memuat data lantai.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(fetchData)
  }, [fetchData])

  const filtered = search
    ? data.filter((l) => l.nama.toLowerCase().includes(search.toLowerCase()))
    : data

  const handleAdd = () => {
    setEditData(null)
    setNama('')
    setFormError('')
    setFormOpen(true)
  }

  const handleEdit = (lantai: LantaiMasterItem) => {
    setEditData(lantai)
    setNama(lantai.nama)
    setFormError('')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const trimmed = nama.trim()
    if (!trimmed) {
      setFormError('Nama lantai wajib diisi')
      return
    }
    setSaving(true)
    try {
      if (editData) {
        await fetchApi(`/api/lantai/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: trimmed }),
        })
      } else {
        await fetchApi('/api/lantai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: trimmed }),
        })
      }
      setFormOpen(false)
      successToast(editData ? `Lantai ${trimmed} berhasil diperbarui` : `Lantai ${trimmed} berhasil ditambahkan`)
      fetchData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetchApi(`/api/lantai/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      setDeleteError('')
      successToast(`Lantai ${deleteTarget.nama} berhasil dihapus`)
      fetchData()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus. Coba lagi.')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await fetchApi('/api/lantai', { method: 'DELETE' })
      setDeleteAllOpen(false)
      setDeleteError('')
      successToast('Semua lantai berhasil dihapus')
      fetchData()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus semua. Coba lagi.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Master Lantai</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar lantai gedung rumah sakit
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => { setDeleteError(''); setDeleteAllOpen(true) }}
            disabled={data.length === 0}
          >
            <Trash2 className="size-4" />
            Hapus Semua
          </Button>
          <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
            <Plus className="size-4" />
            Tambah Lantai
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari lantai..."
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 shadow-xs transition-colors">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-zinc-800/40">
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Lantai</TableHead>
              <TableHead className="text-center">Departemen</TableHead>
              <TableHead className="text-center">IP Address</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
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
            ) : filtered.map((lantai, idx) => (
              <TableRow key={lantai.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                <TableCell className="font-medium">{lantai.nama}</TableCell>
                <TableCell className="text-center">{lantai._count.departemens}</TableCell>
                <TableCell className="text-center">{lantai._count.ipAddresses}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(lantai)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setDeleteError(''); setDeleteTarget(lantai) }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form tambah / edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Lantai' : 'Tambah Lantai'}</DialogTitle>
            <DialogDescription>
              {editData ? 'Ubah nama lantai yang sudah ada' : 'Isi nama lantai baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>
              Nama Lantai <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Contoh: Lantai 1"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              autoFocus
            />
            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t dark:border-zinc-800 pt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={saving}>
              {editData ? 'Simpan Perubahan' : 'Tambah Lantai'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => { setDeleteTarget(null); setDeleteError('') }}
        title="Hapus Lantai"
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.nama}? Tindakan ini tidak dapat dibatalkan.`}
        error={deleteError}
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={deleteAllOpen}
        onOpenChange={(o) => { setDeleteAllOpen(o); if (!o) setDeleteError('') }}
        title="Hapus Semua Lantai"
        description={`Apakah Anda yakin ingin menghapus seluruh ${data.length} lantai? Tindakan ini tidak dapat dibatalkan.`}
        error={deleteError}
        onConfirm={handleDeleteAll}
        confirmText="Hapus Semua"
      />
    </div>
  )
}
