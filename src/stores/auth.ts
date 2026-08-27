import { defineStore } from 'pinia'
// Utilities
import { computed, ref } from 'vue'
import apiClient, { ensureCsrfCookie } from '@/lib/api'

export interface AuthUser {
  id: number
  name: string
  email: string
  currency: string
  timezone: string
}

interface ResourceResponse<T> {
  data: T
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  /** Loads the current session's user, if any. Safe to call when logged out. */
  async function fetchUser () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<AuthUser>>('/me')
      user.value = data.data
    } catch {
      user.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  async function register (payload: { name: string, email: string, password: string, password_confirmation: string }) {
    await ensureCsrfCookie()
    const { data } = await apiClient.post<ResourceResponse<AuthUser>>('/register', payload)
    user.value = data.data
  }

  async function login (payload: { email: string, password: string }) {
    await ensureCsrfCookie()
    const { data } = await apiClient.post<ResourceResponse<AuthUser>>('/login', payload)
    user.value = data.data
  }

  async function logout () {
    await ensureCsrfCookie()
    await apiClient.post('/logout')
    user.value = null
  }

  async function forgotPassword (email: string) {
    await ensureCsrfCookie()
    await apiClient.post('/forgot-password', { email })
  }

  async function resetPassword (payload: { token: string, email: string, password: string, password_confirmation: string }) {
    await ensureCsrfCookie()
    await apiClient.post('/reset-password', payload)
  }

  async function updateProfile (payload: { name: string, email: string, currency: string, timezone: string }) {
    const { data } = await apiClient.put<ResourceResponse<AuthUser>>('/me', payload)
    user.value = data.data
  }

  async function updatePassword (payload: { current_password: string, password: string, password_confirmation: string }) {
    await apiClient.put('/me/password', payload)
  }

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    fetchUser,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
  }
})
