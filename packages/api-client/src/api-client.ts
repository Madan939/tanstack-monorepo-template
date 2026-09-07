import axios from "axios"

export const createApiClient = (baseURL: string) =>
  axios.create({
    baseURL,
    timeout: 1000 * 20,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    responseType: "json",
  })
