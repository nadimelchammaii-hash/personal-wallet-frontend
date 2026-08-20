import { defineStore } from 'pinia'
// Utilities
import { reactive, ref } from 'vue'
import apiClient from '@/lib/api'
import { useAccountsStore } from '@/stores/accounts'

export type TransactionType = 'income' | 'expense' | 'transfer_in' | 'transfer_out'

export interface TransactionAccountRef {
  id: number
  name: string
  icon: string | null
}

export interface TransactionCategoryRef {
  id: number
  name: string
  icon: string | null
  color: string | null
}

export interface Transaction {
  id: number
  type: TransactionType
  amount: string
  note: string | null
  transaction_date: string
  transfer_group_id: string | null
  account: TransactionAccountRef
  related_account: TransactionAccountRef | null
  category: TransactionCategoryRef | null
  created_at: string
}

export interface TransactionPayload {
  account_id: number
  category_id: number
  type: 'income' | 'expense'
  amount: number
  note?: string | null
  transaction_date: string
}

export interface TransferPayload {
  from_account_id: number
  to_account_id: number
  amount: number
  note?: string | null
  transaction_date: string
}

export interface TransactionFilters {
  account_id: number | null
  category_id: number | null
  type: TransactionType | null
  date_from: string | null
  date_to: string | null
  search: string
  page: number
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const meta = ref<PaginatedResponse<Transaction>['meta'] | null>(null)
  const filters = reactive<TransactionFilters>({
    account_id: null,
    category_id: null,
    type: null,
    date_from: null,
    date_to: null,
    search: '',
    page: 1,
  })

  async function fetchTransactions () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
        params: {
          account_id: filters.account_id ?? undefined,
          category_id: filters.category_id ?? undefined,
          type: filters.type ?? undefined,
          date_from: filters.date_from ?? undefined,
          date_to: filters.date_to ?? undefined,
          search: filters.search || undefined,
          page: filters.page,
        },
      })
      transactions.value = data.data
      meta.value = data.meta
    } finally {
      isLoading.value = false
    }
  }

  /** Any write can move money between accounts, so accounts are always refreshed alongside. */
  async function refreshAfterMutation () {
    await Promise.all([fetchTransactions(), useAccountsStore().fetchAccounts()])
  }

  async function createTransaction (payload: TransactionPayload) {
    await apiClient.post('/transactions', payload)
    await refreshAfterMutation()
  }

  async function updateTransaction (id: number, payload: TransactionPayload) {
    await apiClient.put(`/transactions/${id}`, payload)
    await refreshAfterMutation()
  }

  async function deleteTransaction (id: number) {
    await apiClient.delete(`/transactions/${id}`)
    await refreshAfterMutation()
  }

  async function createTransfer (payload: TransferPayload) {
    await apiClient.post('/transfers', payload)
    await refreshAfterMutation()
  }

  return {
    transactions,
    isLoading,
    meta,
    filters,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createTransfer,
  }
})
