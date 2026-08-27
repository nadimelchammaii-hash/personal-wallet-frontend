import { defineStore } from 'pinia'
// Utilities
import { ref } from 'vue'
import apiClient from '@/lib/api'

export type CategoryType = 'income' | 'expense'

export interface Category {
  id: number
  name: string
  type: CategoryType
  icon: string | null
  color: string | null
  is_default: boolean
}

export interface CategoryPayload {
  name: string
  type: CategoryType
  icon?: string | null
  color?: string | null
}

interface ResourceResponse<T> {
  data: T
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)

  async function fetchCategories () {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<ResourceResponse<Category[]>>('/categories')
      categories.value = data.data
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory (payload: CategoryPayload) {
    const { data } = await apiClient.post<ResourceResponse<Category>>('/categories', payload)
    categories.value.push(data.data)
  }

  async function updateCategory (id: number, payload: CategoryPayload) {
    const { data } = await apiClient.put<ResourceResponse<Category>>(`/categories/${id}`, payload)
    const index = categories.value.findIndex(category => category.id === id)
    if (index !== -1) {
      categories.value[index] = data.data
    }
  }

  async function deleteCategory (id: number) {
    await apiClient.delete(`/categories/${id}`)
    categories.value = categories.value.filter(category => category.id !== id)
  }

  return { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory }
})
