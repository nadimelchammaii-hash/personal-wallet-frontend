<template>
  <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
    <h1 class="text-h4">Budgets</h1>

    <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
      New budget
    </v-btn>
  </div>

  <div class="d-flex align-center ga-2 mb-6">
    <v-btn icon="mdi-chevron-left" variant="text" @click="budgetsStore.previousMonth()" />
    <div class="text-h6" style="min-width: 12ch; text-align: center;">{{ periodLabel }}</div>
    <v-btn icon="mdi-chevron-right" variant="text" @click="budgetsStore.nextMonth()" />
  </div>

  <v-row v-if="budgetsStore.budgets.length > 0">
    <v-col
      v-for="budget in budgetsStore.budgets"
      :key="budget.id"
      cols="12"
      md="4"
      sm="6"
    >
      <v-card>
        <v-card-item>
          <template #prepend>
            <v-avatar :color="budget.category.color ?? 'primary'" variant="tonal">
              <v-icon :icon="budget.category.icon ?? 'mdi-shape'" />
            </v-avatar>
          </template>

          <v-card-title>{{ budget.category.name }}</v-card-title>

          <v-card-subtitle>
            {{ formatMoney(budget.spent) }} of {{ formatMoney(budget.amount) }}
          </v-card-subtitle>

          <template #append>
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="menuProps" />
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEditDialog(budget)" />
                <v-list-item prepend-icon="mdi-delete" title="Delete" @click="confirmDelete(budget)" />
              </v-list>
            </v-menu>
          </template>
        </v-card-item>

        <v-card-text>
          <v-progress-linear
            :color="progressColor(budget)"
            height="10"
            :model-value="Math.min(budget.percentage_used, 100)"
            rounded
          />

          <div class="d-flex justify-space-between mt-2 text-body-2">
            <span :class="budget.is_over_budget ? 'text-error font-weight-medium' : 'text-medium-emphasis'">
              {{ budget.is_over_budget ? 'Over by' : 'Remaining' }}
              {{ formatMoney(Math.abs(Number(budget.remaining))) }}
            </span>

            <span class="text-medium-emphasis">{{ budget.percentage_used }}%</span>
          </div>

          <v-alert
            v-if="budget.is_over_budget"
            class="mt-3"
            density="compact"
            type="error"
            variant="tonal"
          >
            Over budget
          </v-alert>

          <v-alert
            v-else-if="budget.percentage_used >= 80"
            class="mt-3"
            density="compact"
            type="warning"
            variant="tonal"
          >
            Approaching budget limit
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-empty-state
    v-else-if="!budgetsStore.isLoading"
    headline="No budgets for this month"
    icon="mdi-chart-donut"
    text="Set a spending limit for a category to track it here."
  >
    <template #actions>
      <v-btn color="primary" @click="openCreateDialog">New budget</v-btn>
    </template>
  </v-empty-state>

  <BudgetFormDialog v-model="isDialogOpen" :budget="editingBudget" />

  <v-dialog v-model="isDeleteDialogOpen" max-width="420">
    <v-card>
      <v-card-title>Delete budget</v-card-title>

      <v-card-text>
        Delete the budget for <strong>{{ deletingBudget?.category.name }}</strong>? This can't be undone.
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancel</v-btn>
        <v-btn color="error" :loading="isDeleting" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import BudgetFormDialog from '@/features/budgets/components/BudgetFormDialog.vue'
  import { type Budget, useBudgetsStore } from '@/stores/budgets'
  import { useCategoriesStore } from '@/stores/categories'

  const categoriesStore = useCategoriesStore()
  const budgetsStore = useBudgetsStore()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const periodLabel = computed(() => `${monthNames[budgetsStore.month - 1]} ${budgetsStore.year}`)

  function formatMoney (amount: string | number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount))
  }

  function progressColor (budget: Budget) {
    if (budget.is_over_budget) return 'error'
    if (budget.percentage_used >= 80) return 'warning'

    return 'primary'
  }

  const isDialogOpen = ref(false)
  const editingBudget = ref<Budget | null>(null)

  function openCreateDialog () {
    editingBudget.value = null
    isDialogOpen.value = true
  }
  function openEditDialog (budget: Budget) {
    editingBudget.value = budget
    isDialogOpen.value = true
  }

  const isDeleteDialogOpen = ref(false)
  const deletingBudget = ref<Budget | null>(null)
  const isDeleting = ref(false)

  function confirmDelete (budget: Budget) {
    deletingBudget.value = budget
    isDeleteDialogOpen.value = true
  }

  async function handleDelete () {
    if (!deletingBudget.value) return

    isDeleting.value = true
    try {
      await budgetsStore.deleteBudget(deletingBudget.value.id)
      isDeleteDialogOpen.value = false
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(() => {
    categoriesStore.fetchCategories()
    budgetsStore.fetchBudgets()
  })
</script>
