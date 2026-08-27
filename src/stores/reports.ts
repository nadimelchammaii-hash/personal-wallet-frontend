import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export interface SpendingTrendPoint {
  period: string
  income: string
  expenses: string
}

interface ReportCategoryRef {
  id: number
  name: string
  icon: string | null
  color: string | null
}

export interface CategoryBreakdownRow {
  category: ReportCategoryRef
  amount: string
}

export interface BudgetPerformanceRow {
  category: ReportCategoryRef
  budgeted: string
  spent: string
}

interface ResourceResponse<T> {
  data: T
}

const now = new Date()

export const useReportsStore = defineStore('reports', () => {
  const spendingTrends = ref<SpendingTrendPoint[]>([])
  const categoryBreakdown = ref<CategoryBreakdownRow[]>([])
  const budgetPerformance = ref<BudgetPerformanceRow[]>([])
  const isLoading = ref(false)
  const month = ref(now.getMonth() + 1)
  const year = ref(now.getFullYear())
  const trendMonths = ref(6)

  async function fetchSpendingTrends () {
    const { data } = await apiClient.get<ResourceResponse<SpendingTrendPoint[]>>('/reports/spending-trends', {
      params: { months: trendMonths.value },
    })
    spendingTrends.value = data.data
  }

  async function fetchCategoryBreakdown () {
    const { data } = await apiClient.get<ResourceResponse<CategoryBreakdownRow[]>>('/reports/category-breakdown', {
      params: { month: month.value, year: year.value },
    })
    categoryBreakdown.value = data.data
  }

  async function fetchBudgetPerformance () {
    const { data } = await apiClient.get<ResourceResponse<BudgetPerformanceRow[]>>('/reports/budget-performance', {
      params: { month: month.value, year: year.value },
    })
    budgetPerformance.value = data.data
  }

  async function fetchAll () {
    isLoading.value = true
    try {
      await Promise.all([fetchSpendingTrends(), fetchCategoryBreakdown(), fetchBudgetPerformance()])
    } finally {
      isLoading.value = false
    }
  }

  function previousMonth () {
    if (month.value === 1) {
      month.value = 12
      year.value -= 1
    } else {
      month.value -= 1
    }
    fetchCategoryBreakdown().catch(() => {})
    fetchBudgetPerformance().catch(() => {})
  }

  function nextMonth () {
    if (month.value === 12) {
      month.value = 1
      year.value += 1
    } else {
      month.value += 1
    }
    fetchCategoryBreakdown().catch(() => {})
    fetchBudgetPerformance().catch(() => {})
  }

  return {
    spendingTrends,
    categoryBreakdown,
    budgetPerformance,
    isLoading,
    month,
    year,
    trendMonths,
    fetchSpendingTrends,
    fetchCategoryBreakdown,
    fetchBudgetPerformance,
    fetchAll,
    previousMonth,
    nextMonth,
  }
})
