/**
 * lib/api.ts
 *
 * Single Axios instance for the Laravel API. Auth is Sanctum's SPA cookie
 * mode: withCredentials sends the session cookie, withXSRFToken attaches
 * the X-XSRF-TOKEN header cross-origin so Laravel can verify the CSRF cookie.
 */

import axios from 'axios'
import { useSnackbar } from '@/composables/useSnackbar'

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
 * Surface unexpected failures (network errors, 5xx) as a toast so a failed
 * fetch never fails silently into a misleading "no data" empty state.
 * 401 (expected: logged out) and 422 (handled inline by forms) are left
 * for callers to handle themselves.
 */
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined

    if (status === undefined || status >= 500) {
      useSnackbar().show(
        status === undefined
          ? 'Network error. Check your connection and try again.'
          : 'Something went wrong on our end. Please try again.',
      )
    }

    return Promise.reject(error)
  },
)

/**
 * Sanctum issues the XSRF-TOKEN cookie from a route outside /api,
 * so it's requested through the bare backend origin, not apiClient.
 */
export function ensureCsrfCookie () {
  return axios.get(`${backendURL}/sanctum/csrf-cookie`, { withCredentials: true })
}

export default apiClient
