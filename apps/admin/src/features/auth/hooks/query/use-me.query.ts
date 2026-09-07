import { CONFIG } from "#/config"
import { useQuery } from "@workspace/query"
import { authApiService } from "../../services"
import type { MeQuery } from "../../types"

export function useMeQuery(options?: { enabled?: boolean }) {
  return useQuery<MeQuery.AxiosResponse, MeQuery.ErrorResponse>(
    CONFIG.QUERY_KEY.AUTH.ME,
    () => authApiService.me(),
    {},
    {
      retry: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      ...options,
    },
  )
}
