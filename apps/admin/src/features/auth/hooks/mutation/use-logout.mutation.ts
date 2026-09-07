import { useNavigate } from "@tanstack/react-router"
import { useMutation } from "@workspace/query"
import { toast } from "@workspace/ui"
import { CONFIG } from "#/config"
import { authApiService } from "../../services"
import type { LogoutAllMutation, LogoutMutation } from "../../types"

export function useLogoutMutation() {
  const navigate = useNavigate()
  return useMutation<LogoutMutation.AxiosResponse, LogoutMutation.ErrorResponse, void>(
    () => authApiService.logout(),
    {
      invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME, CONFIG.QUERY_KEY.USER.PROFILE],
      onSuccess: () => {
        toast.success("Signed out")
        navigate({ to: "/auth/login" })
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? "Logout failed")
      },
    },
  )
}

export function useLogoutAllMutation() {
  const navigate = useNavigate()
  return useMutation<LogoutAllMutation.AxiosResponse, LogoutAllMutation.ErrorResponse, void>(
    () => authApiService.logoutAll(),
    {
      invalidateKeys: [CONFIG.QUERY_KEY.AUTH.ME, CONFIG.QUERY_KEY.USER.PROFILE],
      onSuccess: (data) => {
        toast.success(`Signed out from ${data.data.revokedSessions} sessions`)
        navigate({ to: "/auth/login" })
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? "Logout failed")
      },
    },
  )
}
