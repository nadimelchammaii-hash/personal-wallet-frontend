import type { SavingsGoal } from '@/stores/goals'
import type { Transaction } from '@/stores/transactions'
import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export interface CategorySpend {
  category: { id: number, name: string, icon: string | null, color: string | null }
  amount: string
}

export interface DashboardSummary {
  balance: string
  income: string
  expenses: string
  savings: string
  remaining_budget: string | null
  recent_transactions: Transaction[]
  spending_by_category: CategorySpend[]
  goals: SavingsGoal[]
}

interface ResourceResponse<T> {
  data: T
}

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const isLoading = ref(false)

  async function fetchSummary () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<DashboardSummary>>('/dashboard/summary')
      summary.value = data.data
    } finally {
      isLoading.value = false
    }
  }

  return { summary, isLoading, fetchSummary }
})
