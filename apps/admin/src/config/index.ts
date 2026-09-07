import { ENDPOINTS } from "./endpoints"
import { QUERY_KEY } from "./query-key"

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

export const CONFIG = {
  API_URL,
  ENDPOINTS,
  QUERY_KEY,
} as const
