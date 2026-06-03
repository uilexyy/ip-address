export type IpStatus = 'AKTIF' | 'NONAKTIF' | 'MAINTENANCE'

export interface IpAddress {
  id: string
  ipAddress: string
  hostname: string
  lantai: string
  departemen: string
  subDepartemen?: string
  tipe: string
  pic: string
  status: IpStatus
  macAddress?: string
  keterangan?: string
  diperbarui: string
}

export interface StatItem {
  label: string
  value: number
  icon: string
  color: string
}

export const floors = ['LT 1', 'LT 2', 'LT 3', 'LT 4']

export const departments = [
  'IGD',
  'Rawat Inap A',
  'Rawat Inap B',
  'Farmasi',
  'Laboratorium',
  'Radiologi',
  'Administrasi',
  'Kamar Operasi',
  'ICU',
  'NICU',
  'Gizi',
  'Laundry',
  'CSSD',
  'Rekam Medis',
  'Keuangan',
  'HRD',
]

export const deviceTypes = [
  'Desktop PC',
  'Laptop',
  'Server',
  'Printer',
  'Scanner',
  'UPS',
  'Access Point',
  'CCTV',
  'IP Phone',
  'Tablet',
]

export const picNames = [
  'Dr. Andi Pratama',
  'Siti Rahmawati',
  'Budi Santoso',
  'Dewi Lestari',
  'Ahmad Fauzi',
  'Rina Marlina',
  'Hendra Gunawan',
  'Maya Sari',
  'Rudi Hermawan',
  'Indah Permata',
  'Agus Wijaya',
  'Fitri Handayani',
]

let _seed = 0
function detRand(): number {
  _seed++
  return (Math.sin(_seed * 42.5) * 10000) - Math.floor(Math.sin(_seed * 42.5) * 10000)
}

const pick = <T>(arr: T[]): T => arr[Math.floor(detRand() * arr.length)]

const generateMockData = (count: number): IpAddress[] => {
  const data: IpAddress[] = []
  const statuses: IpStatus[] = ['AKTIF', 'NONAKTIF', 'MAINTENANCE']

  for (let i = 1; i <= count; i++) {
    const lantai = pick(floors)
    const departemen = pick(departments)
    const tipe = pick(deviceTypes)
    const status = pick(statuses)
    const day = Math.floor(detRand() * 30) + 1
    const month = Math.floor(detRand() * 12) + 1

    data.push({
      id: `IP-${String(i).padStart(4, '0')}`,
      ipAddress: `10.${Math.floor(detRand() * 255)}.${Math.floor(detRand() * 255)}.${i + 1}`,
      hostname: `${departemen.toLowerCase().replace(/\s+/g, '-')}-${String(i).padStart(3, '0')}`,
      lantai,
      departemen,
      subDepartemen: detRand() > 0.5 ? `Sub ${departemen}` : undefined,
      tipe,
      pic: pick(picNames),
      status: i === count ? 'MAINTENANCE' : status,
      macAddress: `00:1A:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}`,
      keterangan: detRand() > 0.7 ? `Terminal ${pick(['A', 'B', 'C', 'D'])} - ${pick(['Poli', 'Gudang', 'Ruang Kepala', 'Lobi'])}` : undefined,
      diperbarui: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  return data
}

export function resetSeed() { _seed = 0 }

export const ipAddresses: IpAddress[] = generateMockData(150)

export const departmentByFloor: Record<string, string[]> = {
  'LT 1': ['IGD', 'Radiologi', 'Farmasi', 'Rekam Medis'],
  'LT 2': ['Rawat Inap A', 'ICU', 'Laboratorium', 'Gizi'],
  'LT 3': ['Kamar Operasi', 'Rawat Inap B', 'NICU', 'CSSD'],
  'LT 4': ['Administrasi', 'Keuangan', 'HRD', 'Laundry'],
}

export const getStats = () => ({
  totalIp: ipAddresses.length,
  aktif: ipAddresses.filter((ip) => ip.status === 'AKTIF').length,
  nonaktif: ipAddresses.filter((ip) => ip.status === 'NONAKTIF').length,
  totalDepartemen: departments.length,
})

export const getDevicesPerFloor = () =>
  floors.map(floor => ({
    floor,
    total: ipAddresses.filter((ip) => ip.lantai === floor).length,
  }))

export const getDeviceDistribution = () => {
  const map = new Map<string, number>()
  ipAddresses.forEach((ip) => {
    map.set(ip.tipe, (map.get(ip.tipe) ?? 0) + 1)
  })
  return Array.from(map.entries()).map(([name, value]) => ({
    name,
    value,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }))
}

export const getRecentIps = (limit = 10) =>
  [...ipAddresses]
    .sort((a, b) => new Date(b.diperbarui).getTime() - new Date(a.diperbarui).getTime())
    .slice(0, limit)

export const getFloorData = () => {
  const result: Record<string, Record<string, IpAddress[]>> = {}
  floors.forEach((floor) => {
    const deps: Record<string, IpAddress[]> = {}
    ipAddresses
      .filter((ip) => ip.lantai === floor)
      .forEach((ip) => {
        if (!deps[ip.departemen]) deps[ip.departemen] = []
        deps[ip.departemen].push(ip)
      })
    result[floor] = deps
  })
  return result
}

export const isValidIp = (ip: string) =>
  /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip) &&
  ip.split('.').every((octet) => Number(octet) >= 0 && Number(octet) <= 255)

export const isIpDuplicate = (ip: string) =>
  ipAddresses.some((item) => item.ipAddress === ip)
