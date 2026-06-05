import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import { fetchApi } from "@/lib/api"

export function useFetch<T>(url: string | null, config?: SWRConfiguration): SWRResponse<T, Error> {
  return useSWR<T>(
    url,
    (url: string) => fetchApi<T>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...config,
    }
  )
}
