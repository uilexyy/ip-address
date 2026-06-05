import type { LantaiItem, DepartemenItem, LantaiMasterItem, DepartemenMasterItem, DashboardStats, IpListResponse, HistoryListResponse } from "@/lib/api"
import { useFetch } from "@/lib/swr-fetcher"

export function useLantaiList() {
  return useFetch<LantaiItem[]>("/api/lantai")
}

export function useDepartemenList() {
  return useFetch<DepartemenItem[]>("/api/departemen")
}

export function useLantaiMaster() {
  return useFetch<LantaiMasterItem[]>("/api/lantai")
}

export function useDepartemenMaster() {
  return useFetch<DepartemenMasterItem[]>("/api/departemen")
}

export function useDashboardStats() {
  return useFetch<DashboardStats>("/api/dashboard/stats")
}

export function useDeviceTypes() {
  return useFetch<string[]>("/api/device-types")
}

export function useIpList(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  return useFetch<IpListResponse>(`/api/ip-address?${qs}`)
}

export function useHistoryList(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  return useFetch<HistoryListResponse>(`/api/history?${qs}`)
}
