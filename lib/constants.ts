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

export const deviceTypes = [
  'Desktop PC', 'Laptop', 'Server', 'Printer', 'Scanner',
  'UPS', 'Access Point', 'CCTV', 'IP Phone', 'Tablet',
]

export const picNames = [
  'Dr. Andi Pratama', 'Siti Rahmawati', 'Budi Santoso', 'Dewi Lestari',
  'Ahmad Fauzi', 'Rina Marlina', 'Hendra Gunawan', 'Maya Sari',
  'Rudi Hermawan', 'Indah Permata', 'Agus Wijaya', 'Fitri Handayani',
]

export const isValidIp = (ip: string) =>
  /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip) &&
  ip.split('.').every((octet) => Number(octet) >= 0 && Number(octet) <= 255)

export const isIpDuplicate = async (ip: string) => {
  try {
    const res = await fetch(`/api/ip-address?search=${ip}&limit=1`)
    const data = await res.json()
    return data.data?.some((item: { ipAddress: string }) => item.ipAddress === ip) ?? false
  } catch {
    return false
  }
}
