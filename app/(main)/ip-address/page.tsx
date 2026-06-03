'use client'

import { useState, useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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
import { ipAddresses } from '@/lib/constants'
import type { IpAddress } from '@/lib/constants'

const PER_PAGE = 20

export default function IpAddressPage() {
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<IpAddress | null>(null)

  const filtered = useMemo(() => {
    let data = ipAddresses
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (ip) =>
          ip.ipAddress.toLowerCase().includes(q) ||
          ip.hostname.toLowerCase().includes(q) ||
          ip.pic.toLowerCase().includes(q)
      )
    }
    if (floorFilter !== 'all') data = data.filter((ip) => ip.lantai === floorFilter)
    if (deptFilter !== 'all') data = data.filter((ip) => ip.departemen === deptFilter)
    if (statusFilter !== 'all') data = data.filter((ip) => ip.status === statusFilter)
    return data
  }, [search, floorFilter, deptFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const start = (page - 1) * PER_PAGE + 1
  const end = Math.min(page * PER_PAGE, filtered.length)

  const handleEdit = (ip: IpAddress) => {
    setEditData(ip)
    setFormOpen(true)
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
      />

      <div className="rounded-xl border bg-white shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
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
            {paginated.map((ip, idx) => (
              <TableRow key={ip.id} className="even:bg-muted/20">
                <TableCell className="text-center text-muted-foreground">
                  {(page - 1) * PER_PAGE + idx + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">{ip.ipAddress}</TableCell>
                <TableCell className="font-medium">{ip.hostname}</TableCell>
                <TableCell>{ip.lantai}</TableCell>
                <TableCell>{ip.departemen}</TableCell>
                <TableCell>{ip.tipe}</TableCell>
                <TableCell>{ip.pic}</TableCell>
                <TableCell><StatusBadge status={ip.status} /></TableCell>
                <TableCell className="text-muted-foreground">{ip.diperbarui}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(ip)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm shadow-xs">
        <p className="text-muted-foreground">
          Menampilkan <span className="font-medium text-foreground">{start}-{end}</span> dari{' '}
          <span className="font-medium text-foreground">{filtered.length}</span> data
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
            {(() => {
              const pages: number[] = []
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
              const endPage = Math.min(totalPages, startPage + 4)
              for (let i = startPage; i <= endPage; i++) pages.push(i)
              if (startPage > 1) pages.unshift(-1)
              if (endPage < totalPages) pages.push(-1)
              return pages.map((p, i) =>
                p === -1 ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    size="xs"
                    className="min-w-7"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )
            })()}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>

      <IpForm open={formOpen} onOpenChange={setFormOpen} editData={editData} />
    </div>
  )
}
