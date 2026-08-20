<template>
  <v-dialog v-model="isOpen" max-width="480">
    <v-card>
      <v-card-title>{{ budget ? 'Edit budget' : 'New budget' }}</v-card-title>

      <v-card-text>
        <v-alert
          v-if="generalError"
          class="mb-4"
          closable
          type="error"
          @click:close="generalError = null"
        >
          {{ generalError }}
        </v-alert>

        <v-form @submit.prevent="handleSubmit">
          <v-select
            v-model="form.category_id"
            :error-messages="errors.category_id"
            item-title="name"
            item-value="id"
            :items="expenseCategories"
            label="Category"
          />

          <v-text-field
            v-model.number="form.amount"
            :error-messages="errors.amount"
            label="Budget amount"
            min="0"
            step="0.01"
            type="number"
          />

          <div class="d-flex ga-2">
            <v-select
              v-model="form.period_month"
              :error-messages="errors.period_month"
              item-title="title"
              item-value="value"
              :items="monthOptions"
              label="Month"
            />

            <v-text-field
              v-model.number="form.period_year"
              :error-messages="errors.period_year"
              label="Year"
              type="number"
            />
          </div>

          <div class="d-flex justify-end mt-4 ga-2">
            <v-btn variant="text" @click="isOpen = false">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" type="submit">Save</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { type Budget, useBudgetsStore } from '@/stores/budgets'
  import { useCategoriesStore } from '@/stores/categories'

  const props = defineProps<{
    budget: Budget | null
  }>()

  const isOpen = defineModel<boolean>({ required: true })

  const categoriesStore = useCategoriesStore()
  const budgetsStore = useBudgetsStore()

  const expenseCategories = computed(() => categoriesStore.categories.filter(category => category.type === 'expense'))

  const monthOptions = [
    { title: 'January', value: 1 }, { title: 'February', value: 2 }, { title: 'March', value: 3 },
    { title: 'April', value: 4 }, { title: 'May', value: 5 }, { title: 'June', value: 6 },
    { title: 'July', value: 7 }, { title: 'August', value: 8 }, { title: 'September', value: 9 },
    { title: 'October', value: 10 }, { title: 'November', value: 11 }, { title: 'December', value: 12 },
  ]

  const form = reactive({
    category_id: null as number | null,
    amount: 0,
    period_month: budgetsStore.month,
    period_year: budgetsStore.year,
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  watch(isOpen, open => {
    if (!open) return

    errors.value = {}
    generalError.value = null

    if (props.budget) {
      form.category_id = props.budget.category.id
      form.amount = Number(props.budget.amount)
      form.period_month = props.budget.period_month
      form.period_year = props.budget.period_year
    } else {
      form.category_id = expenseCategories.value[0]?.id ?? null
      form.amount = 0
      form.period_month = budgetsStore.month
      form.period_year = budgetsStore.year
    }
  })

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null

    if (!form.category_id) {
      errors.value = { category_id: 'Please choose a category.' }

      return
    }

    isSubmitting.value = true

    try {
      const payload = {
        category_id: form.category_id,
        amount: form.amount,
        period_month: form.period_month,
        period_year: form.period_year,
      }

      await (props.budget ? budgetsStore.updateBudget(props.budget.id, payload) : budgetsStore.createBudget(payload))

      isOpen.value = false
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        errors.value = fieldErrors
      } else {
        generalError.value = extractErrorMessage(error)
      }
    } finally {
      isSubmitting.value = false
    }
  }
</script>
