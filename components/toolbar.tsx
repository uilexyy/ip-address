'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchApi } from '@/lib/api'
import type { LantaiItem, DepartemenItem } from '@/lib/api'

interface ToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  floorFilter: string
  onFloorChange: (v: string | null) => void
  deptFilter: string
  onDeptChange: (v: string | null) => void
  statusFilter: string
  onStatusChange: (v: string | null) => void
  onAdd: () => void
  onDeleteAll: () => void
}

export function Toolbar({
  search,
  onSearchChange,
  floorFilter,
  onFloorChange,
  deptFilter,
  onDeptChange,
  statusFilter,
  onStatusChange,
  onAdd,
  onDeleteAll,
}: ToolbarProps) {
  const [floors, setFloors] = useState<LantaiItem[]>([])
  const [departments, setDepartments] = useState<DepartemenItem[]>([])

  useEffect(() => {
    fetchApi<LantaiItem[]>('/api/lantai').then(setFloors).catch(() => {})
    fetchApi<DepartemenItem[]>('/api/departemen').then(setDepartments).catch(() => {})
  }, [])

  const filteredDepts = floorFilter && floorFilter !== 'all'
    ? departments.filter((d) => d.lantaiId === floorFilter)
    : departments

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[260px] flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari IP, hostname, PIC..."
          className="h-9 pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={floorFilter} onValueChange={onFloorChange}>
        <SelectTrigger className="h-9 w-28">
          <SelectValue placeholder="Lantai" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Lantai</SelectItem>
          {floors.map((f) => (
            <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={deptFilter} onValueChange={onDeptChange}>
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder="Departemen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Dept</SelectItem>
          {filteredDepts.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.nama}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="AKTIF">AKTIF</SelectItem>
          <SelectItem value="NONAKTIF">NONAKTIF</SelectItem>
          <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => alert('Fitur Export Excel akan segera tersedia')}>
        <Download className="size-4" />
        Export Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDeleteAll}
      >
        <Trash2 className="size-4" />
        Hapus Semua
      </Button>

      <Button size="sm" className="h-9 gap-2 bg-blue-600 hover:bg-blue-700" onClick={onAdd}>
        <Plus className="size-4" />
        Tambah IP
      </Button>
    </div>
  )
}
