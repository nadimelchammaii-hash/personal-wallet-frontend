/**
 * lib/api.ts
 *
 * Single Axios instance for the Laravel API. Auth is Sanctum's SPA cookie
 * mode: withCredentials sends the session cookie, withXSRFToken attaches
 * the X-XSRF-TOKEN header cross-origin so Laravel can verify the CSRF cookie.
 */

import axios from 'axios'

const backendURL = import.meta.env.VITE_API_BASE_URL as string

export const apiClient = axios.create({
  baseURL: `${backendURL}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Sanctum issues the XSRF-TOKEN cookie from a route outside /api,
 * so it's requested through the bare backend origin, not apiClient.
 */
export function ensureCsrfCookie () {
  return axios.get(`${backendURL}/sanctum/csrf-cookie`, { withCredentials: true })
}

export default apiClient
