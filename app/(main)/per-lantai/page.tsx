'use client'

import { useState, useEffect, useRef } from 'react'
import { registerTooltipHider, unregisterTooltipHider } from '@/lib/scroll-tooltip'
import { exportPerLantai } from '@/lib/export'
import { successToast, errorToast } from '@/lib/use-toast'
import { Printer, Download, Monitor, Wifi, Server, Printer as PrinterIcon, Phone, Tablet, Camera, Shield, Radio, ScanLine, LoaderCircle, AlertCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { fetchApi } from '@/lib/api'
import type { FloorApiItem, IpApiItem } from '@/lib/api'

const STATUS_COLORS: Record<string, { dot: string; ring: string }> = {
  AKTIF: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  NONAKTIF: { dot: 'bg-red-500', ring: 'ring-red-500/20' },
  MAINTENANCE: { dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
}

const DEPT_THEMES: Record<string, { gradient: string; border: string; accent: string; darkGradient: string; darkBorder: string }> = {
  IGD: { gradient: 'from-red-50 to-red-100/50', border: 'border-red-200/60', accent: 'text-red-700', darkGradient: 'dark:from-red-950/30 dark:to-red-900/10', darkBorder: 'dark:border-red-800/30' },
  Radiologi: { gradient: 'from-purple-50 to-purple-100/50', border: 'border-purple-200/60', accent: 'text-purple-700', darkGradient: 'dark:from-purple-950/30 dark:to-purple-900/10', darkBorder: 'dark:border-purple-800/30' },
  Farmasi: { gradient: 'from-green-50 to-green-100/50', border: 'border-green-200/60', accent: 'text-green-700', darkGradient: 'dark:from-green-950/30 dark:to-green-900/10', darkBorder: 'dark:border-green-800/30' },
  'Rekam Medis': { gradient: 'from-blue-50 to-blue-100/50', border: 'border-blue-200/60', accent: 'text-blue-700', darkGradient: 'dark:from-blue-950/30 dark:to-blue-900/10', darkBorder: 'dark:border-blue-800/30' },
  'Rawat Inap A': { gradient: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-200/60', accent: 'text-indigo-700', darkGradient: 'dark:from-indigo-950/30 dark:to-indigo-900/10', darkBorder: 'dark:border-indigo-800/30' },
  ICU: { gradient: 'from-orange-50 to-orange-100/50', border: 'border-orange-200/60', accent: 'text-orange-700', darkGradient: 'dark:from-orange-950/30 dark:to-orange-900/10', darkBorder: 'dark:border-orange-800/30' },
  Laboratorium: { gradient: 'from-cyan-50 to-cyan-100/50', border: 'border-cyan-200/60', accent: 'text-cyan-700', darkGradient: 'dark:from-cyan-950/30 dark:to-cyan-900/10', darkBorder: 'dark:border-cyan-800/30' },
  Gizi: { gradient: 'from-yellow-50 to-yellow-100/50', border: 'border-yellow-200/60', accent: 'text-yellow-700', darkGradient: 'dark:from-yellow-950/30 dark:to-yellow-900/10', darkBorder: 'dark:border-yellow-800/30' },
  'Kamar Operasi': { gradient: 'from-pink-50 to-pink-100/50', border: 'border-pink-200/60', accent: 'text-pink-700', darkGradient: 'dark:from-pink-950/30 dark:to-pink-900/10', darkBorder: 'dark:border-pink-800/30' },
  'Rawat Inap B': { gradient: 'from-teal-50 to-teal-100/50', border: 'border-teal-200/60', accent: 'text-teal-700', darkGradient: 'dark:from-teal-950/30 dark:to-teal-900/10', darkBorder: 'dark:border-teal-800/30' },
  NICU: { gradient: 'from-rose-50 to-rose-100/50', border: 'border-rose-200/60', accent: 'text-rose-700', darkGradient: 'dark:from-rose-950/30 dark:to-rose-900/10', darkBorder: 'dark:border-rose-800/30' },
  CSSD: { gradient: 'from-slate-50 to-slate-100/50', border: 'border-slate-200/60', accent: 'text-slate-700', darkGradient: 'dark:from-slate-950/30 dark:to-slate-900/10', darkBorder: 'dark:border-slate-700/30' },
  Administrasi: { gradient: 'from-violet-50 to-violet-100/50', border: 'border-violet-200/60', accent: 'text-violet-700', darkGradient: 'dark:from-violet-950/30 dark:to-violet-900/10', darkBorder: 'dark:border-violet-800/30' },
  Keuangan: { gradient: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200/60', accent: 'text-emerald-700', darkGradient: 'dark:from-emerald-950/30 dark:to-emerald-900/10', darkBorder: 'dark:border-emerald-800/30' },
  HRD: { gradient: 'from-sky-50 to-sky-100/50', border: 'border-sky-200/60', accent: 'text-sky-700', darkGradient: 'dark:from-sky-950/30 dark:to-sky-900/10', darkBorder: 'dark:border-sky-800/30' },
  Laundry: { gradient: 'from-stone-50 to-stone-100/50', border: 'border-stone-200/60', accent: 'text-stone-700', darkGradient: 'dark:from-stone-800/20 dark:to-stone-900/10', darkBorder: 'dark:border-stone-700/30' },
}

const DEFAULT_THEME = { gradient: 'from-zinc-50 to-zinc-100/50', border: 'border-zinc-200/60', accent: 'text-zinc-700', darkGradient: 'dark:from-zinc-800/30 dark:to-zinc-900/10', darkBorder: 'dark:border-zinc-700/30' }

const DEVICE_ICONS: Record<string, React.ElementType> = {
  'Desktop PC': Monitor,
  'Laptop': Monitor,
  'Server': Server,
  'Printer': PrinterIcon,
  'Scanner': ScanLine,
  'UPS': Shield,
  'Access Point': Wifi,
  'CCTV': Camera,
  'IP Phone': Phone,
  'Tablet': Tablet,
}

function DeviceNode({ ip }: { ip: IpApiItem }) {
  const statusColor = STATUS_COLORS[ip.status] ?? STATUS_COLORS.AKTIF
  const DeviceIcon = DEVICE_ICONS[ip.tipe] ?? Radio
  const ref = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrow: 'up' | 'down' } | null>(null)

  const show = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const gap = 8
    const tooltipHeight = 180
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const centerX = rect.left + rect.width / 2

    if (spaceBelow >= tooltipHeight) {
      setTooltipPos({ top: rect.bottom + gap, left: centerX, arrow: 'down' })
    } else {
      setTooltipPos({ top: rect.top - gap, left: centerX, arrow: 'up' })
    }
  }

  const hide = () => setTooltipPos(null)

  useEffect(() => {
    if (!tooltipPos) return
    registerTooltipHider(hide)
    return () => unregisterTooltipHider(hide)
  }, [tooltipPos])

  const tooltipContent = (
    <div className="w-56 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-800 p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className={`size-2 rounded-full ${statusColor.dot}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{ip.status}</span>
      </div>
      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{ip.hostname}</p>
      <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">{ip.ipAddress}</p>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <DeviceIcon className="size-3" />
          {ip.tipe}
        </span>
        {ip.pic && <span className="truncate">PIC: {ip.pic}</span>}
      </div>
      {ip.macAddress && (
        <p className="mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">MAC: {ip.macAddress}</p>
      )}
    </div>
  )

  return (
    <div className="relative" ref={ref} onMouseEnter={show} onMouseLeave={hide}>
      <div
        className={`flex size-10 items-center justify-center rounded-lg border border-zinc-200/60 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/60 shadow-xs transition-all duration-200 hover:shadow-md hover:scale-110 hover:z-10 cursor-default ring-2 ${statusColor.ring}`}
      >
        <DeviceIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
        <div className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full ${statusColor.dot} ring-2 ring-white dark:ring-zinc-900`} />
      </div>

      {tooltipPos && (
        <div className="fixed z-50" style={{ top: tooltipPos.top, left: tooltipPos.left }}>
          <div className={`absolute left-1/2 -translate-x-1/2 ${tooltipPos.arrow === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            {tooltipContent}
            <div className={`mx-auto h-2 w-2 rotate-45 border-zinc-200/60 dark:border-zinc-700/50 bg-white dark:bg-zinc-800 ${tooltipPos.arrow === 'up' ? '-translate-y-[1px] border-b border-r' : 'translate-y-[1px] border-t border-l'}`} />
          </div>
        </div>
      )}
    </div>
  )
}

function DeptCard({ dept, theme }: { dept: FloorApiItem['departemens'][0]; theme: typeof DEFAULT_THEME }) {
  const aktif = dept.ipAddresses.filter(ip => ip.status === 'AKTIF').length
  const nonaktif = dept.ipAddresses.filter(ip => ip.status === 'NONAKTIF').length
  const maintenance = dept.ipAddresses.filter(ip => ip.status === 'MAINTENANCE').length
  const total = dept.ipAddresses.length

  return (
    <div
      className={`rounded-xl border ${theme.border} ${theme.darkBorder} bg-gradient-to-br ${theme.gradient} ${theme.darkGradient} p-4 transition-all duration-300 hover:shadow-md`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-bold ${theme.accent} dark:text-zinc-200`}>
          {dept.nama}
        </h3>
        <span className="rounded-full bg-white/80 dark:bg-zinc-800/60 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 shadow-xs">
          {total}
        </span>
      </div>

      {/* Status summary bar */}
      <div className="mb-3 flex items-center gap-3 text-[11px] font-medium">
        {aktif > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {aktif}
          </span>
        )}
        {nonaktif > 0 && (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <span className="size-1.5 rounded-full bg-red-500" />
            {nonaktif}
          </span>
        )}
        {maintenance > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-500" />
            {maintenance}
          </span>
        )}
      </div>

      {/* Capacity bar */}
      {total > 0 && (
        <div className="mb-3 h-1.5 w-full rounded-full bg-zinc-200/60 dark:bg-zinc-700/40 overflow-hidden">
          {aktif > 0 && (
            <div
              className="h-full rounded-full bg-emerald-500 float-left"
              style={{ width: `${(aktif / total) * 100}%` }}
            />
          )}
          {maintenance > 0 && (
            <div
              className="h-full bg-amber-500 float-left"
              style={{ width: `${(maintenance / total) * 100}%` }}
            />
          )}
          {nonaktif > 0 && (
            <div
              className="h-full bg-red-500 float-left"
              style={{ width: `${(nonaktif / total) * 100}%` }}
            />
          )}
        </div>
      )}

      {/* Device nodes grid */}
      <div className="flex flex-wrap gap-2">
        {dept.ipAddresses.map((ip: IpApiItem) => (
          <DeviceNode key={ip.id} ip={ip} />
        ))}
        {total === 0 && (
          <div className="flex w-full flex-col items-center py-3 text-zinc-300 dark:text-zinc-600">
            <Monitor className="size-5 mb-1 opacity-40" />
            <p className="text-[11px] font-medium">Belum ada perangkat</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PerLantaiPage() {
  const [floors, setFloors] = useState<FloorApiItem[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApi<FloorApiItem[]>('/api/per-lantai')
      .then((data) => {
        setFloors(data)
        if (data.length > 0) setActiveTab((prev) => prev || data[0].nama)
      })
      .catch(() => setError('Gagal memuat data. Periksa koneksi database.'))
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Per Lantai</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Lihat distribusi perangkat berdasarkan lantai dan departemen</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-red-200/60 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Per Lantai</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Lihat distribusi perangkat berdasarkan lantai dan departemen</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-blue-600" />
          <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">Memuat data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Per Lantai</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Lihat distribusi perangkat berdasarkan lantai dan departemen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { exportPerLantai().then(() => successToast('Data berhasil diexport')).catch(() => errorToast('Gagal export data')) }}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 px-4 py-3 shadow-xs">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-1">Status:</span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="size-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          Aktif
        </span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="size-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" />
          Nonaktif
        </span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="size-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          Maintenance
        </span>
      </div>

      {/* Overview summary */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 px-5 py-3 shadow-xs text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 dark:text-zinc-500">Total Lantai</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{floors.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 dark:text-zinc-500">Total Departemen</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {floors.reduce((s, f) => s + f.departemens.length, 0)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 dark:text-zinc-500">Total Perangkat</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {floors.reduce((s, f) => s + f.departemens.reduce((s2, d) => s2 + d.ipAddresses.length, 0), 0)}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="sticky top-0 z-10 py-2 bg-zinc-50 dark:bg-zinc-950">
          <TabsList variant="line">
            {floors.map((f) => {
              const deviceCount = f.departemens.reduce((s, d) => s + d.ipAddresses.length, 0)
              return (
                <TabsTrigger key={f.id} value={f.nama} className="gap-2">
                  {f.nama}
                  {deviceCount > 0 && (
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                      {deviceCount}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {floors.map((floor) => {
          const totalDevices = floor.departemens.reduce(
            (sum, d) => sum + d.ipAddresses.length, 0
          )

          return (
            <TabsContent key={floor.id} value={floor.nama} className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalDevices}</span> perangkat di {floor.departemens.length} departemen
                </p>
              </div>

              {/* Department Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floor.departemens.map((dept) => {
                  const theme = DEPT_THEMES[dept.nama] ?? DEFAULT_THEME
                  return <DeptCard key={dept.id} dept={dept} theme={theme} />
                })}
                {floor.departemens.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
                    <Building2 className="size-8 mb-2 opacity-40" />
                    <p className="text-sm">Belum ada departemen di lantai ini</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
