import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings' | 'other'

export interface Account {
  id: number
  name: string
  type: AccountType
  currency: string
  initial_balance: string
  current_balance: string
  color: string | null
  icon: string | null
  is_archived: boolean
  created_at: string
}

export interface AccountPayload {
  name: string
  type: AccountType
  currency: string
  initial_balance: number
  color?: string | null
  icon?: string | null
  is_archived?: boolean
}

interface ResourceResponse<T> {
  data: T
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const isLoading = ref(false)
  const includeArchived = ref(false)

  async function fetchAccounts () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<Account[]>>('/accounts', {
        params: includeArchived.value ? { include_archived: 1 } : {},
      })
      accounts.value = data.data
    } finally {
      isLoading.value = false
    }
  }

  async function createAccount (payload: AccountPayload) {
    const { data } = await apiClient.post<ResourceResponse<Account>>('/accounts', payload)
    accounts.value.push(data.data)
  }

  async function updateAccount (id: number, payload: AccountPayload) {
    const { data } = await apiClient.put<ResourceResponse<Account>>(`/accounts/${id}`, payload)
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value[index] = data.data
    }
  }

  async function deleteAccount (id: number) {
    await apiClient.delete(`/accounts/${id}`)
    accounts.value = accounts.value.filter(account => account.id !== id)
  }

  return { accounts, isLoading, includeArchived, fetchAccounts, createAccount, updateAccount, deleteAccount }
})
