'use client'

import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, AlertTriangle, Plus, Search } from 'lucide-react'
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
import { fetchApi } from '@/lib/api'
import type { DepartemenMasterItem, LantaiItem } from '@/lib/api'

export default function MasterDepartemenPage() {
  const [data, setData] = useState<DepartemenMasterItem[]>([])
  const [floors, setFloors] = useState<LantaiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<DepartemenMasterItem | null>(null)
  const [nama, setNama] = useState('')
  const [lantaiId, setLantaiId] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<DepartemenMasterItem | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchApi<DepartemenMasterItem[]>('/api/departemen')
      setData(res)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(fetchData)
    fetchApi<LantaiItem[]>('/api/lantai').then(setFloors).catch(() => {})
  }, [fetchData])

  const filtered = data.filter((d) => {
    const matchSearch = search ? d.nama.toLowerCase().includes(search.toLowerCase()) : true
    const matchFloor = floorFilter !== 'all' ? d.lantaiId === floorFilter : true
    return matchSearch && matchFloor
  })

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
      await fetchApi(`/api/departemen/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      setDeleteError('')
      fetchData()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus. Coba lagi.')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await fetchApi('/api/departemen', { method: 'DELETE' })
      setDeleteAllOpen(false)
      setDeleteError('')
      fetchData()
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
            disabled={data.length === 0}
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={floorFilter} onValueChange={(v) => setFloorFilter(v ?? 'all')}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filtered.map((dept, idx) => (
              <TableRow key={dept.id} className="even:bg-muted/20 dark:even:bg-zinc-800/20">
                <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
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

      {/* Hapus satu */}
      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setDeleteError('') }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Hapus Departemen
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.nama}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError('') }}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hapus semua */}
      <Dialog open={deleteAllOpen} onOpenChange={(o) => { setDeleteAllOpen(o); if (!o) setDeleteError('') }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Hapus Semua Departemen
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold text-foreground">seluruh {data.length} departemen</span>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setDeleteAllOpen(false); setDeleteError('') }}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteAll}>
              Hapus Semua
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
