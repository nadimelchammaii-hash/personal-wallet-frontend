<template>
  <v-dialog v-model="isOpen" max-width="480">
    <v-card>
      <v-card-title>{{ goal ? 'Edit goal' : 'New savings goal' }}</v-card-title>

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
          <v-text-field
            v-model="form.name"
            :error-messages="errors.name"
            label="Goal name"
            placeholder="New Laptop"
          />

          <v-text-field
            v-model.number="form.target_amount"
            :error-messages="errors.target_amount"
            label="Target amount"
            min="0"
            step="0.01"
            type="number"
          />

          <v-text-field
            v-model="form.target_date"
            clearable
            :error-messages="errors.target_date"
            label="Target date (optional)"
            type="date"
          />

          <v-select
            v-if="goal"
            v-model="form.status"
            item-title="title"
            item-value="value"
            :items="statusOptions"
            label="Status"
          />

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
  import { reactive, ref, watch } from 'vue'
  import { extractErrorMessage, extractFieldErrors } from '@/lib/errors'
  import { type GoalStatus, type SavingsGoal, useGoalsStore } from '@/stores/goals'

  const props = defineProps<{
    goal: SavingsGoal | null
  }>()

  const isOpen = defineModel<boolean>({ required: true })

  const goalsStore = useGoalsStore()

  const statusOptions: { title: string, value: GoalStatus }[] = [
    { title: 'Active', value: 'active' },
    { title: 'Completed', value: 'completed' },
    { title: 'Archived', value: 'archived' },
  ]

  const form = reactive({
    name: '',
    target_amount: 0,
    target_date: '' as string | null,
    status: 'active' as GoalStatus,
  })
  const errors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)
  const isSubmitting = ref(false)

  watch(isOpen, open => {
    if (!open) return

    errors.value = {}
    generalError.value = null

    if (props.goal) {
      form.name = props.goal.name
      form.target_amount = Number(props.goal.target_amount)
      form.target_date = props.goal.target_date
      form.status = props.goal.status
    } else {
      form.name = ''
      form.target_amount = 0
      form.target_date = null
      form.status = 'active'
    }
  })

  async function handleSubmit () {
    errors.value = {}
    generalError.value = null
    isSubmitting.value = true

    try {
      const payload = {
        name: form.name,
        target_amount: form.target_amount,
        target_date: form.target_date || null,
        ...(props.goal ? { status: form.status } : {}),
      }

      await (props.goal ? goalsStore.updateGoal(props.goal.id, payload) : goalsStore.createGoal(payload))

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
