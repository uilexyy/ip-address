'use client'

import { useState, useEffect } from 'react'
import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { fetchApi } from '@/lib/api'
import type { FloorApiItem, IpApiItem } from '@/lib/api'

const DEPT_COLORS: Record<string, string> = {
  IGD: 'bg-red-100 text-red-800 border-red-200',
  Radiologi: 'bg-purple-100 text-purple-800 border-purple-200',
  Farmasi: 'bg-green-100 text-green-800 border-green-200',
  'Rekam Medis': 'bg-blue-100 text-blue-800 border-blue-200',
  'Rawat Inap A': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ICU: 'bg-orange-100 text-orange-800 border-orange-200',
  Laboratorium: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Gizi: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Kamar Operasi': 'bg-pink-100 text-pink-800 border-pink-200',
  'Rawat Inap B': 'bg-teal-100 text-teal-800 border-teal-200',
  NICU: 'bg-rose-100 text-rose-800 border-rose-200',
  CSSD: 'bg-slate-100 text-slate-800 border-slate-200',
  Administrasi: 'bg-violet-100 text-violet-800 border-violet-200',
  Keuangan: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  HRD: 'bg-sky-100 text-sky-800 border-sky-200',
  Laundry: 'bg-stone-100 text-stone-800 border-stone-200',
}

export default function PerLantaiPage() {
  const [floors, setFloors] = useState<FloorApiItem[]>([])
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    fetchApi<FloorApiItem[]>('/api/per-lantai')
      .then((data) => {
        setFloors(data)
        if (data.length > 0 && !activeTab) setActiveTab(data[0].nama)
      })
      .catch(() => {})
  }, [activeTab])

  const handlePrint = () => {
    window.print()
  }

  if (floors.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Per Lantai</h1>
          <p className="text-sm text-muted-foreground">
            Memuat data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Per Lantai</h1>
          <p className="text-sm text-muted-foreground">
            Lihat distribusi perangkat berdasarkan lantai dan departemen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="size-4" />
            Print Lantai Ini
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export Lantai Ini
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {floors.map((f) => (
            <TabsTrigger key={f.id} value={f.nama}>
              {f.nama}
            </TabsTrigger>
          ))}
        </TabsList>

        {floors.map((floor) => {
          const totalDevices = floor.departemens.reduce(
            (sum, d) => sum + d.ipAddresses.length, 0
          )

          return (
            <TabsContent key={floor.id} value={floor.nama} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Total {totalDevices} perangkat di {floor.nama}
              </p>

              <Accordion multiple className="space-y-3">
                {floor.departemens.map((dept) => {
                  const colorClass = DEPT_COLORS[dept.nama] ?? 'bg-gray-100 text-gray-800 border-gray-200'

                  return (
                    <AccordionItem
                      key={dept.id}
                      value={dept.id}
                      className="rounded-xl border bg-white overflow-hidden shadow-xs"
                    >
                      <AccordionTrigger className={`px-4 py-3 text-sm font-semibold ${colorClass}`}>
                        <span className="flex items-center gap-2">
                          {dept.nama}
                          <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-normal text-foreground">
                            {dept.ipAddresses.length}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="w-12 text-center">No</TableHead>
                              <TableHead>Hostname</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Tipe</TableHead>
                              <TableHead>PIC</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dept.ipAddresses.map((ip: IpApiItem, idx: number) => (
                              <TableRow key={ip.id} className="even:bg-muted/20">
                                <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                                <TableCell className="font-medium">{ip.hostname}</TableCell>
                                <TableCell className="font-mono text-xs">{ip.ipAddress}</TableCell>
                                <TableCell>{ip.tipe}</TableCell>
                                <TableCell>{ip.pic}</TableCell>
                                <TableCell><StatusBadge status={ip.status} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
