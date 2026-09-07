import type { AxiosError, AxiosResponse } from "axios"

export interface ServerResponse<TData = unknown> {
  success: boolean
  message?: string
  data?: TData
}

export interface ErrorResponseDto {
  statusCode: number
  message: string | string[]
  error?: string
  path: string
  requestId?: string | number
  timestamp: string
}

export type ApiResponse<TData> = AxiosResponse<TData>

export type APIError<TError = unknown> = AxiosError<ErrorResponseDto & { errors?: TError }>

export type { AxiosRequestConfig } from "axios"
