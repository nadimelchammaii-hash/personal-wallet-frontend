import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export interface BudgetCategoryRef {
  id: number
  name: string
  icon: string | null
  color: string | null
}

export interface Budget {
  id: number
  category: BudgetCategoryRef
  amount: string
  period_month: number
  period_year: number
  spent: string
  remaining: string
  percentage_used: number
  is_over_budget: boolean
  created_at: string
}

export interface BudgetPayload {
  category_id: number
  amount: number
  period_month: number
  period_year: number
}

interface ResourceResponse<T> {
  data: T
}

const now = new Date()

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([])
  const isLoading = ref(false)
  const month = ref(now.getMonth() + 1)
  const year = ref(now.getFullYear())

  async function fetchBudgets () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<Budget[]>>('/budgets', {
        params: { month: month.value, year: year.value },
      })
      budgets.value = data.data
    } finally {
      isLoading.value = false
    }
  }

  async function createBudget (payload: BudgetPayload) {
    await apiClient.post('/budgets', payload)
    await fetchBudgets()
  }

  async function updateBudget (id: number, payload: BudgetPayload) {
    await apiClient.put(`/budgets/${id}`, payload)
    await fetchBudgets()
  }

  async function deleteBudget (id: number) {
    await apiClient.delete(`/budgets/${id}`)
    budgets.value = budgets.value.filter(budget => budget.id !== id)
  }

  function previousMonth () {
    if (month.value === 1) {
      month.value = 12
      year.value -= 1
    } else {
      month.value -= 1
    }
    fetchBudgets().catch(() => {})
  }

  function nextMonth () {
    if (month.value === 12) {
      month.value = 1
      year.value += 1
    } else {
      month.value += 1
    }
    fetchBudgets().catch(() => {})
  }

  return { budgets, isLoading, month, year, fetchBudgets, createBudget, updateBudget, deleteBudget, previousMonth, nextMonth }
})
