import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export type GoalStatus = 'active' | 'completed' | 'archived'

export interface SavingsGoal {
  id: number
  name: string
  target_amount: string
  current_amount: string
  remaining_amount: string
  progress_percentage: number
  target_date: string | null
  icon: string | null
  color: string | null
  status: GoalStatus
  created_at: string
}

export interface GoalPayload {
  name: string
  target_amount: number
  target_date?: string | null
  icon?: string | null
  color?: string | null
  status?: GoalStatus
}

export interface Contribution {
  id: number
  amount: string
  contributed_at: string
  note: string | null
  created_at: string
}

export interface ContributionPayload {
  amount: number
  contributed_at: string
  note?: string | null
}

interface ResourceResponse<T> {
  data: T
}

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<SavingsGoal[]>([])
  const isLoading = ref(false)

  async function fetchGoals () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<SavingsGoal[]>>('/goals')
      goals.value = data.data
    } finally {
      isLoading.value = false
    }
  }

  async function createGoal (payload: GoalPayload) {
    const { data } = await apiClient.post<ResourceResponse<SavingsGoal>>('/goals', payload)
    goals.value.unshift(data.data)
  }

  async function updateGoal (id: number, payload: GoalPayload) {
    const { data } = await apiClient.put<ResourceResponse<SavingsGoal>>(`/goals/${id}`, payload)
    const index = goals.value.findIndex(goal => goal.id === id)
    if (index !== -1) {
      goals.value[index] = data.data
    }
  }

  async function deleteGoal (id: number) {
    await apiClient.delete(`/goals/${id}`)
    goals.value = goals.value.filter(goal => goal.id !== id)
  }

  async function fetchContributions (goalId: number) {
    const { data } = await apiClient.get<ResourceResponse<Contribution[]>>(`/goals/${goalId}/contributions`)

    return data.data
  }

  async function addContribution (goalId: number, payload: ContributionPayload) {
    await apiClient.post(`/goals/${goalId}/contributions`, payload)
    await fetchGoals()
  }

  return { goals, isLoading, fetchGoals, createGoal, updateGoal, deleteGoal, fetchContributions, addContribution }
})
