import * as XLSX from "xlsx"
import { fetchApi } from "@/lib/api"
import type { IpApiItem, FloorApiItem } from "@/lib/api"

export async function exportIpList() {
  const res = await fetchApi<{ data: IpApiItem[] }>("/api/ip-address?limit=10000")
  const rows = res.data.map((ip, i) => ({
    No: i + 1,
    "IP Address": ip.ipAddress,
    Hostname: ip.hostname,
    "MAC Address": ip.macAddress ?? "-",
    Lantai: ip.lantai.nama,
    Departemen: ip.departemen.nama,
    "Sub Departemen": ip.subDepartemen ?? "-",
    Tipe: ip.tipe,
    PIC: ip.pic,
    Status: ip.status === "AKTIF" ? "Aktif" : ip.status === "NONAKTIF" ? "Nonaktif" : "Maintenance",
    Keterangan: ip.keterangan ?? "-",
    Terakhir: new Date(ip.updatedAt).toLocaleDateString("id-ID"),
  }))
  downloadExcel(rows, "IP_Address")
}

export async function exportPerLantai() {
  const floors = await fetchApi<FloorApiItem[]>("/api/per-lantai")
  const rows: Record<string, unknown>[] = []
  let no = 1

  for (const floor of floors) {
    for (const dept of floor.departemens) {
      for (const ip of dept.ipAddresses) {
        rows.push({
          No: no++,
          Lantai: floor.nama,
          Departemen: dept.nama,
          "IP Address": ip.ipAddress,
          Hostname: ip.hostname,
          "MAC Address": ip.macAddress ?? "-",
          Tipe: ip.tipe,
          PIC: ip.pic,
          Status: ip.status === "AKTIF" ? "Aktif" : ip.status === "NONAKTIF" ? "Nonaktif" : "Maintenance",
        })
      }
    }
  }

  downloadExcel(rows, "Per_Lantai")
}

function downloadExcel(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
