export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export interface IpListResponse {
  data: IpApiItem[]
  total: number
  page: number
  totalPages: number
}

export interface IpApiItem {
  id: string
  ipAddress: string
  hostname: string
  macAddress: string | null
  subDepartemen: string | null
  tipe: string
  pic: string
  status: 'AKTIF' | 'NONAKTIF' | 'MAINTENANCE'
  keterangan: string | null
  lantaiId: string
  departemenId: string
  createdAt: string
  updatedAt: string
  lantai: { id: string; nama: string }
  departemen: { id: string; nama: string }
}

export interface HistoryApiItem {
  id: string
  aksi: string
  detail: string | null
  createdAt: string
  ipAddressId: string
  ipAddress: { id: string; ipAddress: string; hostname: string }
}

export interface HistoryListResponse {
  data: HistoryApiItem[]
  total: number
  page: number
  totalPages: number
}

export interface DashboardStats {
  totalIp: number
  aktif: number
  nonaktif: number
  totalDepartemen: number
}

export interface FloorApiItem {
  id: string
  nama: string
  departemens: DeptWithIps[]
}

export interface DeptWithIps {
  id: string
  nama: string
  lantaiId: string
  ipAddresses: IpApiItem[]
}

export interface LantaiItem {
  id: string
  nama: string
}

export interface LantaiMasterItem {
  id: string
  nama: string
  createdAt: string
  updatedAt: string
  _count: { departemens: number; ipAddresses: number }
}

export interface DepartemenItem {
  id: string
  nama: string
  lantaiId: string
  lantai: { id: string; nama: string }
}

export interface DepartemenMasterItem {
  id: string
  nama: string
  lantaiId: string
  lantai: { id: string; nama: string }
  createdAt: string
  updatedAt: string
  _count: { ipAddresses: number }
}
