import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import type { ServerResponse } from "./types"

export class BaseApiService {
  private api: AxiosInstance

  constructor(apiInstance: AxiosInstance) {
    this.api = apiInstance
  }

  async post<
    TData = unknown,
    TResponse extends AxiosResponse<TData> = AxiosResponse<TData>,
    TPayload = unknown,
  >(url: string, data?: TPayload, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.api.post(url, data, config) as unknown as Promise<TResponse>
  }

  async get<
    TData = unknown,
    TResponse extends AxiosResponse<TData> = AxiosResponse<TData>,
  >(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.api.get(url, config) as unknown as Promise<TResponse>
  }

  async put<
    TServerResponse extends ServerResponse,
    TAxiosResponse extends AxiosResponse<TServerResponse>,
    TPayload = unknown,
  >(url: string, data?: TPayload, config?: AxiosRequestConfig): Promise<TAxiosResponse> {
    return this.api.put(url, data, config) as unknown as Promise<TAxiosResponse>
  }

  async patch<
    TServerResponse extends ServerResponse,
    TAxiosResponse extends AxiosResponse<TServerResponse>,
    TPayload = unknown,
  >(url: string, data?: TPayload, config?: AxiosRequestConfig): Promise<TAxiosResponse> {
    return this.api.patch(url, data, config) as unknown as Promise<TAxiosResponse>
  }

  async delete<
    TServerResponse extends ServerResponse,
    TAxiosResponse extends AxiosResponse<TServerResponse>,
  >(url: string, config?: AxiosRequestConfig): Promise<TAxiosResponse> {
    return this.api.delete(url, config) as unknown as Promise<TAxiosResponse>
  }
}
