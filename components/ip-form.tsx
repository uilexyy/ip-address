'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { deviceTypes, isValidIp, isIpDuplicate } from '@/lib/constants'
import { fetchApi } from '@/lib/api'
import type { LantaiItem, DepartemenItem, IpApiItem } from '@/lib/api'
import type { IpStatus } from '@/lib/constants'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IpFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editData?: IpApiItem | null
  onSaved?: () => void
}

const emptyForm = {
  ipAddress: '',
  hostname: '',
  macAddress: '',
  lantai: '',
  departemen: '',
  subDepartemen: '',
  tipe: '',
  pic: '',
  status: 'AKTIF' as IpStatus,
  keterangan: '',
}

export function IpForm({ open, onOpenChange, editData, onSaved }: IpFormProps) {
  const [floors, setFloors] = useState<LantaiItem[]>([])
  const [departments, setDepartments] = useState<DepartemenItem[]>([])

  useEffect(() => {
    fetchApi<LantaiItem[]>('/api/lantai').then(setFloors).catch(() => {})
    fetchApi<DepartemenItem[]>('/api/departemen').then(setDepartments).catch(() => {})
  }, [])

  const [form, setForm] = useState(emptyForm)
  const [ipError, setIpError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    Promise.resolve().then(() => {
      setForm(editData ? {
        ipAddress: editData.ipAddress,
        hostname: editData.hostname,
        macAddress: editData.macAddress ?? '',
        lantai: editData.lantaiId,
        departemen: editData.departemenId,
        subDepartemen: editData.subDepartemen ?? '',
        tipe: editData.tipe,
        pic: editData.pic,
        status: editData.status,
        keterangan: editData.keterangan ?? '',
      } : emptyForm)
      setErrors({})
      setIpError(null)
    })
  }, [open, editData])

  const validate = async () => {
    const newErrors: Record<string, string> = {}
    if (!form.ipAddress) newErrors.ipAddress = 'IP Address wajib diisi'
    else if (!isValidIp(form.ipAddress)) newErrors.ipAddress = 'Format IP tidak valid'
    else if (!editData) {
      const duplicate = await isIpDuplicate(form.ipAddress)
      if (duplicate) newErrors.ipAddress = 'IP sudah terdaftar'
    }
    if (!form.hostname) newErrors.hostname = 'Hostname wajib diisi'
    if (!form.lantai) newErrors.lantai = 'Lantai wajib dipilih'
    if (!form.departemen) newErrors.departemen = 'Departemen wajib dipilih'
    if (!form.tipe) newErrors.tipe = 'Jenis perangkat wajib dipilih'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleIpChange = async (value: string) => {
    setForm({ ...form, ipAddress: value })
    if (value && !isValidIp(value)) {
      setIpError('Format: xxx.xxx.xxx.xxx')
    } else if (value && !editData) {
      const duplicate = await isIpDuplicate(value)
      setIpError(duplicate ? 'IP sudah terdaftar' : null)
    } else {
      setIpError(null)
    }
  }

  const filteredDepts = form.lantai
    ? departments.filter((d) => d.lantaiId === form.lantai)
    : departments

  const handleSubmit = async () => {
    if (!(await validate())) return
    setSaving(true)
    const payload = {
      ipAddress: form.ipAddress,
      hostname: form.hostname,
      macAddress: form.macAddress,
      lantaiId: form.lantai,
      departemenId: form.departemen,
      subDepartemen: form.subDepartemen,
      tipe: form.tipe,
      pic: form.pic,
      status: form.status,
      keterangan: form.keterangan,
    }
    try {
      if (editData) {
        await fetchApi(`/api/ip-address/${editData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetchApi('/api/ip-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      onSaved?.()
      onOpenChange(false)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Gagal menyimpan. Coba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  const update = (key: string, value: string | null) =>
    setForm((prev) => ({ ...prev, [key]: value ?? '' }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit IP Address' : 'Tambah IP Address'}</DialogTitle>
          <DialogDescription>
            {editData ? 'Ubah data IP Address yang sudah ada' : 'Isi form untuk menambahkan IP Address baru'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={cn(errors.ipAddress && 'text-destructive')}>
                IP Address <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="192.168.1.1"
                value={form.ipAddress}
                onChange={(e) => handleIpChange(e.target.value)}
                className={cn(
                  errors.ipAddress && 'border-destructive ring-destructive/20',
                  ipError && !errors.ipAddress && 'border-amber-400'
                )}
              />
              {errors.ipAddress && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" /> {errors.ipAddress}
                </p>
              )}
              {ipError && !errors.ipAddress && (
                <p className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="size-3" /> {ipError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.hostname && 'text-destructive')}>
                Hostname <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="server-001"
                value={form.hostname}
                onChange={(e) => update('hostname', e.target.value)}
                className={cn(errors.hostname && 'border-destructive ring-destructive/20')}
              />
              {errors.hostname && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" /> {errors.hostname}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>MAC Address</Label>
              <Input
                placeholder="00:1A:2B:3C:4D:5E"
                value={form.macAddress}
                onChange={(e) => update('macAddress', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.tipe && 'text-destructive')}>
                Jenis Perangkat <span className="text-destructive">*</span>
              </Label>
              <Select value={form.tipe} onValueChange={(v) => update('tipe', v)}>
                <SelectTrigger className={cn(errors.tipe && 'border-destructive ring-destructive/20')}>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipe && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" /> {errors.tipe}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={cn(errors.lantai && 'text-destructive')}>
                Lantai <span className="text-destructive">*</span>
              </Label>
              <Select value={form.lantai} onValueChange={(v) => setForm((prev) => ({ ...prev, lantai: v ?? '', departemen: '' }))}>
                <SelectTrigger className={cn(errors.lantai && 'border-destructive ring-destructive/20')}>
                  <SelectValue placeholder="Pilih lantai" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lantai && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" /> {errors.lantai}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className={cn(errors.departemen && 'text-destructive')}>
                Departemen <span className="text-destructive">*</span>
              </Label>
              <Select value={form.departemen} onValueChange={(v) => update('departemen', v)}>
                <SelectTrigger className={cn(errors.departemen && 'border-destructive ring-destructive/20')}>
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDepts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departemen && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" /> {errors.departemen}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sub-departemen</Label>
              <Input
                placeholder="Opsional"
                value={form.subDepartemen}
                onChange={(e) => update('subDepartemen', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama PIC</Label>
              <Input
                placeholder="Nama penanggung jawab"
                value={form.pic}
                onChange={(e) => update('pic', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={cn(errors.status && 'text-destructive')}>
              Status <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={form.status}
              onValueChange={(v) => update('status', v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="AKTIF" id="s-aktif" />
                <Label htmlFor="s-aktif" className="font-normal">Aktif</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="NONAKTIF" id="s-nonaktif" />
                <Label htmlFor="s-nonaktif" className="font-normal">Nonaktif</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MAINTENANCE" id="s-maintenance" />
                <Label htmlFor="s-maintenance" className="font-normal">Maintenance</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              placeholder="Catatan tambahan (opsional)"
              value={form.keterangan}
              onChange={(e) => update('keterangan', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {errors.submit && (
          <p className="flex items-center gap-1 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="size-3.5" /> {errors.submit}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Tambah IP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
